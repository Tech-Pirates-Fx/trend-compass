# UI Brief (owner: CODEX, `web/` only; tasks U1-U4 in docs/TASKS.md)

## Goal
A space + pirate fusion for team "Tech Pirates" that is still a trustworthy science tool. Pirate flavour lives in headings, labels and microcopy only (for example "Captain's log", "Chart your course"). Science explanations and statistics stay in plain English.

## Priorities (in this order)
1. **Placement and structure:** the first screen answers WHAT is changing, WHERE, HOW MUCH, and is it SIGNIFICANT.
2. **Trust:** a "Where this data comes from" panel, an honest verdict badge, and the MOCK banner exactly as it works now (driven by the API `is_mock` flag).
3. **Memorability:** globe, glass cards, atmosphere effects.

## Visual language
- Dark-first deep-space palette (navy / near-black) with gold and teal accents and soft glow. Light mode must also work.
- Original motifs only: compass rose (ties to "Trend Compass"), treasure-map grid HUD, a simple original skull-and-crossbones, spyglass, stars. NO copyrighted characters or logos (no Disney, One Piece, etc.).
- Glass cards: backdrop blur, subtle borders, text contrast at WCAG AA or better.
- Atmosphere (U4): rain-on-glass droplets, sun/lens flare, star field. Low intensity, text stays readable, purely decorative (never implies data).

## U1: Theme and shell
Design tokens, fonts, light/dark, navbar with compass mark, footer (credit line for NASA data, generic until real datasets are in, plus "Tech Pirates"), reusable GlassCard, Badge, HudFrame, SectionHeader, VerdictBadge (colour + icon + text), ProvenancePanel. No new dependencies unless listed here.

## U2: Pages
- **Landing:** hero, the four-question strip, a result preview that is clearly labelled while data is mock, CTAs "Start investigating" and "Watch a demo".
- **Wizard:** What -> Where -> When. Keep numeric bbox inputs, presets and free box drawing.
- **Results:** first viewport shows verdict, rate per decade, confidence interval, region and variable; then chart, statistics table, provenance panel, explainer.
- **ProvenancePanel** reads an optional `provenance` object from the API (`dataset_name, version, source_url, retrieval_date, units, baseline, spatial_resolution, temporal_coverage, citation, smoothing`) and shows a clear empty state when absent. Mirror the type in `web/lib/types.ts` as optional fields only.
- Reserved slots, hidden until their data exists: variable screening, trend map, Detective Mode.
- Also fix the web-side Known issues: 4 (two-corner drawing must not sort longitudes, so antimeridian boxes work), 5 (dates and defaults come from API/catalog metadata, not hardcoded years), 8 (remove or cite every uncited scientific claim in presets, demo cases and copy; when unsure, keep only generic plain definitions). The existing demo JSON stays labelled MOCK until ANTI regenerates it.

## U3: Globe region picker
- Rotate, zoom, hover and click. Selecting a country produces a bounding box, with antimeridian handling (for example Russia, USA, Fiji), and a note: "bounding box, not the exact outline".
- KEEP: free box drawing/placing anywhere (needed for ocean variables), numeric inputs, presets, and the 2D map fallback. Add a keyboard-accessible country search/list.
- Minimum box size: warn when a selection covers fewer than ~4 cells of a 2 x 2 degree grid.
- Country borders from an open dataset (for example Natural Earth): verify the licence first. Earth texture: NASA imagery only if its usage terms allow (verify). NASA GIBS BlueMarble may serve as the 2D basemap (tile endpoint returned HTTP 200 earlier). List every asset and licence in `docs/DATA_AND_AI.md`.
- Dependencies: the app is on Next 14 / React 18. Check peer dependencies BEFORE installing `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`; pin compatible versions; one line of justification in STATUS. Install nothing else.
- Performance: lazy-load (`ssr:false`), cap devicePixelRatio, pause when the tab is hidden, fall back to a static gradient + 2D map when WebGL is unavailable. Report the bundle-size impact.

## U4: Atmosphere effects and screenshots
Rain, flare and star field with `prefers-reduced-motion` support (disable effects and auto-rotation), a low-power fallback, and no effect over text-heavy panels. Screenshots into `docs/screenshots/`: landing (1920x1080 and 1080x1920), globe with a selected country, wizard step 2. NEVER screenshot result pages while any mock data is active.

## Accessibility (all tasks)
Keyboard operation, labels, colour is never the only signal, contrast checked in both themes.

## Hard rules
- Edit only `web/` (and `docs/` for your reports). Do not touch `api/` or `data-pipeline/`.
- Never invent numbers. Do not remove `MapSelector` or the bbox model.
- Commit only your own folders with `git add web/ docs/...`, never `git add -A`.
- Report in at most 10 lines in `docs/STATUS.md`. Do not ask questions in chat.
