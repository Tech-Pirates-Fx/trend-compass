# Trend Compass — NASA Space Apps Challenge Project Page

**Challenge:** Be An Earth System Trend Detective!  
**Team:** Tech Pirates  
**Repository:** [Public GitHub Repository Link — Confirmed by Team Lead]  
**Video Demonstration:** [YouTube Demo Link (< 30 seconds)]  
**Working Prototype Link:** [Deployment URL / Localhost Run Instructions]

---

## High-Level Project Summary

**Trend Compass** is an open-source, server-side Earth system trend detection engine and space-pirate expedition journey built for the NASA Space Apps Challenge. 

Discerning genuine long-term climate signals from short-term seasonal and natural variability is a fundamental scientific challenge. Many public dashboards rely on naive linear regressions (Ordinary Least Squares) that falsely declare short-term autocorrelation as significant trends, or present black-box conclusions without verifiable provenance. 

Trend Compass bridges rigorous climatological statistics and intuitive exploration:
1. **Direct NASA Gridded Data:** Runs directly against the official NASA GISS GISTEMP v4 gridded anomaly dataset (1880-01 to 2026-10, 1,762 monthly grids, 1200 km smoothing) with immutable SHA-256 receipts.
2. **Four Detective Answers:** Directly answers **WHAT** is changing, **WHERE** on Earth, **HOW MUCH** per decade, and **IS IT SIGNIFICANT?**
3. **Robust Non-Parametric Statistics:** Calculates Sen's robust slope (resilient to outliers) and evaluates statistical significance using the **Hamed–Rao Modified Mann-Kendall test**, which adjusts variance for geophysical serial autocorrelation.
4. **Accessible Space Expedition Experience:** Guided by an original bottom-left mascot, **Star Navigator Orion**, users embark on an orbital voyage across a 3D Earth globe, custom 2D bounding boxes, real time-series visualizations, and instant CSV exports.

---

## Detailed Project Description

### 1. Why: The Detective Problem
Earth's climate system is noisy. Large-scale oscillations (such as El Niño–Southern Oscillation, Pacific Decadal Oscillation, and solar cycles) introduce multi-year serial dependence. When analysts apply standard linear models assuming independent errors, serial autocorrelation deflates standard errors and produces rampant false-positive trend declarations. 

Furthermore, non-expert audiences (students, educators, community leaders) are often overwhelmed by complex climatology papers or misled by uncontextualized short-term graphs. We built Trend Compass to democratize scientific rigor: allowing anyone to test any coordinate box on Earth and obtain honest, mathematically robust answers.

### 2. What: The Four Answers Delivered
For every query, Trend Compass returns a unified, transparent findings panel:
- **WHAT:** Surface temperature anomaly relative to the 1951–1980 climatological baseline (GISTEMP v4 blended land-air and sea-surface observations).
- **WHERE:** User-selected latitude/longitude bounding box (via interactive 3D globe, country search, or 2D coordinates) with cosine-latitude cell weighting.
- **HOW MUCH:** Theil–Sen non-parametric median slope per decade, accompanied by 95% rank confidence intervals (explicitly noted as not serial-dependence corrected).
- **IS IT SIGNIFICANT:** Hamed–Rao Modified Mann-Kendall test ($p$-value and decision at $\alpha = 0.05$), accounting for lag-$k$ autocorrelation coefficients.

### 3. How: Architecture & Pipeline
- **Backend (Python 3.11 / FastAPI):** Memory-mapped NumPy float32 store (114 MB) preprocessed from the official NetCDF grid. Regional spatial reductions process up to 1,762 months in milliseconds. 
- **Statistical Engine:** SciPy, statsmodels, and pyMannKendall implement OLS, Theil–Sen, Mann–Kendall, Hamed–Rao, and Seasonal Mann–Kendall / STL.
- **Frontend (Next.js 14 / React 18 / Tailwind):** Fast, dark-first space-sailing interface featuring interactive WebGL/Canvas globe, NASA GIBS contextual imagery, Plotly time-series plots, accessible keyboard navigation, and the Star Navigator mascot.
- **Independent Audit & Reproducibility:** A separate audit script (`tests/audit/gistemp_audit.py`) reads the raw NetCDF file and independently recomputes weighted means, slopes, and $p$-values against the API golden reference.

