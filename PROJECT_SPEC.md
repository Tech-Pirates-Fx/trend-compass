# Trend Compass - Technical Project Specification

**Project:** Trend Compass 🧭  
**Challenge:** NASA Space Apps Challenge — *"Be An Earth System Trend Detective"*  
**Repository:** `nasa-app`  
**Monorepo Architecture:** Two-tier decoupled system (Next.js 14 Frontend + FastAPI Statistical Backend)  
**Last Updated:** November 2026  

---

## 1. Executive Summary & Challenge Objectives

**Trend Compass** is an open-source, educational Earth system detective platform engineered for students, educators, and researchers. The application enables users to select any geophysical Earth observation variable and any geographic bounding box across the globe to investigate multi-decadal changes.

The engine directly answers the four core questions outlined by the NASA challenge:

| Question | Implementation in Trend Compass | Technical Mechanism |
| :--- | :--- | :--- |
| **1. WHAT is changing?** | Physical variable definitions, physical units, measurement principles, and observational caveats. | Catalog metadata registry (`api/app/catalog.json`) with strict schema validation. |
| **2. WHERE is it changing?** | Interactive global coordinates, custom bounding boxes, and pre-configured preset regions. | Leaflet 2D bounding-box map selector (`web/components/MapSelector.tsx`) with antimeridian wrapping and area calculations. |
| **3. HOW MUCH is it changing?** | Non-parametric decadal and annual rates of change with 95% confidence intervals. | Theil-Sen median pairwise slope estimator (`scipy.stats.theilslopes`). |
| **4. IS IT SIGNIFICANT?** | Determining if observed trajectories exceed natural climate variability and serial persistence. | Hamed-Rao modified Mann-Kendall test with lag-$i$ rank autocorrelation variance correction (`pymannkendall`). |

---

## 2. System Architecture Overview

Trend Compass utilizes a decoupled, high-performance monorepo architecture:

```
+-------------------------------------------------------------------------------+
|                            NEXT.JS 14 FRONTEND (web/)                         |
|                                                                               |
|   Landing (/)  --->  Wizard (/investigate)  --->  Results (/results)          |
|                             |                             |                   |
|                      MapSelector.tsx              TimeSeriesChart.tsx         |
|                      (Leaflet 2D)                 (Plotly.js Dynamic)         |
|                                                           |                   |
|                      Static Demo Cases (/demo) <----------+                   |
+-------------------------------------------------------------------------------+
                                      |
                           Next.js Rewrite Proxy
                         (/api/py/* -> FastAPI:8000)
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                           FASTAPI BACKEND (api/)                              |
|                                                                               |
|  POST /analyze { variable_id, bbox, start, end, deseasonalize, alpha }        |
|                                                                               |
|  1. DataAdapter Layer                                                         |
|     * MockAdapter (deterministic synthetic generator)                         |
|     * GistempAdapter / NASA Earthdata NetCDF Ingestion Engine                 |
|                                                                               |
|  2. Preprocessing & Gap Handling Engine                                       |
|     * Missingness diagnostics & linear spline gap interpolation               |
|     * STL Decomposition (LOESS, period=12) for seasonal cycle extraction      |
|                                                                               |
|  3. Multi-Method Statistical Trend Suite                                      |
|     * Theil-Sen Robust Slope (median of pairwise slopes + 95% CI)             |
|     * Ordinary Least Squares (OLS) Linear Regression (slope, SE, R², p-value) |
|     * Mann-Kendall Rank Test (Kendall's tau, normalized z, p-value)           |
|     * Hamed-Rao Modified Mann-Kendall (autocorrelation-corrected variance)    |
|     * Seasonal Mann-Kendall Test (calendar month sub-series)                  |
|                                                                               |
|  4. Diagnostics & Divergence Protocol                                         |
|     * Lag-1 autocorrelation (r1) calculation                                  |
|     * Short-record detection (< 120 observations / 10 years)                  |
|     * Parametric vs non-parametric divergence flagging (OLS false positives)  |
|                                                                               |
|  5. Plain-Language Verdict Synthesizer                                        |
|     * Deterministic, template-driven natural language summary generation      |
|     * Transparent verdict classification ("Significant" vs "Not Significant") |
+-------------------------------------------------------------------------------+
```

