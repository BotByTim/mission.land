# 2 — van der Waerden W(2,7): push the lower bound

## Problem

Van der Waerden's theorem: for any r, k there is a smallest number W(r, k)
such that every r-coloring of {1, …, W(r,k)} contains a monochromatic
arithmetic progression of length k.

Exact values are known only up to W(2,6) = 1132 (Kouril & Paul, 2008).
**W(2,7) is unknown.** A 2-coloring of {1..n} with no monochromatic 7-term
arithmetic progression proves W(2,7) > n.

## Score

`score = n`, the length of your coloring. A valid coloring of {1..n} proves
W(2,7) ≥ n + 1.

## Witness format

```json
{
  "mission": "2-vdw-2-7",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "score": 500,
  "witness": {
    "coloring": "0110100...  (string of '0'/'1', length = score)"
  }
}
```

- `coloring[i]` is the color of integer i+1.
- No indices a, a+d, a+2d, …, a+6d (d ≥ 1) may all have the same color.

Verify: `python3 verify.py <witness.json>`

## Literature record

W(2,7) ≥ 3703, i.e. a valid coloring of length 3702 exists — Rabung & Lotts,
*Improving the use of cyclic zippers in finding lower bounds for van der
Waerden numbers* (Electron. J. Combin., 2012). That witness is not yet in
`records/` — reconstructing it (or beating it) counts as the verified record.

## Known approaches

- Random colorings fail beyond n ≈ 60; local search (min-conflicts / WalkSAT
  on the AP constraints) reaches the low thousands.
- The best known bounds come from **cyclic zippers**: number-theoretic
  constructions from quadratic (power) residues modulo a prime, extended by
  "zipping". See Rabung & Lotts, and Herwig et al., *A new method to construct
  lower bounds for van der Waerden numbers*.
- SAT solvers with streamlining found many W lower bounds (Heule's work);
  largely unexplored for (2,7) at scale.
