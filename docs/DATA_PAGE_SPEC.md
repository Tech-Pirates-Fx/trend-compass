# /data page: "Which data is in the app?" (compact spec)

## Goal
Jury and team open `/data` and instantly see, for EVERY resource the handbook gave plus anything the team added: the name, the link, whether it is in the app, what it feeds, and why not if it is missing. A plain table. No hero, no cards, no marketing text.

## Page layout (nothing else above the table)
1. One-line summary, computed: "N of M sources are in the app." and a one-line legend.
2. Filter buttons: All / In the app / Not in the app / Reference only.
3. A real HTML `<table>` with a caption. Columns: **Source** (name + link) | **Kind** (data / tool / article / mission info) | **In the app?** | **What it feeds** | **How it got in** | **Date**.
4. Click or press Enter on a row to expand it inline: "Where the app uses it" (links to the pages/modes), dataset version, period, resolution, file and first 12 characters of SHA-256, required citation/credit text, and for "Not in the app" the specific reason and what would be needed to include it.
5. Small button: "Download this table (CSV)".
6. Below the table, a closed `<details>` "Technical details" containing the existing sections unchanged in function: Receipts (SHA-256), Citations, AI transparency, Admin controls / data switches. Nothing else on the page.

## Status words (text always shown; colour is never the only signal)
- **In the app**: real data loaded and its receipt is verified.
- **In the app (check pending)**: loaded, but provenance is not yet verified.
- **Not in the app**: with a one-line reason.
- **Reference only**: articles and portals that are not data feeds.

## Status must be COMPUTED, not typed
- Static registry (`web/lib/sources-registry.ts`) holds descriptive fields only: name, url, kind, listedBy (official / organiser / team), reason, usedBy links.
- "In the app" comes from the real inventory: the backend data inventory/receipts (see `api/app/data_control.py`, the existing `/data` page and its API, `data-pipeline/` outputs) and, for Giovanni exports, the files actually loaded from `data-samples/`. If the registry says a source is included but no receipt/store is found, show **Missing** in the status cell (honest, red text label). If the backend is unreachable, show "Live check unavailable" and do NOT show "In the app".
- Never invent a URL. Use only the links below; for rows with no link here, open the official challenge page `https://www.spaceappschallenge.org/2026/challenges/` (find the Trend Detective challenge, Resources tab) and copy the exact links; if you cannot reach them, leave the link empty and add a HUMAN HELP in STATUS.
- Do not delete data, controls or docs. Do not change the data-control behaviour.

## Rows (de-duplicate: Giovanni and AppEEARS appear in both handbook lists but get ONE row each, tagged by both). "Expected" is what the computed result should normally show; verify, do not hardcode.
| Source | Link | Kind | Expected |
| --- | --- | --- | --- |
| NASA GISTEMP v4 (temperature anomaly, 2 x 2 degree grid) | https://data.giss.nasa.gov/gistemp/ | data | In the app; feeds Heat mode, Lab/Investigate, saved demos, Judge page |
| GPCP v2.3 monthly precipitation (team addition, not on the handbook lists) | verify host and use the official link | data | In the app (check pending) until the provenance audit passes |
| NASA GIBS (Blue Marble imagery) | https://gibs.earthdata.nasa.gov/ | imagery | In the app as picture/basemap only, not used for trend numbers |
| NASA Giovanni | https://giovanni.gsfc.nasa.gov/giovanni/ | tool | Not in the app live; "N CSV exports loaded" computed from `data-samples/` |
| AppEEARS | https://www.earthdata.nasa.gov/data/tools/appeears | tool | Not in the app: needs Earthdata login and batch processing |
| Hydrology Time Series (Data Rods) | from official page | tool | Not in the app: anonymous access returned a login/captcha gate in the team's test |
| NOAA Climate Data Online | from official page | data | Not in the app: NOAA station data, not NASA data |
| KNMI Climate Explorer | from official page | tool | Not in the app: partner tool, not NASA data |
| SeaWiFS chlorophyll time-series paper (Acker et al. 2009) | from official page | article | Reference only |
| Statistical test methods for trend detection (article) | from official page | article | Reference only |
| A Comprehensive Guide to Statistical Significance | from official page | article | Reference only |
| CSA RADARSAT Constellation Mission data | from official page | data | Not in the app: out of scope for the temperature/rainfall pipeline |
| Geo.ca | from official page | data | Not in the app: Canada-only geospatial portal |
| SWOT mission information | from official page | mission info | Not in the app |
| CSA "Monitoring and protecting our ecosystem" page | from official page | article | Reference only |
| Synthetic Aperture Radar Python tutorial | from official page | article | Reference only |
| NASA Earthdata | https://www.earthdata.nasa.gov/ | portal | Reference only |
| Earthdata Search | https://search.earthdata.nasa.gov/ | tool | Reference only (used to look up datasets, no data fed) |
| NASA Worldview | https://worldview.earthdata.nasa.gov/ | tool | Not in the app |
| Climate Indicators Data Pathfinder | https://www.earthdata.nasa.gov/topics/climate-indicators | portal | Not in the app |
| VEDA | https://www.earthdata.nasa.gov/data/tools/veda | tool | Not in the app |
| NASA Sea Level Change Portal | https://sealevel.nasa.gov/ | data | Not in the app until a series file is loaded (computed) |
| NASA Earth Information Center | https://earth.gov/ | portal | Not in the app |
| Instruments/models named in the challenge text (MODIS, OMI, AIRS, GPM, MERRA-2, GLDAS) | n/a | mission info | Not loaded directly; reachable only through Giovanni CSV exports |

"How it got in" examples (read from the receipts, never retype): "Official file, downloaded by script, SHA-256 verified", "Provided by the team (CSV export)", "Built by `data-pipeline/build_gpcp.py`".

## Quality rules
- Plain, short English. Row details: at most 6 short lines. No walls of text.
- Keyboard accessible (button in each row to expand), table caption, header scope attributes, readable contrast in light and dark, works at phone width (horizontal scroll inside the table container is allowed).
- Credit text for each included dataset stays accurate and visible in the expanded row.
- Tests: one unit test that computed status is "Missing" when a receipt is absent and "Live check unavailable" when the backend is unreachable; one check that every row has a link or a documented HUMAN HELP. Build once. One screenshot at 1920x1080 and one at 390 px width in `docs/screenshots/`.
- Budget: at most 30 tool calls; chat reply at most 8 lines; record any row whose official link could not be found.
