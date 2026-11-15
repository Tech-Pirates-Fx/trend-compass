# Trend Compass: Space Apps 2026 Scoring Rubric Map

This document explicitly maps every system architectural component, UX workflow, and statistical feature in **Trend Compass** to the official NASA Space Apps Challenge judging criteria (100 core points + bonus criteria).

---

## 1. Rubric Mapping Table

| Rubric Criterion | Weight | Trend Compass Feature / Architectural Implementation | How It Maximizes Score |
| :--- | :---: | :--- | :--- |
| **Impact** | 20 pts | • **Classroom Investigation Pack & Worksheets** (`/web` student sheet export)<br>• **Shareable URL State Parameters** (instant case loading for classrooms)<br>• **Scalable Browser/Client-Ready Architecture** (zero per-user cloud database overhead) | Demonstrates a clear, plausible, and measurable educational pathway from high school earth science curricula to university atmospheric research. Students can formulate hypotheses and verify them in minutes. |
| **Creativity** | 20 pts | • **Detective Mode (Gamified Hypothesis Flow)**: predicts direction (*Up / Down / Flat*) before statistical reveal<br>• **Multi-Variable Screening ("What's trending here?")**<br>• **Opposite Trend Polar Contrast Preset** (Western Arctic vs. East Antarctic) | Replaces dry data portals with an engaging mystery-solving mechanic. Tackles the core challenge objective ("up in one place, down in another") through gamified discovery. |
| **Validity** | 20 pts | • **Statistical Rigor**: Theil-Sen median slope, Hamed-Rao modified Mann-Kendall (lag-1 autocorrelation correction), STL seasonal decomposition<br>• **Honest Reporting**: non-significant trends flagged explicitly with "needs longer record" warning<br>• **Formal Cross-Validation**: `docs/VALIDATION.md` benchmarking against Giovanni and SciPy/Statsmodels<br>• **Automated Test Suite**: 20+ unit/integration tests with known synthetic slopes | Addresses the fundamental trap in climate science: autocorrelation inducing false positive trends. Evaluators can inspect full mathematical derivations and reproducible verification tests. |
| **Relevance** | 20 pts | • **NASA Open Data Central**: 100% user-facing outputs trace directly to real NASA/partner datasets (MODIS, GLDAS, GISTEMP, SeaWiFS/OC-CCI)<br>• **Complete Provenance on Every Series**: metadata panel displays dataset name, version, sensor, retrieval date, DOI, and citation<br>• **Reproducible Pipeline**: `/data-pipeline` scripts recreate the exact dataset store from source | Directly aligns with the "Be An Earth System Trend Detective" challenge statement. Eliminates mock data in production while providing open, reproducible source pipelines. |
| **Presentation** | 20 pts | • **Clear Scientific Storyline**: Hero preview answers WHAT, WHERE, HOW MUCH, and IS IT SIGNIFICANT in seconds<br>• **Accessible Visualizations**: Interactive Plotly charts with confidence intervals and dual raw/deseasonalized traces<br>• **Polished Design**: Dark/light mode, mobile responsive (375px+), loading skeletons, and interactive Leaflet map drawing | High visual appeal for both expert evaluators and general student audiences. Communicates complex statistical concepts in plain English. |

---

## 2. Additional Bonus Criteria

| Category | Score Scale | Implementation in Trend Compass |
| :--- | :---: | :--- |
| **NASA Data Extent** | 1 to 5 | Spans all three Earth system spheres with distinct datasets:<br>1. **Atmosphere**: GISTEMP / AIRS / NLDAS (Surface Air Temperature)<br>2. **Land**: MODIS MOD13 / GLDAS (Vegetation Greenness NDVI & Soil Moisture)<br>3. **Ocean**: MODIS Aqua / SeaWiFS / OISST (Sea Surface Temperature & Chlorophyll-a) |
| **User Experience (UX)** | 1 to 5 | Multi-step inquiry wizard, interactive map with antimeridian 180° date-line split, immediate preset loading, keyboard accessibility, and intuitive sliders with real-time record length validation. |
| **Teamwork & Collaboration** | 1 to 5 | Monorepo layout with decoupled `/api` and `/web`, transparent documentation, clear issue tracking, and clean division of scientific and UI responsibilities. |
| **Checklist Compliance** | +3 pts | • Challenge category accurately designated: *"Be An Earth System Trend Detective"*<br>• Public GitHub repository with open MIT license and zero committed secrets<br>• Complete NASA Space Apps project page content ready in `docs/PROJECT_PAGE.md` |
