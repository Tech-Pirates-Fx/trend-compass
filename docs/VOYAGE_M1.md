# First Light — P1 handoff

M0 tag: `voyage-m0` (783d60c). M1 is implemented but PARTIAL at P1: the production input smoke is unresolved, and human acceptance is pending. Route `/voyage`, branch `feat/voyage`; `/play`, its redirect, scenes and home game were not changed. No push or deployment.

Sail with arrows/WASD or point on the chart; E interacts near the beacon. Cast the marked net with a drag or N. Rotate the compass or use left/right, then Enter. Fire six volleys with Space or the cannon, drag the verdict flag (left/right keyboard), then Enter. Drop receipts in matching court slots (1–5 keyboard), attach the limitation, cycle confidence with C and submit. Wrong + Certain reaches Crew Trust zero; one click retries. M mutes, P pauses; R at sea toggles reduced motion. H hides/shows the nonblocking tool hint. No blocking dialogue, dropdowns, typed answers or four-choice answer cards.

Technical evidence:

- `docs/logs/voyage-M1-domain.txt`: eight behavioral groups covering exact receipt scope, prerequisites, idempotence, scoring, failure and retry, valid non-significance, and bad-data rejection.
- `docs/logs/voyage-M1-tests-approved.txt`: backend regression and real-store builder tests; rainfall skip is not a rainfall verification claim. Initial sandbox run stalled without results; the approved run supplies the evidence.
- `docs/logs/voyage-M1-smoke-final.txt`: development-preview Playwright keyboard failure and pointer success, disabled-source and missing-archetype states. Production attempts in `voyage-M1-production-smoke.txt` and `voyage-M1-production-smoke-verified.txt` FAILED: rapid synthetic inputs did not reliably produce the intended court placements / Certain confidence. Root cause is UNKNOWN; do not treat development success as production acceptance. Stopped this step after two failures under the playbook.
- `docs/screenshots/voyage-M1/01` through `09` are nine sequential real-play frames from the latest production attempt, up to court before the failed assertion. Frames 10–15 are earlier attempt / development snapshots, not one contiguous capture with the latest 01–09. No completed production playthrough is claimed.
- `docs/logs/voyage-M1-production-final.txt`: final production build, including the debrief readability correction. `/voyage` initial JS approximately 97.6 kB; lazy Phaser chunk 1,192,695 bytes raw / 317,381 gzip in the pre-handoff build (`voyage-M1-bundle.txt`). Phaser uses logical 1280×720 rendering (DPR 1), FIT scaling and no React animation loop. Hidden tabs stop the Phaser loop.

## Section 2 checklist

| # | Status | Evidence / limit |
| --- | --- | --- |
| 1 | PASS automated | 16:9 stage, scrollHeight <= innerHeight, desktop and 390×844 fit |
| 2 | PASS automated | Immediately controllable after asset load; timed keyboard sailing |
| 3 | PASS technical | Sail, cast, rotate, fire, place; each playable scene has a verb |
| 4 | PARTIAL | Immediate handler updates, action tones (unless muted), numeric/graphic feedback; sampled reducer+DOM feedback <100 ms. Full input-to-display/audio latency on target devices is unmeasured |
| 5 | PARTIAL | Domain and development browser passed mutiny / Trust 0 / one-click retry; production synthetic-input route intermittently failed |
| 6 | PASS automated | WHERE from exact Net cast; direction/magnitude from Compass; significance from Storm flag; scoped receipts compared with engine at submission |
| 7 | PARTIAL | Development browser passed steering, rectangle drag, dial rotation, flag movement and token placement; production court input check unresolved |
| 8 | PARTIAL | No blocking dialogue (0 ms); one optional nonblocking hint. Actual player reading fraction UNKNOWN; P1 must measure |
| 9 | PASS technical | All drags have keyboard equivalents; OS reduced motion + persisted toggle, persisted mute, aria-live state. Browser test uses reduced motion; device/screen-reader audit still pending |
| 10 | PENDING HUMAN | No uncoached tester result exists; questions in `docs/PLAYTESTS.md` |

The checklist is deliberately not marked universally PASS. In particular, this assistant cannot certify game feel, uncoached completion, actual reading time or target-device latency. Production boot was measured at 891–1115 ms; a synchronous reducer + DOM feedback sample was 0.30 ms, which is not an input-to-render latency measurement. Production input reliability still needs investigation after human feedback. P1 is the stop point, not permission to continue M2.

## Placeholders and bounded scope

Original procedural ship and instrument art, system monospace font, reused Piper portrait and NASA basemap; final pixel-art pass waits for M5. One generated Clear Current beacon only. The tutorial net intentionally casts one exact precomputed box; no nearby-region substitution. Fuel has an emergency floor of 15 to prevent a tutorial soft-lock; ports refill free. No Atlas, ranks, persistent progress, Mirage or extra archetypes (M2), rainfall (M3), Open Seas/live analysis or hatching UI (M4), or final polish/release. The world JSON contains labelled exploratory BH-FDR results for later use; the current map displays tint only. Sails is a short anomaly-dataset note, not a rainfall tool. No backend computation delay is simulated. No external assets or sources were newly fetched beyond the pinned Phaser dependency.

M1 does not claim every planned final mechanic is complete. Read `docs/VALIDATION.md` for the simulated noise model and its limitations. Stop here until Joshua records P1 feedback.