---

## NASA Earth Observations & Imagery Used

| Dataset / Asset | Origin / Provider | Purpose in Project | Cryptographic Receipt (SHA-256) |
| :--- | :--- | :--- | :--- |
| **GISTEMP v4 Gridded Anomaly** (`gistemp1200_GHCNv4_ERSSTv5.nc.gz`) | NASA Goddard Institute for Space Studies (GISS) | Core numerical observations (1880–2026, 2°×2° grid, 1200 km smoothing) | `f7788db9044d0f0e3f9561ad5d0fd82e59cdfdb82ea8a10244f78f2cb032a3c7` |
| **GISTEMP Global Monthly CSV** (`GLB.Ts+dSST.csv`) | NASA GISS | Independent validation of global spatial reduction (MAE 0.012 °C, r = 0.9994) | `a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253` |
| **GIBS Blue Marble** (`BlueMarble_ShadedRelief_Bathymetry`) | NASA Global Imagery Browse Services (GIBS) / ESDIS | Contextual geographic basemap for 3D globe (visual only; not numerical input) | `0efc32f0d1a0bcf9b68196f11a0ebb0da6e1d6f0aa1ef48fb7b32da7d8d1f550` |

---

## Scientific Honesty & Documented Limitations

In accordance with NASA Open Science principles:
1. **Bounding Boxes vs Political Borders:** Country selections evaluate rectangular bounding boxes containing the territory, not high-resolution political polygon outlines.
2. **Serial Dependence Limitations:** The displayed Theil–Sen confidence interval is the rank interval on elapsed time and is explicitly labelled as not corrected for serial dependence.
3. **Independent Audit Variations:** While regional series means and original Mann-Kendall $p$-values match to $10^{-10}$, subtle numerical differences in detrended rank ties yield minor differences in Hamed–Rao $p$-values across libraries. All categorical significance decisions agree ($100\%$ concordant). We openly document these numbers in `docs/VALIDATION.md` without artificially tuning results.
4. **No Synthetic Fallbacks:** If the processed NASA data store is absent, the backend returns HTTP 503 rather than silently falling back to synthetic mock data.

---

## Team Members (Team Tech Pirates)

**Institution:** Francis Xavier Engineering College, Tirunelveli, Tamil Nadu, India

| Member Name | Academic Year & Department | Project Role | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Sam Joshua C** | III CSE | Captain & Scientific Architect | Project leadership, NASA Earthdata acquisition, statistical methodology governance, and quality assurance. |
| **Sathish S** | III CSE | Data Pipeline & Systems Specialist | Gridded NetCDF decompression, chunk loader optimization, cryptographic SHA-256 receipts, and regression checks. |
| **Ramakrishna S** | III CSE | Lead Full-Stack & Systems Engineer | 114MB memory-mapped NetCDF pipeline, FastAPI backend, interactive 3D WebGL globe, and automated validation suite. |
| **Santhosh S** | III CSE | Statistical Modeling & Audit Researcher | Theil–Sen robust slope estimation, Hamed–Rao Modified Mann-Kendall variance correction, and hypothesis verification. |
| **Rafin Antony.A** | II ECE | Satellite Telemetry & Sensor Integration | Remote sensing instruments (MODIS/IMERG), spectral radiance mapping, and telemetry latency verification. |
| **SAM BRAINARD M** | II ECE | Orbital Cartography & Signal Processing | Spherical coordinate projections, antimeridian bounding box transformations, and GIS layer integration. |

---

## Tools, Technologies & AI Disclosures

- **Languages & Frameworks:** Python 3.11, TypeScript, Next.js 14, React 18, FastAPI, Tailwind CSS.
- **Scientific Libraries:** NumPy, SciPy, Pandas, xarray, h5netcdf, statsmodels, pyMannKendall.
- **Visuals & Cartography:** Leaflet, Plotly.js, Natural Earth (public domain), OpenStreetMap (ODbL).
- **AI Tool Disclosure:** Google DeepMind Antigravity (Gemini models) and OpenAI Codex were used for code generation, test scripts, and UI refactoring. All calculations are executed deterministically by compiled Python code on verified NASA files; **no AI models generate or alter Earth observation data**.
