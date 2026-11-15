# Approved delivery track — current

- [ ] DATA-PAGE CODEX (small, at most 30 tool calls) Rebuild `/data` as a simple sources table exactly per `docs/DATA_PAGE_SPEC.md`: every handbook resource + team additions, status computed from real receipts, expandable "where the app uses it", old sections moved into a closed Technical details block. Work only in `web/app/data/`, `web/lib/sources-registry.ts` and the data inventory API; do not touch `web/components/game/voyage/`.

- [x] GAME-V5 ANTI (owner-chosen executor for this run; Codex rests) Build the multi-mode game per `docs/GAME_MODES_SPEC.md` on branch `feat/voyage`, continuing from tag `voyage-m1`. Owner authorizes proceeding past P1. Follow its token-budget and stop rules.
- [ ] AUDIT-V5 CODEX (small, bounded: at most 25 tool calls, no new features) (1) Verify GPCP provenance for the rain mode: official NASA/NOAA host, version, citation, independent check; record verdict in STATUS. (2) Find the root cause of the production-only input flake in the M1 smoke test (test artifact or real bug) and fix only that.

- [~] GAME-V4 CODEX M0 foundations and M1 First Light technical slice implemented on `feat/voyage`; STOPPED at P1 pending human playtest. Evidence and explicit checklist limits: `docs/VOYAGE_M0.md`, `docs/VOYAGE_M1.md`, `docs/PLAYTESTS.md`. Build the playable Sea of Time game exactly as specified in `docs/GAME_PLAN_VOYAGE.md` (route `/voyage`, branch `feat/voyage`). Do not touch `/play` until P1 passes. This supersedes the player-facing mechanics of `docs/GAME_IMPLEMENTATION_PLAN.md`; its integrity rules stay.

- [x] GAME-H1 CODEX Owner-authorized first Heat investigation checkpoint: case objectives, exact observation receipts, two-window archive, evidence comparison, revisable report, safe drafts and corrected Phaser registration. Evidence and honest remaining scope: docs/HEAT_H1_DELIVERY.md. H2/H3 and the new Rainfall campaign await the plan's H1 owner review.

User approved A on 2026-11-13 and assigned CODEX end-to-end implementation. This track supersedes old ownership/relay/gate requirements below. Preserve the old queue as historical scope/evidence; do not repeat completed acquisition or UI work merely because an old predecessor says ANTI/HUMAN.

- [x] A1 CODEX Temperature + imagery milestone (includes option B): official GISTEMP acquisition, store/adapter, real catalog/provenance, separate raw-grid audit, corrected statistics, NASA globe image, real saved demos, 24 tests and production build. Evidence: docs/VALIDATION.md, docs/logs/A-*.txt. Known HR numerical differences and deployment/clean-clone limits are documented, not hidden.
- [~] A2 CODEX Precipitation: bounded IMERG anonymous archive check returned 401; need one authenticated Giovanni export before parser/import and actual rainfall results can be completed. Exact human action: docs/RAINFALL_NEXT.md. Do not repeat unauthenticated attempts or expose a placeholder rainfall result.
- [ ] A3 CODEX Vegetation extension / option C: next extension after the approved core, starting with an actual MOD13C2 access/volume/QA spike; not an enabled dataset yet.
- [~] U4 remaining: exact 1080x1920 portrait capture and any further accessibility/cross-browser review; actual native portrait capture is 1080x1910. UI/effects and browser flow checks have been implemented and recorded.
- [x] U7 ANTI Complete Trend Compass game experience: procedural cosmic backdrop (parallax stars, aurora, Earth limb, meteors), expanded Web Audio SFX with muted persistence, 6-scene journey (intro, expedition hub with playable GISTEMP and locked IMERG/MODIS, Piper briefing, 4-choice prediction with unsure, telemetry scan, evidence reveal answering 4 questions with honest badges and voyage logbook), verified 29/29 pytest and production build.

No Git push, external deployment or publication without Joshua's separate approval. This assistant did not commit or push. HEAD advanced to 9222f9c during the session through another actor/process; remaining edits are local and uncommitted.

---
# Task queue

Deadline: UNKNOWN (HUMAN: write the real date here: ____________)
Owners: ANTI = Antigravity, CODEX = Codex, HUMAN = Joshua/teammates, GATE = Claude review.
Rule: pick the first unblocked open task owned by your role. CODEX: audit tasks (T3, T5, T8, T12) come first as soon as their ANTI predecessor is DONE; otherwise do the next U task. `[ ]` open, `[x]` done, `[~]` partial or blocked.
If a task is already done, mark it DONE with evidence instead of redoing it.