---

## 3. Monorepo Directory Structure

```
nasa-app/
│
├── api/                           # Backend Python service
│   ├── app/
│   │   ├── adapters/              # Data source abstraction layer
│   │   │   ├── base.py            # Abstract Base Class (DataAdapter)
│   │   │   ├── mock.py            # Deterministic synthetic mock adapter
│   │   │   └── __init__.py        # Adapter factory & environment registry
│   │   ├── stats/                 # Mathematical & statistical computation engine
│   │   │   ├── preprocess.py      # Interpolation, missingness metrics, STL decomposition
│   │   │   ├── trend.py           # Theil-Sen, OLS, MK, Hamed-Rao, autocorrelation
│   │   │   └── summary.py         # Deterministic plain-language summary generator
│   │   ├── catalog.json           # Variable definitions, temporal & spatial coverage
│   │   ├── catalog.py             # Catalog query & lookup functions
│   │   ├── schemas.py             # Pydantic v2 data models & request/response contracts
│   │   └── main.py                # FastAPI route definitions, CORS, error handling
│   ├── tests/                     # Backend test suite (pytest)
│   │   ├── test_adapters.py       # Adapter consistency & reproducibility tests
│   │   ├── test_api.py            # API endpoint contracts & input validation tests
│   │   └── test_stats.py          # Statistical accuracy & divergence tests
│   └── requirements.txt           # Python dependency manifest
│
├── web/                           # Frontend Next.js 14 application
│   ├── app/                       # Next.js App Router
│   │   ├── demo/                  # Guided demo cases route (/demo)
│   │   │   ├── demo-cases.ts      # Guided scenario definitions
│   │   │   └── page.tsx           # Demo viewer page
│   │   ├── investigate/           # 3-step investigation wizard (/investigate)
│   │   │   └── page.tsx           # Step 1 (Var), Step 2 (Map), Step 3 (Params)
│   │   ├── results/               # Dynamic investigation results (/results)
│   │   │   └── page.tsx           # Analytical dashboard & visualization
│   │   ├── globals.css            # Tailwind CSS directives & custom styling
│   │   ├── layout.tsx             # Root layout, Navbar, MockBanner, Footer
│   │   └── page.tsx               # Landing page with 4 detective questions
│   ├── components/                # Modular UI components
│   │   ├── MapSelector.tsx        # Leaflet 2D bounding-box map selector
│   │   ├── TimeSeriesChart.tsx    # Plotly.js interactive timeseries visualization
│   │   ├── SummaryVerdict.tsx     # Plain-language verdict badge & summary card
│   │   ├── StatCard.tsx           # Key indicator metric card
│   │   ├── StatsDetailsTable.tsx  # Multi-method statistical comparison table
│   │   ├── ExplainerCard.tsx      # Educational methodology accordion
│   │   ├── MockBanner.tsx         # Real-time mock data indicator banner
│   │   ├── Navbar.tsx             # Navigation header & theme switcher
│   │   └── Footer.tsx             # NASA challenge attribution & credits
│   ├── lib/                       # Frontend utilities & clients
│   │   ├── api.ts                 # Type-safe API client (via Next.js rewrite proxy)
│   │   ├── presets.ts             # Predefined geographic regions & bounding boxes
│   │   └── types.ts               # TypeScript data models mirroring schemas.py
│   ├── public/demo/               # Precomputed static JSON fixtures for offline demo
│   ├── next.config.mjs            # Next.js config & API proxy rewrites
│   ├── tailwind.config.ts         # Tailwind design tokens & typography
│   ├── tsconfig.json              # TypeScript compilation configuration
│   └── package.json               # Node.js dependencies & scripts
│
├── data-pipeline/                 # NASA data ingestion and validation pipelines
│   ├── raw/                       # Downloaded NetCDF/CSV files (gitignored)
│   ├── download_gistemp.py        # Resumable HTTP Range downloader with checksums
│   ├── inspect_gistemp.py         # NetCDF inspection & cos(lat)-weighted mean validator
│   └── README.md                  # Pipeline execution instructions
│
├── data-raw/                      # Manual user drop folder for NASA source files
├── docs/                          # Comprehensive project documentation
│   ├── ARCHITECTURE.md            # System architecture blueprint
│   ├── STATISTICAL_METHODS.md     # Mathematical formulations & references
│   ├── DATA_ACCESS.md             # NASA Earthdata access audit & endpoint log
│   ├── DEPLOYMENT.md              # Vercel & Render cloud deployment guide
│   ├── TEAM_PLAYBOOK.md           # Engineering rules, roles, and constraints
│   ├── TASKS.md                   # Project execution task tracking
│   └── STATUS.md                  # Development progress log
│
├── main.py                        # Root Python entrypoint (wraps api/app/main.py)
├── Dockerfile                     # Production container specification
├── render.yaml                    # Render.com cloud deployment configuration
├── start-all.bat                  # Local Windows service startup script
└── PROJECT_SPEC.md                # Technical project specifications (this file)
```

