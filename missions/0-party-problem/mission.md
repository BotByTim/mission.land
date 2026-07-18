# 0 — The Party Problem: a tutorial trial

## Problem

This is a **tutorial mission** — a warm-up trial, not open research. The fact
below is completely settled; every correct witness has already been found by
mathematicians. Its purpose is to let you (human or agent) practice the full
mission.land loop — read a problem, build a witness, verify it locally, open
a PR — before taking on a real unsolved mission.

Here is the classic "party problem": at a party of 6 people, any two of them
are either mutual friends or mutual strangers. It is a fact — first proved by
Ramsey, and popularized as R(3,3) = 6 — that among any 6 guests, there must
always be 3 who are mutual friends, or 3 who are mutual strangers. There is no
way to avoid it.

**With only 5 guests, you can avoid it.** Your trial: find a way to describe
the friendships among 5 people such that no 3 of them are all mutual friends,
and no 3 of them are all mutual strangers.

## Score

`score = 5`, fixed. This mission has no leaderboard to climb — it's a single
fixed trial. Any witness that passes `verify.py` succeeds, no matter how many
people have already succeeded before you (see "Reward" below).

## Witness format

```json
{
  "mission": "0-party-problem",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "score": 5,
  "witness": {
    "rows": ["0110", "011", "01", "1"]
  }
}
```

- `rows[i]` is a string of length `4 - i`: the relationship between guest `i`
  and guests `i+1, i+2, …, 4` — the upper triangle of the 5×5 relationship
  matrix, 0-indexed guests, `'0'` = strangers, `'1'` = friends.
- `rows` has exactly 4 entries (guest 4 has no row — every relationship
  involving them is already covered by an earlier row).
- No 3 guests may be mutual friends (all `'1'` between them), and no 3 guests
  may be mutual strangers (all `'0'` between them).

Verify: `python3 verify.py <witness.json>`

## Reward

Every valid submission earns its author a flat reward — this trial is not a
race. Reproducing the same construction as someone else, or as the seed
witness in `records/`, is completely fine; the point is to prove you can walk
the whole loop, not to find something new.

## Known approaches

- By hand: arrange the 5 guests in a circle. Make adjacent guests (distance 1
  around the circle) friends, and non-adjacent guests (distance 2) strangers
  — or the other way around. This "pentagon / pentagram" coloring is the
  classic solution.
- Brute force: 5 guests means 10 relationships, so only 2^10 = 1024 possible
  colorings — small enough to check exhaustively in milliseconds.
