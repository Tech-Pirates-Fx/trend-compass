# Mission flow and data management — 2026-11-14

Joshua asked for a clearer game, retained country selection, connected scenes, integrated Piper styling, a working daylight theme, an improved 2D map, and real data switches. Implemented locally; no commit, push, publication or deployment.

## What players now do

Home explains the task plainly: choose a destination, make a temperature hunch, reveal NASA evidence, and record a finding. The primary action is **Start playing**. Choosing a country at home carries its name and actual bounding coordinates to `/play`, which opens the locked-destination briefing immediately. It does not repeat region selection. A player can explicitly choose **Change destination**.

`/play` keeps charting, briefing/prediction and evidence inside one mission component. Buttons change scenes with a short entrance animation and visible selection feedback; navigation between main areas has a course-plotting overlay. Analysis waits for the actual service, without a fabricated progress percentage or result. The chosen setup is retained in the URL when the destination is locked or the scan starts. Refresh returns to its briefing; it does not invent a completed scan. The existing analysis workbench at `/investigate` remains available by direct URL for advanced options.

Piper is now a framed portrait within a navy/teal/brass ship communicator. She no longer floats as a detached hip-cut figure, bobs continuously, or uses the cream speech balloon. Her expressions and dialogue follow prediction, scanning, real evidence and data locks. Phone entry starts minimized. Daylight mode now changes the actual tokens, surfaces, navigation, sky and communicator instead of only toggling a class whose light/dark palettes were identical.

The 2D map defaults to **Select a country**: clickable country polygons, named targets, country dropdown, tooltips and a fit-to-selection view. Custom areas use an explicitly named **two corners** mode; corner order is normalized and the shorter longitude interval is chosen across the date line. Coordinates are entered as a draft and applied together, instead of immediately moving the map after every keystroke. Country boxes still include areas outside the country's outline; this caveat is visible.

## Engine room / Data Management

`/data` replaces the primary For Judges navigation link. The former judge/evidence page and submission pages remain in the ship's manifest/footer.

- Master data switch: blocks live analyses, raw time-series requests and the saved-voyage API on the server. The game shows **Mission offline** and explains how to enable data.
- Temperature source switch: separately controls the numerical observation store and catalog availability.
- Saved voyages switch: separately controls the archive through `/saved-voyages`. The app no longer bypasses these controls by reading the public JSON file directly.
- NASA imagery switch: removes the optional NASA texture from the globe; the vector globe remains useful. Decorative imagery is not required for numerical science.
- Inventory: actual known raw inputs, reference CSVs, processed grid files, measurements and the app's service routes. It does not enumerate arbitrary directories, env files or credentials.

Controls do not delete files. The master switch preserves individual source preferences so restoring it can restore the previous configuration. Active browser screens refresh control state every five seconds and on focus; data-dependent views unmount when access is disabled. Each new analysis rechecks availability, and the backend independently enforces it.

Reference CSVs are honestly labelled as references. This page does **not** upload arbitrary CSVs, process a new dataset, add arbitrary API endpoints or make rainfall/vegetation playable. Those require actual supported inputs and validated adapters. The new page manages the resources currently provided; it does not claim a generic ingestion system.

## Local administration and private state

Writes use a local-only Next server route, which checks the actual incoming socket address, host and same-origin request. It reads a private capability on the server and sends it to the local Python API. The Python route also checks loopback access, origin and the capability. A browser-visible fixed header alone cannot authorize a direct backend write. Remote/cross-origin writes and malformed settings are rejected. The inventory never returns the private capability.

Local runtime settings are `.cache/data-control.json`; the automatically generated server capability is `.cache/data-admin-token`. Both are ignored by Git. Do not commit or email the capability; a teammate's local backend generates its own. `TC_DATA_CONTROL_FILE` and `TC_DATA_ADMIN_TOKEN` are optional server settings used to isolate tests/custom setups. No new frontend environment variable, account, paid service or manual secret setup is needed for this local workflow.

This is a workstation administration feature, **not** public multi-user authentication. Before any external deployment, design authentication/roles and hosting-appropriate shared storage; do not present the local admin page as production user administration. Current JSON persistence assumes one local API process.

## Verification

- Full production build: `docs/logs/game-v2-build.txt`. Final TypeScript check: `game-v2-types.txt`.
- Backend: 29 tests passed, including five data-control tests covering master off/on, analysis/time-series/archive enforcement, source independence, remote/origin/capability restrictions, strict input validation and corrupt-state fail-closed behavior. `game-v2-tests.txt`.
- Existing ten geometry/date/contrast checks and four evidence-export checks passed: `game-v2-ui-tests.txt`, `game-v2-export-tests.txt`. The export tests preserve significant/not-significant/inconclusive responses without changing them to match the player's hunch.
- Browser: India selected on home arrived directly at **Mission: India**, with coordinates retained. Native month inputs accepted 2000-01 through 2020-12 and the actual scan returned 252 observations, rate +0.173 °C anomaly/decade, displayed interval [0.099, 0.246], p=0.0005548 and a significant verdict. No data or statistical values were changed for this UI.
- Browser: daylight computed body background was rgb(234,242,238), foreground rgb(19,46,56), dark class false; toggling back restored dark mode.
- Browser: admin master off saved successfully; Play displayed **Mission offline**. Restoring access succeeded and sources were left enabled. The backend tests separately prove saved/raw/analysis routes cannot bypass the switch.
- Browser: 2D dropdown selected India and locked the correct destination. A click on the labelled Pakistan polygon changed the box to 23.69–37.13° latitude, 60.87–77.84° longitude and produced **Mission: Pakistan**.
- Desktop and phone layouts reviewed. Requested overrides: 1440×1000 and 390×844; Windows scaling yielded phone CSS innerWidth 325 / scrollWidth 317. No horizontal overflow in that check. Viewport override reset.

Screenshots: `docs/screenshots/game-v2-mission.jpg` (final framed Piper/mission), `game-v2-data.jpg` (admin master off), `game-v2-phone.jpg` (phone briefing). `game-v2-locked.jpg` records the successful play lock before a subsequently corrected stale Piper dialogue; it is not a final portrait-state screenshot.

The custom-month limitation reported in the first Orbital Galleon delivery is resolved and verified in the new mission flow. Browser download delivery remains a prior unverified OS-level check; JSON generation/export contents and UI completion were tested. The final small Piper data-lock adjustment was type-checked/source-reviewed. Freeform custom-corner drawing across every geographic edge, physical-phone performance, and a user usability study were not exhaustively tested. A connected mission UI is delivered; a subjective native-game feel still needs owner feedback rather than an assertion that a production game engine was shipped.

## Start this version

Use the existing setup/dependencies and official processed store. From repository root:

```powershell
$env:DATA_ADAPTER='gistemp'
python -m uvicorn api.app.main:app --host 127.0.0.1 --port 8001
```

In a second terminal in `web/`:

```powershell
$env:PY_API_URL='http://127.0.0.1:8001'
$env:NEXT_DIST_DIR='.next-ui-game-v2-dev'
.\node_modules\.bin\next.cmd dev -p 3104
```

Open http://localhost:3104. An older already-running production server will keep its previous build until restarted/rebuilt; no existing user server was stopped or replaced during these checks. Unlike the original archive-only behavior, saved missions now also require the data-control service, so an offline client cannot silently ignore a server kill switch.
