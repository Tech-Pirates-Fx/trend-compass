# NASA Data Access Research & Evaluation Report (v3)

**Project:** Trend Compass (NASA Space Apps 2026: *"Be An Earth System Trend Detective"*)  
**Status:** Phase A Research Completed & Corrected (Task T1)  
**Sources:** Official NASA Space Apps Challenge Resources  

---

## 1. Primary NASA Data Sources Assessment

### 1.1 NASA GISS Surface Temperature Analysis (GISTEMP v4)
* **Description:** NASA Goddard Institute for Space Studies global surface temperature anomaly analysis combining meteorological surface stations (NOAA GHCN v4) and sea surface temperatures (ERSST v5).
* **Grid Resolution:** `[READ (https://data.giss.nasa.gov/gistemp/data_v4.html)]`  
  Regular **2° × 2° latitude-longitude grid** (not 1°). The global grid contains $90 \times 180 = 16,200$ cells per monthly time step.
* **Exact File Names, URLs, and Sizes:** `[READ (https://data.giss.nasa.gov/gistemp/data_v4.html)]`
  * **Gridded Compressed NetCDF (1200km smoothing):**  
    `https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz` (Size: **23 MB**)
  * **Gridded Compressed NetCDF (250km smoothing, land only):**  
    `https://data.giss.nasa.gov/pub/gistemp/gistemp250_GHCNv4.nc.gz` (Size: **9 MB**)
  * **Land Mask (2° × 2°):**  
    `https://data.giss.nasa.gov/pub/gistemp/landmask.2degx2deg.txt`
  * **Global / Hemispheric Time Series Tables (CSV):**  
    `https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv` (Global LOTI, ~18 KB)  
    `https://data.giss.nasa.gov/gistemp/tabledata_v4/NH.Ts+dSST.csv` (Northern Hemisphere LOTI, ~18 KB)  
    `https://data.giss.nasa.gov/gistemp/tabledata_v4/SH.Ts+dSST.csv` (Southern Hemisphere LOTI, ~18 KB)  
    `https://data.giss.nasa.gov/gistemp/tabledata_v4/ZonAnn.Ts+dSST.csv` (Zonal annual means, ~14 KB)
* **Smoothing Options (250km vs. 1200km) & Polar Implications:** `[READ (https://data.giss.nasa.gov/gistemp/)]`
  * **250 km smoothing (`gistemp250`):** Land stations only, interpolated out to a maximum radius of 250 km. Because Antarctica and remote oceanic/desert regions have sparse weather stations separated by hundreds of kilometers, large portions of continental Antarctica and the Arctic Ocean have **no data (unshaded / NaN)**.
  * **1200 km smoothing (`gistemp1200`):** Based on the empirical finding by Hansen et al. that surface temperature anomaly correlations remain significant ($\rho > 0.5$) over distances up to 1200 km at mid-to-high latitudes. This option linearly extrapolates station anomalies across data-poor regions, providing **continuous spatial coverage across continental Antarctica and the Arctic basin**.
* **Units:** `[READ (https://data.giss.nasa.gov/gistemp/data_v4.html)]`  
  Degrees Celsius (**°C**), expressed as temperature anomalies.
* **Anomaly Baseline Period:** `[READ (https://data.giss.nasa.gov/gistemp/data_v4.html)]`  
  **1951–1980** climatological base period (deviations from 1951–1980 calendar monthly means).
* **Login Requirement:** `[TESTED - DATA VERIFIED for CSV; netCDF download in T2]`  
  **None.** Completely open, unauthenticated direct HTTP download from NASA GISS.
* **Required Citation Text:** `[READ (https://data.giss.nasa.gov/gistemp/)]`  
  * *Webpage Citation:* "GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Dataset accessed [date] at https://data.giss.nasa.gov/gistemp/."
  * *Foundational Methodology Papers (named on current page):*
    1. Hansen, J., R. Ruedy, M. Sato, and K. Lo, 2010: Global surface temperature change. *Rev. Geophys.*, 48, RG4004, doi:10.1029/2010RG000045.
    2. Lenssen, N., G. A. Schmidt, M. Hendrickson, P. Jacobs, M. Menne, and R. Ruedy, 2024: A GISTEMPv4 observational uncertainty ensemble. *J. Geophys. Res. Atmos.*, 129(17), e2023JD040179, doi:10.1029/2023JD040179.
    *(Note: The 2019 paper Lenssen et al., 2019, JGR Atmos., is also maintained in the Uncertainty Quantification section).*