## HUMAN (run in parallel; some agent tasks depend on them)
- [ ] H1 Create a free NASA Earthdata Login at urs.earthdata.nasa.gov. Put `EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD` in a local `.env` in the repo root (gitignored). Needed by T7. Never paste them into any chat.
- [ ] H2 A teammate exports ONE Giovanni area-averaged monthly time-series CSV (any variable, any region) into `data-samples/` (create the folder) plus `data-samples/README.txt` noting variable, region and dates. Needed by T5 (validation) and T10.
- [ ] H3 Write the real submission deadline at the top of this file.
- [ ] H4 Team page: each member's photo, role and 2-line bio, plus a team photo, into `docs/team/`.
- [ ] H5 Line up 5 non-CSE students for a usability test (needed at T14) and one person to record the demo video (under 30 seconds).
- [ ] H6 At the end (T16): make the GitHub repo public and test every link in an incognito window.
- [ ] H7 Answer any `DECISION NEEDED` in `docs/STATUS.md` by writing `DECISION: <option>` under it.
- [x] H8 RESOLVED by CODEX official HTTPS acquisition on 2026-11-13: combined GISTEMP grid and matching global CSV are in data-raw/ with source/date/SHA-256 receipts. Optional 250 km land-only and landmask files are not needed for the approved combined-temperature milestone. No manual temperature download is pending.

## Phase 1: data and statistics (current)
- [x] T0 CODEX Check the "Known issues" list in `docs/TEAM_PLAYBOOK.md` against the code. Write FIXED/OPEN per item in STATUS (one line each).
- [x] T1 ANTI Correct `docs/DATA_ACCESS.md`: relabel every TESTED that only proved a metadata search or an HTML page; mark Data Rods "not usable anonymously"; verify or remove the claims "MOD13A3 aggregated to 0.5/1 degree in LP DAAC" and "monthly 0.25/1.0 degree MUR SST products on PO.DAAC"; use the GISTEMP citation text exactly as printed on the current page (check whether it names Lenssen et al. 2024); state exactly what the earlier "custom SSL context" did, and ensure certificate verification is never disabled. Done when: doc updated and the SSL note is in STATUS.
- [x] T2 ANTI GISTEMP download and inspection in `/data-pipeline`: resumable download with logged checksum of `gistemp1200_GHCNv4_ERSSTv5.nc.gz` and `gistemp250_GHCNv4.nc.gz` (direct requests to data.giss.nasa.gov are reset by the network on this machine: do NOT keep retrying. Use the files the human saved in `data-raw/` per H8, support `--from-file`, record URL, retrieval date and sha256, and make sure `data-raw/` is gitignored); decompress; open with xarray; log dims, variables, time range, fill value and real file size to `docs/logs/T2.txt`. Compare the cos(latitude)-weighted global mean from the grid with `GLB.Ts+dSST.csv` for overlapping months and report differences without tuning. Done when: evidence is in logs and STATUS.
- [ ] T3 CODEX Audit T1 and T2 evidence. Re-run the global-mean comparison with your own independent script in `tests/audit/`. Also report provenance: where each raw file really came from (T2.txt does not record source URLs), the data vintage of the grid (it ends 2024-05) versus the CSV used (it ends 2021-08), and whether the early-year differences look like a version difference rather than rounding. STATUS: AGREE or DISAGREE with the numbers.
- [ ] T4a ANTI NO NETWORK in this task: use only files already in `data-pipeline/raw/` or `data-raw/`. HARD LIMIT 40 tool calls, then stop and report. Step 1 (file edits only): `data-pipeline/README.md` must not call GitHub/NOAA copies "verified mirrors"; `docs/logs/T2.txt` must label every raw input PROVISIONAL with its real origin (or UNKNOWN); add `verified: true/false` to the `provenance` object, false for anything not downloaded from an official NASA host; the loader must auto-detect the variable/time names so an official file can be swapped in with `--from-file`. Step 2: compact processed store (float32, lazy-loaded; confirm the memory limit of the deployment target before choosing the format) + `GistempAdapter` behind `DATA_ADAPTER=gistemp` (same TimeSeries schema, `is_mock=false`, full provenance, also exposed in the API response as a `provenance` object with: dataset_name, version, source_url, retrieval_date, units, baseline, spatial_resolution, temporal_coverage, citation, smoothing). Handle fill values, antimeridian boxes, minimum box size (warn below ~4 grid cells), and end the record at the last complete month. Real mode shows no MOCK banner. Done when: `/analyze` returns `is_mock=false` with a `provenance` object for a GISTEMP region, and pytest passes.
- [ ] T4b ANTI (after T4a; NO network; 40 tool calls max) Regenerate presets and demo from REAL data; remove every mock-era story. Backend and pipeline only: do NOT edit `web/` components (the UI track owns them); you may write regenerated demo JSON into `web/public/demo/`. Web-side Known issues 4, 5 and 8 belong to U2. Tests: add a golden-file test on one real regional series. Run the pipeline from a clean clone with the raw files copied in, and log the timing. Done when: pytest and `npm run build` green; `/analyze` returns `is_mock=false` for presets.
- [ ] T5 CODEX Independent statistics audit: your own script recomputes the regional mean plus Theil-Sen, Mann-Kendall and Hamed-Rao for at least 5 presets directly from the raw grid and compares with `/analyze`. Review `api/app/stats/*` for bugs (step conversions, interpolation, whether STL is appropriate for anomaly data, confidence intervals, verdict logic). Draft `docs/VALIDATION.md` with numbers and honest differences. Use the Giovanni CSV from H2 as a cross-check if present.
- [ ] T6 ANTI Results hunt: run the stats for all presets and a coarse global scan. Report which regions show significant trends, which do not, and whether ANY pair shows genuinely opposite significant trends. Do not force or tune. Output to `docs/logs/T6.*`, summary in STATUS.
- [ ] T7 ANTI Variable spikes (no building). Candidates: one land, one ocean, one precipitation variable from NASA satellite or model data, plus GISTEMP; fallback ocean = GISTEMP ocean file. For each, download ONE real data file (not a metadata search) and report: product name and version (verify, do not trust memory), native resolution, coverage, login need, size per file, number of files for 2000-2025 monthly, TOTAL download volume, regrid plan to a compact store. Reject candidates whose total volume makes the pipeline impractical to reproduce. Needs H1 for login-gated data. Output: `docs/DATA_SPIKES.md`.
- [ ] T8 CODEX Review T7. Recommend a final shortlist (at most 5 variables) with risks, as a `DECISION NEEDED` for the human (H7).
- [ ] T9 ANTI Build the approved variables into the pipeline, adapters and `catalog.json` (real definitions in two sentences, units, coverage, citation, DOI/URL, `is_placeholder=false`).
- [ ] G1 GATE (Claude) Human says to Claude: "Gate G1: read docs/TASKS.md and docs/STATUS.md and review." Claude checks data, validation and results. Real-data screenshots, the demo video and any promo material showing result pages wait for this gate.

