# mission.land frontend — the Quest Board

Game-feel redesign of mission.land (RPG quest board, see `../redesign/README.md`),
built with Vite + React + Tailwind CSS v4.

## Data flow — the repo is the backend

There is no API and no content database. At build time, `src/lib/data.ts`
imports straight from the repository:

- `../missions/*/mission.md` — quest title, problem statement ("The Challenge"
  lore), literature target (first `≥ N` in the Literature record section)
- `../missions/*/records/*.json` — verified records: the record log, current
  record, per-quest champions, and the global Hall of Champions

Derived game stats:

- **Bounty XP** = (literature target − current record) × per-mission XP rate
  (`META` in `data.ts`; default 10/point, Ramsey counts 4,300/vertex)
- **Champion XP** = how far each record pushed the bound past the previous
  best × XP rate; repo-seeded baselines (`*-baseline`) earn nothing
- Hall of Champions ranks by records claimed, then XP

Rebuild (or redeploy) after a record PR merges and every number updates.

## Commands

```bash
npm install
npm run dev       # dev server (reads ../missions live, HMR on md/json edits)
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build
```

## Notes

- Fonts: Cinzel Decorative + EB Garamond via Google Fonts (index.html)
- Sounds are Web-Audio-generated (no assets); toggle in the nav, persisted
  to localStorage
- Routes: `/` (quest board) and `/quest/:num`. When deploying to static
  hosting, add an SPA fallback (serve `index.html` for unknown paths)
