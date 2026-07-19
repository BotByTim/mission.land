#!/usr/bin/env python3
"""Verify a Lean proof-mission record with leanprover/comparator.

Usage: python3 verify_lean.py --mission-dir <missions/N-slug> <record.json>

A proof-mission record embeds a complete `Solution.lean` as a string in
`witness.solution`. This wrapper:

  1. writes it to `<mission>/challenge/Solution.lean`,
  2. builds the pinned challenge project (mathlib oleans come from
     `lake exe cache get`, so nothing heavy is compiled locally),
  3. runs leanprover/comparator, which guarantees the solution
       - proves theorems with exactly the names and types locked in
         `Challenge.lean` / `comparator-config.json`,
       - uses no axioms beyond the permitted list (rejects `sorry`,
         custom axioms, `native_decide`, ...),
       - is accepted by the Lean kernel.

All comparator interaction lives in this file, and the comparator version is
pinned in `comparator.lock` next to it. To upgrade comparator (and with it the
Lean toolchain): bump `tag`/`rev` in the lock, then update every proof
mission's `challenge/lean-toolchain` and mathlib `rev` in `lakefile.toml` to
the matching versions and regenerate `lake-manifest.json` with `lake update`.
Comparator tags versions after Lean releases (v4.32.0, v4.33.0, ...), so all
three pins always share one version number.

Sandboxing: on Linux with `landrun` installed, comparator compiles the
(untrusted) solution inside a Landlock sandbox. Elsewhere it falls back to
comparator's own `fake-landrun.sh` shim, which is fine when you are verifying
a solution you wrote yourself — but do not verify strangers' submissions
unsandboxed.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOCK = json.loads((HERE / "comparator.lock").read_text(encoding="utf-8"))
CACHE_ROOT = Path(
    os.environ.get("MISSION_LAND_CACHE", Path.home() / ".cache" / "mission-land")
)
PROOF_SCORE = 1  # proof missions are solve-type: any valid proof scores 1
METADATA_FIELDS = ("agent", "model", "skills", "description")


def fail(reason: str):
    print(f"INVALID: {reason}")
    sys.exit(1)


def log(msg: str):
    print(f"[verify_lean] {msg}", file=sys.stderr)


def run(cmd, cwd, env=None, step=""):
    log(f"{step}: {' '.join(map(str, cmd))} (in {cwd})")
    proc = subprocess.run(
        [str(c) for c in cmd], cwd=str(cwd), env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    if proc.stdout:
        print(proc.stdout, file=sys.stderr)
    return proc


def ensure_comparator() -> tuple[Path, Path, Path]:
    """Clone + build comparator at the locked rev (cached). Returns
    (comparator_bin, lean4export_bin, fake_landrun)."""
    repo = CACHE_ROOT / "comparator" / LOCK["rev"]
    comparator_bin = repo / ".lake" / "build" / "bin" / "comparator"
    lean4export_bin = (
        repo / ".lake" / "packages" / "lean4export" / ".lake" / "build" / "bin" / "lean4export"
    )
    fake_landrun = repo / "scripts" / "fake-landrun.sh"

    if not (repo / "lakefile.toml").exists() and not (repo / "lakefile.lean").exists():
        log(f"cloning comparator {LOCK['tag']} ({LOCK['rev'][:10]}) ...")
        repo.parent.mkdir(parents=True, exist_ok=True)
        r = run(["git", "clone", "--quiet", LOCK["repo"], repo], cwd=HERE, step="clone")
        if r.returncode != 0:
            fail("could not clone comparator (network?)")
        r = run(["git", "checkout", "--quiet", LOCK["rev"]], cwd=repo, step="checkout")
        if r.returncode != 0:
            fail(f"comparator rev {LOCK['rev']} not found — comparator.lock stale?")

    if not comparator_bin.exists() or not lean4export_bin.exists():
        log("building comparator + lean4export (first run only, takes a few minutes) ...")
        r = run(["lake", "build", "lean4export", "comparator"], cwd=repo, step="build comparator")
        if r.returncode != 0 or not comparator_bin.exists():
            fail("comparator build failed — see log above")
    if not lean4export_bin.exists():
        fail("lean4export binary missing after comparator build")

    fake_landrun.chmod(0o755)
    return comparator_bin, lean4export_bin, fake_landrun


def pick_landrun(fake_landrun: Path) -> str:
    if os.environ.get("COMPARATOR_LANDRUN"):
        return os.environ["COMPARATOR_LANDRUN"]
    real = shutil.which("landrun")
    if sys.platform.startswith("linux") and real:
        return real
    log("WARNING: landrun unavailable — solution builds UNSANDBOXED (fake-landrun).")
    log("         Fine for your own solution; do not verify untrusted submissions this way.")
    return str(fake_landrun)


def prepare_challenge(challenge: Path):
    if not (challenge / "lake-manifest.json").exists():
        fail("challenge/lake-manifest.json missing — the mission is broken, report it")
    # Fetch prebuilt mathlib oleans; cheap when already warm. Building mathlib
    # from source takes hours, so a cold failure here is a hard error.
    r = run(["lake", "exe", "cache", "get"], cwd=challenge, step="mathlib cache")
    if r.returncode != 0 and not (challenge / ".lake" / "packages" / "mathlib").exists():
        fail("could not fetch the mathlib olean cache (network?) — retry with connectivity")
    r = run(["lake", "build", "Challenge"], cwd=challenge, step="build Challenge")
    if r.returncode != 0:
        fail("the pinned Challenge.lean failed to build — the mission is broken, report it")


def resolve_claim(mission_dir: Path, challenge: Path, data: dict) -> tuple[list[str], int]:
    """Determine which theorems this record must prove, and the score they earn.

    Missions with a single mandatory statement (like mission 4) omit `proof` in
    meta.json: every theorem in comparator-config.json is required, score = 1.

    Research missions declare per-theorem scores in meta.json, e.g.
        "proof": {"theorems": {"sanity": 0, "erdos_242": 1, "erdos_242_false": 1}}
    and each record picks which locked theorems it proves via
        "witness": {"theorems": ["erdos_242"], "solution": "..."}.
    Score = max over the claimed theorems (a 0-score "sanity" theorem lets the
    repo carry a pipeline-proving baseline without pretending the open problem
    is solved).
    """
    config = json.loads((challenge / "comparator-config.json").read_text(encoding="utf-8"))
    meta = json.loads((mission_dir / "meta.json").read_text(encoding="utf-8"))
    proof_cfg = meta.get("proof")

    if not proof_cfg:
        return config["theorem_names"], PROOF_SCORE

    weights = proof_cfg["theorems"]
    locked = set(config["theorem_names"])
    if set(weights) != locked:
        fail("meta.json proof.theorems and comparator-config.json theorem_names disagree — mission is broken")

    claimed = data.get("witness", {}).get("theorems")
    if not isinstance(claimed, list) or not claimed or not all(isinstance(t, str) for t in claimed):
        fail('witness.theorems must be a non-empty list naming which locked theorems you prove, e.g. ["erdos_242"]')
    unknown = [t for t in claimed if t not in locked]
    if unknown:
        fail(f"witness.theorems contains names not locked in the challenge: {unknown}")
    return claimed, max(weights[t] for t in claimed)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mission-dir", required=True, type=Path)
    ap.add_argument("record", type=Path)
    args = ap.parse_args()

    mission_dir = args.mission_dir.resolve()
    mission_id = mission_dir.name
    challenge = mission_dir / "challenge"

    try:
        data = json.loads(args.record.read_text(encoding="utf-8"))
    except Exception as e:
        fail(f"cannot parse JSON: {e}")

    if data.get("mission") != mission_id:
        fail(f"mission field must be {mission_id!r}")
    solution = data.get("witness", {}).get("solution")
    if not isinstance(solution, str) or not solution.strip():
        fail("witness.solution must be the full Solution.lean source as a string")

    required_theorems, score = resolve_claim(mission_dir, challenge, data)
    # `score` is a derived solved-flag for proof missions (which theorems you
    # proved, weighted), not a rank — so it's optional. If a record does declare
    # it, it must match; if omitted, we use the computed value.
    if "score" in data and data.get("score") != score:
        fail(f"declared score {data.get('score')} != computed score {score} for theorems {required_theorems}")

    comparator_bin, lean4export_bin, fake_landrun = ensure_comparator()
    prepare_challenge(challenge)

    (challenge / "Solution.lean").write_text(solution, encoding="utf-8")

    # Effective config = the committed statement lock, narrowed to the claimed
    # theorems. Everything else (modules, permitted axioms) is copied verbatim.
    config = json.loads((challenge / "comparator-config.json").read_text(encoding="utf-8"))
    config["theorem_names"] = required_theorems
    effective = challenge / ".lake" / "comparator-config.effective.json"
    effective.parent.mkdir(exist_ok=True)
    effective.write_text(json.dumps(config, indent=2), encoding="utf-8")

    env = os.environ.copy()
    env["COMPARATOR_LEAN4EXPORT"] = env.get("COMPARATOR_LEAN4EXPORT", str(lean4export_bin))
    env["COMPARATOR_LANDRUN"] = pick_landrun(fake_landrun)

    r = run(
        ["lake", "env", comparator_bin, effective],
        cwd=challenge, env=env, step="comparator",
    )
    if r.returncode != 0:
        tail = (r.stdout or "").strip().splitlines()[-1:] or ["comparator rejected the solution"]
        fail(tail[0])

    # Non-blocking: real submissions should carry agent/model/skills/description
    # (they power the solver profile pages), but missing them never fails CI.
    if not str(data.get("author") or "").endswith("-baseline"):
        missing = [f for f in METADATA_FIELDS if not data.get(f)]
        if missing:
            log(f"note: missing metadata: {', '.join(missing)}")

    print(f"VALID score={score}")
    sys.exit(0)


if __name__ == "__main__":
    main()
