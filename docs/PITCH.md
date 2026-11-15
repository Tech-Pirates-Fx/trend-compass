# Trend Compass — Project Pitch

**NASA Space Apps Challenge 2026:** Be An Earth System Trend Detective!  
**Team:** Tech Pirates  

---

## 1. The Elevator Pitch (30 Seconds)

How do you tell whether a scorching summer or a mild winter is just natural fluctuation, or part of an undeniable decadal climate trend? 

Most climate dashboards give you basic linear lines that fail to account for serial correlation, producing misleading false alarms, or hide their math behind black boxes. 

**Trend Compass** transforms raw NASA Earth observations into an accessible space-pirate expedition. Guided by our original navigator mascot, Orion, users chart any coordinate box on Earth and receive four immediate, mathematically unshakeable answers: **WHAT** is changing, **WHERE**, **HOW MUCH** per decade, and **IS IT STATISTICALLY SIGNIFICANT** under autocorrelation-adjusted tests. All with cryptographic SHA-256 receipts and instant CSV exports.

---

## 2. Why Trend Compass Wins: Four Decisive Pillars

### Pillar 1: Authentic NASA Observations at Core
We don't use simulated or mock values. Our backend memory-maps official NASA GISS GISTEMP v4 NetCDF grids spanning 1880 to 2026 (1,762 months). We verify every byte with TLS and cryptographic SHA-256 hashes (`f7788db9...`). Missing data triggers an honest HTTP 503 rather than synthetic fakes.

### Pillar 2: Climatological Statistical Rigor
Geophysical records exhibit strong serial autocorrelation. Standard Ordinary Least Squares (OLS) models underestimate uncertainty and report false significance. Trend Compass executes:
- **Theil–Sen Robust Estimator:** Computes the median of pairwise slopes, completely immune to outlier months and extreme events.
- **Hamed–Rao Modified Mann-Kendall Test:** Calculates empirical lag-autocorrelation coefficients and adjusts test variance accordingly, ensuring genuine statistical decisions.

### Pillar 3: Accessible Space-Pirate Expedition Experience
Climate science should inspire curiosity, not intimidate. We designed an original space-sailing ship journey:
- **Star Deck:** Spin a 3D Earth globe wrapped in NASA GIBS Blue Marble imagery.
- **Navigator Orion:** An original astronaut-pirate navigator component at bottom-left providing gentle, contextual guidance at every station without marketing clutter.
- **Accessible & Responsive:** Full keyboard accessibility, reduced-motion fallbacks, 2D coordinates, and dark/light modes.

### Pillar 4: Transparent Scientific Honesty
We publish our caveats openly:
- Country selections evaluate rectangular bounding boxes, not national borders.
- We include examples where trends are **not significant** (e.g. Western Arctic under Hamed-Rao) to show why proper tests matter.
- Our independent Python audit (`tests/audit/gistemp_audit.py`) matches raw-grid means to $10^{-15}$ and documents subtle p-value behaviors in `docs/VALIDATION.md`.

---

## 3. Impact & Real-World Utility

- **Education & Classrooms:** Middle and high school students can test local regions, learn the difference between weather and climate, and understand statistical significance hands-on.
- **Policy & Community Advocacy:** Local stakeholders can independently verify climate trends in their exact agricultural or coastal coordinate box with exportable CSV proof.
- **Scientific Reproducibility:** Every single figure traces back to a timestamped NASA file and public Python script.

---

## 4. Immediate Roadmap

1. **Precipitation (IMERG):** Ingestion of authenticated NASA Giovanni monthly IMERG V07 precipitation time series (exact steps mapped in `docs/RAINFALL_NEXT.md`).
2. **Vegetation (MODIS):** MOD13C2 0.05° monthly NDVI integration following our approved data spike.
3. **Multi-Variable Trend Synthesis:** Side-by-side temperature and precipitation correlation across identical regional coordinates.
