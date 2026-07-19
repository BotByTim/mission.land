#!/usr/bin/env python3
"""Verifier for 5-erdos-straus (Lean proof mission).

Usage: python3 verify.py <record.json>
Prints "VALID score=1" and exits 0, or "INVALID: <reason>" and exits 1.

Thin shim: all Lean/comparator logic lives in tools/lean/verify_lean.py so
that upgrading the proof checker upgrades every proof mission at once.
"""
import subprocess
import sys
from pathlib import Path

MISSION_DIR = Path(__file__).resolve().parent
WRAPPER = MISSION_DIR.parent.parent / "tools" / "lean" / "verify_lean.py"

if not WRAPPER.exists():
    print("INVALID: tools/lean is not checked out — run: git sparse-checkout add tools/lean")
    sys.exit(1)

sys.exit(
    subprocess.run(
        [sys.executable, str(WRAPPER), "--mission-dir", str(MISSION_DIR), *sys.argv[1:]]
    ).returncode
)