---

## 4. Backend Technical Specifications (`/api`)

### 4.1 Runtime & Dependencies
- **Language / Runtime:** Python 3.11.x
- **Framework:** FastAPI (`>=0.112.0, <0.115.0`)
- **ASGI Server:** Uvicorn (`>=0.29.0, <1.0.0`)
- **Data Validation:** Pydantic v2 (`>=2.8.0, <2.9.0`)
- **Scientific Computing Stack:**
  - `numpy` (`>=1.26.0`): Vectorized numerical array operations
  - `pandas` (`>=2.2.0`): Time-series indexing, interpolation, and slicing
  - `scipy` (`>=1.12.0`): Non-parametric Theil-Sen slope estimation and distributions
  - `statsmodels` (`>=0.14.0`): STL decomposition (Seasonal and Trend with LOESS)
  - `pymannkendall` (`>=1.4.3`): Original, Hamed-Rao modified, and Seasonal Mann-Kendall tests
  - `xarray` (`>=2024.0.0`): Multidimensional NetCDF grid manipulation
  - `h5netcdf` (`>=1.3.0`) & `h5py` (`>=3.10.0`): NetCDF-4 / HDF5 grid parsing

### 4.2 REST API Routes & Specifications

#### 1. `GET /health`
- **Purpose:** Service health check and data adapter status probe.
- **Response Schema:** `HealthResponse`
```json
{
  "status": "healthy",
  "service": "trend-compass-api",
  "phase": 2,
  "adapter": "mock",
  "is_mock": true
}
```

#### 2. `GET /catalog` (Alias: `GET /variables`)
- **Purpose:** Returns the complete catalog of observable Earth science variables with spatial and temporal bounds.
- **Response Schema:** `list[VariableMeta]`
- **Variables Supported:**
  1. `air_temperature`: Surface Air Temperature (°C, atmosphere, 0.5° resolution)
  2. `precipitation`: Total Precipitation (mm/month, atmosphere, 0.5° resolution)
  3. `vegetation_greenness`: Vegetation Greenness NDVI (-1 to 1, land, 0.25° resolution)
  4. `sea_surface_temperature`: Sea Surface Temperature SST (°C, ocean, 0.25° resolution)
  5. `soil_moisture`: Volumetric Soil Moisture (m³/m³, land, 0.5° resolution)

#### 3. `POST /timeseries`
- **Purpose:** Retrieves raw timeseries points for a designated variable and bounding box without running statistical evaluation.
- **Request Parameters:**
  - `variable_id` (str): Catalog variable identifier.
  - `bbox` (BoundingBox): `{ south, west, north, east }`.
  - `start` (str, default `"2000-01"`): Start date (YYYY-MM or YYYY-MM-DD).
  - `end` (str, default `"2025-12"`): End date (YYYY-MM or YYYY-MM-DD).
  - `resolution` (str, default `"monthly"`): Sampling resolution (`"monthly"` or `"daily"`).

