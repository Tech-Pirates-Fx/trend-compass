# UI ↔ NASA data integration handoff

UI U1–U4 runs independently of the data pipeline. CODEX changed only `web/` and documentation. No backend or pipeline code is modified by this work.

The existing API contract is retained: GET `/health`, GET `/catalog`, POST `/analyze`, through the frontend `/api/py` rewrite. Configure `PY_API_URL` for the API service when starting/building Next.js. No credentials belong in browser code.

- `/catalog` supplies IDs, units, available resolutions and `temporal_coverage.start/end`. No hardcoded observation years or fabricated fallback catalog remain in the active UI. An offline API leaves country/globe/2D coordinate selection available and shows retry/reconnection guidance.
- Country links pass only region name and bbox. Dataset and dates are selected from the catalog. Country boxes may include ocean/other countries; the UI says these are boxes, not outline averages. Small boxes show the approximate four-cell warning for a 2° grid.
- `/analyze` keeps the existing request schema. The response's `is_mock` controls an explicit result-page MOCK warning independently of the unchanged global health-driven banner. Source verification is never inferred merely from `is_mock: false`.
- Optional `provenance` fields: `dataset_name`, `version`, `source_url`, `retrieval_date`, `units`, `baseline`, `spatial_resolution`, `temporal_coverage` (string or start/end object), `citation`, `smoothing`, `verified`. Every field is optional; unknown values are visibly unknown. A false/absent verified flag shows a warning for non-mock responses.
- Rate, interval, p-value, verdict, method name and diagnostics come directly from the response. No frontend result numbers are generated. Inconclusive remains distinct from not significant. CSV exports include source and `is_mock`, and mock exports have MOCK in the filename.
- No cached mock demo JSON is used by the new guided demo. Those files remain untouched for ANTI's T4b regeneration. Guided expeditions choose a region without promising a trend direction or significance.
- Variable screening, trend maps and Detective Mode are not presented before their API data exists.

On 2026-11-13 the initial sandboxed health check could not reach localhost. A check outside that network isolation confirmed a healthy backend at `127.0.0.1:8000` with `adapter:mock` and `is_mock:true`; the UI proxy successfully called catalog and analyze (24 monthly mock observations). `data-raw/` was empty and the committed adapter registry contained only MockAdapter. These are local readiness observations, not a claim about another agent's unfinished work. ANTI continues T4a/T4b, using `verified:false` for provisional files and official NASA input once available under H8. No repeated NASA download attempts were made here.

Local verification: run `node web/scripts/audit-ui.mjs` from the repository root. From `web/`, set `NEXT_DIST_DIR=.next-ui-build` and run `npm run build`; then start Next with the same variable and the desired local port. A preview and build may use different NEXT_DIST_DIR values to avoid corrupting each other's output. Outputs matching `.next-ui-*` are ignored by `web/.gitignore`.

