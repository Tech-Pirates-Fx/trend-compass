from typing import Tuple
import numpy as np
import pandas as pd
import pymannkendall as mk
from scipy import stats
from api.app.schemas import Diagnostics, TimeSeriesPoint, TrendMethodResult


def compute_lag1_autocorrelation(y: np.ndarray) -> float:
    """Compute lag-1 Pearson autocorrelation r1."""
    if len(y) < 3:
        return 0.0
    y_centered = y - np.mean(y)
    var = np.sum(y_centered**2)
    if var == 0:
        return 0.0
    r1 = np.sum(y_centered[:-1] * y_centered[1:]) / var
    return float(np.clip(r1, -1.0, 1.0))


def analyze_trends(
    series: pd.Series,
    raw_dates: list[str],
    missing_count: int,
    missing_pct: float,
    preprocess_warnings: list[str],
    is_deseasonalized: bool = False,
    alpha: float = 0.05,
    resolution: str = "monthly",
) -> Tuple[dict[str, TrendMethodResult], Diagnostics, list[TimeSeriesPoint]]:
    """Execute all trend estimation methods, diagnostics, and fitted trend lines.

    Methods:
      1. OLS linear regression (slope, stderr, 95% CI, p-value, R^2)
      2. Theil-Sen robust slope (median slope, 95% CI)
      3. Original Mann-Kendall test (tau, p-value, trend)
      4. Hamed-Rao modified Mann-Kendall test (autocorrelation-corrected)
      5. Seasonal Mann-Kendall test (if not deseasonalized and monthly)
    """
    all_dates = pd.DatetimeIndex(pd.to_datetime(raw_dates))
    if len(all_dates) != len(series) or not all_dates.is_monotonic_increasing or all_dates.has_duplicates:
        raise ValueError('Observations need matching, unique, ordered dates')
    if resolution == 'monthly':
        ordinals = all_dates.to_period('M').asi8
        all_x = (ordinals - ordinals[0]).astype(float)
    else:
        all_x = np.asarray((all_dates - all_dates[0]).total_seconds() / 86400, dtype=float)
    valid = np.isfinite(series.to_numpy(dtype=float))
    y = series.to_numpy(dtype=float)[valid]
    x = all_x[valid]
    n = len(y)
    if n < 3:
        raise ValueError('At least three finite observations are required')

    # Conversion factor from sample step (month) to year and decade
    # If monthly: 12 months/year, 120 months/decade
    # If daily: 365.25 days/year, 3652.5 days/decade
    step_per_year = 12.0 if resolution == "monthly" else 365.25
    step_per_decade = step_per_year * 10.0

    warnings = list(preprocess_warnings)
    if not valid.all():
        warnings.append('Slope uses actual elapsed time across missing observations; serial-correlation test assumptions need a complete record.')
    warnings.append('The Theil–Sen slope interval does not correct for serial dependence; it is distinct from the Hamed–Rao significance test.')
    if n < 120 and resolution == "monthly":
        warnings.append(
            f"Record length ({n} months) is under 10 years (120 months). Short climate series are highly susceptible to natural multidecadal variability."
        )

    r1 = compute_lag1_autocorrelation(y)
    if abs(r1) > 0.30:
        warnings.append(
            f"High lag-1 serial autocorrelation detected (r1 = {r1:.2f}). Autocorrelation can falsely inflate OLS significance; evaluate Hamed-Rao modified Mann-Kendall."
        )

    methods: dict[str, TrendMethodResult] = {}

    # 1. OLS Linear Regression
    lr = stats.linregress(x, y)
    ols_slope_month = float(lr.slope)
    ols_intercept = float(lr.intercept)
    ols_stderr_month = float(lr.stderr) if lr.stderr is not None else 0.0
    ols_p_val = float(lr.pvalue)
    ols_r2 = float(lr.rvalue**2)

    # 95% CI for OLS slope using t-distribution
    t_crit = float(stats.t.ppf(1.0 - alpha / 2.0, df=max(1, n - 2)))
    ols_ci_lo_month = ols_slope_month - t_crit * ols_stderr_month
    ols_ci_up_month = ols_slope_month + t_crit * ols_stderr_month

    methods["ols"] = TrendMethodResult(
        method_key="ols",
        display_name="Ordinary Least Squares (OLS)",
        slope_per_year=round(ols_slope_month * step_per_year, 5),
        slope_per_decade=round(ols_slope_month * step_per_decade, 4),
        intercept=round(ols_intercept, 4),
        std_err=round(ols_stderr_month * step_per_decade, 4),
        ci_lower_decade=round(ols_ci_lo_month * step_per_decade, 4),
        ci_upper_decade=round(ols_ci_up_month * step_per_decade, 4),
        p_value=ols_p_val,
        is_significant=(ols_p_val < alpha),
        test_statistic=round(float(lr.slope / (lr.stderr + 1e-12)), 3) if lr.stderr else None,
        details={"r_squared": round(ols_r2, 4), "degrees_of_freedom": n - 2},
        notes="Standard parametric linear model. Assumes uncorrelated residuals.",
    )

    # 2. Theil-Sen Robust Estimator
    ts = stats.theilslopes(y, x, alpha=(1.0 - alpha))
    ts_slope_month = float(ts.slope)
    ts_intercept = float(ts.intercept)
    ts_ci_lo_month = float(ts.low_slope)
    ts_ci_up_month = float(ts.high_slope)

    methods["theil_sen"] = TrendMethodResult(
        method_key="theil_sen",
        display_name="Theil-Sen Robust Slope",
        slope_per_year=round(ts_slope_month * step_per_year, 5),
        slope_per_decade=round(ts_slope_month * step_per_decade, 4),
        intercept=round(ts_intercept, 4),
        std_err=None,
        ci_lower_decade=round(ts_ci_lo_month * step_per_decade, 4),
        ci_upper_decade=round(ts_ci_up_month * step_per_decade, 4),
        p_value=None,  # Theil-Sen estimates slope & CI; significance derived via Mann-Kendall
        is_significant=not (ts_ci_lo_month <= 0 <= ts_ci_up_month),
        test_statistic=None,
        details={"median_slope_per_month": round(ts_slope_month, 6)},
        notes="Median of pairwise slopes on elapsed time. Rank-based slope interval does not correct for serial dependence.",
    )

    # 3. Original Mann-Kendall Test
    try:
        mk_orig = mk.original_test(y, alpha=alpha)
        methods["mann_kendall_original"] = TrendMethodResult(
            method_key="mann_kendall_original",
            display_name="Mann-Kendall (Original)",
            slope_per_year=round(ts_slope_month * step_per_year, 5),
            slope_per_decade=round(ts_slope_month * step_per_decade, 4),
            intercept=None,
            std_err=None,
            ci_lower_decade=None,
            ci_upper_decade=None,
            p_value=float(mk_orig.p),
            is_significant=(float(mk_orig.p) < alpha),
            test_statistic=round(float(mk_orig.z), 3),
            details={"tau": round(float(mk_orig.Tau), 4), "trend_direction": str(mk_orig.trend)},
            notes="Standard non-parametric rank test for monotonic trends. Does not correct for serial autocorrelation.",
        )
    except Exception as e:
        warnings.append(f"Original Mann-Kendall test calculation failed: {str(e)}")

    # 4. Hamed-Rao Modified Mann-Kendall (Autocorrelation Corrected)
    try:
        mk_hr = mk.original_test(y, alpha=alpha) if np.ptp(y) == 0 else mk.hamed_rao_modification_test(y, alpha=alpha)
        if not np.isfinite(mk_hr.p):
            raise ValueError('Non-finite Hamed–Rao result')
        methods["mann_kendall_hamed_rao"] = TrendMethodResult(
            method_key="mann_kendall_hamed_rao",
            display_name="Hamed-Rao Modified Mann-Kendall",
            slope_per_year=round(ts_slope_month * step_per_year, 5),
            slope_per_decade=round(ts_slope_month * step_per_decade, 4),
            intercept=None,
            std_err=None,
            ci_lower_decade=None,
            ci_upper_decade=None,
            p_value=float(mk_hr.p),
            is_significant=(float(mk_hr.p) < alpha),
            test_statistic=round(float(mk_hr.z), 3),
            details={"tau": round(float(mk_hr.Tau), 4), "trend_direction": str(mk_hr.trend)},
            notes="Modified rank correlation adjusting variance for serial autocorrelation. Recommended for geophysical time series.",
        )
    except Exception as e:
        warnings.append(f"Hamed-Rao Mann-Kendall calculation failed: {str(e)}")

    # 5. Seasonal Mann-Kendall (when NOT deseasonalized and monthly)
    if not is_deseasonalized and resolution == "monthly" and n >= 24 and valid.all():
        try:
            mk_seas = mk.seasonal_test(y, period=12, alpha=alpha)
            methods["seasonal_mann_kendall"] = TrendMethodResult(
                method_key="seasonal_mann_kendall",
                display_name="Seasonal Mann-Kendall",
                slope_per_year=round(float(mk_seas.slope), 5),
                slope_per_decade=round(float(mk_seas.slope) * 10.0, 4),
                intercept=None,
                std_err=None,
                ci_lower_decade=None,
                ci_upper_decade=None,
                p_value=float(mk_seas.p),
                is_significant=(float(mk_seas.p) < alpha),
                test_statistic=round(float(mk_seas.z), 3),
                details={"tau": round(float(mk_seas.Tau), 4), "trend_direction": str(mk_seas.trend)},
                notes="Evaluates monotonic trend across individual calendar months without requiring deseasonalization.",
            )
        except Exception as e:
            warnings.append(f"Seasonal Mann-Kendall calculation failed: {str(e)}")

    # Diagnostics
    diagnostics = Diagnostics(
        n_observations=n,
        missing_count=missing_count,
        missing_pct=missing_pct,
        lag1_autocorrelation=round(r1, 3),
        warnings=warnings,
    )

    # Compute trend line values using robust Theil-Sen fit
    trend_line: list[TimeSeriesPoint] = []
    for i in range(len(all_x)):
        y_val = ts_intercept + ts_slope_month * all_x[i]
        trend_line.append(TimeSeriesPoint(t=raw_dates[i], value=round(float(y_val), 4)))

    return methods, diagnostics, trend_line