#### 4. `POST /analyze`
- **Purpose:** Core analytical pipeline. Preprocesses raw data, performs seasonal extraction, runs five statistical trend tests, evaluates diagnostics, and generates a plain-language summary.
- **Request Schema:** `AnalyzeRequest`
```json
{
  "variable_id": "air_temperature",
  "bbox": { "south": 68.0, "west": -160.0, "north": 75.0, "east": -130.0 },
  "start": "2000-01",
  "end": "2025-12",
  "resolution": "monthly",
  "deseasonalize": true,
  "alpha": 0.05
}
```
- **Response Schema:** `AnalyzeResponse`
  - `variable`: Complete variable metadata.
  - `bbox`: Query bounding box.
  - `resolution`: Effective sampling frequency.
  - `units`: Physical units.
  - `source`: Dataset citation/source name.
  - `is_mock`: Boolean indicating whether mock or real NASA observations were computed.
  - `deseasonalize_applied`: Boolean indicating if STL was performed.
  - `raw_timeseries`: Array of `{ t: "YYYY-MM", value: float }`.
  - `deseasonalized_timeseries`: Array of `{ t: "YYYY-MM", value: float }` (or null).
  - `trend_line`: Fitted trend line points for charting.
  - `methods`: Map of method results (`ols`, `theil_sen`, `mann_kendall`, `hamed_rao`, `seasonal_mk`).
  - `diagnostics`: Data quality metrics (`missing_count`, `missing_pct`, `r1_autocorrelation`, `warnings`, `recommendation`).
  - `summary`: Plain-language verdict and narrative (`verdict`, `headline`, `narrative`, `direction`).

### 4.3 Statistical Engine & Mathematical Methods

#### 1. Data Preprocessing & Gap Handling (`preprocess.py`)
- **Missingness Calculation:**
  $$\text{missing\_pct} = \frac{N_{\text{missing}}}{N_{\text{total}}} \times 100$$
  If missingness exceeds 15%, a diagnostic warning is emitted.
- **Gap Interpolation:** Linear spline interpolation across missing values with boundary forward/backward filling (`pandas.Series.interpolate(method="linear").bfill().ffill()`).
- **STL Deseasonalization:** Robust Seasonal and Trend decomposition using LOESS (`statsmodels.tsa.seasonal.STL`, period = 12 for monthly, 365 for daily, `robust=True`). The deseasonalized series is extracted as:
  $$\tilde{y}(t) = y(t) - S(t)$$

#### 2. Theil-Sen Robust Estimator (`trend.py`)
- Computes the median of all pairwise slopes across $n$ observations:
  $$\beta_{\text{Sen}} = \text{median}\left\{ \frac{y_j - y_i}{t_j - t_i} \;\middle|\; 1 \le i < j \le n \right\}$$
- **Breakdown Point:** 29.3%, providing extreme resilience against climate outliers and measurement anomalies.
- **Confidence Intervals:** 95% non-parametric confidence limits calculated from normal rank quantiles.

#### 3. Ordinary Least Squares (OLS) Linear Regression (`trend.py`)
- Fits standard parametric line:
  $$y_t = \alpha + \beta t + \varepsilon_t$$
- Reports slope, standard error, $R^2$, and two-sided p-value against $H_0: \beta = 0$.

#### 4. Original Mann-Kendall Test (`trend.py`)
- Evaluates monotonic trend test statistic $S$:
  $$S = \sum_{i=1}^{n-1} \sum_{j=i+1}^n \text{sgn}(y_j - y_i)$$
- Standardized $Z$ statistic evaluated against standard normal distribution $\mathcal{N}(0, 1)$.

#### 5. Hamed-Rao Modified Mann-Kendall Test (`trend.py`)
- **Primary Arbiter of Significance:** Geophysical time-series often possess positive serial autocorrelation, inflating $\text{Var}(S)$ and causing false-positive trend declarations.
- Computes an empirical variance correction factor based on lag-$i$ rank autocorrelation $\rho_s(i)$ of detrended series:
  $$\text{Var}^*(S) = \text{Var}(S) \cdot \left[ 1 + \frac{2}{n(n - 1)(n - 2)} \sum_{i=1}^{n-1} (n - i)(n - i - 1)(n - i - 2) \rho_s(i) \right]$$

#### 6. Autocorrelation & Disagreement Protocol
- Calculates lag-1 Pearson autocorrelation $r_1$:
  $$r_1 = \frac{\sum_{t=1}^{n-1} (y_t - \bar{y})(y_{t+1} - \bar{y})}{\sum_{t=1}^n (y_t - \bar{y})^2}$$
