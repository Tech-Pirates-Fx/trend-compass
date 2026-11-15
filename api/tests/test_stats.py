import numpy as np
import pandas as pd
import pytest
from api.app.schemas import TimeSeriesPoint
from api.app.stats.preprocess import preprocess_timeseries
from api.app.stats.summary import generate_summary
from api.app.stats.trend import analyze_trends, compute_lag1_autocorrelation


def test_preprocess_missing_data_interpolation():
    """Verify missing values (None) are accurately counted and interpolated."""
    dates = pd.date_range("2010-01-01", periods=12, freq="MS").strftime("%Y-%m-%d").tolist()
    points = [TimeSeriesPoint(t=d, value=float(i) if i not in (3, 7) else None) for i, d in enumerate(dates)]

    clean, deseas, missing_cnt, missing_pct, warnings = preprocess_timeseries(
        points, deseasonalize=False, period=12
    )

    assert missing_cnt == 2
    assert abs(missing_pct - (2 / 12 * 100)) < 0.1
    # Check that points at index 3 and 7 are interpolated cleanly
    assert not np.isnan(clean.iloc[3])
    assert abs(clean.iloc[3] - 3.0) < 1e-6
    assert abs(clean.iloc[7] - 7.0) < 1e-6


def test_preprocess_stl_deseasonalize():
    """Verify STL decomposes seasonal signal cleanly when length is sufficient."""
    dates = pd.date_range("2000-01-01", periods=60, freq="MS").strftime("%Y-%m-%d").tolist()
    # Signal with strong seasonal sine wave
    season = 10.0 * np.sin(2 * np.pi * np.arange(60) / 12.0)
    trend = 0.1 * np.arange(60)
    points = [TimeSeriesPoint(t=d, value=float(season[i] + trend[i])) for i, d in enumerate(dates)]

    clean, deseas, missing_cnt, missing_pct, warnings = preprocess_timeseries(
        points, deseasonalize=True, period=12
    )

    assert deseas is not None
    assert len(deseas) == 60
    # Seasonal amplitude in deseasonalized series should be dramatically lower than 10.0
    assert (deseas.max() - deseas.min()) < 12.0


def test_known_injected_positive_slope():
    """Verify known positive slope is recovered within tight tolerance and flagged significant."""
    n_years = 25
    n_months = n_years * 12
    dates = pd.date_range("2000-01-01", periods=n_months, freq="MS").strftime("%Y-%m-%d").tolist()

    # Injected slope: +0.40 units / year (+4.00 units / decade)
    true_slope_per_year = 0.40
    true_slope_per_month = true_slope_per_year / 12.0
    true_slope_per_decade = true_slope_per_year * 10.0

    rng = np.random.RandomState(42)
    months = np.arange(n_months, dtype=float)
    seasonal = 5.0 * np.sin(2 * np.pi * months / 12.0)
    noise = rng.normal(0, 0.4, size=n_months)
    y_values = 10.0 + (true_slope_per_month * months) + seasonal + noise

    points = [TimeSeriesPoint(t=d, value=float(y_values[i])) for i, d in enumerate(dates)]
    clean, deseas, m_cnt, m_pct, w = preprocess_timeseries(points, deseasonalize=True, period=12)

    series_to_test = deseas if deseas is not None else clean
    methods, diag, trend_line = analyze_trends(
        series=series_to_test,
        raw_dates=dates,
        missing_count=0,
        missing_pct=0.0,
        preprocess_warnings=[],
        is_deseasonalized=True,
        alpha=0.05,
    )

    ols = methods["ols"]
    ts = methods["theil_sen"]
    hr = methods["mann_kendall_hamed_rao"]

    # Assert recovered slopes are within 10% of true value (+4.00 / decade)
    assert abs(ols.slope_per_decade - true_slope_per_decade) < 0.40
    assert abs(ts.slope_per_decade - true_slope_per_decade) < 0.40

    # Assert statistical significance
    assert ols.is_significant is True
    assert ols.p_value < 0.001
    assert hr.is_significant is True
    assert hr.p_value < 0.001


