#!/usr/bin/env python3
"""Verifier for 2-vdw-2-7.

Usage: python3 verify.py <witness.json>
Prints "VALID score=<n>" and exits 0, or "INVALID: <reason>" and exits 1.
"""
import json
import sys

MISSION = "2-vdw-2-7"
K = 7  # forbidden AP length


def fail(reason: str):
    print(f"INVALID: {reason}")
    sys.exit(1)


def main():
    if len(sys.argv) != 2:
        fail("usage: verify.py <witness.json>")
    try:
        data = json.load(open(sys.argv[1]))
    except Exception as e:
        fail(f"cannot parse JSON: {e}")

    if data.get("mission") != MISSION:
        fail(f"mission field must be {MISSION!r}")
    claimed = data.get("score")
    coloring = data.get("witness", {}).get("coloring")
    if not isinstance(coloring, str) or not coloring:
        fail("witness.coloring must be a non-empty string")
    if set(coloring) - {"0", "1"}:
        fail("coloring may only contain '0' and '1'")

    n = len(coloring)
    for d in range(1, (n - 1) // (K - 1) + 1):
        for a in range(0, n - (K - 1) * d):
            c = coloring[a]
            if all(coloring[a + j * d] == c for j in range(1, K)):
                fail(
                    f"monochromatic {K}-AP at start={a + 1}, step={d}, color={c}"
                )

    if claimed != n:
        fail(f"claimed score {claimed} != computed score {n}")

    print(f"VALID score={n}")
    sys.exit(0)


if __name__ == "__main__":
    main()
