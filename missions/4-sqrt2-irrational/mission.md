# 4 — √2 is irrational: your first Lean proof

## Problem

This is a **tutorial mission** — the Lean counterpart of mission 0. The fact
below has been settled for ~2,500 years; it is #1 on [Freek Wiedijk's list of
100 theorems](https://www.cs.ru.nl/~freek/100/) and already lives in mathlib.
Its purpose is to let you practice the *proof mission* loop — write a Lean
proof, verify it locally with the comparator, submit it as a PR — before
proof missions with real substance arrive.

The theorem: **the square root of 2 is not a rational number.** The classic
proof is by infinite descent: if √2 = p/q in lowest terms, then p² = 2q²
forces p even, then q even — contradicting lowest terms.

Your trial: prove it in Lean 4. The statement is locked in
`challenge/Challenge.lean`:

```lean
theorem sqrt2_irrational : Irrational (Real.sqrt 2)
```

Write a `Solution.lean` that proves a theorem with exactly this name and
exactly this type. The verifier
([leanprover/comparator](https://github.com/leanprover/comparator)) checks
your proof against the locked statement, rejects forbidden axioms (`sorry`,
custom axioms, `native_decide`), and re-checks everything with the Lean
kernel — so there is no way to cheat the statement.

## Score

`score = 1`, fixed. This is a solve-type mission: there is no record to beat,
and any proof the verifier accepts succeeds — no matter how many people have
already succeeded before you (see "Reward" below).

## Witness format

Your record embeds the complete `Solution.lean` source as a JSON string:

```json
{
  "mission": "4-sqrt2-irrational",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "score": 1,
  "witness": {
    "solution": "import Mathlib\n\ntheorem sqrt2_irrational : Irrational (Real.sqrt 2) := by\n  ..."
  }
}
```

- `witness.solution` is the full text of your `Solution.lean` (use `\n` for
  newlines — `json.dumps(open("Solution.lean").read())` gets it right).
- It must prove `sqrt2_irrational : Irrational (Real.sqrt 2)` using only the
  standard axioms (`propext`, `Quot.sound`, `Classical.choice`).
- It may import mathlib (pinned in `challenge/lakefile.toml`) and define any
  helper lemmas it likes.

Verify: `python3 verify.py <record.json>`

Requirements: [elan](https://leanprover-community.github.io/get_started.html)
(the Lean toolchain manager) plus network access on first run — the verifier
downloads the pinned toolchain, the prebuilt mathlib cache, and builds the
comparator once (cached under `~/.cache/mission-land/` afterwards).

## Reward

Every valid submission earns its author the same flat reward — this trial is
not a race. A one-line proof reusing mathlib's own lemma counts exactly as
much as a from-scratch proof; the point is to walk the whole loop, not to be
original.

## Known approaches

- **The one-liner**: mathlib already proves this theorem — find the lemma
  (its name is very guessable, or search with `exact?`) and apply it.
- **From scratch**: prove `¬ ∃ p q : ℕ, ...` by the classic descent argument,
  then connect it to `Irrational (Real.sqrt 2)` via
  `Nat.Prime.irrational_sqrt` or `irrational_nrt_of_notint_nrt`. A good
  exercise, entirely optional.
- What will be rejected, automatically: `sorry` anywhere, `axiom`
  declarations, `native_decide`, proving a different (weaker) statement, or
  renaming the theorem. The comparator checks name, type, and axioms against
  the locked challenge.
