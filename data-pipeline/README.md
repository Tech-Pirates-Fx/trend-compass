# Trend Compass data pipeline

The approved A implementation uses official NASA GISS input for temperature and NASA GIBS for contextual imagery. Earlier files in `raw/` have UNKNOWN original acquisition or mirror provenance and are historical/provisional; they are not used by the verified store.

## Temperature

From the repository root:

```powershell
python data-pipeline/download_gistemp.py
python data-pipeline/build_gistemp.py
python tests/audit/gistemp_audit.py
python data-pipeline/cache_presets.py
$env:DATA_ADAPTER='gistemp'
python -m uvicorn api.app.main:app --host 127.0.0.1 --port 8001
```

The downloader uses one bounded HTTPS request per file per invocation, normal TLS verification, no mirrors, and records URL/date/size/SHA-256 in ignored `data-raw/acquisition.json`. It obtains only the combined GISTEMP grid and published global table; the optional 250 km land-only product is not required for this feature. Failed/partial responses are not accepted as complete input.

Local fallback: `python data-pipeline/download_gistemp.py --from-file data-raw/`. Local input remains unverified unless a human explicitly attests its NASA origin with `--official-origin --retrieval-date YYYY-MM-DD`. Preserve the original source and date; do not use that flag for old mirror files.

The builder auto-detects the temperature field and coordinate names, decodes fill/scale metadata, checks regular 2° spacing, excludes current/future calendar months, and creates float32 `values.npy`, coordinates and a manifest in ignored `processed/gistemp/`. The API uses read-only memory mapping and at most 120-month regional blocks. Deployment RAM limits remain unspecified; the verified local store is about 114 MB on disk and is not preloaded as a full cube.

Region means use grid-cell centers inside a half-open box (south/west included, north/east excluded), cosine-latitude weights and a fixed minimum 50% available selected weight per month. That threshold is an explicit implementation policy, not a NASA quality endorsement. Changing spatial coverage can still affect interpretation. Boxes with no centers return 422; fewer than four cells warn. Date-line crossing uses west > east. Missing months remain missing and make real-data significance inconclusive. No daily temperature observations are manufactured.

The default API adapter is now `gistemp`; a missing store returns 503 with setup guidance, not synthetic results. Synthetic tests explicitly select `DATA_ADAPTER=mock`. Provenance distinguishes verified acquisition from scientific validation and retains source/input/store checksums. The frontend shows dataset information, confidence-method limits and the actual returned test.

`cache_presets.py` calculates saved regional examples from the same store, using an explicit last-25-years-through-latest-month selection rule. It refuses mock/unverified observations. `/results?preset=<id>` reads only these recorded examples; it cannot silently substitute them for another box or period. Old mock demo JSON files were removed. The six saved examples have their dates, source and request recorded.

## Imagery and precipitation

- `python data-pipeline/fetch_basemap.py`: checks GIBS capabilities and fetches one 1024×512 Blue Marble JPEG. Attribution and checksum are saved beside it in `web/public/imagery/`. Optional native WebGL renders the photograph; Canvas2D vector picking/fallback remains usable without WebGL or in low-power mode. Imagery is never numerical trend input.
- `python data-pipeline/spike_imerg.py`: bounded anonymous feasibility check, at most one 64 MiB HDF5 sample. The recorded attempt returned HTTP 401; no rainfall observation or bulk archive was downloaded. See `docs/RAINFALL_NEXT.md` for the authenticated Giovanni export handoff. Do not retry the anonymous route repeatedly.

## Verification and running the frontend

See `docs/VALIDATION.md`, `docs/logs/A-tests.txt` and `docs/logs/A-web-build-release.txt`. The current local frontend uses port 3101 and API port 8001. From `web/`, set `PY_API_URL=http://127.0.0.1:8001`, set a fresh `NEXT_DIST_DIR=.next-ui-local`, then run `npm run dev -- --port 3101`. Keep a preview and build in separate output directories. The production verification used `.next-ui-nasa-release`.

The original `inspect_gistemp.py` and T2 log are historical evidence; do not mistake their provisional old input results for the new official-source validation. No deployment or Git push is performed by these commands.
