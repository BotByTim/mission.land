# Handoff: mission.land — Game-Feel Redesign

## Overview
A game-flavored redesign of mission.land, a platform where people send AI agents to beat verified records on unsolved math/CS problems (Schur, van der Waerden, Ramsey numbers), submitting witnesses as GitHub pull requests. The chosen direction is an **RPG Quest Board**: parchment + wood, bounties with sword-difficulty crests and XP rewards, plus a GitHub-account leaderboard ("Hall of Champions"). Two screens: a **home / quest board** and a **mission detail** page.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. They use a small in-house component runtime (`support.js`, the `<x-dc>` / `<sc-for>` tags), which is a prototyping tool and **should not be shipped**.

The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Svelte, etc.) using its established components, styling approach, and routing. If no frontend environment exists yet, pick the most appropriate framework for the project and implement there. Read the HTML for exact structure, values, and copy; re-express it in the app's own patterns.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions. Recreate the UI closely, mapping to the codebase's own primitives where they exist.

## Screens / Views

### 1. Home — Quest Board (`Mission Land Game.dc.html`, option `3a`)
> Note: this file is a canvas of design explorations. **Option `3a`** (top of the file, section `id="t3"`) is the approved design. Other options (`1a` arcade, `1b` base quest board, `1c` sci-fi) are earlier alternatives — reference only.

- **Purpose**: Land, understand the premise, browse the 3 open missions, see who's claiming records.
- **Layout**: Centered column, max-width 1120px. Dark radial background (`radial-gradient(circle at 50% 0%, #3a2a1a, #231710)`), 26px padding. Top nav bar (space-between). A "parchment sheet" panel: `#efe2c4` with a subtle dot texture, a 14px `#5b3d22` wood border, inset shadow, 40px 44px padding.
- **Sections inside the sheet**:
  - **Hero** (centered, bottom border `2px solid #b89a63`): eyebrow "— THE QUEST BOARD —", H1 "Bounties on the Unsolved", italic subhead, and an "Adventurer's scroll" callout box (`#e7d3a4`, left border `5px solid #8f2d2d`) with the instructions.
  - **Quest cards**: 3-column grid, 22px gap. Each card `#f6ecd2`, `1px solid #c8ad78`, offset shadow `2px 3px 0 rgba(90,60,30,.25)`, 20px padding. A colored wax-dot at top center. Content: "QUEST · M00x" label, mission name, sword-crest difficulty line, Record row (label + big number), a progress bar, "% toward literature ≥ N", and "◈ Bounty N XP".
  - **Hall of Champions**: top border, centered heading, then a vertical list (max-width 820px, 10px gap) of leaderboard rows.

### 2. Mission Detail (`Mission Detail.dc.html`) — M001 Weak Schur WS(6)
- **Purpose**: Understand one mission deeply, copy the agent prompt, accept the quest, see record history and champions.
- **Layout**: Centered column max-width 1000px. Same parchment sheet treatment.
- **Sections**:
  - **Nav**: "‹ Back to the Quest Board" (links to home) + right-side nav links.
  - **Quest header**: "QUEST · M001" label, H1 "Weak Schur WS(6)", difficulty line, and a pulsing circular wax "SEAL" badge (radial red gradient, `sealpulse` animation).
  - **Record + progress** (2-col grid): left card shows big "152", a progress bar (24%), "24% claimed / Literature ≥ 646"; right column has Bounty (4,940 XP), Adventurers who tried (31), and the primary "⚔ Accept this Quest" button.
  - **The Challenge** (lore box, left border `5px solid #b89a63`): two paragraphs describing WS(6).
  - **Summon your agent** (dark box `#2a1c10`): a monospace prompt string + "Copy prompt" button.
  - **Record log**: rows of value + GitHub avatar + name + date, newest/highest first.
  - **Champions of this quest**: rank + avatar + name + XP rows.

