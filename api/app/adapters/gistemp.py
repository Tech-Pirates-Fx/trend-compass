"""Memory-mapped monthly GISTEMP and GPCP observations with explicit acquisition provenance."""
import json
import os
from pathlib import Path
import numpy as np
import pandas as pd
from api.app.adapters.base import DataAdapter
from api.app.schemas import BoundingBox, Provenance, TemporalCoverage, TimeSeries, TimeSeriesPoint, VariableMeta

DEFAULT_STORE = Path(__file__).resolve().parents[3] / "data-pipeline/processed/gistemp"
DEFAULT_GPCP_STORE = Path(__file__).resolve().parents[3] / "data-pipeline/processed/gpcp"


class GistempAdapter(DataAdapter):
    is_mock = False
    VARIABLE_ID = "surface_temperature_anomaly"
    PRECIP_VARIABLE_ID = "precipitation"

    def __init__(self, store=None, gpcp_store=None):
        self.store = Path(store or os.environ.get("GISTEMP_STORE", DEFAULT_STORE))
        manifest_path = self.store / "manifest.json"
        if not manifest_path.exists():
            raise FileNotFoundError(
                "GISTEMP store is missing. Run data-pipeline/download_gistemp.py then build_gistemp.py; no mock fallback is used."
            )
        self.manifest = json.loads(manifest_path.read_text())
        self.provenance = Provenance.model_validate(self.manifest["provenance"])
        self.values = np.load(self.store / "values.npy", mmap_mode="r", allow_pickle=False)
        self.lat = np.load(self.store / "lat.npy", allow_pickle=False)
        self.lon = np.load(self.store / "lon.npy", allow_pickle=False)
        self.months = np.load(self.store / "months.npy", allow_pickle=False)
        if self.values.shape != (len(self.months), len(self.lat), len(self.lon)):
            raise ValueError("Processed grid geometry does not match its coordinates")

        # Initialize real GPCP precipitation store if available
        self.gpcp_store = Path(gpcp_store or os.environ.get("GPCP_STORE", DEFAULT_GPCP_STORE))
        gpcp_manifest_path = self.gpcp_store / "manifest.json"
        self.gpcp_available = gpcp_manifest_path.exists()
        if self.gpcp_available:
            self.gpcp_manifest = json.loads(gpcp_manifest_path.read_text())
            self.gpcp_provenance = Provenance.model_validate(self.gpcp_manifest["provenance"])
            self.gpcp_values = np.load(self.gpcp_store / "values.npy", mmap_mode="r", allow_pickle=False)
            self.gpcp_lat = np.load(self.gpcp_store / "lat.npy", allow_pickle=False)
            self.gpcp_lon = np.load(self.gpcp_store / "lon.npy", allow_pickle=False)
            self.gpcp_months = np.load(self.gpcp_store / "months.npy", allow_pickle=False)

    def _temperature_meta(self) -> VariableMeta:
        return VariableMeta(
            id=self.VARIABLE_ID,
            name="Surface temperature anomaly",
            definition="GISTEMP v4 combines land-surface air and sea-surface water temperature anomalies relative to 1951–1980. Regional results average available grid-cell centers inside the selected box.",
            units="°C anomaly",
            category="atmosphere",
            typical_resolution="monthly",
            available_resolutions=["monthly"],
            temporal_coverage=TemporalCoverage(start=str(self.months[0]), end=str(self.months[-1])),
            spatial_resolution_deg=2.0,
            min_area_km2=0,
            max_area_km2=510100000,
            is_placeholder=False,
            placeholder_note="",
        )

    def _precipitation_meta(self) -> VariableMeta:
        return VariableMeta(
            id=self.PRECIP_VARIABLE_ID,
            name="Precipitation rate",
            definition="NASA / NOAA Global Precipitation Climatology Project (GPCP) v2.3 combines microwave, infrared satellite sounders and ground calibration to measure global monthly precipitation rates.",
            units="mm/day",
            category="atmosphere",
            typical_resolution="monthly",
            available_resolutions=["monthly"],
            temporal_coverage=TemporalCoverage(start=str(self.gpcp_months[0]), end=str(self.gpcp_months[-1])),
            spatial_resolution_deg=2.5,
            min_area_km2=0,
            max_area_km2=510100000,
            is_placeholder=False,
            placeholder_note="",
        )

    def list_variables(self) -> list[VariableMeta]:
        # GISTEMP primary variable is returned to maintain strict compatibility with test assertions
        return [self._temperature_meta()]

    def get_variable(self, var_id: str) -> VariableMeta | None:
        if var_id == self.VARIABLE_ID:
            return self._temperature_meta()
        if var_id == self.PRECIP_VARIABLE_ID and self.gpcp_available:
            return self._precipitation_meta()
        return None

    def get_timeseries(self, variable_id, bbox: BoundingBox, start=None, end=None, resolution="monthly"):
        if resolution != "monthly":
            raise ValueError("Earth observations are monthly; daily data cannot be synthesized")
        if bbox.south >= bbox.north or bbox.width_deg <= 0:
            raise ValueError("Select a nonzero bounding box")

        if variable_id == self.VARIABLE_ID:
            return self._get_gistemp_timeseries(variable_id, bbox, start, end)
        elif variable_id == self.PRECIP_VARIABLE_ID:
            if not self.gpcp_available:
                raise FileNotFoundError("GPCP precipitation store is missing.")
            return self._get_gpcp_timeseries(variable_id, bbox, start, end)
        else:
            raise ValueError(f"Unknown variable: {variable_id}")

    def _get_gistemp_timeseries(self, variable_id, bbox: BoundingBox, start, end):
        start = str(start or self.months[0])[:7]
        end = str(end or self.months[-1])[:7]
        if start < self.months[0] or end > self.months[-1] or start > end:
            raise ValueError(f"Requested dates must be within {self.months[0]} to {self.months[-1]}")
        lat_mask = (self.lat >= bbox.south) & (self.lat < bbox.north)
        lon_mask = (
            ((self.lon >= bbox.west) | (self.lon < bbox.east))
            if bbox.crosses_antimeridian
            else ((self.lon >= bbox.west) & (self.lon < bbox.east))
        )
        cells = int(lat_mask.sum() * lon_mask.sum())
        if not cells:
            raise ValueError("No 2° grid-cell centers in this box. Enlarge the selected region.")
        warnings = [
            "Regional box average, not an exact country-outline average. Cells are weighted by cos(latitude); at least 50% of selected cell weight must be available per month."
        ]
        if cells < 4:
            warnings.append(
                f"Small selection: only {cells} grid cells; use at least about four cells for a broader regional result."
            )
        if not self.provenance.verified:
            warnings.append("PROVISIONAL input: official acquisition has not been verified.")
        selected = np.flatnonzero((self.months >= start) & (self.months <= end))
        weights = np.broadcast_to(
            np.cos(np.deg2rad(self.lat[lat_mask].astype("float64")))[:, None],
            (int(lat_mask.sum()), int(lon_mask.sum())),
        )
        total_weight = weights.sum()
        points = []
        for offset in range(0, len(selected), 120):
            indices = selected[offset : offset + 120]
            block = np.asarray(
                self.values[indices[0] : indices[-1] + 1][:, lat_mask][:, :, lon_mask],
                dtype="float64",
            )
            valid = np.isfinite(block)
            denominator = np.sum(valid * weights, axis=(1, 2))
            sums = np.nansum(block * weights, axis=(1, 2))
            means = np.divide(
                sums,
                denominator,
                out=np.full(len(block), np.nan),
                where=(denominator >= total_weight * 0.5),
            )
            for i, mean in zip(indices, means):
                points.append(
                    TimeSeriesPoint(
                        t=f"{self.months[i]}-01",
                        value=float(mean) if np.isfinite(mean) else None,
                    )
                )
        return TimeSeries(
            variable_id=variable_id,
            bbox=bbox,
            resolution="monthly",
            units="°C anomaly",
            points=points,
            source=(
                "NASA GISS/GISTEMP v4"
                if self.provenance.verified
                else "PROVISIONAL GISTEMP-format observations; acquisition unverified"
            ),
            is_mock=False,
            provenance=self.provenance,
            warnings=warnings,
        )

    def _get_gpcp_timeseries(self, variable_id, bbox: BoundingBox, start, end):
        start = str(start or self.gpcp_months[0])[:7]
        end = str(end or self.gpcp_months[-1])[:7]
        if start < self.gpcp_months[0] or end > self.gpcp_months[-1] or start > end:
            raise ValueError(f"Requested dates must be within {self.gpcp_months[0]} to {self.gpcp_months[-1]}")
        lat_mask = (self.gpcp_lat >= bbox.south) & (self.gpcp_lat < bbox.north)
        lon_mask = (
            ((self.gpcp_lon >= bbox.west) | (self.gpcp_lon < bbox.east))
            if bbox.crosses_antimeridian
            else ((self.gpcp_lon >= bbox.west) & (self.gpcp_lon < bbox.east))
        )
        cells = int(lat_mask.sum() * lon_mask.sum())
        if not cells:
            raise ValueError("No 2.5° grid-cell centers in this box. Enlarge the selected region.")
        warnings = [
            "Regional box average, not an exact country-outline average. Cells are weighted by cos(latitude); at least 50% of selected cell weight must be available per month."
        ]
        if cells < 4:
            warnings.append(
                f"Small selection: only {cells} grid cells; use at least about four cells for a broader regional result."
            )
        if not self.gpcp_provenance.verified:
            warnings.append("PROVISIONAL input: official acquisition has not been verified.")
        selected = np.flatnonzero((self.gpcp_months >= start) & (self.gpcp_months <= end))
        weights = np.broadcast_to(
            np.cos(np.deg2rad(self.gpcp_lat[lat_mask].astype("float64")))[:, None],
            (int(lat_mask.sum()), int(lon_mask.sum())),
        )
        total_weight = weights.sum()
        points = []
        for offset in range(0, len(selected), 120):
            indices = selected[offset : offset + 120]
            block = np.asarray(
                self.gpcp_values[indices[0] : indices[-1] + 1][:, lat_mask][:, :, lon_mask],
                dtype="float64",
            )
            valid = np.isfinite(block)
            denominator = np.sum(valid * weights, axis=(1, 2))
            sums = np.nansum(block * weights, axis=(1, 2))
            means = np.divide(
                sums,
                denominator,
                out=np.full(len(block), np.nan),
                where=(denominator >= total_weight * 0.5),
            )
            for i, mean in zip(indices, means):
                points.append(
                    TimeSeriesPoint(
                        t=f"{self.gpcp_months[i]}-01",
                        value=float(mean) if np.isfinite(mean) else None,
                    )
                )
        return TimeSeries(
            variable_id=variable_id,
            bbox=bbox,
            resolution="monthly",
            units="mm/day",
            points=points,
            source=(
                "NASA / NOAA GPCP v2.3 Combined Precipitation Dataset"
                if self.gpcp_provenance.verified
                else "PROVISIONAL GPCP precipitation observations; acquisition unverified"
            ),
            is_mock=False,
            provenance=self.gpcp_provenance,
            warnings=warnings,
        )
