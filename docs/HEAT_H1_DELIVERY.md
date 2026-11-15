# Heat investigation H1 — review checkpoint

2026-11-15. Joshua assigned execution to CODEX by asking it to start if it preferred to execute. This delivers the first-case checkpoint in `GAME_IMPLEMENTATION_PLAN.md`; the remaining campaigns are not complete. No commit, push, publication or deployment.

## Play

Local preview: http://localhost:3105. Choose Heat, select a destination, then lock the target. Heat now opens **The Broken Heat Ledger** instead of the prediction/scan/celebration loop. Direct checkpoint entry for the default India box: http://localhost:3105/?level=4. URL entry cannot bypass the new case objectives.

The case board introduces two fictional disputed dispatches. At the archive terminal, select a shorter period and a longer comparison with a common end month. Retrieve the actual analyses, inspect charts and source receipts, and pin both records. At the evidence table, record a qualified comparison. At the dispatch desk, select a conclusion supported by the longer result, attach its measured magnitude and qualify the regional scope. Unsupported submissions give specific feedback and can be revised. Completion opens the repaired ledger and a JSON report export.

Piper remains available with contextual hints and minimize/reopen. Existing globe, legacy Rainfall flow, art, audio, charts and judge links remain. This is a functional first investigation slice; it is not a completed two-campaign adventure or evidence that non-expert playtesting succeeded.

## Architecture and data behavior

- `domain/heatCase.ts`: typed case state and reducer, receipt validation, objective prerequisites, idempotent pins, verdict-dependent submissions and safe draft restoration. No reward based on guessing a scientific outcome.
- `runtime/heatAnalysis.ts`: catalog-driven coverage and strict requests to the existing analysis service. No artificial telemetry delay or substituted nearby observation.
- `HeatInvestigation.tsx`: investigation stations, dates, evidence inventory, comparison, report/revision, result export, request cancellation/generation guards and versioned local drafts.
- Drafts retain dates and station; observations/completion are not trusted from local storage. Reload returns to the archive to retrieve fresh receipts. This is intentionally a draft save, not full campaign/evidence persistence.
- Data-control disablement cancels pending requests and hides observations; each actual analysis is still subject to backend enforcement. New case requests require the backend; offline cached H1 cases are not implemented.
- Replaced nearest-region cache substitution with exact variable/box/date/resolution/preprocessing/alpha matching. Receipts keep their original coordinates. Proxy service errors are preserved, and the new case explicitly requests live service handling. Legacy catalog/health offline fallbacks still exist outside this slice; they are not the new case's authority.
- Corrected existing duplicate Phaser scene registration discovered during browser review, and registered the actual initial scene with its manager. New case backgrounds unmount for reduced motion/hidden documents. Corrected URL-level initialization so the checkpoint can open directly.

## Verification

TESTED: `node web/scripts/test-heat-case.cjs` from the repository root (or `node scripts/test-heat-case.cjs` in web). Nine behavioral groups passed: prerequisites, exact cache matching and rejection, invalid/mock/provisional receipts, duplicate pins, revision, all three verdict states and both significant slope directions, evidence invalidation, incompatible periods and safe save restore. Mutated outcome fixtures are test-only. Log: `docs/logs/heat-h1-behavior.txt`.

TESTED: `node scripts/verify-heat-live.cjs` in web against the frontend proxy and real local GISTEMP store. Catalog coverage 1880-01 to 2026-10; default India rectangle returned 60 observations for 2021-11 to 2026-10 and 1,762 for the full record, both with verified NASA-source receipts. Rate/decade 1.0859 and 0.0886 °C anomaly respectively; these are different selected periods, not a fabricated trend contrast. Invalid dates returned HTTP 422 without a cached success. Log: `docs/logs/heat-h1-live.txt`.

TESTED: production build generated 18 pages; build log `docs/logs/heat-h1-build.txt`. Final draft end-month preservation and cache-import cleanup received a subsequent TypeScript check in `docs/logs/heat-h1-types.txt`. Backend regression: 29 passed, 1 skipped, one third-party deprecation warning, `docs/logs/heat-h1-backend.txt`. The skipped test is not claimed as a pass. Build linting is disabled by the existing project configuration; no clean lint claim.

TESTED in the in-app browser: direct Heat checkpoint, archive retrieval for both periods, pinning, expanded provenance, comparison gating, deliberately wrong falling report rejected against the rising long-window result, revised rising report accepted, “Ledger repaired” visible, and reload restored the draft with zero trusted evidence. Initial browser navigation/interaction timed out during compilation; URL initialization and duplicate Phaser scene errors were corrected before the final reload. The final reload showed the functioning archive with no visible runtime-error badge. Source view and charts were checked with actual data. Screenshot: `docs/screenshots/heat-h1-board.png`.

LIMITS: no physical-phone or full keyboard-only/reduced-motion emulation, multi-browser certification, five-player study, OS-level download verification, full async-race browser test or exhaustive runtime-console audit. Final screenshot is a compact browser view with Piper minimized. Existing Hamed–Rao independent numerical limitations remain as documented in `docs/VALIDATION.md`; these UI changes do not resolve them. GPCP provenance/seasonality and new Rainfall campaign content remain for the later milestone.

## Local servers used

Backend: `DATA_ADAPTER=gistemp`, `python -m uvicorn api.app.main:app --host 127.0.0.1 --port 8005`.

Frontend in `web`: `PY_API_URL=http://127.0.0.1:8005`, `NEXT_DIST_DIR=.next-heat-h1-dev`, `next dev -p 3105` using the existing local Next executable. Build directory `.next-heat-h1-release` is isolated from the preview. No dependency was installed.

## Next

Owner reviews H1 gameplay before H2/H3 and Rainfall implementation, as specified in the approved plan. Remaining content should improve the adventure around the evidence tasks; it must not reduce the investigation back to a prediction followed by automatic completion.
