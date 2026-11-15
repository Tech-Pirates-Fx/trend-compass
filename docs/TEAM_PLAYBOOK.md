# Approved working arrangement — 2026-11-13

Joshua approved RESOURCE_PLAN option A and asked CODEX to own implementation end to end. This section supersedes conflicting role, directory-ownership, one-task-per-session, old no-network task and mandatory external-review instructions below. CODEX may edit web/, api/, data-pipeline/, tests/ and project documentation for the approved plan. Continue temperature + NASA imagery first, then precipitation access/implementation; vegetation remains the next extension. No agent relay is required. Keep the original science/provenance/TLS/bounded-retry rules. Do not push, publish or deploy externally without Joshua's approval; keep current changes uncommitted for review. Old tasks/logs remain historical evidence, not proof of official-source verification.
# Team Playbook (read this first, every session)

Project: **Trend Compass**, NASA Space Apps 2026 challenge "Be An Earth System Trend Detective!"
Repo: this folder (`/web` Next.js 14, `/api` FastAPI, `/data-pipeline` to be created).

## Roles
- **ANTI (Antigravity) = EXECUTES.** Writes code, runs pipelines and tests, commits, writes the docs a task asks for.
- **CODEX = ANALYSES, and builds the UI in `web/` for tasks U1-U4.** Reviews, audits, independently re-computes, recommends. Outside `web/` it is read-only on app code and may add files only under `docs/` or `tests/audit/`. Never fixes ANTI's code: writes findings, ANTI fixes.
- **HUMAN (Joshua) = PROVIDES.** Logins, files, approvals, real-world tasks (tasks marked HUMAN in `docs/TASKS.md`).
- **CLAUDE = MILESTONE REVIEWER.** Used rarely, only at GATE tasks. Do not wait for Claude between gates.