- **Disagreement Guard:** When OLS indicates statistical significance ($p < 0.05$) but Hamed-Rao Mann-Kendall does not ($p \ge 0.05$), Trend Compass warns the user that serial memory likely produced a false positive in the linear model.

---

## 5. Frontend Technical Specifications (`/web`)

### 5.1 Runtime & Libraries
- **Framework:** Next.js 14.2.23 (App Router)
- **UI Library:** React 18.3.1
- **Language:** TypeScript 5.6.3
- **Styling:** Tailwind CSS 3.4.14 with `@tailwindcss/typography` & `clsx` / `tailwind-merge`
- **Mapping:** Leaflet 1.9.4 & `react-leaflet` 4.2.1
- **Visualization:** Plotly.js (`plotly.js-dist-min` 2.35.2 & `react-plotly.js` 2.6.0)
- **Icons:** Lucide React (`lucide-react` 0.453.0)

### 5.2 Application Pages & User Journey

#### 1. Home / Landing Page (`/`)
- Presents the challenge overview and the four Earth detective questions.
- Quick navigation pathways: **"Start Investigation"** (wizard) or **"Explore Demo Cases"** (curated scenarios).

#### 2. Investigation Wizard (`/investigate`)
A structured 3-step configuration interface:
- **Step 1: Choose Variable:** Selection between the 5 Earth observation datasets.
- **Step 2: Define Geographic Area:** Interactive Leaflet 2D map:
  - Click-to-center box sizing.
  - Two-corner rectangle drawing.
  - 1-click Preset Regions (Western Arctic, Southern Ocean, Amazon Basin, Sahel, North Atlantic).
  - Validation: Prevents inverted bounding boxes and calculates surface area in $\text{km}^2$.
- **Step 3: Temporal & Analysis Settings:**
  - Start / End date dropdowns with chronological validation (minimum 24 months).
  - Resolution selector (`monthly` or `daily`).
  - STL Deseasonalization toggle.
  - Significance threshold $\alpha$ (`0.05` or `0.01`).

#### 3. Results Dashboard (`/results`)
- **URL-Driven State:** All query parameters serialized into URL (`?variable_id=...&south=...`), enabling reproducible sharing and bookmarking.
- **Interactive Timeseries Chart:** Plotly chart with toggleable traces:
  - Raw observations
  - Deseasonalized trend component (STL)
  - Theil-Sen robust fitted trend line
- **Summary Verdict Badge:** Prominent status badge:
  - 🟢 **Statistically Significant Trend Detected**
  - 🟡 **No Statistically Significant Trend**
  - 🔴 **Data Quality / High Uncertainty Warning**
- **Stat Cards:** At-a-glance metrics (Rate of Change per Decade, Hamed-Rao p-value, OLS Slope, Lag-1 Autocorrelation).
- **Statistical Methods Comparison Table:** Side-by-side display of OLS, Theil-Sen, Mann-Kendall, Hamed-Rao, and Seasonal MK.

#### 4. Demo Walkthrough Mode (`/demo`)
- **Zero-Backend Dependency:** Operates instantly via precomputed JSON files in `web/public/demo/*.json`.
- **4 Guided Scenarios:**
  1. *Arctic Amplification:* Accelerated high-latitude warming.
  2. *The Polar Contrast:* Subpolar cooling showing opposing regional trajectories.
  3. *Sahel Precipitation:* High variability with subtle long-term shifts.
  4. *Bering Strait SST:* Marine temperature shifts and seasonal sea-ice impacts.

### 5.3 Frontend-to-Backend Proxy Architecture
To avoid CORS issues and eliminate raw backend IP exposure, Next.js handles proxy rewrites via `web/next.config.mjs`:

```javascript
async rewrites() {
  const pyApiUrl = process.env.PY_API_URL || "http://127.0.0.1:8000";
  return [
    {
      source: "/api/py/:path*",
      destination: `${pyApiUrl}/:path*`,
    },
  ];
}
```
All client-side API requests call relative URL `/api/py/*`, which Next.js forwards internally to the FastAPI backend.

---

## 6. Data Pipeline Specifications (`/data-pipeline`)