* **Note on Faulty / Missing GHCN Data (August 2025 Onward):** `[READ (https://data.giss.nasa.gov/gistemp/updates_v4/)]`
  * Documented under the official *September 11, 2025* GISTEMP v4 update:
    > "The August 2025 report from Maliye Karmakuly seemed inconsistent with history and its neighbors, off by about 12 °C. This was confirmed by looking at other sources. Inspecting the whole time series showed that the same faulty report was also submitted for June 2024 and June 2025, where it was less noticeable, being off by about 3-4 °C. All three reports were omitted from our analysis. This was reported to NCEI."
* **Real Test Fetch (Table Data):** `[TESTED - DATA VERIFIED]`
  ```bash
  python -c "import urllib.request; resp = urllib.request.urlopen('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'); print('Status:', resp.status); print(resp.read(300).decode('utf-8'))"
  ```
  *Output:*
  ```text
  Status: 200
  Land-Ocean: Global Means
  Year,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,J-D,D-N,DJF,MAM,JJA,SON
  1880,-.19,-.25,-.10,-.17,-.10,-.21,-.19,-.11,-.15,-.23,-.22,-.18,-.18,***,***,-.12,-.17,-.20
  1881,-.20,-.15,.03,.05,.06,-.19,.00,-.03,-.15,-.22,-.19,-.07,-.09,-.10,-.18,.04,-.08,-.19
  ```
* **Status of Gridded NetCDF File:** `[READ (URL) - DOWNLOAD PENDING T2]`  
  Initial automated attempts on Windows experienced connection resets (`WinError 10054`) on `data.giss.nasa.gov/pub/`. Task T2 implements a robust, resumable downloader with retry logic, proper headers, and SHA-256 checksum verification in `/data-pipeline`.

---

### 1.2 NASA Giovanni (GES DISC)
* **Description:** Geospatial Interactive Online Visualization and Analysis Infrastructure for satellite and modeled Earth data.
* **Programmatic / Export Route:** `[READ (https://giovanni.gsfc.nasa.gov/giovanni/help-resources/)]`
  * Interactive web portal where users run "Area-Averaged Time Series" plots and export tabular `.csv` files.
  * Underlying API endpoints (`proxy-timeseries`, Harmony API).
* **Output Format:** `[READ (Official Giovanni CSV Export Format)]`  
  Standard CSV format with `#`-prefixed metadata lines (title, date range, bounding box coordinates, units, sensor) followed by two tabular columns: `date, <Variable_Column_Name>`.
* **Authentication:** `[READ (https://urs.earthdata.nasa.gov/)]`  
  Requires NASA Earthdata Login (EDL).

---

### 1.3 NASA AppEEARS (LP DAAC)
* **Description:** Application for Extracting and Exploring Analysis Ready Samples (MODIS, VIIRS, SMAP).
* **API Endpoints:** `[READ (https://appeears.earthdatacloud.nasa.gov/api/)]`  
  REST API: `POST /api/login`, `POST /api/task`, `GET /api/task/{task_id}`, `GET /api/bundle/{task_id}`.
* **Latency & Execution Model:** `[READ & ASSUMED]`  
  Tasks execute in an asynchronous batch queue. Point sampling finishes in minutes; spatial area extractions can take 15–60+ minutes depending on LP DAAC cluster workload. **Cannot serve synchronous on-the-fly requests for arbitrary bounding boxes in a web app.**
* **Authentication:** `[READ (https://appeears.earthdatacloud.nasa.gov/api/)]`  
  Requires NASA Earthdata Login Bearer token.

---

### 1.4 NASA GES DISC Hydrology Data Rods Service
* **Description:** Point time-series extraction service for GLDAS/NLDAS land surface models.
* **API Endpoint:** `[READ (https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi)]`
* **Real Test Fetch:** `[TESTED - BLOCKED ANONYMOUSLY]`
  ```bash
  python -c "import urllib.request; req = urllib.request.Request('https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi?variable=NLDAS:NLDAS_FORA0125_H.002:TMP2m&location=GEOM:POINT(-95.5%2035.2)&startDate=2020-01-01T00&endDate=2020-01-02T00&type=asc2', headers={'User-Agent': 'Mozilla/5.0'}); resp = urllib.request.urlopen(req); print('Status:', resp.status); print(resp.read(300).decode('utf-8'))"
  ```
  *Output:*
  ```text
  Status: 200
  <!DOCTYPE html>
  <html lang='en' ng-app="uuiApp" class="theme-gesdisc bg-deep-blue">
  <head>
  <!-- Google Tag Manager -->
  ...
  <!-- Google reCAPTCHA -->
  ```
  *Operational Finding:* **Not usable anonymously.** Anonymous HTTP GET requests from outside NASA networks trigger an interactive HTML authentication and reCAPTCHA challenge rather than returning raw ASCII time-series records. Therefore, Data Rods is disqualified from automated unattended backend pipeline execution.