def test_known_injected_negative_slope():
    """Verify known negative slope is recovered within tolerance with negative sign."""
    n_months = 300
    dates = pd.date_range("2000-01-01", periods=n_months, freq="MS").strftime("%Y-%m-%d").tolist()

    # Injected slope: -0.30 units / year (-3.00 units / decade)
    true_slope_per_year = -0.30
    true_slope_per_month = true_slope_per_year / 12.0
    true_slope_per_decade = true_slope_per_year * 10.0

    rng = np.random.RandomState(123)
    months = np.arange(n_months, dtype=float)
    noise = rng.normal(0, 0.3, size=n_months)
    y_values = 20.0 + (true_slope_per_month * months) + noise

    series = pd.Series(y_values, index=pd.to_datetime(dates))
    methods, diag, trend_line = analyze_trends(
        series=series,
        raw_dates=dates,
        missing_count=0,
        missing_pct=0.0,
        preprocess_warnings=[],
        is_deseasonalized=False,
        alpha=0.05,
    )

    ts = methods["theil_sen"]
    hr = methods["mann_kendall_hamed_rao"]

    assert abs(ts.slope_per_decade - true_slope_per_decade) < 0.30
    assert ts.slope_per_decade < 0
    assert hr.is_significant is True
    assert hr.details["trend_direction"] == "decreasing"


def test_pure_noise_not_flagged_significant():
    """Verify pure stationary noise series without trend is NOT flagged as significant

    at a sensible rate (empirically verifying low false positive rate).
    """
    n_months = 312
    dates = pd.date_range("2000-01-01", periods=n_months, freq="MS").strftime("%Y-%m-%d").tolist()

    # 1. Single typical run: verify non-significant verdict and explanation
    rng_single = np.random.RandomState(42)
    noise_single = rng_single.normal(0, 1.0, size=n_months)
    series_single = pd.Series(noise_single + 15.0, index=pd.to_datetime(dates))

    methods, diag, trend_line = analyze_trends(
        series=series_single,
        raw_dates=dates,
        missing_count=0,
        missing_pct=0.0,
        preprocess_warnings=[],
        is_deseasonalized=False,
        alpha=0.05,
    )

    hr = methods["mann_kendall_hamed_rao"]
    summary = generate_summary(
        variable_name="Air Temperature",
        units="°C",
        start_year="2000",
        end_year="2025",
        methods=methods,
        alpha=0.05,
    )

    assert hr.is_significant is False
    assert hr.p_value > 0.05
    assert summary.verdict == "not_significant"
    assert "NOT statistically significant" in summary.plain_language

    # 2. Multi-trial check: assert false-positive rate across noise trials remains low
    false_positives = 0
    n_trials = 20
    for seed in range(n_trials):
        rng = np.random.RandomState(seed * 31 + 7)
        innovations = rng.normal(0, 1.0, size=n_months)
        noise = np.zeros(n_months)
        for t in range(1, n_months):
            noise[t] = 0.25 * noise[t - 1] + innovations[t]
        s = pd.Series(noise, index=pd.to_datetime(dates))
        m, _, _ = analyze_trends(s, dates, 0, 0.0, [], is_deseasonalized=False, alpha=0.05)
        if m["mann_kendall_hamed_rao"].is_significant:
            false_positives += 1

    fp_rate = false_positives / n_trials
    assert fp_rate <= 0.25, f"False positive rate ({fp_rate * 100:.1f}%) exceeds acceptable tolerance"



def test_short_series_warning():
    """Verify short series (<120 points) triggers diagnostic warning."""
    n_months = 48  # 4 years
    dates = pd.date_range("2020-01-01", periods=n_months, freq="MS").strftime("%Y-%m-%d").tolist()
    series = pd.Series(np.linspace(10, 12, n_months), index=pd.to_datetime(dates))

    methods, diag, trend_line = analyze_trends(
        series=series,
        raw_dates=dates,
        missing_count=0,
        missing_pct=0.0,
        preprocess_warnings=[],
        is_deseasonalized=False,
        alpha=0.05,
    )

    warning_text = " ".join(diag.warnings)
    assert "under 10 years" in warning_text
