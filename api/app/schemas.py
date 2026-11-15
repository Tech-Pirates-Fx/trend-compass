import math
from typing import Literal
from pydantic import BaseModel, Field, model_validator


class BoundingBox(BaseModel):
    south: float = Field(..., ge=-90.0, le=90.0, description="Southern latitude (-90 to 90)")
    west: float = Field(..., ge=-180.0, le=180.0, description="Western longitude (-180 to 180)")
    north: float = Field(..., ge=-90.0, le=90.0, description="Northern latitude (-90 to 90)")
    east: float = Field(..., ge=-180.0, le=180.0, description="Eastern longitude (-180 to 180)")

    @model_validator(mode="after")
    def validate_bounds(self) -> "BoundingBox":
        if self.south > self.north:
            raise ValueError(f"South ({self.south}) must be <= North ({self.north})")
        return self

    @property
    def crosses_antimeridian(self) -> bool:
        """True if the box crosses the 180th meridian (International Date Line)."""
        return self.west > self.east

    @property
    def width_deg(self) -> float:
        """Total longitudinal width in degrees (accounting for antimeridian crossing)."""
        if self.west <= self.east:
            return self.east - self.west
        else:
            return (180.0 - self.west) + (self.east - (-180.0))

    @property
    def height_deg(self) -> float:
        """Total latitudinal height in degrees."""
        return self.north - self.south

    @property
    def center_lat(self) -> float:
        return (self.south + self.north) / 2.0

    @property
    def center_lon(self) -> float:
        if not self.crosses_antimeridian:
            return (self.west + self.east) / 2.0
        else:
            # Wrap around 180 meridian: calculate midpoint in [0, 360) and map back
            w_360 = self.west
            e_360 = self.east + 360.0
            mid_360 = (w_360 + e_360) / 2.0
            return mid_360 - 360.0 if mid_360 > 180.0 else mid_360

    @property
    def area_km2(self) -> float:
        """Approximate spherical surface area in square kilometers."""
        r = 6371.0  # Earth mean radius in km
        d_sin_lat = abs(math.sin(math.radians(self.north)) - math.sin(math.radians(self.south)))
        d_lon_rad = math.radians(self.width_deg)
        return r * r * d_sin_lat * d_lon_rad


class TemporalCoverage(BaseModel):
    start: str = Field(..., description="Historical start year-month (YYYY-MM)")
    end: str = Field(..., description="Historical end year-month (YYYY-MM)")


class VariableMeta(BaseModel):
    id: str
    name: str
    definition: str
    units: str
    category: Literal["atmosphere", "land", "ocean"]
    typical_resolution: Literal["monthly", "daily"]
    available_resolutions: list[Literal["monthly", "daily"]] = Field(default_factory=lambda: ["monthly"])
    temporal_coverage: TemporalCoverage
    spatial_resolution_deg: float = 0.5
    min_area_km2: float = 2500.0
    max_area_km2: float = 50000000.0
    is_placeholder: bool = True
    placeholder_note: str = "Placeholder dataset, to be replaced when real data sources are confirmed."


class TimeSeriesPoint(BaseModel):
    t: str  # ISO date e.g. "2020-01-01" or "2020-01"
    value: float | None = None


class Provenance(BaseModel):
    dataset_name: str
    version: str
    source_url: str | None = None
    expected_official_url: str | None = None
    retrieval_date: str | None = None
    units: str
    baseline: str | None = None
    spatial_resolution: str
    temporal_coverage: TemporalCoverage
    citation: str
    smoothing: str | None = None
    verified: bool = False
    input_sha256: str
    processed_sha256: str | None = None
    origin: str | None = None


class TimeSeries(BaseModel):
    variable_id: str
    bbox: BoundingBox
    resolution: Literal["monthly", "daily"]
    units: str
    points: list[TimeSeriesPoint]
    source: str
    is_mock: bool = True
    provenance: Provenance | None = None
    warnings: list[str] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    variable_id: str
    bbox: BoundingBox
    start: str = Field(..., description="Start year-month e.g. 2000-01")
    end: str = Field(..., description="End year-month e.g. 2025-12")
    resolution: Literal["monthly", "daily"] = "monthly"
    deseasonalize: bool = False
    alpha: float = Field(default=0.05, ge=0.001, le=0.5, description="Significance threshold")


class TrendMethodResult(BaseModel):
    method_key: str
    display_name: str
    slope_per_year: float
    slope_per_decade: float
    intercept: float | None = None
    std_err: float | None = None
    ci_lower_decade: float | None = None
    ci_upper_decade: float | None = None
    p_value: float | None = None
    is_significant: bool
    test_statistic: float | None = None
    details: dict[str, float | str | None] = Field(default_factory=dict)
    notes: str | None = None


class Diagnostics(BaseModel):
    n_observations: int
    missing_count: int
    missing_pct: float
    lag1_autocorrelation: float
    warnings: list[str] = Field(default_factory=list)


class SummaryVerdict(BaseModel):
    verdict: Literal["significant", "not_significant", "inconclusive"]
    rate_per_decade: float
    units: str
    ci_lower_decade: float
    ci_upper_decade: float
    p_value: float | None
    primary_method: str
    plain_language: str
    agreement_notes: str | None = None
    confidence_level: float = 0.95
    confidence_method: str | None = None


class AnalyzeResponse(BaseModel):
    provenance: Provenance | None = None
    variable: VariableMeta
    bbox: BoundingBox
    resolution: Literal["monthly", "daily"]
    units: str
    source: str
    is_mock: bool
    deseasonalize_applied: bool
    raw_timeseries: list[TimeSeriesPoint]
    deseasonalized_timeseries: list[TimeSeriesPoint] | None = None
    trend_line: list[TimeSeriesPoint]
    methods: dict[str, TrendMethodResult]
    diagnostics: Diagnostics
    summary: SummaryVerdict


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "trend-compass-api"
    phase: int = 2
    adapter: str
    is_mock: bool
    verified: bool | None = None
    detail: str | None = None