---

### 1.5 Official Challenge Scientific Reference: SeaWiFS Ocean Chlorophyll Paper
* **Real Official Citation:** `[READ]`  
  **Acker, J. G., McMahon, E., Shen, S., Hearty, T., & Casey, N. (2009):**  
  *"Time-Series Analysis of Remotely-Sensed SeaWiFS Chlorophyll in River-Influenced Coastal Regions."*  
  *EARSeL eProceedings*, 8(2), 114–139.
* **Core Takeaways for Trend Compass:**  
  1. Authored by the NASA GES DISC Giovanni development team to showcase how Giovanni generates reliable multi-decadal time-series and area-averages.
  2. Analyzes 10+ years of SeaWiFS ocean color data across optically complex river plumes (Amazon, Orinoco, Congo).
  3. Emphasizes isolating seasonal cycle swings from underlying decadal trends, which directly motivates Trend Compass's STL deseasonalization option.

---

## 2. Reference / Context Tools (Non-NASA)

*Note: In accordance with the challenge requirement that NASA open data must be central, non-NASA tools like NOAA CDO and KNMI Climate Explorer are removed from the core data plan and retained for context only.*

* **NOAA Climate Data Online (CDO):** Station-based weather data (GHCN-Daily), not gridded satellite data. Removed from human action checklist.
* **KNMI Climate Explorer:** Partner analysis platform (`climexp.knmi.nl`). Used only as an external benchmark for cross-validating trends in `docs/VALIDATION.md`.

---

## 3. Approved Architecture: Modified Hybrid Model

In accordance with the Phase A architectural decision and Team Playbook, Trend Compass will implement:

1. **Core Data Store (Option 1 - Local Gridded Store):**
   - Built and populated by fully reproducible Python scripts in `/data-pipeline`.
   - Starts with **NASA GISS GISTEMP v4** (2° × 2° regular global grid).
   - The backend loads the local NetCDF/Zarr grid, computes cosine-latitude area weighting ($w = \cos\phi$) across user-selected bounding boxes, and derives regional monthly means on the fly with sub-100ms latency.
2. **Preset Regions (Option 2 - Precomputed Cache):**
   - Derived directly from the exact same local store via pipeline scripts. Guarantees 100% agreement between preset results and live box queries.
   - Fully offline-ready for presentations and judging.
3. **Giovanni CSV Upload Route (Add-on):**
   - Implemented after the core engine is complete.
   - Accepts real Giovanni Area-Averaged Time Series `.csv` files provided in `data-samples/`, parses the `#` metadata, and feeds them into the statistical test pipeline.
4. **No Live-API Adapter:**
   - Eliminates runtime dependency on external NASA/third-party API availability, tokens, and rate limits.
5. **Resolution-Aware Bounding Box Constraint:**
   - Enforces a minimum bounding box threshold based on grid resolution. For GISTEMP's 2° × 2° grid, displays a warning when a selection covers fewer than ~4 cells (i.e. smaller than ~4° × 4°).

---

## 4. Proposed Variable Shortlist & Candidate Spikes (Section C)

Below is the updated candidate shortlist across Atmosphere, Land, and Ocean. Each entry clearly distinguishes tested data vs. metadata searches:

### Variable 1: Surface Temperature Anomaly (Atmosphere / Global Core)
* **Dataset Name & Version:** NASA GISTEMP v4 (GISS Surface Temperature Analysis version 4)
* **Spatial Resolution:** 2.0° × 2.0° regular lat-lon grid
* **Temporal Coverage:** 1880–present (monthly)
* **Access Method:** Direct HTTP download from NASA GISS (`https://data.giss.nasa.gov/pub/gistemp/`)
* **Login Need:** None (open public HTTP)
* **Evidence Status:** `[TESTED - DATA VERIFIED for CSV table; gridded netCDF download in T2]`
  - Tested: `urllib.request.urlopen('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv')` returned `HTTP 200 OK` with 1880–2026 monthly global anomalies.