The data pipeline manages official NASA observational datasets:
- **`download_gistemp.py`**:
  - Resumable download manager utilizing RFC 7233 HTTP Range headers.
  - Endpoints: GISTEMP v4 1200km (`gistemp1200_GHCNv4_ERSSTv5.nc.gz`), 250km (`gistemp250_GHCNv4.nc.gz`), 2° landmask, and `GLB.Ts+dSST.csv`.
  - Offline fallback `--from-file` to ingest files downloaded manually into `data-raw/`.
  - SHA-256 integrity verification.
- **`inspect_gistemp.py`**:
  - NetCDF-3 / NetCDF-4 auto-detection via `xarray`, `scipy`, and `h5netcdf`.
  - Area-weighted global temperature anomaly integration using cosine of latitude:
    $$\bar{T}(t) = \frac{\sum_i T_i(t) \cos(\phi_i)}{\sum_i \cos(\phi_i)}$$
  - Cross-validation against NASA published tables (`GLB.Ts+dSST.csv`).

---

## 7. Environment Variables & Port Allocations

| Variable | Scope | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | `8000` | Port for the FastAPI Uvicorn server |
| `HOST` | Backend | `0.0.0.0` | Binding host address |
| `DATA_ADAPTER` | Backend | `mock` | Active data provider (`mock`, `gistemp`, `nasa`) |
| `PYTHONPATH` | Backend | `.` | Python module search path |
| `PY_API_URL` | Frontend | `http://127.0.0.1:8000` | Backend URL used by Next.js rewrites and SSR |

### Port Mapping
- **Frontend Web App:** `http://localhost:3000`
- **Backend API Service:** `http://127.0.0.1:8000`
- **Backend Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Backend ReDoc:** `http://127.0.0.1:8000/redoc`

---

## 8. Startup & Execution Instructions

### 8.1 Automated 1-Click Startup (Windows)
Double-click `start-all.bat` in the repository root, or run:
```cmd
start-all.bat
```
This script automatically:
1. Validates the Python 3.11 environment and required backend packages.
2. Validates Node.js and verifies `web/node_modules` (runs `npm install` if absent).
3. Launches the FastAPI backend on port 8000 in a dedicated console window.
4. Launches the Next.js development server on port 3000 in a dedicated console window.
5. Displays connection status and automatically launches `http://localhost:3000` in the default browser.

### 8.2 Manual Startup

#### Backend Service (Terminal 1)
```powershell
# From workspace root
python -m pip install -r api/requirements.txt
python main.py
```
*Backend is accessible at `http://127.0.0.1:8000`.*

#### Frontend Service (Terminal 2)
```powershell
# From workspace root
cd web
npm install
npm run dev
```
*Frontend is accessible at `http://localhost:3000`.*

---

## 9. Testing & Quality Assurance

### 9.1 Backend Test Suite (Pytest)
Execute unit and integration tests covering adapters, statistics, and API endpoints:
```powershell
python -m pytest api/tests
```
**Test Coverage:**
- `api/tests/test_adapters.py`: Adapter seeding, deterministic series generation, polar trend forcing, and coordinate boundary handling.
- `api/tests/test_stats.py`: Linear interpolation, STL deseasonalization, Theil-Sen slope calculation, OLS regression, Mann-Kendall, and Hamed-Rao variance correction.
- `api/tests/test_api.py`: Input validation (422 responses for invalid chronology, minimum duration checks), catalog retrieval, and `/analyze` integration.

### 9.2 Frontend Validation
```powershell
cd web
npm run lint
npm run build
```

---

## 10. Deployment Specifications

| Component | Target Platform | Root Directory | Build Command | Start Command | Env Variables |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Render / Railway | Workspace Root | `pip install -r api/requirements.txt` | `python main.py` | `PYTHON_VERSION=3.11.9`, `DATA_ADAPTER=mock` |
| **Frontend Web**| Vercel | `web/` | `npm run build` | `npm run start` | `PY_API_URL=https://<your-backend-url>` |
| **Docker Container** | Docker Engine | Workspace Root | `docker build -t trend-compass .` | `docker run -p 8000:8000 trend-compass` | `PORT=8000` |

