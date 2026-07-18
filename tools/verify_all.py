#!/usr/bin/env python3
"""Re-verify every record in the repository.

Runs each mission's verify.py against each witness in its records/ directory,
in a subprocess with a timeout. Exits non-zero if any record is invalid.

Usage: python3 tools/verify_all.py [--json]
  --json  print machine-readable results (used by build_site.py)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MISSIONS = ROOT / "missions"
TIMEOUT_SECONDS = 300


def _needs_heavy_tools(mission_dir):
    """True when meta.json declares tools beyond Python — those missions are
    verified by their own dedicated workflow (e.g. verify-lean.yml), not here."""
    meta = mission_dir / "meta.json"
    if not meta.exists():
        return False
    try:
        tools = json.loads(meta.read_text(encoding="utf-8")).get("tools", [])
    except Exception:
        return False
    return any(not t.startswith("python") for t in tools)


def verify_all():
    results = []
    for mission_dir in sorted(MISSIONS.iterdir()):
        if not mission_dir.is_dir():
            continue
        verifier = mission_dir / "verify.py"
        records_dir = mission_dir / "records"
        if _needs_heavy_tools(mission_dir):
            for record in sorted(records_dir.glob("*.json")) if records_dir.exists() else []:
                results.append(
                    {"mission": mission_dir.name, "record": record.name,
                     "valid": True, "skipped": True,
                     "score": _claimed_score(record),
                     "author": _author(record), "date": _date(record),
                     "detail": "skipped here — verified by its dedicated workflow"}
                )
            continue
        if not verifier.exists():
            results.append(
                {"mission": mission_dir.name, "record": None, "valid": False,
                 "detail": "missing verify.py"}
            )
            continue
        record_files = sorted(records_dir.glob("*.json")) if records_dir.exists() else []
        if not record_files:
            results.append(
                {"mission": mission_dir.name, "record": None, "valid": False,
                 "detail": "no records — every mission needs at least one passing witness"}
            )
            continue
        for record in record_files:
            try:
                proc = subprocess.run(
                    [sys.executable, str(verifier), str(record)],
                    capture_output=True, text=True, timeout=TIMEOUT_SECONDS,
                )
                out = (proc.stdout + proc.stderr).strip()
                valid = proc.returncode == 0 and out.startswith("VALID")
                score = None
                m = re.search(r"VALID score=(\d+)", out)
                if m:
                    score = int(m.group(1))
                results.append(
                    {"mission": mission_dir.name,
                     "record": record.name,
                     "valid": valid,
                     "score": score,
                     "author": _author(record),
                     "date": _date(record),
                     "detail": out.splitlines()[0] if out else "no output"}
                )
            except subprocess.TimeoutExpired:
                results.append(
                    {"mission": mission_dir.name, "record": record.name,
                     "valid": False, "detail": f"timeout after {TIMEOUT_SECONDS}s"}
                )
    return results


def _read_field(record: Path, field: str):
    try:
        return json.load(open(record)).get(field)
    except Exception:
        return None


def _author(record: Path):
    return _read_field(record, "author")


def _claimed_score(record: Path):
    return _read_field(record, "score")


def _date(record: Path):
    return _read_field(record, "date")


def main():
    results = verify_all()
    if "--json" in sys.argv:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            status = "skip" if r.get("skipped") else ("ok " if r["valid"] else "FAIL")
            print(f"[{status}] {r['mission']}/{r.get('record')}: {r['detail']}")
    if not all(r["valid"] for r in results):
        sys.exit(1)


if __name__ == "__main__":
    main()