### Variable 2: Vegetation Greenness / NDVI (Land Candidate)
* **Dataset Name & Version:** MODIS/Terra Vegetation Indices Monthly L3 Global 1km SIN Grid V061 (`MOD13A3.061`)
* **Spatial Resolution:** 1 km sinusoidal tiles (Global Climate Modeling Grid version is `MOD13C2` at 0.05°)
* **Temporal Coverage:** February 2000 – present (monthly)
* **Access Method:** NASA Earthdata CMR Granule Search / LP DAAC
* **Login Need:** Open metadata via CMR; Earthdata Login (H1) for raw granule downloads
* **Evidence Status:** `[READ (CMR Metadata Search) - DATA SPIKE PENDING T7]`
  - Command tested: `curl.exe -s "https://cmr.earthdata.nasa.gov/search/granules.json?short_name=MOD13A3&page_size=1"` returned `HTTP 200 OK` with collection `C2327962326-LPCLOUD`. Actual data file download and size feasibility will be evaluated in Spike T7.

### Variable 3: Sea Surface Temperature (Ocean Candidate)
* **Dataset Name & Version:** GHRSST Level 4 MUR Global Foundation Sea Surface Temperature Analysis v4.1 (`MUR-JPL-L4-GLOB-v4.1`)
* **Spatial Resolution:** 0.01° daily global grid (~1 km)
* **Temporal Coverage:** June 2002 – present
* **Access Method:** NASA PO.DAAC / CMR
* **Login Need:** Open metadata via CMR; Earthdata Login (H1) for PO.DAAC raw granules
* **Evidence Status:** `[READ (CMR Collection Metadata) - DATA SPIKE PENDING T7]`
  - Command tested: `curl.exe -s "https://cmr.earthdata.nasa.gov/search/collections.json?short_name=MUR-JPL-L4-GLOB-v4.1"` returned `HTTP 200 OK` with concept `C1996881146-POCLOUD`. High native resolution (0.01° daily) makes total volume massive; Spike T7 will evaluate whether a coarsened monthly product or the GISTEMP ocean component (`SBBX.ERSSTv5`) is the viable reproducible ocean path.

### Variable 4: Global Imagery Basemap (Visualization)
* **Dataset Name & Version:** NASA GIBS BlueMarble Shaded Relief Bathymetry (WMTS)
* **Spatial Resolution:** 500m global Web Mercator tiles
* **Temporal Coverage:** Static global composite
* **Access Method:** Open WMTS endpoint (`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/...`)
* **Login Need:** None (open public WMTS)
* **Evidence Status:** `[TESTED - DATA VERIFIED]`
  - Command tested: `curl.exe -s -I "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/default/GoogleMapsCompatible_Level8/0/0/0.jpeg"` returned `HTTP/1.1 200 OK`, `Content-Type: image/jpeg`, `Content-Length: 17819 bytes`, `Access-Control-Allow-Origin: *`.

---

## 5. Security & TLS Verification Policy

### 5.1 TLS Certificate Verification Policy
* **Policy:** In strict accordance with the Team Playbook honesty and science rules, **certificate verification must NEVER be disabled in application, test, or pipeline code**.
* **Audit of Earlier Diagnostic Probe:**  
  During initial network exploration of `data.giss.nasa.gov`, a temporary script used `ssl.CERT_NONE` to determine whether `WinError 10054 Connection reset` was caused by a client-side CA trust failure or a remote server/network reset. The command failed identically with `WinError 10054`, confirming that the failure was a network/edge firewall drop by NASA GISS, not a client-side certificate trust problem. That probe was discarded; all production pipeline scripts enforce standard validated TLS contexts (`verify=True`).

### 5.2 Environment Variables & Secrets
* `.env` policy: **Strictly read from environment variables or `.env`**.
* `.gitignore` verification: Verified that `.env`, `.env*`, and `**/.env*` are explicitly excluded from git tracking.
* Zero credentials are logged or printed in tests, scripts, or outputs.

---

## 6. Human Action Checklist

1. **Shortlist & Spikes Approval**: Note the primary core is GISTEMP v4; Variables 2 & 3 will be evaluated in Task T7 (Variable Spikes).
2. **Giovanni Sample File (H2)**: When ready for the Giovanni upload route (T10), place a real exported Giovanni `.csv` into `data-samples/`.
3. **NASA Earthdata Account (H1)**: Provide `EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD` in a local `.env` for the T7 raw granule spikes.
