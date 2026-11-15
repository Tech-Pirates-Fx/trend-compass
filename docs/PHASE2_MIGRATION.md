# Phase 2 NASA Data Source Integration Roadmap

On **November 13**, NASA will officially release the resources and datasets for the *"Be An Earth System Trend Detective"* challenge. This document provides a step-by-step technical guide for plugging real satellite observations into Trend Compass.

---

## 1. Architecture Overview

Trend Compass was purposefully constructed with an isolated DataAdapter boundary. All data retrieval logic is abstracted away from the statistical analysis engine and frontend UI:

```
[ Frontend: Next.js ] ---> [ FastAPI: POST /analyze ] ---> [ DataAdapter ]
                                                                 |
                                       +-------------------------+-------------------------+
                                       |                                                   |
                            [ Phase 1: MockAdapter ]                            [ Phase 2: NASA Adapter ]
                            (Synthetic monthly series)                          (CMR / Harmony / STAC)
```

**Zero changes are required in the Next.js frontend** when switching to real NASA data.

---

## 2. Step-by-Step Implementation Guide

### Step 1: Create `api/app/adapters/nasa.py`
Create a new file subclassing `DataAdapter`:

```python
# api/app/adapters/nasa.py
from api.app.adapters.base import DataAdapter
from api.app.schemas import BoundingBox, TimeSeries, TimeSeriesPoint, VariableMeta
import os
import httpx

class NASADataAdapter(DataAdapter):
    SOURCE_LABEL = "NASA Earthdata (Live Satellite Observations)"

    def __init__(self):
        self.edl_token = os.environ.get("EARTHDATA_TOKEN")
        self.base_cmr_url = "https://cmr.earthdata.nasa.gov/search"

    def list_variables(self) -> list[VariableMeta]:
        # Return real catalog entries
        from api.app.catalog import get_catalog
        return get_catalog()

    def get_timeseries(
        self,
        variable_id: str,
        bbox: BoundingBox,
        start: str = "2000-01",
        end: str = "2025-12",
        resolution: str = "monthly",
    ) -> TimeSeries:
        # 1. Query NASA CMR or Harmony API for granules matching bounding box & time range
        # 2. Ingest Cloud-Optimized GeoTIFFs (COGs) or NetCDF4 files
        # 3. Apply area-weighted spatial mean reduction across the bbox
        # 4. Return standard TimeSeries schema with is_mock=False
        ...
```

### Step 2: Register in `api/app/adapters/__init__.py`
Enable the adapter in the global registry:

```python
from api.app.adapters.mock import MockAdapter
from api.app.adapters.nasa import NASADataAdapter

_ADAPTER_REGISTRY = {
    "mock": MockAdapter,
    "nasa": NASADataAdapter,
}
```

### Step 3: Align Variable Metadata in `api/app/catalog.json`
Replace generic placeholder entries with the official NASA dataset shortnames and metadata:
- Air Temperature: e.g., `GISTEMP_v4` (Goddard Institute for Space Studies Surface Temperature Analysis)
- Precipitation: e.g., `GPM_3IMERGM` (Global Precipitation Measurement IMERG Final Monthly)
- Vegetation Index: e.g., `MOD13A2` / `MYD13A2` (MODIS Terra/Aqua 16-Day Vegetation Indices)
- Sea Surface Temperature: e.g., `MUR-JPL-L4-GLOB-v4.1` (Multiscale Ultrahigh Resolution SST)
- Soil Moisture: e.g., `SMAP_L4_SM_gph` (Soil Moisture Active Passive L4 Global 3-hourly)

Update `is_placeholder: false` for each finalized variable.

### Step 4: Spatial Aggregation Pipeline
When raw gridded NetCDF4 or Zarr data is fetched, calculate the area-weighted spatial average using `xarray` and cosine latitude weighting:

```python
import numpy as np
import xarray as xr

def compute_regional_mean(ds: xr.Dataset, var_name: str) -> list[float]:
    # Cosine latitude weighting for spherical area distortion
    weights = np.cos(np.deg2rad(ds.lat))
    weights.name = "weights"
    ds_weighted = ds[var_name].weighted(weights)
    regional_mean = ds_weighted.mean(dim=["lat", "lon"])
    return regional_mean.values.tolist()
```

### Step 5: Activate
Set the environment variable:
```bash
export DATA_ADAPTER="nasa"
export EARTHDATA_TOKEN="your_token_here"
```

Restart FastAPI. The application will immediately begin serving real NASA observations. The UI will automatically detect `is_mock: false`, update source badges, and display verified satellite measurements.

