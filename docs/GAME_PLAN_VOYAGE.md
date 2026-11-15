# Voyage of the Compass: playable game plan (v4)

Owner: Joshua (Tech Pirates). Written 2026-11-15. This plan REPLACES the player-facing mechanics of `docs/GAME_IMPLEMENTATION_PLAN.md` and the 6-scene "predict, scan, celebrate" flow in `/play`. It KEEPS the integrity rules in section 9. Read sections 0 to 6 fully; the rest are reference.

## 0. TL;DR for the executor
- Build a real-time 2D game in **Phaser 3** (already installed). The player SAILS a space-pirate galleon over a navigable chart of the Earth. The sea is tinted by real NASA data. The player finds "anomaly beacons" and solves each case by PLAYING five data tools (Net, Sails, Compass, Storm Test, Crew Court).
- The four answers (WHAT / WHERE / HOW MUCH / SIGNIFICANT) come from what the player DOES (moving, dragging, rotating, firing, placing). They are never answered by choosing one of four buttons.
- This is NOT a form, a wizard, a quiz, a dashboard, or a dialogue slideshow. Section 2 lists the bans and the checklist that must pass.
- Work on branch `feat/voyage`, route `/voyage`. Leave `/play` untouched until playtest gate P1 passes.
- Stop at every milestone gate (section 13) and show evidence. The human playtests. You never self-certify "feels like a game".

## 1. Why the earlier builds failed (diagnosis)
- `/play` = dialogue, then pick one of four cards (Rising / Falling / No significant / Unsure), then a scan animation, then a result. That is a quiz with cutscenes. Players have no verbs.
- Heat H1 = date pickers, pinning cards, and choosing report statements. Scientifically honest, but it is paperwork. No movement, no stakes, no discovery, no direct manipulation.
- Reference screenshots from a friend's project (3 screens only): pixel-art scenes, an NPC portrait with a dialogue box, a green HUD frame, a menu of scenario cards, and a YES/NO modal. Take the ART DIRECTION idea (pixel art, characterful NPC, framed HUD). Do NOT take the card-menu flow or the YES/NO guess. Do not copy any of that project's art, layout or text.

## 2. What "game" means here (hard rules)
**Bans:** no multi-step wizard; no dropdown or typed inputs in gameplay (settings screens excepted); no "choose one of four" for any of the four answers; no modal as the main flow; no fake XP, levels, or currency that does nothing; no fake loading or "scanning" delays (only real computation time); no page scrolling during play.

**Checklist (must pass, and be shown with evidence, before any milestone is reported done):**
1. Fixed 16:9 stage scaled to fit the window; `document.scrollingElement.scrollHeight <= window.innerHeight`.
2. The player controls something within 10 seconds of load (the ship moves).
3. Every screen has a verb. Primary input is direct manipulation: move, drag, rotate, aim, fire, drop.
4. Feedback within 100 ms on every action: sound + animation + a visible number change.
5. A failure state exists, is triggered in an automated test, and retry is one click.
6. The four answers are derived from player actions plus engine receipts.
7. At least three different interaction types in the milestone slice.
8. Dialogue is at most 2 short lines per box, skippable anywhere, and under about 20% of play time (log it).
9. Keyboard equivalent for every drag. Reduced-motion and mute work.
10. HUMAN gate: a playtester with no coaching completes the slice.

## 3. Fiction (original; keep Piper and the Star Galleon identity already in the repo)
The Tech Pirates sail the **Sea of Time**: a chart of the Earth where the water changes colour where the planet is changing. First Mate Piper gives short hints; the Archivist (fictional) posts bounties: disputed claims about a place. Treasure = verified findings, kept in the **Atlas**. Characters and incidents are fictional; data is real. Pirate flavour lives in names, sounds and visuals. Science text stays plain English. No copyrighted characters or logos.

## 4. World: the Sea of Time (overworld)
- **Map:** equirectangular world chart (2:1), pixel-art land and sea, rendered in Phaser. Pan/zoom is by sailing; camera follows the ship.
- **Controls:** arrows/WASD to sail, click or tap to sail toward a point, `E`/tap to interact. Speed is constant. Sailing consumes **Fuel** by distance; ports refuel for free. Fuel is generous: its job is to make routes matter, not to punish.
- **Data layer (the exploration reason):** tint the sea with a REAL layer built offline from the GISTEMP 2 x 2 degree grid: per-cell Theil-Sen slope of annual means over the last 40 complete years (a stated rule, not tuned), cells with insufficient coverage left transparent. Fog of war: unexplored sea is dim; sailing reveals tint within a radius. Per-cell significance hatching is EXPLORATORY and must apply a false-discovery-rate correction (Benjamini-Hochberg), stated in the legend; never claim every hatched cell is a confirmed trend. Layer files are static (PNG + JSON) so the map works offline.
- **Beacons:** glowing markers placed by the Case Builder (section 8) at locations where the real data fits a case archetype. Not hand-placed.
- **Open Seas:** after the tutorial the player can drop anchor anywhere and drag a net rectangle over the sea to start a free investigation (live `/analyze`; clear message if the backend is unavailable).