## Phase 2: product features (after G1)
- [ ] T10 ANTI Giovanni CSV upload route: parse `#` metadata, run the stats pipeline, show the result. Needs a real sample (H2).
- [ ] T11 ANTI "What's trending here?" variable screening (rank all catalog variables for a region by significance and effect size) and a trend map (per-cell Sen slope, significance hatching, false-discovery-rate control stated in the UI) if the grid supports it.
- [ ] T12 CODEX Audit T10 and T11, and audit every scientific claim in UI copy: each must be cited to a source actually read, or removed. Update `docs/VALIDATION.md`.

## UI track: runs NOW in parallel with Phase 1 (CODEX builds in `web/` only; read `docs/UI_BRIEF.md` first; build against the existing API and mock data; the MOCK banner stays as is until real data is active)

- [x] U5 CODEX Owner-approved option A: implement the first Orbital Galleon walkthrough with original expressive Piper, actual local video loop, optional prediction, real-evidence log and preserved judge access. Delivered 2026-11-14; evidence and remaining manual QA limits: `docs/ORBITAL_GALLEON.md`.
- [x] U6 CODEX Owner feedback: connected /play mission, retained destination, clear onboarding, framed Piper communicator, daylight palette, 2D country selection, real local data management/kill switch. Evidence, scope and tests: `docs/GAME_V2.md`.
- [x] U1 CODEX Theme and shell per `docs/UI_BRIEF.md` (tokens, fonts, light/dark, navbar, footer credits, reusable components).
- [x] U2 CODEX Landing, wizard and results layout per the brief: four answers on the first screen, ProvenancePanel with empty state, honest verdict badge, reserved hidden slots, plus the web-side Known issues 4, 5 and 8.
- [x] U3 CODEX Globe region picker with country selection, 2D fallback and keyboard alternative per the brief.
- [~] U4 CODEX Atmosphere effects (rain, flare, stars), reduced-motion and low-power fallbacks, screenshots (never of result pages while mock data is active).

## Phase 4: submission
- [ ] T14 CODEX Draft `docs/PROJECT_PAGE.md`, `docs/DATA_AND_AI.md` (every NASA dataset, every AI tool, third-party credits), `docs/DEMO_SCRIPT.md` (under 30 seconds), `docs/PITCH.md`, `docs/USABILITY.md` (task script + feedback form). Facts only from the repo and STATUS; use `[PLACEHOLDER]` for unknowns. HUMAN runs the usability test and records results in `docs/USABILITY.md`.
- [ ] T15 ANTI Apply usability fixes. Deploy frontend and backend; cached presets must work even if the backend cold-starts. README with screenshots and run steps.
- [ ] T16 ANTI Public-repo checklist: no secrets, LICENSE present, list of links to test. Then HUMAN does H6.
- [ ] G3 GATE (Claude) Final review of the project page text and the demo flow before submission.






- [x] SUBMISSION-SNAPSHOT CODEX Prepare current source snapshot for trend-compass with real commit time, updated README and current Home/Data captures. Build and source test passed; backend rerun unverified (see STATUS and submission logs).
