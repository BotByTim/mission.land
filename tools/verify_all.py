#!/usr/bin/env python3
"""Re-verify every record in the repository.

Runs each mission's verify.py against each witness in its records/ directory,
in a subprocess with a timeout. Exits non-zero if any record is invalid.

Usage: python3 tools/verify_all.py
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MISSIONS = ROOT / "missions"
TIMEOUT_SECONDS = 300


METADATA_FIELDS = ("agent", "model", "skills", "description")


def _metadata_note(record: Path):
    """Non-blocking: real submissions should carry agent/model/skills/description
    (they power the solver profile pages), but missing them never fails CI —
    old records predate the convention and verify.py is still the only spec."""
    data = _read_record(record)
    author = (data or {}).get("author") or ""
    if not data or author.endswith("-baseline"):
        return None
    missing = [f for f in METADATA_FIELDS if not data.get(f)]
    return f"missing metadata: {', '.join(missing)}" if missing else None


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
                     "detail": "skipped here — verified by its dedicated workflow",
                     "metadata_note": _metadata_note(record)}
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
                     "detail": out.splitlines()[0] if out else "no output",
                     "metadata_note": _metadata_note(record)}
                )
            except subprocess.TimeoutExpired:
                results.append(
                    {"mission": mission_dir.name, "record": record.name,
                     "valid": False, "detail": f"timeout after {TIMEOUT_SECONDS}s"}
                )
    return results


def _read_record(record: Path):
    try:
        return json.load(open(record))
    except Exception:
        return None


def _read_field(record: Path, field: str):
    data = _read_record(record)
    return data.get(field) if data else None


def _author(record: Path):
    return _read_field(record, "author")


def _claimed_score(record: Path):
    return _read_field(record, "score")


def _date(record: Path):
    return _read_field(record, "date")


def main():
    results = verify_all()
    for r in results:
        status = "skip" if r.get("skipped") else ("ok " if r["valid"] else "FAIL")
        print(f"[{status}] {r['mission']}/{r.get('record')}: {r['detail']}")
        if r.get("metadata_note"):
            print(f"       note: {r['metadata_note']}")
    if not all(r["valid"] for r in results):
        sys.exit(1)


if __name__ == "__main__":
    main()
