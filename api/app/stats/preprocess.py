from typing import Tuple
import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import STL
from api.app.schemas import TimeSeriesPoint


def preprocess_timeseries(
    points: list[TimeSeriesPoint],
    deseasonalize: bool = False,
    period: int = 12,
    interpolate_gaps: bool = True,
) -> Tuple[pd.Series, pd.Series | None, int, float, list[str]]:
    """Preprocess a time series: gap interpolation, missingness calculation,

    and optional STL deseasonalization.

    Returns:
        (clean_raw_series, deseasonalized_series, missing_count, missing_pct, warnings)
    """
    warnings: list[str] = []

    if not points:
        raise ValueError("Cannot preprocess empty time series")

    # Extract dates and values
    dates = [p.t for p in points]
    values = [p.value for p in points]

    raw_series = pd.Series(values, index=pd.to_datetime(dates), dtype=float)
    n_total = len(raw_series)

    # Missingness diagnostics
    missing_mask = raw_series.isna()
    missing_count = int(missing_mask.sum())
    missing_pct = round((missing_count / n_total) * 100.0, 2)

    if missing_pct > 15.0:
        warnings.append(
            f"High proportion of missing values ({missing_pct}%). Interpolation may reduce trend confidence."
        )

    # Gap handling: linear interpolation with edge padding
    clean_series = raw_series.interpolate(method="linear").bfill().ffill() if interpolate_gaps else raw_series.copy()
    if missing_count and not interpolate_gaps:
        warnings.append('Missing observations are retained, not fabricated or interpolated. Significance is inconclusive when the requested real-data record has gaps.')

    # Fallback if entire series was NaN
    if clean_series.isna().all():
        raise ValueError('All observations are missing; choose another region or period.')

    deseasonalized_series: pd.Series | None = None

    if deseasonalize:
        # STL requires at least 2 full periods (e.g., 24 months for monthly data)
        if clean_series.isna().any():
            warnings.append('STL skipped because the record contains missing observations.')
        elif n_total < period * 2:
            warnings.append(
                f"Record has {n_total} observations, fewer than the {period * 2} required for STL deseasonalization. Deseasonalization skipped."
            )
        else:
            try:
                # Use robust STL to guard against temporary spikes or outlier events
                stl = STL(clean_series, period=period, robust=True)
                res = stl.fit()
                # Seasonally adjusted series = raw - seasonal = trend + resid
                deseasonalized_series = pd.Series(
                    res.trend + res.resid,
                    index=clean_series.index,
                    dtype=float,
                )
            except Exception as e:
                warnings.append(f"STL deseasonalization failed ({str(e)}). Using raw series.")
                deseasonalized_series = None

    return clean_series, deseasonalized_series, missing_count, missing_pct, warnings

