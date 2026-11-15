# System Architecture & Technical Specifications

Trend Compass is designed as a modular, decoupled web system that combines a high-performance scientific Python analytics engine with an interactive Next.js web application.

```
+-------------------------------------------------------------------------------+
|                               NEXT.JS FRONTEND                                |
|                                                                               |
|   Landing (/)  --->  Wizard (/investigate)  --->  Results (/results)          |
|                             |                             |                   |
|                      MapSelector.tsx              TimeSeriesChart.tsx         |
|                      (Leaflet Map)                (Plotly.js Dynamic)         |
+-------------------------------------------------------------------------------+
                                      |
                           Next.js Rewrite Proxy
                         (/api/py/* -> FastAPI:8000)
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                               FASTAPI BACKEND                                 |
|                                                                               |
|  POST /analyze { variable_id, bbox, start, end, deseasonalize, alpha }       |
|                                                                               |
|  1. DataAdapter Registry (MockAdapter / RealNASADataAdapter)                  |
|     * Seeded deterministic monthly synthesis or NASA Earthdata raster fetch   |
|                                                                               |
|  2. Preprocessing Engine                                                      |
|     * Missing value diagnostics (% missing)                                  |
|     * Linear gap interpolation & boundary padding                             |
|     * STL Decomposition (Loess period=12) for seasonal cycle removal          |
|                                                                               |
|  3. Multi-Method Statistical Trend Suite                                      |
|     * Theil-Sen Robust Slope (median of pairwise slopes + 95% CI)             |
|     * Ordinary Least Squares (OLS) Linear Regression                          |
|     * Original Mann-Kendall Rank Test (Kendall's tau, z, p-value)             |
|     * Hamed-Rao Modified Mann-Kendall (autocorrelation-corrected variance)    |
|     * Seasonal Mann-Kendall Test (calendar month sub-series)                  |
|                                                                               |
|  4. Diagnostics & Verification                                                |
|     * Lag-1 autocorrelation (r1) calculation                                  |
|     * Short-record warnings (< 120 observations / 10 years)                   |
|     * Parametric vs Non-parametric disagreement detection                     |
|                                                                               |
|  5. Plain-Language Template Synthesizer                                       |
|     * Deterministic, template-driven summary sentences (no LLM latency/halluc)|
|     * Clear Verdict: "Significant" vs "Not Significant"                       |
+-------------------------------------------------------------------------------+
```

---

## 1. DataAdapter Interface Contract

All data providers implement the abstract `DataAdapter` base class defined in `api/app/adapters/base.py`:

```python
class DataAdapter(ABC):
    @abstractmethod
    def list_variables(self) -> list[VariableMeta]:
        """Return catalog of supported Earth science variables."""
        pass

    @abstractmethod
    def get_timeseries(
        self,
        variable_id: str,
        bbox: BoundingBox,
        start: str = "2000-01",
        end: str = "2025-12",
        resolution: str = "monthly",
    ) -> TimeSeries:
        """Fetch or generate time series observations for a variable and region."""
        pass
```

### Swappable Selection
The active adapter is loaded dynamically on startup via the `DATA_ADAPTER` environment variable:
- `DATA_ADAPTER="mock"` (Default): Uses `MockAdapter`.
- `DATA_ADAPTER="nasa"` (Phase 2): Uses `RealNASADataAdapter`.

Because the API response schema (`TimeSeries` and `AnalyzeResponse`) remains identical across adapters, the frontend requires zero modifications when swapping data providers.

---

## 2. MockAdapter Implementation Details

The `MockAdapter` produces a deterministic, 312-month synthetic time series (January 2000 through December 2025):

$$y(t) = \text{baseline} + \beta \cdot t + A \sin\left(\frac{2\pi t}{12} + \phi\right) + e(t)$$

- **Seeding**: Deterministically generated from a SHA-256 hash of `(variable_id, round(center_lat, 1), round(center_lon, 1))`.
- **Opposing Polar Trends**:
  - Center latitude $\ge 60^\circ\text{N}$: Forced positive warming slope ($+0.45$ to $+0.55$ °C/decade).
  - Center latitude $\le -60^\circ\text{S}$: Forced negative cooling slope ($-0.35$ to $-0.50$ °C/decade).
- **Colored Noise**: AR(1) autoregressive noise process with persistence $\rho \in [0.25, 0.50]$.
- **Simulated Gaps**: Deterministically introduces 2–4% missing observations (`None`) to validate interpolation routines.

---

## 3. Preprocessing & STL Deseasonalization

1. **Gap Handling**: Missing values are interpolated using linear splines (`pandas.Series.interpolate(method="linear")`), with edge boundary preservation via backward and forward filling.
2. **Missingness Metrics**: Returns `missing_count` and `missing_pct`. If missingness exceeds 15%, a diagnostic quality warning is emitted.
3. **STL Decomposition**: Seasonal and Trend decomposition using Loess (`statsmodels.tsa.seasonal.STL`, period=12, `robust=True`). The seasonally adjusted series is computed as:

$$\tilde{y}(t) = y(t) - S(t) = T(t) + R(t)$$

---

## 4. State & Network Architecture

- **No Database**: Computation is performed on-the-fly in sub-second execution times.
- **URL-Driven State**: All wizard choices (variable, bounding box coordinates, start/end years, resolution, deseasonalization flag) are serialized to URL query parameters (`/results?variable_id=...&south=...`). Links can be copied and shared between users.
- **CORS Prevention**: Next.js App Router defines a rewrite rule in `next.config.mjs` forwarding `/api/py/:path*` to the FastAPI backend, eliminating CORS preflight overhead in development and production.

