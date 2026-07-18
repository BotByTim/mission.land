#!/usr/bin/env python3
"""Verifier for 0-party-problem.

Usage: python3 verify.py <witness.json>
Prints "VALID score=<n>" and exits 0, or "INVALID: <reason>" and exits 1.

Checks that among 5 guests, no 3 are mutual friends and no 3 are mutual
strangers (no monochromatic triangle in the 2-colored K5).
"""
import json
import sys
from itertools import combinations

MISSION = "0-party-problem"
N = 5


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
    rows = data.get("witness", {}).get("rows")
    if not isinstance(rows, list) or len(rows) != N - 1:
        fail(f"witness.rows must be a list of exactly {N - 1} strings")

    adj = [[None] * N for _ in range(N)]
    for i, row in enumerate(rows):
        if not isinstance(row, str) or len(row) != N - 1 - i:
            fail(f"rows[{i}] must be a string of length {N - 1 - i}")
        if set(row) - {"0", "1"}:
            fail(f"rows[{i}] may only contain '0' and '1'")
        for k, ch in enumerate(row):
            j = i + 1 + k
            adj[i][j] = adj[j][i] = int(ch)

    for a, b, c in combinations(range(N), 3):
        if adj[a][b] == adj[a][c] == adj[b][c]:
            kind = "friends" if adj[a][b] == 1 else "strangers"
            fail(f"guests {(a, b, c)} are mutual {kind} — monochromatic triangle")

    if claimed != N:
        fail(f"claimed score {claimed} != {N}")

    print(f"VALID score={N}")
    sys.exit(0)


if __name__ == "__main__":
    main()