## Working rules (these save tokens; follow them strictly)
1. Read only: this file, `docs/TASKS.md`, the last 30 lines of `docs/STATUS.md`, and files the task names. Do NOT scan the whole repo.
2. Take the first unblocked open task owned by your role. One task per session, then stop.
3. Do NOT ask questions in chat. If blocked or a choice is needed, append a `DECISION NEEDED` block to `docs/STATUS.md` (question, 2-3 options, your recommended default, consequence) and continue with other unblocked tasks. The human answers by writing `DECISION: <option>` under it. Never proceed on your own default if it involves credentials, cost, or something hard to undo.
4. Report by appending at most 10 lines to `docs/STATUS.md`. Format: `YYYY-MM-DD | ROLE | T# | DONE/PARTIAL/BLOCKED | evidence path | next`. Put long output in `docs/logs/<task>.txt` and reference the path. Never paste big logs or whole files into chat or STATUS.
5. Run the full test suite / build once before committing, not repeatedly.
6. Do not redo tasks marked DONE. Trust their evidence unless a CODEX audit disagrees.
7. Directory ownership: ANTI edits `api/`, `data-pipeline/`, `tests/` (except `tests/audit/`) and the docs its tasks name. CODEX edits ONLY `web/` and only for UI tasks (U1-U4); elsewhere it is read-only. Neither edits the other's directories (exception: ANTI may write regenerated demo JSON into `web/public/demo/`). `api/app/schemas.py` is changed only by ANTI; CODEX mirrors it in `web/lib/types.ts` with additive, optional fields. CODEX reviews via `git diff` / commit ranges, not by re-reading everything.
8. Commit per task: message `T<id>: <summary>`. Never rewrite history.
9. After each task append one line to `docs/AI_LOG.md`: `date | tool | task | what was done` (the hackathon requires crediting AI use).
10. Tick the task's checkbox in `docs/TASKS.md` when done.
11. THREE STRIKES: after 2 failed attempts at the same step, stop that step. Append a `HUMAN HELP` block to STATUS (exact URL or click path, what to save, filename, destination folder) and move to another task. Never try more than 3 variations of a failing network call.
12. No exploratory testing. Tests exist to prove a task's "Done when", not to explore. At most 5 tool calls per sub-step before you report or ask for HUMAN HELP.
13. Scripts live in files (`data-pipeline/` or a scratch folder outside the repo). Do not use long inline `python -c` with nested quotes in PowerShell.
14. Sources: only official NASA hosts or files the human downloaded. No third-party mirrors or re-uploads (for example someone else's GitHub release). Record source URL, retrieval date and sha256 for every input file. Pipelines must accept a local file path (`--from-file`) when a download is blocked.
15. Do not install packages without adding them to `api/requirements.txt` (or `web/package.json`) and writing one line of reason in STATUS.
16. Never disable TLS certificate verification, not even for a probe. Use another route or HUMAN HELP.
17. Commit only your own folders (`git add <your dirs>`), never `git add -A`. If you hit `index.lock`, wait 10 seconds and retry once.

## Honesty and science rules
- NEVER fabricate data, numbers, dataset names, endpoints, citations or results. Unknown = UNKNOWN.
- Tag evidence: `TESTED` (command + real output saved in `docs/logs/`, and real DATA obtained, not only a metadata search or an HTML page), `READ` (URL actually opened), `ASSUMED`.
- Never tune, force or cherry-pick results. Report non-significant and negative findings honestly.
- Never disable TLS certificate verification. Never print, log or commit credentials. Credentials only via environment variables or `.env` (gitignored).
- Every scientific statement in the UI or docs must trace to a source actually read, or be removed.
- All user-facing results must come from real NASA data. Mock data only in tests, always labelled as mock.

## Hackathon facts (from the official pages; treat as truth)
- Rules: NASA open data must be central. Source code must be public (GitHub). Credit NASA data, third-party assets and AI use.
- Scoring: Impact 20, Creativity 20, Validity 20 (scientifically robust, validated data, working prototype, usability tested beyond experts), Relevance 20 (NASA data central, reproducible, transparent), Presentation 20. Plus Teamwork, User experience, NASA data extent (1-5 each). +3 checklist (category named, repo open, project page complete).
- Challenge: pick variables, show change over time, answer WHAT / WHERE / HOW MUCH / is it SIGNIFICANT. Name the statistical test. Linear trends are enough. Account for seasonality; use long records.
- Organiser guide (advice, not official rules): answer the four questions on the first demo screen; reproduce a documented trend as a known case; opposite-trends demo as hero ONLY if real data shows it; publish dataset names, versions and dates.
- Project page needs: About, Members, summary, YouTube demo under 30 seconds, working app link, details (why/what/how, community, tools, AI use), Data & AI, public repo link.

## Decisions already made (do not reopen without new evidence)
- Architecture: local gridded store built by reproducible scripts in `/data-pipeline` (core). Preset regions = precomputed cache from the same store. Giovanni CSV upload comes after the core (needs a real sample in `data-samples/`). No live-API adapter.
- Data sources: NASA only. NOAA CDO and KNMI are references only. Hydrology Data Rods: anonymous access returned an HTML gate, so NOT in automation. NOAA Mauna Loa CO2: rejected. NASA GIBS BlueMarble: basemap only (not a variable).
- Variable 1 = NASA GISTEMP v4 on a 2 x 2 degree grid, monthly anomalies (baseline 1951-1980 per the earlier reading of NASA's page; verify).
- Statistics: Theil-Sen slope, Hamed-Rao modified Mann-Kendall as the primary significance test, plus OLS, Mann-Kendall, Seasonal MK, STL where appropriate.
- UI work runs in parallel as the UI track (U1-U4, CODEX, `web/` only, see `docs/UI_BRIEF.md`). Real-data screenshots, the demo video and any promo material showing result pages wait for Gate G1.
- Extra variables (land, ocean, precipitation) are ON HOLD until spike evidence (T7).

## Known issues seen in code on 2026-11-13 (verify each; mark FIXED/OPEN in STATUS; fix in the relevant ANTI task)
1. `web/app/layout.tsx` hardcodes `MockBanner isMock={true}`; it must follow the API `is_mock` flag.
2. Daily resolution is fake: MockAdapter always builds monthly series while preprocessing assumes period 365 for daily.
3. Start/end are fixed dropdowns; start > end is not blocked; backend silently falls back to the full range instead of returning 422.
4. Map is click-only (no rectangle drawing); antimeridian boxes (west > east) are unsupported in schema, mock and map.
5. Years 2000-2025 are hardcoded in presets, demo cases and UI copy; they must come from dataset metadata.
6. Results page card label "Theil-Sen / MK" is hardcoded; it should show the primary method the API returns.
7. Duplicate entrypoints: `main.py`, `api/main.py`, `setup.py`.
8. Presets, demo cases and UI copy contain uncited scientific claims and mock-era stories (for example East Antarctic cooling).
9. `web/public/demo/*.json` were generated from mock data.