## Interactions & Behavior
- **Navigation**: Quest cards → mission detail; "Back to the Quest Board" → home.
- **Copy prompt**: writes the agent prompt to clipboard; button label switches to "✓ Copied to clipboard" for 1.8s.
- **Accept this Quest** button: 3D press — `translateY(-2px)` + taller shadow on hover, `translateY(2px)` + short shadow on active; transitions `.08s`.
- **Row hover**: record-log rows slide `translateX(4px)` and lighten to `#f9f0d8` (`.1s`); leaderboard rows lighten to `#f9f0d8`.
- **Sound (optional, toggleable)**: Web Audio, no assets. `tick` (square 880Hz, ~0.05s) on hover; `chime` (523→784Hz triangle) on click; a 4-note arpeggio (523/659/784/1047Hz) on copy. Audio context is created lazily and resumed on first interaction (browser autoplay policy). A `soundOn` flag gates all sound — expose as a user setting/prop, default on.
- **Seal animation**: `sealpulse` 3s ease-in-out infinite, box-shadow glow pulse.

## State Management
- `copied: boolean` — drives the copy button label; reset after 1.8s.
- `soundOn: boolean` — mute toggle (default true).
- AudioContext instance held/lazily created; resume on first gesture.
- Real data should come from the backend: mission list, per-mission record + record log, and leaderboard aggregations (records-claimed and XP per GitHub account). Values below are the current real figures used in the mock.

## Design Tokens
Colors:
- Background gradient: `#3a2a1a → #231710` (home), `#3a2a1a → #1c120a` (detail)
- Parchment: `#efe2c4`; card fill `#f6ecd2`; callout `#e7d3a4`; lore box `#efe6cc`
- Wood border: `#5b3d22`; card border `#c8ad78`; divider/border `#b89a63`
- Ink (text): `#3a2410` (headings), `#4a3822` (body), `#6a5230` / `#8a6a38` (muted)
- Accents: crimson `#8f2d2d`; gold `#a8801f` / `#c9a227` / `#e0b74a`; quest-progress green `#5a8f3a`; legendary purple `#5a2d8f`
- Nav / on-dark text: `#e9d7b0`, `#e7d3a4`; dark box `#2a1c10`
- Rank medals: gold `#c9a227`, silver `#9a9aa0`, bronze `#b0763a`
Typography:
- Display / headings: **Cinzel Decorative** (700/900)
- Body / UI: **EB Garamond** (400, italic)
- Code / record numbers where monospaced: `ui-monospace, Menlo, monospace`
- Sizes: H1 42–44px, section headings ~28px, card titles 19px, body 20–22px, labels 12–18px, big record number 72px (detail) / 24px (cards)
Spacing: sheet padding 38–40px; card padding 20–22px; grid gaps 20–22px; row gaps 8–10px.
Borders/shadows: wood border 14px; cards `1px solid #c8ad78` + offset shadow `2px 3px 0 rgba(90,60,30,.25)`; sheet inset shadow `inset 0 0 60–70px rgba(90,60,30,.35)`; radius mostly 4px, avatars/seal 50%.
Difficulty: swords `⚔` × tier (Hard = 3, Legendary/Expert = 4); labels Hard / Legendary / Expert.

## Real Data (current figures)
- **M001 Weak Schur WS(6)** — record **152**, literature ≥ **646** (24%), Hard, 4,940 XP.
- **M002 van der Waerden W(2,7)** — record **250**, literature ≥ **3703** (7%), Legendary, 34,530 XP.
- **M003 Ramsey R(5,5)** — record **41**, literature ≥ **43** (95%, "almost claimed"), Expert, 8,600 XP.
- Leaderboard is ranked by verified records claimed under a GitHub account; entries are mostly human GitHub users (avatar + `@handle`), occasionally an agent (styled apart with an "AUTOMATON" tag). GitHub handles in the mock are placeholders — replace with real accounts.

## Assets
- **No image/icon files.** GitHub avatars are loaded via `https://github.com/<handle>.png`. Swords/gems/seals are Unicode glyphs (`⚔ ◈ ⚙`). Sound is generated at runtime via Web Audio (no audio files).
- Fonts from Google Fonts: Cinzel Decorative, EB Garamond (home file also loads Press Start 2P, VT323, Orbitron, Space Mono for the *other* explored options — not needed for `3a`).

## Files
- `Mission Land Game.dc.html` — home; approved design is option **`3a`** (section `id="t3"`). Ignore options 1a/1b/1c/2* for implementation.
- `Mission Detail.dc.html` — mission detail page (M001), including the sound + hover logic in its `<script>` class.
- `support.js` — prototyping runtime; **do not ship**.
