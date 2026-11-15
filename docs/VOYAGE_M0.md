# M0 foundation checkpoint

Local route `/voyage`; no `/play` route, scene, redirect or gameplay changed. Foundation includes lazy Phaser 3.90 boot, 1280×720 FIT stage, keyboard/pointer navigation, beacon entry, pure domain reducer, checksummed offline case loader and deterministic real-store builders. Installed Phaser 3 to match the approved plan; no new library added.

Commands and actual results are in `docs/logs/voyage-M0-*.txt`. Domain tests use the real generated case; builder tests independently recompute its Sen estimate, every 15+ year window and seeded storms. `case-builder.txt` records rejected candidates and the first qualifying fixed box. PNG and JSON are reproducible from the hash-checked local store, without network. Preserve raw-store requirements for rebuilding; only static outputs ship in the web app.

Section 2 checklist at this foundation checkpoint (not P1 acceptance):

| Item | M0 status / evidence |
| --- | --- |
| 1 fixed stage/no scroll | Automated browser check in M0 browser log |
| 2 ship input | Automated keyboard sailing and distance receipt |
| 3 verbs | Sail, point-to-sail, enter beacon; tools still pending M1 |
| 4 immediate feedback | Movement, distance/fuel HUD and input sound implemented; instrumented timing pending M1 |
| 5 failure/retry | Pure-domain mutiny test passes; scene pending M1 |
| 6 answers derived from actions | Reducer tested; tool scenes pending M1 |
| 7 three interaction types | FAIL at foundation: steering and pointer targeting only |
| 8 dialogue | One nonblocking hint; no dialogue gate |
| 9 keyboard/settings | Steering and beacon keyboard tested; full settings pending M1 |
| 10 human playtest | PENDING; never self-certified |

Stubbed at M0: evidence-tool visuals, fog reveal, final art, court/reveal UI, advanced cases and all M2 onward scope. The foundation is a technical checkpoint, not a claim that every game-feel requirement has passed. P1 follows M1 only.
