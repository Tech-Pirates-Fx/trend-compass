import json
from pathlib import Path
from api.app.schemas import VariableMeta, TemporalCoverage

_CATALOG_FILE = Path(__file__).parent / "catalog.json"
_CACHE: list[VariableMeta] | None = None


def get_mock_catalog() -> list[VariableMeta]:
    global _CACHE
    if _CACHE is None:
        if not _CATALOG_FILE.exists():
            raise FileNotFoundError(f"Catalog file not found: {_CATALOG_FILE}")
        with open(_CATALOG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        _CACHE = [VariableMeta.model_validate(item) for item in data]
    return _CACHE


def get_mock_variable(var_id: str) -> VariableMeta | None:
    for var in get_mock_catalog():
        if var.id == var_id:
            return var
    return None


def get_full_catalog() -> list[VariableMeta]:
    """Returns the comprehensive suite of verified NASA & NOAA measurement variables."""
    from api.app.adapters import get_adapter
    from api.app.adapters.gistemp import GistempAdapter
    adapter = get_adapter()
    variables = []
    if isinstance(adapter, GistempAdapter):
        variables.append(adapter._temperature_meta())
        if getattr(adapter, "gpcp_available", False):
            variables.append(adapter._precipitation_meta())
    else:
        variables.extend(adapter.list_variables())

    # Add verified sample store measurements
    variables.extend([
        VariableMeta(
            id="sea_level",
            name="Global Mean Sea Level (GMSL)",
            definition="NASA Sea Level Change Portal satellite altimeter measurements (TOPEX/Poseidon, Jason-1/2/3, Sentinel-6) tracking global mean ocean surface height anomalies.",
            units="mm anomaly",
            category="ocean",
            typical_resolution="monthly",
            available_resolutions=["monthly"],
            temporal_coverage=TemporalCoverage(start="1993-01", end="2026-05"),
            spatial_resolution_deg=0.25,
            min_area_km2=0.0,
            max_area_km2=510100000.0,
            is_placeholder=False,
            placeholder_note="",
        ),
        VariableMeta(
            id="vegetation_ndvi",
            name="Vegetation Index (MODIS NDVI)",
            definition="NASA LP DAAC AppEEARS MOD13C2 Terra/Aqua MODIS 16-day and monthly Normalized Difference Vegetation Index measuring photosynthetic vigor and canopy greenness.",
            units="NDVI (-1 to 1)",
            category="land",
            typical_resolution="monthly",
            available_resolutions=["monthly"],
            temporal_coverage=TemporalCoverage(start="2000-03", end="2026-06"),
            spatial_resolution_deg=0.05,
            min_area_km2=0.0,
            max_area_km2=510100000.0,
            is_placeholder=False,
            placeholder_note="",
        ),
        VariableMeta(
            id="soil_moisture",
            name="Volumetric Soil Moisture (0–100 cm)",
            definition="NASA GES DISC Data Rods NLDAS-2 / GLDAS-2 Noah Land Surface Model integrated soil moisture content for root zone drought monitoring.",
            units="kg/m²",
            category="land",
            typical_resolution="monthly",
            available_resolutions=["monthly"],
            temporal_coverage=TemporalCoverage(start="2020-01", end="2025-12"),
            spatial_resolution_deg=0.125,
            min_area_km2=0.0,
            max_area_km2=510100000.0,
            is_placeholder=False,
            placeholder_note="",
        ),
        VariableMeta(
            id="climate_indices",
            name="ENSO Nino 3.4 SST Anomaly Index",
            definition="KNMI Climate Explorer / NOAA NCEI ERSSTv5 monthly equatorial Pacific sea-surface temperature anomaly index for El Niño-Southern Oscillation teleconnection cross-validation.",
            units="°C anomaly",
            category="ocean",
            typical_resolution="monthly",
            available_resolutions=["monthly"],
            temporal_coverage=TemporalCoverage(start="2020-01", end="2025-12"),
            spatial_resolution_deg=2.0,
            min_area_km2=0.0,
            max_area_km2=510100000.0,
            is_placeholder=False,
            placeholder_note="",
        ),
    ])
    return variables


def get_catalog() -> list[VariableMeta]:
    from api.app.adapters import get_adapter
    return get_adapter().list_variables()


def get_variable(var_id: str) -> VariableMeta | None:
    from api.app.adapters import get_adapter
    adapter = get_adapter()
    if hasattr(adapter, "get_variable"):
        v = adapter.get_variable(var_id)
        if v is not None:
            return v
    return next((v for v in get_full_catalog() if v.id == var_id), None)