## 5. Core loop (3 to 5 minutes per case)
1. **Sail** to a glowing beacon. Piper gives one line of context. A bounty states a disputed claim.
2. **Drop the net:** drag a rectangle over the beacon's sea to fix WHERE (box must meet the minimum cell count for the dataset's resolution; warn otherwise).
3. **Work the evidence** with the tools in section 6 (each case uses 3 or 4 of them). Each tool produces an **evidence token** (a receipt with case id, tool, inputs, result, provenance).
4. **Crew Court:** drag tokens into the four answer slots and attach limitation tokens. Set a confidence flag. Submit.
5. **Reveal:** the engine's real result is shown next to the player's work (estimate vs truth, noise cloud vs real slope). Debrief in plain language, template-based from real numbers (no LLM).
6. **Loot:** an Atlas entry and skill progress. Next beacon lights up.

A wrong or overconfident claim is a legitimate outcome: the debrief explains exactly why, and retry is immediate.

## 6. The five tools (each is a Phaser scene with direct manipulation)
All tools run on the case's real monthly series (client-side, using precomputed tables from the pipeline so interaction is instant and exact). The official verdict always comes from the engine (Hamed-Rao modified Mann-Kendall, Theil-Sen, OLS as already implemented). Tools are visual aids, labelled as such.

**T1: The Net (choose the window).** Chart with two draggable brackets on the timeline. As you drag, the trend line and slope readout update from a precomputed **window table** (all windows of at least 5 years at 1-year steps within the case period, capped at about 600 windows; each with Sen slope, direction and coverage). Some cases include a **mirage**: a window whose slope opposes the long record. Objective varies by case ("find a window that lies", "show the trend holds in every window of 15+ years"). Teaches: short windows mislead.

**T2: The Sails (seasonal wave).** For variables with a seasonal cycle (for example precipitation). The seasonal wave is drawn as billowing sails over the series. The player drags a slider to flatten the sails (blend between raw and deseasonalized series, both precomputed with STL). Locking in "calm sails" makes the deseasonalized series the evidence. For anomaly datasets (GISTEMP) the tool is a short tutorial beat ("these seas are already calm") and counts as complete. Teaches: remove the seasonal cycle first.

**T3: The Compass (estimate HOW MUCH).** A compass dial over a scatter of the data. The player rotates the needle (drag, or arrow keys for fine steps) so the line fits the data, with units per decade shown. Lock-in reveals the engine's Theil-Sen slope and its 95% confidence interval as a band. Scoring: inside the CI = Bullseye; within twice the CI width = Close; else Off Course. The dial range is symmetric and scaled to the series so the range does not leak the answer.

