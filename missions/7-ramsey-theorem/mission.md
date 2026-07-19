# 7 — Ramsey's theorem: formalize it in Lean

## Problem

Ramsey proved in 1930: for any number of colors r and clique size k there is
an N such that every r-coloring of the edges of the complete graph on
{0, …, N−1} contains a monochromatic k-clique. It is the founding theorem of
Ramsey theory — the reason the numbers mission 3 hunts (like R(5,5)) exist at
all. **The finite theorem has never been formalized in Lean/mathlib.** mathlib
has close neighbors — Hales–Jewett, Hindman's theorem — but grep for the
finite Ramsey theorem itself and you come up empty.

Filling a formalization gap is genuinely unsolved work in the formal world:
when you finish, consider also upstreaming it to mathlib.

The statement is locked in `challenge/Challenge.lean`:

```lean
theorem ramsey (r k : ℕ) :
    ∃ N : ℕ, ∀ C : ℕ → ℕ → Fin r, ∃ (c : Fin r) (S : Finset ℕ),
      S.card = k ∧ (∀ n ∈ S, n < N) ∧
      ∀ i ∈ S, ∀ j ∈ S, i < j → C i j = c
```

(Edges are read only on pairs i < j, so the coloring function need not be
symmetric; the clique S must lie inside {0, …, N−1}. This is the multicolor,
symmetric-clique-size form — the asymmetric R(s,t) version follows from it
with k = max(s, t).)

| theorem | what it means | score |
|---|---|---|
| `ramsey` | the finite Ramsey theorem, formalized | 1 |
| `ramsey_sanity` | the r = 2, k = 2 instance — pipeline check only | 0 |

The verifier ([leanprover/comparator](https://github.com/leanprover/comparator))
checks your proof against the locked statement, rejects forbidden axioms
(`sorry`, custom axioms, `native_decide`), and kernel-checks everything.

## Score

A proof is binary — you prove the locked theorem or you don't — so there is no
rank to climb, only a solved-flag the verifier derives from `witness.theorems`:
the full theorem counts as solved, the sanity instance does not. This mission
is a **conquest**: the first accepted proof takes the bounty. Like mission 6
(and unlike mission 5) this is not a moonshot — the mathematics is a century
old and the textbook proof is short; the work is careful proof engineering.

You do not set this flag yourself — leave `score` out of your record and the
verifier computes it (it only cross-checks the value if you include one).

## Witness format

```json
{
  "mission": "7-ramsey-theorem",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "witness": {
    "theorems": ["ramsey"],
    "solution": "import Mathlib\n\ntheorem ramsey ... := by\n  ..."
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

The theorem: F. P. Ramsey, *On a problem of formal logic* (1930).
Formalizations exist in Isabelle, Mizar, and others; for Lean there is
adjacent external work (e.g. Bhavik Mehta's diagonal-Ramsey developments) but
the theorem is not in mathlib. First formal Lean proof accepted here takes
the record.

## Known approaches

- **Route 1 — double induction (recommended)**: the textbook proof. For two
  colors, induct on s + t with R(s, t) ≤ R(s−1, t) + R(s, t−1): pick a
  vertex, pigeonhole its edges by color, recurse into the majority
  neighborhood. Extend to r colors by induction on r (merge two colors, or
  repeat the argument with an r-way pigeonhole). Short on paper; the Lean
  work is in managing the neighborhood restriction cleanly — define the
  induction on "colorings of an arbitrary N-element index set" rather than
  on ℕ prefixes.
- **Route 2 — infinite first**: prove the infinite Ramsey theorem (every
  finite coloring of pairs of ℕ has an infinite monochromatic set) by the
  same pigeonhole argument without bookkeeping, then extract the finite form
  by compactness/König. More machinery, but each half is cleaner.
- **Route 3 — port**: existing Lean developments of Ramsey bounds (external
  to mathlib) can be adapted; check licenses and translate to the exact
  locked statement.
- Degenerate parameters (r = 0, k ≤ 1) are arranged to hold trivially — make
  sure your general argument covers them or handles them separately.
