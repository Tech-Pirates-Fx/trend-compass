# Orbital Galleon — approved option A

Superseded UI behavior: see `docs/GAME_V2.md` for the connected mission scenes, functioning daylight palette, country map and real data controls added after owner feedback. Its verified custom-month fix and archive access policy supersede the initial limits/offline description below.

Implemented locally on 2026-11-14 after Joshua said to proceed with A independently. No commit, push, deployment, paid media service, or account action was performed.

## Playable slice

Home is the ship's navigation deck: interactive NASA-imagery globe, country selection, short briefing, board/resume action, saved voyages and judge access. The main journey is Chart → Predict → Investigate → Evidence → Log. Measurement/date availability still comes from the actual catalog. An optional rising/falling/uncertain hunch (or skip) is separate from the analysis request. Results, intervals, significance, diagnostics, missing-data verdicts and source receipts remain supplied by the existing service.

First Mate Piper now uses original six-expression art: welcome, pointing, thinking, concerned, celebrating and listening. Her pose/dialogue reacts to setup, prediction, returned evidence, inconclusive results, errors and log completion. She has a minimize/reopen control and an optional explanation. Phone layouts start minimized. No lip-sync or skeletal character animation is claimed; pose swaps, a restrained idle motion and bubble transitions supply the animation.

The captain's JSON log includes the hunch, query, coordinates, returned summary/diagnostics and provenance. Saved examples do not inherit a live voyage's hunch. Completion rewards recording evidence regardless of significance. It does not reward a particular scientific answer. Progress and setup resume in the same browser tab through sessionStorage; they are not an account or cloud save, and closing the tab may clear them. Chart-room resume restores the recorded URL parameters. Results are fetched again on reload rather than trusting stored science.

About, Members, Mission, Summary, Sources and Judge routes remain available through Ship's manifest, the direct judge link and footer. Long home marketing blocks and the old scripted SVG tour/glossary were replaced. The results interpretation text no longer claims significance proves a genuine signal. Existing submission placeholders, YouTube/public-link gaps, rainfall access and vegetation validation remain outstanding.

## Media and credit

- `web/public/mascot/piper-atlas-v1.png`: original OpenAI image generation through Codex; 1536 × 1024, six 512 × 512 cells, 2,423,397 bytes. Decoded alpha range checked with FFmpeg: 0–254. CSS selects atlas cells without raster editing. The Clash of Clans screenshot was a placement/interaction reference; no game character or asset was copied.
- `web/public/video/orbital-galleon.mp4`: original procedural decorative star field, teal orbital glow and one soft distant meteor. 960 × 540, 24 fps, 12 seconds, silent H.264, 88,726 bytes. Periodic star paths close at the loop boundary. The live interactive Earth is a separate existing NASA-imagery globe, not baked into this decorative video. The background does not portray measurements or live weather.
- `web/public/video/orbital-galleon-poster.jpg`: first frame, 10,103 bytes. Fallback for reduced motion/data saving/autoplay failure. Playback stops off the home route and when the document is hidden. Home has a persistent pause toggle. Reduced-motion users retain a still sky and no Piper idle animation.
- Reproduce video from repo root: `python -m pip install -r api/requirements.txt`, then `python web/scripts/render-orbital.py`. Build-only `imageio-ffmpeg==0.6.0` was declared in the existing requirements per the playbook and installed from PyPI. NumPy was already present. The frontend needs no new package. Media hashes are in `docs/logs/orbital-assets.txt`.

Generation prompt (first asset, used in app):

> Create ONE production sprite atlas for an original web adventure-game guide named First Mate Piper. A precise 3 columns by 2 rows grid of SIX equally sized square cells, transparent background everywhere outside the character, no text, no cell borders, no shadows outside cells, no props crossing cell edges. Each cell shows the SAME consistent stylized premium 3D illustrated female space-pirate navigator from hips up, front three-quarter view facing slightly right toward the app. Warm brown skin, short dark wavy hair with one silver streak, expressive amber eyes, navy tricorne with a small original compass emblem, teal spacefaring jacket with brass piping, ivory undershirt, gold compass pendant, compact futuristic shoulder pads, fingerless gloves. Friendly, clever, adventurous, rounded polished shapes, detailed expressive face, soft cinematic studio lighting. Entire head and hat, hands and elbows visible with generous transparent padding within EVERY square. Top row left: cheerful waving welcome. Top row middle: calmly pointing up-right to guide. Top row right: curious thinking, hand near chin. Bottom row left: thoughtful concerned expression, open palm, never angry. Bottom row middle: happy celebration small fist raised. Bottom row right: relaxed neutral listening pose. Same proportions, same costume, same camera, same character scale, identical waist baseline per cell. Art must be completely original, no existing game characters, no copyrighted logos. Wide landscape atlas, exact evenly aligned grid, clean genuine alpha cutouts. This single atlas is the final asset consumed by CSS sprite positions.

Built-in image tool used; transparent_background=true. A second background-removal generation was attempted but was not copied into the app. No hand-drawn authorship claim or unverified model/version label is made.

## Verification and honest limits

TESTED: production build, all routes generated; 24 backend tests; 10 existing geometry/date/contrast checks; four new export checks against a real saved result, exercising significant/not-significant/inconclusive summaries, opposite predictions, nullable p-values, provenance preservation and saved-example separation. Exact commands/output are in `docs/logs/orbital-*.txt`.

TESTED in in-app browser: desktop and phone breakpoint rendering, real India selection → investigation → verified GISTEMP evidence (1880-01 to 2026-10), optional hunch, a second real inconclusive Arctic-box result, skip prediction, save-log action reaching “Voyage recorded”, playback duration 12s and paused=false, pause control yielding paused=true, quiet video off home, minimized phone guide, and resume URL after reload. The requested viewport overrides were 1440×1000 and 390×844; Windows scaling produced a measured phone CSS innerWidth of 325, scrollWidth 317. Screenshots: `docs/screenshots/orbital-desktop.jpg`, `orbital-phone.jpg`.

LIMITED: download-event capture timed out in the browser tool; the click/completion state and generated JSON contents were verified separately, but OS delivery of the downloaded file was not confirmed. Native month-field automation changed the DOM temporarily but did not commit React values (both attempted custom-period runs retained the full record); custom month editing requires a manual browser check. No claim of successful 2000–2020 UI selection is made. Reduced-motion/save-data, hidden-tab and autoplay-failure branches were implemented/source-reviewed, not independently emulated in this browser run. No physical-phone performance/usability test or full handbook submission audit was performed.

## Run locally

From repo root, with the existing official processed GISTEMP store available:

```powershell
$env:DATA_ADAPTER='gistemp'
python -m uvicorn api.app.main:app --host 127.0.0.1 --port 8001
```

In another PowerShell, from `web/`:

```powershell
$env:PY_API_URL='http://127.0.0.1:8001'
$env:NEXT_DIST_DIR='.next-ui-orbit-dev'
.\node_modules\.bin\next.cmd dev -p 3103
```

Open http://localhost:3103. Existing data setup/source documentation still applies. Without the live backend, clearly identified verified saved voyages remain available under Demo; live analysis should report an error rather than invent data. Private credentials are unnecessary for this temperature UI slice.
