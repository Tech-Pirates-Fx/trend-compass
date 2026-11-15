import os
import pytest
from api.app.adapters import get_adapter, reset_adapter
from api.app.adapters.mock import MockAdapter
from api.app.schemas import BoundingBox
from api.app.stats.preprocess import preprocess_timeseries
from api.app.stats.trend import analyze_trends


def test_mock_adapter_determinism():
    """Verify repeated calls with identical parameters return byte-identical series."""
    adapter = MockAdapter()
    bbox = BoundingBox(south=10.0, west=20.0, north=15.0, east=25.0)

    ts1 = adapter.get_timeseries("air_temperature", bbox, "2000-01", "2025-12")
    ts2 = adapter.get_timeseries("air_temperature", bbox, "2000-01", "2025-12")

    assert ts1.is_mock is True
    assert ts1.source == MockAdapter.SOURCE_LABEL
    assert len(ts1.points) == len(ts2.points)
    for p1, p2 in zip(ts1.points, ts2.points):
        assert p1.t == p2.t
        assert p1.value == p2.value


def test_opposite_trend_preset_pair():
    """Verify that the preset pair (Western Arctic vs East Antarctic) produces

    statistically significant trends of OPPOSITE SIGN for the same variable.
    """
    adapter = MockAdapter()

    # Preset 1: Western Arctic (warming)
    arctic_bbox = BoundingBox(south=68.0, west=-160.0, north=75.0, east=-130.0)
    arctic_ts = adapter.get_timeseries("air_temperature", arctic_bbox, "2000-01", "2025-12")

    # Preset 2: East Antarctic / Subpolar (cooling)
    antarctic_bbox = BoundingBox(south=-75.0, west=60.0, north=-65.0, east=100.0)
    antarctic_ts = adapter.get_timeseries("air_temperature", antarctic_bbox, "2000-01", "2025-12")

    # Preprocess and analyze Arctic
    clean_arc, des_arc, _, _, w_arc = preprocess_timeseries(arctic_ts.points, deseasonalize=True)
    methods_arc, _, _ = analyze_trends(
        series=des_arc if des_arc is not None else clean_arc,
        raw_dates=[p.t for p in arctic_ts.points],
        missing_count=0,
        missing_pct=0.0,
        preprocess_warnings=w_arc,
        is_deseasonalized=True,
    )

    # Preprocess and analyze Antarctic
    clean_ant, des_ant, _, _, w_ant = preprocess_timeseries(antarctic_ts.points, deseasonalize=True)
    methods_ant, _, _ = analyze_trends(
        series=des_ant if des_ant is not None else clean_ant,
        raw_dates=[p.t for p in antarctic_ts.points],
        missing_count=0,
        missing_pct=0.0,
        preprocess_warnings=w_ant,
        is_deseasonalized=True,
    )

    arc_slope = methods_arc["theil_sen"].slope_per_decade
    ant_slope = methods_ant["theil_sen"].slope_per_decade

    # Check opposite signs
    assert arc_slope > 0.0, f"Expected positive Arctic warming, got {arc_slope}"
    assert ant_slope < 0.0, f"Expected negative Antarctic cooling, got {ant_slope}"

    # Both should be statistically significant
    assert methods_arc["mann_kendall_hamed_rao"].is_significant is True
    assert methods_ant["mann_kendall_hamed_rao"].is_significant is True


def test_bounding_box_properties_and_antimeridian():
    """Verify BoundingBox geometry, area calculation, and antimeridian crossing."""
    # Standard box
    std_box = BoundingBox(south=10.0, west=-20.0, north=20.0, east=10.0)
    assert std_box.crosses_antimeridian is False
    assert std_box.width_deg == 30.0
    assert std_box.height_deg == 10.0
    assert std_box.center_lat == 15.0
    assert std_box.center_lon == -5.0
    assert std_box.area_km2 > 3_000_000

    # Antimeridian crossing box: 170 E to -170 W (across 180 Date Line)
    anti_box = BoundingBox(south=50.0, west=170.0, north=60.0, east=-170.0)
    assert anti_box.crosses_antimeridian is True
    assert anti_box.width_deg == 20.0
    assert anti_box.height_deg == 10.0
    assert abs(anti_box.center_lon - 180.0) < 1e-4 or abs(anti_box.center_lon - (-180.0)) < 1e-4
    assert anti_box.area_km2 > 1_000_000

    # Ensure MockAdapter generates deterministic series for antimeridian box
    adapter = MockAdapter()
    ts = adapter.get_timeseries("air_temperature", anti_box, "2000-01", "2025-12")
    assert len(ts.points) == 312
    assert ts.points[0].value is not None


def test_adapter_environment_registry():
    """Verify DATA_ADAPTER environment variable configures the active adapter."""
    reset_adapter()
    os.environ["DATA_ADAPTER"] = "mock"
    adapter = get_adapter()
    assert isinstance(adapter, MockAdapter)

    # Unknown adapter raises ValueError
    reset_adapter()
    os.environ["DATA_ADAPTER"] = "nonexistent_adapter"
    with pytest.raises(ValueError, match="Unknown DATA_ADAPTER"):
        get_adapter()

    # Reset back to mock
    os.environ["DATA_ADAPTER"] = "mock"
    reset_adapter()
