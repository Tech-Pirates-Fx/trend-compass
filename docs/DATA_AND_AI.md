# Data, Assets, and AI Credits — Submission Inventory

**Project:** Trend Compass  
**Team:** Tech Pirates  
**Challenge:** NASA Space Apps 2026 — *Be An Earth System Trend Detective!*  
**Last Updated:** 2026-11-14

---

## 1. NASA Earth Observations & Contextual Imagery

### A. Core Numerical Dataset: NASA GISTEMP v4 Land-Ocean Temperature Index
- **Provider:** NASA Goddard Institute for Space Studies (GISS).
- **Official Source URL:** https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz
- **Retrieval Date:** 2026-11-14 (reproducible via `data-pipeline/download_gistemp.py` with TLS verification).
- **Cryptographic Receipt:** SHA-256 `f7788db9044d0f0e3f9561ad5d0fd82e59cdfdb82ea8a10244f78f2cb032a3c7`
- **File Specifications:** 25,885,943 bytes (compressed NetCDF container).
- **Spatial Grid:** 2° × 2° regular latitude/longitude grid (90 lats × 180 lons), 1200 km smoothing radius.
- **Temporal Coverage:** 1880-01 to 2026-10 (1,762 monthly grids).
- **Baseline Period:** 1951–1980 climatological baseline.
- **Physical Interpretation:** Blended surface air temperature over land and sea-surface water temperature anomalies relative to the baseline.
- **License / Terms:** Public domain NASA open science data.
- **Scientific Citations:**
  - Lenssen, N. J. L., G. Schmidt, J. Hansen, M. Menne, R. Ruedy, B. Kelly, and K. Hendrickson, 2024: *Improvements in the GISTEMP uncertainty quantification.* J. Geophys. Res. Atmos., doi:10.1029/2023JD040177.
  - Hansen, J., R. Ruedy, M. Sato, and K. Lo, 2010: *Global surface temperature change.* Rev. Geophys., 48, RG4004, doi:10.1029/2010RG000345.

### B. Validation Dataset: NASA GISTEMP Published Global Monthly Mean Table
- **Provider:** NASA Goddard Institute for Space Studies (GISS).
- **Official Source URL:** https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv
- **Retrieval Date:** 2026-11-14.
- **Cryptographic Receipt:** SHA-256 `a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253`
- **File Specifications:** 12,887 bytes (CSV table).
- **Temporal Coverage:** 1880-01 to 2026-10.
- **Usage:** Benchmarking pipeline spatial reduction against NASA's published global average series (MAE = 0.0120 °C, RMSE = 0.0155 °C, Pearson $r = 0.9994$).

### C. Geographic Imagery: NASA GIBS Blue Marble
- **Provider:** NASA Global Imagery Browse Services (GIBS), Earth Science Data and Information System (ESDIS) Project.
- **Service Layer:** `BlueMarble_ShadedRelief_Bathymetry` (WMS/EPSG:4326).
- **Cryptographic Receipt:** SHA-256 `0efc32f0d1a0bcf9b68196f11a0ebb0da6e1d6f0aa1ef48fb7b32da7d8d1f550`
- **File Specifications:** 86,648 bytes (1024×512 JPEG), archived in `web/public/imagery/`.
- **Usage:** Contextual basemap texture for 3D WebGL globe. *Explicitly noted in UI and docs: imagery is purely visual context and never serves as numerical trend input.*

---

## 2. Geography, Cartography & Procedural Assets

- **Natural Earth Vector (1:110m Admin-0 Country Polygons):** Public domain map dataset. Official source: `ne_110m_admin_0_countries.geojson` (SHA-256 `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`). Processed into `web/public/geography/countries.json` (194,187 bytes).
- **OpenStreetMap Contributors:** 2D Leaflet map basemap tiles licensed under Open Database License (ODbL).
- **Original Procedural Visuals:** Star fields, lens flare, rain animations, celestial compass frames, and the **Navigator Orion mascot** are completely original procedural CSS/SVG vector assets authored by the team. Zero third-party proprietary artwork or copyrighted characters (e.g., Clash of Clans) are used.

---

## 3. Third-Party Software Dependencies & Licenses

