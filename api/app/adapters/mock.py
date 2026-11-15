import hashlib
import numpy as np
import pandas as pd
from api.app.adapters.base import DataAdapter
from api.app.catalog import get_mock_catalog as get_catalog, get_mock_variable as get_variable
from api.app.schemas import BoundingBox, TimeSeries, TimeSeriesPoint, VariableMeta


class MockAdapter(DataAdapter):
    """Deterministic synthetic DataAdapter.

    Generates reproducible synthetic monthly or daily time series
    using: linear trend + seasonal cycle + AR(1) noise + simulated missing values.
    Seeded from a hash of (variable_id, rounded_lat, rounded_lon).
    Guarantees opposite-sign trends between Western Arctic (positive warming)
    and East Antarctic (negative cooling) for 'air_temperature'.
    """

    is_mock: bool = True
    IS_MOCK: bool = True
    SOURCE_LABEL = "MOCK (synthetic, not real measurements)"

    def list_variables(self) -> list[VariableMeta]:
        return get_catalog()

    def get_timeseries(
        self,
        variable_id: str,
        bbox: BoundingBox,
        start: str = "2000-01",
        end: str = "2025-12",
        resolution: str = "monthly",
    ) -> TimeSeries:
        meta = get_variable(variable_id)
        if meta is None:
            raise ValueError(f"Unknown variable: {variable_id}")

        if resolution not in meta.available_resolutions:
            raise ValueError(
                f"Resolution '{resolution}' is not supported for variable '{variable_id}'. Available: {meta.available_resolutions}"
            )

        lat_c = round(bbox.center_lat, 1)
        lon_c = round(bbox.center_lon, 1)

        # Deterministic seed from variable and rounded bbox center (works across antimeridian)
        seed_str = f"{variable_id}:{lat_c}:{lon_c}"
        seed_val = int(hashlib.sha256(seed_str.encode("utf-8")).hexdigest()[:8], 16)
        rng = np.random.RandomState(seed_val)

        # Parse start and end dates
        try:
            if resolution == "daily":
                start_dt = pd.to_datetime(f"{start}-01" if len(start) == 7 else start)
                if len(end) == 7:
                    end_dt = pd.to_datetime(f"{end}-01") + pd.offsets.MonthEnd(1)
                else:
                    end_dt = pd.to_datetime(end)
                dates = pd.date_range(start=start_dt, end=end_dt, freq="D")
                step_per_year = 365.25
                period_steps = 365.25
                cycle_index = np.array([d.dayofyear for d in dates], dtype=float)
            else:
                start_str = f"{start[:7]}-01"
                end_str = f"{end[:7]}-01"
                dates = pd.date_range(start=start_str, end=end_str, freq="MS")
                step_per_year = 12.0
                period_steps = 12.0
                cycle_index = np.array([d.month for d in dates], dtype=float)
        except Exception as e:
            raise ValueError(f"Invalid date format or range ({start} to {end}): {str(e)}")

        n = len(dates)
        if n == 0:
            raise ValueError(f"No valid observations in requested date range ({start} to {end}).")

        years_from_start = np.arange(n, dtype=float) / step_per_year

        # Physical baselines & parameters per variable
        if variable_id == "air_temperature":
            baseline = 15.0 - 0.45 * abs(lat_c)
            # Polar opposite presets guarantee:
            if lat_c >= 60.0:
                trend_per_year = 0.045 + rng.uniform(0.005, 0.015)  # ~ +0.50 C/decade (Arctic warming)
            elif lat_c <= -60.0:
                trend_per_year = -(0.035 + rng.uniform(0.005, 0.015))  # ~ -0.40 C/decade (Antarctic cooling)
            else:
                trend_per_year = rng.uniform(-0.035, 0.035)
            season_amp = 6.0 + 0.15 * min(abs(lat_c), 70.0)
            noise_sigma = 0.75
            ar_phi = 0.70 if resolution == "daily" else 0.40

        elif variable_id == "precipitation":
            baseline = 75.0 + 35.0 * np.cos(np.radians(lat_c))
            trend_per_year = rng.uniform(-0.6, 0.6)  # mm/month per year
            season_amp = 25.0
            noise_sigma = 12.0 if resolution == "monthly" else 4.0
            ar_phi = 0.50 if resolution == "daily" else 0.25

        elif variable_id == "vegetation_greenness":
            baseline = max(0.15, 0.52 - 0.0035 * abs(lat_c))
            if lat_c >= 60.0:
                trend_per_year = 0.003 + rng.uniform(0.001, 0.002)  # Arctic greening
            else:
                trend_per_year = rng.uniform(-0.004, 0.004)
            season_amp = 0.14
            noise_sigma = 0.025
            ar_phi = 0.75 if resolution == "daily" else 0.45

        elif variable_id == "sea_surface_temperature":
            baseline = max(1.0, 26.0 - 0.35 * abs(lat_c))
            if lat_c >= 60.0:
                trend_per_year = 0.035 + rng.uniform(0.005, 0.015)
            elif lat_c <= -60.0:
                trend_per_year = -(0.025 + rng.uniform(0.005, 0.015))
            else:
                trend_per_year = rng.uniform(-0.025, 0.025)
            season_amp = 3.5
            noise_sigma = 0.45
            ar_phi = 0.80 if resolution == "daily" else 0.50

        else:  # soil_moisture or generic
            baseline = 0.26
            trend_per_year = rng.uniform(-0.003, 0.003)
            season_amp = 0.06
            noise_sigma = 0.02
            ar_phi = 0.70 if resolution == "daily" else 0.40

        # Seasonal cycle: phase shift accounts for Northern vs Southern hemisphere
        phase = -np.pi / 2.0 if lat_c >= 0 else np.pi / 2.0
        seasonal_cycle = season_amp * np.sin(2.0 * np.pi * cycle_index / period_steps + phase)

        # AR(1) colored noise: e_t = phi * e_{t-1} + sqrt(1 - phi^2) * sigma * w_t
        innovations = rng.normal(0, noise_sigma, size=n)
        ar_noise = np.zeros(n)
        scale = np.sqrt(max(1e-4, 1.0 - ar_phi**2))
        ar_noise[0] = innovations[0]
        for t in range(1, n):
            ar_noise[t] = ar_phi * ar_noise[t - 1] + scale * innovations[t]

        # Total signal = baseline + trend + season + noise
        signal = baseline + (trend_per_year * years_from_start) + seasonal_cycle + ar_noise

        # Physical clamping if needed
        if variable_id == "precipitation":
            signal = np.clip(signal, 0.0, None)
        elif variable_id == "vegetation_greenness":
            signal = np.clip(signal, -0.1, 1.0)
        elif variable_id == "soil_moisture":
            signal = np.clip(signal, 0.01, 0.6)

        # Deterministically introduce 2-4% missing values (NaN) to test gap handling
        missing_rng = np.random.RandomState(seed_val + 777)
        num_missing = int(n * 0.03)
        if num_missing > 0 and n > 10:
            candidate_indices = np.arange(2, n - 2)
            missing_indices = set(missing_rng.choice(candidate_indices, size=num_missing, replace=False))
        else:
            missing_indices = set()

        points: list[TimeSeriesPoint] = []
        for i, dt in enumerate(dates):
            t_str = dt.strftime("%Y-%m-%d")
            if i in missing_indices:
                points.append(TimeSeriesPoint(t=t_str, value=None))
            else:
                points.append(TimeSeriesPoint(t=t_str, value=round(float(signal[i]), 4)))

        return TimeSeries(
            variable_id=variable_id,
            bbox=bbox,
            resolution=resolution,  # type: ignore[arg-type]
            units=meta.units,
            points=points,
            source=self.SOURCE_LABEL,
            is_mock=True,
        )
