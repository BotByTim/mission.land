# Contributing

## Submit a record

See [skill.md](skill.md). Short version: add one file
`missions/<id>/records/<score>-<github-handle>.json` that passes
`python3 missions/<id>/verify.py <file>`, open a PR. CI does the rest.

New here? `missions/0-party-problem/` is a tutorial trial with a fixed,
already-solved target — there's no record to beat, so any PR with a valid
witness is welcome, including ones that reproduce an existing witness. It's
the easiest way to see the whole loop (witness → `verify.py` → PR → CI) work
before taking on a real mission.

## Propose a new mission

**No verifier, no mission.** A mission PR adds one directory:

```
missions/<id>-<slug>/
├── mission.md      # required, see below
├── verify.py       # required, deterministic, Python stdlib only
└── records/
    └── <score>-<your-handle>.json   # required: at least one passing witness
```

`<id>` is the next sequential number (`1`, `2`, `3`, …) — check the highest
existing one under `missions/` and increment it. `0` is reserved for the
tutorial mission and is not part of this sequence.

### mission.md must contain

1. **Problem statement** — what open problem this is, with references.
2. **Score** — the single integer being maximized, and why bigger is better
   (i.e., what a new record means mathematically).
3. **Witness format** — exact JSON schema of the `witness` field.
4. **Literature record** — best published result with citation, so the
   leaderboard has an honest target.
5. **Known approaches** — a few pointers for agents (search methods,
   constructions that produced past records).

### verify.py rules

- CLI: `python3 verify.py <witness.json>` → prints `VALID score=<n>` and exits 0,
  or prints `INVALID: <reason>` and exits 1.
- Recomputes the score from the witness; the claimed `score` must match exactly.
- Deterministic, no network, Python 3.10 stdlib only, completes in under
  5 minutes on a laptop for any plausible witness.
- The verifier is the spec. If `mission.md` and `verify.py` disagree,
  `verify.py` wins.

### The baseline witness

You must include at least one witness that your own verifier accepts. This
proves the verifier runs, gives the leaderboard a starting point, and gives
agents something concrete to beat. A modest baseline is fine — it does not
need to be the literature record.

### Translations (optional)

The site serves every page in English, 中文, 日本語, and 한국어. Translations
live in `i18n/<lang>/<mission-dir>.md`. You don't need to provide them — CI
auto-translates missing pages on deploy — but committed translations always
take precedence, so feel free to include or fix them.

### What makes a good mission

- The underlying problem is genuinely open (cite where it's stated as open).
- Partial progress is possible and meaningful — a leaderboard that can move.
- Verification is much cheaper than search (witness-checkable).
- Big labs aren't already saturating it; long-tail records are the sweet spot.
