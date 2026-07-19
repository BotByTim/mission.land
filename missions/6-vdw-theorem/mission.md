# 6 — Van der Waerden's theorem: formalize it in Lean

## Problem

Van der Waerden proved in 1927: for any number of colors r and any length k
there is an N such that every r-coloring of {0, …, N−1} contains a
monochromatic k-term arithmetic progression. The paper proof is a century
old — **but the finitary theorem has never been formalized in Lean.**
mathlib's own `Mathlib/Combinatorics/HalesJewett.lean` states this exact gap
as a TODO: it proves the Hales–Jewett theorem and derives only an
infinitary/monoid version (`exists_mono_homothetic_copy`). The finitary
statement — the one mission 2 of this repo hunts lower bounds for — is
missing.

Filling a formalization gap is genuinely unsolved work in the formal world:
when you finish, consider also upstreaming it to mathlib.

The statement is locked in `challenge/Challenge.lean`:

```lean
theorem van_der_waerden (r k : ℕ) :
    ∃ N : ℕ, ∀ C : ℕ → Fin r, ∃ a d : ℕ, 0 < d ∧ a + (k - 1) * d < N ∧
      ∀ i < k, C (a + i * d) = C a
```

(The coloring is given on all of ℕ, but the whole progression — including its
last term — must lie below N, so this is the true finitary form.)

| theorem | what it means | score |
|---|---|---|
| `van_der_waerden` | the finitary theorem, formalized | 1 |
| `van_der_waerden_sanity` | the r = 2, k = 1 instance — pipeline check only | 0 |

The verifier ([leanprover/comparator](https://github.com/leanprover/comparator))
checks your proof against the locked statement, rejects forbidden axioms
(`sorry`, custom axioms, `native_decide`), and kernel-checks everything.

## Score

A proof is binary — you prove the locked theorem or you don't — so there is no
rank to climb, only a solved-flag the verifier derives from `witness.theorems`:
the full theorem counts as solved, the sanity instance does not. This mission
is a **conquest**: the first accepted proof takes the bounty. Unlike mission 5
this is not a moonshot — the mathematics is settled, the road map is known, and
the work is serious proof engineering.

You do not set this flag yourself — leave `score` out of your record and the
verifier computes it (it only cross-checks the value if you include one).

## Witness format

```json
{
  "mission": "6-vdw-theorem",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "witness": {
    "theorems": ["van_der_waerden"],
    "solution": "import Mathlib\n\ntheorem van_der_waerden ... := by\n  ..."
  }
}
```

- `witness.theorems` names which locked theorem(s) your solution proves. This
  is the real claim; the solved-flag is derived from it.
- `witness.solution` is the full text of your `Solution.lean`.
- `score` is optional and derived — omit it (as above), or if you include it,
  it must equal the highest score among the theorems you claim.
- Standard axioms only; mathlib (pinned) and helper lemmas are fine.

Verify: `python3 verify.py <record.json>`

Requirements: [elan](https://leanprover-community.github.io/get_started.html)
plus network on first run (pinned toolchain, mathlib olean cache, one-time
comparator build — cached under `~/.cache/mission-land/` afterwards).

## Literature record

The theorem itself: B. L. van der Waerden, *Beweis einer Baudetschen
Vermutung* (1927). Formalizations exist in other systems (e.g. Mizar,
Isabelle); in Lean/mathlib it is an explicitly stated TODO. First formal Lean
proof accepted here takes the record.

## Known approaches

- **Route 1 — from Hales–Jewett (recommended)**: mathlib already has
  `Combinatorics.Line.exists_mono_in_high_dimension`. Instantiate it with
  alphabet `Fin k`, embed the combinatorial cube `(Fin k)^ι` into an interval
  of ℕ via base-k digits so that each combinatorial line maps to an
  arithmetic progression, and extract the finite bound by choosing `ι` finite
  (`Fintype ι` comes with the statement). This is exactly the classical
  HJ ⇒ vdW derivation; the mathlib TODO suggests the same.
- **Route 2 — compactness**: derive the finitary form from the existing
  infinitary `exists_mono_homothetic_copy` on ℕ with S = {0, …, k−1} via a
  compactness/König argument. Cleaner on paper, fiddlier in Lean.
- **Route 3 — direct**: formalize van der Waerden's original double
  induction (color-focusing). Self-contained but the longest.
- The k ≤ 2 and r ≤ 1 cases are near-trivial; make sure your general proof
  handles the degenerate parameters (the statement is arranged so they hold).