**T4: The Storm Test (SIGNIFICANT, visually).** The player fires "storm cannons". Each volley drops precomputed zero-trend **noise storms** (surrogate series with the case's measured lag-1 autocorrelation and variance, seeded, 300 slopes per case) onto a slope gauge. The real slope appears as a flag. If the flag is far outside the storm cloud, noise rarely produces it; if inside, it can. The label must say: "Visual noise test (AR(1) surrogates). The official verdict uses the Hamed-Rao test." Document the approximation in `docs/VALIDATION.md`.

**T5: Crew Court (the claim).** Four slots: WHAT, WHERE, HOW MUCH, SIGNIFICANT. The player drags matching evidence tokens into slots (mismatches bounce back with a reason). Then attaches at least one **limitation token** drawn from tokens actually earned (for example "short window used", "coverage gaps", "OLS and Hamed-Rao disagree"). Then sets confidence: Certain, Likely, or Unsure. Submit.

## 7. Scoring, failure, progression (honest, skill-based)
- **Correctness:** direction, magnitude (inside CI), and significance verdict versus the engine. "No significant trend" is a fully valid, full-credit answer when the engine says so.
- **Calibration (the real skill):** confidence flag versus correctness. Overconfident and wrong costs the most; cautious and wrong costs little; confident and right earns the most. Matrix is in `domain/scoring.ts` with unit tests.
- **Crew Trust (case health):** drops on unsupported claims (for example "significant" when the engine says otherwise, or a magnitude outside twice the CI). At zero the case ends with a debrief ("mutiny"); retry is free and the debrief says what to try.
- **Fuel:** limits detours only; cannot soft-lock (a port is always reachable).
- **Progression = skills shown, not time spent:** Atlas entries (verified findings with receipts), ranks Deckhand, Navigator, Captain from calibration, estimation accuracy and window discipline. No XP bars, no coins.
- **Replay:** any other beacon or Open Seas voyage gives new evidence. Do not advertise authored stories that do not exist.

## 8. Data contracts and the Case Builder (honest by construction)
Script `data-pipeline/build_cases.py` (and `build_world_layers.py`) reads the REAL processed stores and writes static files under `web/public/voyage/`. Answer keys are COMPUTED by the existing stats engine, never typed in. If an archetype is not found in the real data, that case is not generated (log "archetype unavailable"). Selection rules are deterministic and logged in `docs/logs/case-builder.txt`; never tune regions or windows to get a desired story.

Archetypes: **Clear Current** (strong significant trend, sign stable across windows of 15+ years; tutorial); **Mirage** (a window of 5+ years with opposite-sign slope versus a significant long-record trend); **Calm Waters** (30+ years, not significant under Hamed-Rao); **Phantom Strength** (OLS significant but Hamed-Rao not, if it exists); **Twin Tides** (two boxes with opposite-sign significant trends, only if real data shows it); rainfall cases only after GPCP provenance is verified (see section 9).

Case file shape (`cases/<id>.json`):
```
{ "id", "archetype", "variable", "units", "bbox", "period": {"start","end"},
  "series": [{"t","v"}],                       // monthly, nulls kept
  "windowTable": [{"s","e","senSlopePerDecade","dir","coverage"}],
  "seasonal": {"raw":[], "deseasonalized":[]}, // null for anomaly data
  "stormSlopes": [300 numbers, seeded],
  "answerKey": {"senSlopePerDecade","ci95":[lo,hi],"hrP","olsP","verdict","method"},
  "provenance": {"dataset","version","sourceUrl","retrievalDate","sha256","verified":true},
  "isMock": false, "builderRule": "text of the selection rule used" }
```
`isMock:true` cases are allowed only for tests and must show a visible TRAINING banner. A case with `verified:false` provenance is not shippable.

## 9. Integrity rules (inherited, non-negotiable)
- Never fabricate numbers, datasets, citations or results. Every displayed number traces to a receipt.
- Evidence matching is exact: a receipt for one region/period never satisfies another objective. Stale async results are discarded. No reward farming by repeating a tool.
- Branches change tasks and dialogue, never scientific values.
- Honest failure states: backend down, data disabled, missing coverage. Do not substitute nearby observations. Respect the existing data-control switches.
- No claims of flood prediction, discharge, or causes. Significance is not causality; non-significance is not proof of no change.
- Rainfall cases wait for GPCP provenance verification (official NASA/NOAA hosting, version, citation, independent check). Record any gap in STATUS instead of shipping the case.
- Credit all NASA data, third-party assets and AI use in `docs/DATA_AND_AI.md` and the Sources page.

## 10. Screens (all Phaser; DOM only for settings/accessibility)
Title, Ship Deck (hub: Atlas, Open Seas, settings), Sea of Time (overworld), Beacon (bounty intro), Net, Sails, Compass, Storm, Crew Court, Reveal/Debrief, Atlas. HUD: Fuel, Crew Trust, current objective, mute, pause. Piper is a corner companion with one-line hints and a hint button; never a blocking modal. A visually hidden `aria-live` region mirrors state changes for screen readers.

## 11. Art, audio, assets
- **Look:** pixel art (like the reference's mood, but original), dark space palette with gold and teal accents, chunky pixel font (use an open-licence font and credit it). Set `image-rendering: pixelated`, integer scaling where possible.
- **Reuse first:** `web/public/mascot/` (Piper sprites and atlas), `web/public/imagery/`, `web/public/audio/`, existing video loops.
- **Placeholders first:** build every scene with procedural placeholder shapes so the game is playable before final art arrives; art is swapped via a single asset manifest.
- **Sources:** CC0 packs (for example Kenney) for tiles, ship and UI frames: verify each pack's licence file before use and record it. AI-generated images only for 3 hero illustrations and portraits, with a locked style sentence; log them in `docs/AI_LOG.md`.
- **Audio:** keep synthesized SFX (Web Audio) and the existing music; mute persists; no autoplay before first input.

## 12. Technical architecture
- New code under `web/components/game/voyage/`: `scenes/*` (Phaser scenes), `domain/*` (pure TypeScript reducer, tokens, scoring, case loader), `ui/*` (settings/aria overlay), `assets/manifest.ts`. Reuse the existing pure-reducer and exact-receipt patterns from `domain/heatCase.ts` and `runtime/heatAnalysis.ts`.
- **Phaser scenes own interaction; the domain reducer owns progress.** Scenes dispatch player ACTIONS; the reducer validates prerequisites and grants evidence tokens; scene callbacks never grant progress or change scientific values.
- Backend additions (only when needed): `POST /storm` for Open Seas surrogate slopes (seeded, AR(1), 300 draws) and a `build_cases` CLI. Case files are static for offline play.
- Save: versioned local save of Atlas, skills and settings (try/catch; works without it). No accounts.
- Performance: lazy-load Phaser, texture atlases, cap DPR at 2, no per-frame React renders, pause when the tab is hidden. Report bundle impact.
- Accessibility: keyboard for every drag; reduced-motion disables shakes and particles; colour-blind-safe palette (shape plus colour); readable contrast; mute.
- Housekeeping (first task of M0): delete stale `web/.next-*` build directories, make sure `.gitignore` covers `.next*`, and tag each milestone (`voyage-m0`, `voyage-m1`, ...) so any rollback is a tag checkout, never a rewrite.

## 13. Milestones and gates (stop at each gate)
- **M0 Foundations:** route `/voyage`, Phaser boot with fixed 16:9 scaling, input layer (keyboard, mouse, touch), scene manager, placeholder art, domain skeleton, case loader, `build_cases.py` and `build_world_layers.py` producing files from the real GISTEMP store. Automated smoke: boot, sail, enter a beacon. Housekeeping chores done.
- **M1 Vertical slice "First Light":** sailing overworld with the real data tint, ONE Clear Current beacon, Net drop, Compass, Storm Test, Crew Court, Reveal, one failure path (Crew Trust zero) with one-click retry, Piper hints. **GATE P1 (human playtest).**
- **M2 Cases and tools:** The Net with a Mirage case, Calm Waters, Phantom Strength and Twin Tides if they exist in real data, overconfidence scoring, Atlas, local save. **GATE P2 (human playtest).**
- **M3 Rainfall:** The Sails with GPCP, only after provenance verification; rainfall cases and debrief honesty.
- **M4 Open Seas and world layer polish:** free voyages with live `/analyze`, `/storm`, discoveries log, FDR-corrected hatching legend.
- **M5 Juice and polish:** art pass, audio, particles, transitions, mobile touch, accessibility audit, performance, and a deterministic "capture mode" (fixed seed, no debug UI) so the promo video can be filmed.
- **M6 Release:** real-data provenance verified end to end, validation updated, five-person usability test recorded, docs (Project page, Data and AI, Demo script) updated, deploy, public links tested.

**Priority if time is short:** M0, M1, M2, then M5 (juice) and M6, then M4, then M3. A tight, complete Heat voyage beats a broad half-built game. If the deadline is unknown, write `DECISION NEEDED: deadline` in STATUS and proceed in this order.

## 14. Evidence required at each gate
Save under `docs/screenshots/voyage-M#/` and `docs/logs/voyage-M#-*.txt`: (a) a 20 to 30 second screen recording or at least 8 sequential screenshots of real play, (b) the game-feel checklist from section 2 with each item marked PASS/FAIL and how it was tested, (c) unit test output (domain, scoring, case builder determinism), (d) a Playwright smoke run, (e) production build output, (f) a list of what is stubbed. Report in `docs/STATUS.md` in at most 10 lines.

**Playtest gate questions (the human records answers verbatim in `docs/PLAYTESTS.md`):** (1) Within 30 seconds, did you know what to do? (2) Did it feel like playing a game or filling something in? (3) What did you do that mattered? (4) Where were you bored or confused? (5) Could you explain what the sea colour means?

## 15. Human tasks (the executor cannot do these)
- H-A: Tell the executor the real deadline (write it at the top of `docs/TASKS.md`).
- H-B: Art. Recommended: download 2 or 3 CC0 packs (pirate, space, pixel UI) from kenney.nl, keep each pack's licence file, put the zips in `art-source/` (gitignored) and tell the executor. Optional: generate 3 hero images with ChatGPT using the style sentence the executor provides; save them to `web/public/game-art/incoming/` and log them in `docs/AI_LOG.md`.
- H-C: Play each gate (about 3 minutes, no coaching from you) and ask one other person to play too. Paste their answers into `docs/PLAYTESTS.md`.
- H-D: Keep only ONE agent editing `web/components/game/` at a time. Do not ask for visual redesigns between gates; write feedback into `docs/PLAYTESTS.md` instead.
- H-E: Before M6: five non-expert testers, a person to film the 30-second video (capture mode), team photos, and making the repo public.