| Package / Library | Ecosystem | License | Purpose |
| :--- | :--- | :--- | :--- |
| **FastAPI** | Python | MIT | High-performance asynchronous REST API framework |
| **Uvicorn** | Python | BSD-3-Clause | ASGI web server |
| **NumPy** | Python | BSD-3-Clause | Memory-mapped numerical arrays and spatial reductions |
| **SciPy** | Python | BSD-3-Clause | Scientific computing, OLS regression, Theil-Sen slope |
| **Pandas** | Python | BSD-3-Clause | Time-series data manipulation and date alignment |
| **xarray & h5netcdf** | Python | Apache 2.0 / MIT | NetCDF-3/4 parsing and raw-grid audit extraction |
| **pyMannKendall** | Python | GPLv3 | Non-parametric Mann-Kendall and Hamed-Rao test suite |
| **statsmodels** | Python | BSD-3-Clause | STL seasonal-trend decomposition procedure |
| **Next.js 14 & React 18** | Node.js | MIT | React server and client application framework |
| **Tailwind CSS** | Node.js | MIT | Utility-first responsive design system |
| **Leaflet & React-Leaflet** | Node.js | BSD-2-Clause | 2D interactive coordinate selection map |
| **Plotly.js** | Node.js | MIT | Interactive SVG/WebGL time-series charting |
| **Lucide React** | Node.js | ISC | Accessible UI iconography |

---

## 4. Artificial Intelligence Usage & Ethics Disclosure

In compliance with NASA Space Apps Challenge regulations on AI transparency:

1. **AI Technologies Employed:**
   - **Google DeepMind Antigravity (Gemini models):** Used for full-stack codebase maintenance, pipeline verification, test orchestration, and accessibility review.
   - **OpenAI Codex:** Used for initial UI shell prototyping, statistical auditing scripts, and documentation synthesis.
2. **Deterministic Science Boundary:**
   - **No generative AI produces, alters, simulates, or predicts Earth observation data points.**
   - All statistical metrics (Theil-Sen slope, Hamed-Rao $p$-value, serial autocorrelation, seasonal components) are computed strictly and deterministically by compiled Python algorithms running NumPy, SciPy, and pyMannKendall.
   - Missing data points are preserved as missing (never hallucinated or interpolated).
3. **Human Governance & Verification:**
   - All architecture decisions, scope definitions, security boundaries (strict TLS enforcement, no disabling certificate checks), and mathematical validations were directed and verified by project owners Joshua and Ramakrishna.

## Orbital Galleon implementation — 2026-11-14

Original First Mate Piper atlas (six poses) generated using OpenAI image generation through Codex; user-provided Clash of Clans screenshot informed interaction placement only. Orbital stars/glow/meteor video and poster are original procedural art encoded by NumPy + FFmpeg via imageio-ffmpeg, not NASA data or live weather. Scientific globe imagery and numerical observations retain their separate existing credits. Prompts, sizes, hashes, reproduction instructions and verification limits are in docs/ORBITAL_GALLEON.md and docs/logs/orbital-assets.txt. The game hunch does not enter scientific requests or change returned results. No deployment or public-link claim is added by this work.

## Sea of Time M0/M1 — 2026-11-15

OpenAI Codex implemented the isolated `/voyage` Phaser 3 prototype, builders, tests and documentation. Original procedural ship, net, compass, frames and synthesized action sounds; system monospace font, no new third-party art pack or font. Reuses existing NASA Blue Marble imagery (receipt in `web/public/imagery/provenance.json`) and the credited AI-generated Piper portrait. Phaser is MIT licensed (installed package license); no image generation was performed for this milestone.

Real numerical input: verified GISTEMP v4 store, raw SHA-256 `f7788db9044d0f0e3f9561ad5d0fd82e59cdfdb82ea8a10244f78f2cb032a3c7`, processed SHA-256 `88806248e3bd00a4c14fd6af699a9a64668feeeb95f5e25ceec36f0dd35f010a`; source and citation retained in every case receipt. World and case period is the last 40 complete years present in the input, 1986–2025. Missing cells remain transparent. Fixed candidate order and rejection evidence are in `docs/logs/case-builder.txt`.

The seeded AR(1) surrogates are explicitly simulated zero-trend teaching aids, never observations or a replacement for the official Hamed–Rao result. The earlier statement that no algorithms simulate any data refers to observations; these visual surrogates are the documented exception. No rainfall case ships. No human playtest, external publication or release verification is claimed.

## Voyage v5 Multi-Mode & Hub — 2026-11-15

Antigravity implemented the multi-mode registry, illustrated Mode Select hub, per-mode theming, Mirage unmasking mechanic in Heat mode, Atlas ("Piper's Log"), and ed-tech Research Log export (JSON/CSV). Original procedural 16-bit pixel cards and backgrounds (`web/public/voyage-art/`) generated via deterministic script `web/scripts/generate_voyage_placeholders.py` matching the approved 32-color palettes for all 7 modes. Sourced facts retrieved directly from NASA GISS official documentation (`https://data.giss.nasa.gov/gistemp/`) with TLS verification. No external font packs or proprietary assets installed.

