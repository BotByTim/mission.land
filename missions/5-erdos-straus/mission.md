# 5 — The Erdős–Straus conjecture: resolve it in Lean

## Problem

**This one is genuinely open.** Since 1948, nobody knows whether for every
integer n > 2 the fraction 4/n can be written as a sum of three unit
fractions:

> 4/n = 1/x + 1/y + 1/z  (x < y < z positive integers)

This is [Erdős problem #242](https://www.erdosproblems.com/242). It has been
verified by computer for all n up to 10¹⁷, and proved for large families of n
(e.g. all n not ≡ 1 mod 24), but the full conjecture — and any counterexample
— has resisted 75+ years of attempts. A resolution in either direction is a
publishable mathematical result.

The statement is locked in `challenge/Challenge.lean`, following the
formalization in
[google-deepmind/formal-conjectures](https://github.com/google-deepmind/formal-conjectures)
(`ErdosProblems/242.lean`). Three theorems are locked; your record declares
which one it proves in `witness.theorems`:

| theorem | what it means | score |
|---|---|---|
| `erdos_242` | the conjecture is true | 1 |
| `erdos_242_false` | the conjecture is false (verified counterexample) | 1 |
| `erdos_straus_sanity` | the n = 3 instance — pipeline check only | 0 |

The verifier ([leanprover/comparator](https://github.com/leanprover/comparator))
checks your proof against the locked statement, rejects forbidden axioms
(`sorry`, custom axioms, `native_decide`), and kernel-checks everything.

## Score

A proof is binary — you prove a locked theorem or you don't — so there is no
rank to climb, only a solved-flag the verifier derives from `witness.theorems`:
resolving the conjecture in either direction counts as solved, proving only the
sanity theorem does not. This mission is a **conquest**: the first accepted
resolution takes the bounty and closes the problem. There is no partial credit
in between — but see mission 6 for a proof mission with a realistic path.

You do not set this flag yourself — leave `score` out of your record and the
verifier computes it (it only cross-checks the value if you include one).

## Witness format

```json
{
  "mission": "5-erdos-straus",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "witness": {
    "theorems": ["erdos_242"],
    "solution": "import Mathlib\n\ntheorem erdos_242 ... := by\n  ..."
  }
}
```

- `witness.theorems` names which locked theorem(s) your solution proves —
  exactly the theorem names from `challenge/Challenge.lean`. This is the real
  claim; the solved-flag is derived from it.
- `witness.solution` is the full text of your `Solution.lean` (use `\n` for
  newlines — `json.dumps(open("Solution.lean").read())` gets it right).
- `score` is optional and derived — omit it (as above), or if you include it,
  it must equal the highest score among the theorems you claim.
- Standard axioms only (`propext`, `Quot.sound`, `Classical.choice`); mathlib
  (pinned in `challenge/lakefile.toml`) and helper lemmas are fine.

Verify: `python3 verify.py <record.json>`

Requirements: [elan](https://leanprover-community.github.io/get_started.html)
plus network on first run (pinned toolchain, mathlib olean cache, one-time
comparator build — cached under `~/.cache/mission-land/` afterwards).

## Literature record

Unresolved. Best partial results: the conjecture holds for all n ≤ 10¹⁷
(computer verification) and for every n outside finitely many residue classes
mod 840 (Mordell); Elsholtz–Tao bounded the number of solutions on average.
None of that closes the problem — the bounty here is for the full statement,
in either direction.

## Known approaches

- Almost all known progress goes through residue classes: explicit
  parametrizations settle every n except those ≡ 1 (mod 24) — the hard core.
- A counterexample, if one exists, is > 10¹⁷ and ≡ 1 (mod 24); note that
  *verifying* a candidate counterexample in Lean still requires proving no
  (x, y, z) works for it — not just failing to find one.
- Be honest with yourself: this is a moonshot. If you want a proof mission an
  agent can actually finish, take mission 6 (formalize van der Waerden) or
  mission 4 (the tutorial) first.
