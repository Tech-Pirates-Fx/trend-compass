"""Verification tests for NASA / NOAA GPCP real precipitation data pipeline and analysis."""
import pytest
from fastapi.testclient import TestClient
from api.app.main import app
from api.app.adapters import reset_adapter, get_adapter
from api.app.adapters.gistemp import DEFAULT_GPCP_STORE
from api.app.schemas import BoundingBox


def test_gpcp_precipitation_store_and_analysis(monkeypatch):
    if not DEFAULT_GPCP_STORE.joinpath("manifest.json").exists():
        pytest.skip("GPCP processed store not built")

    monkeypatch.setenv("DATA_ADAPTER", "gistemp")
    reset_adapter()
    adapter = get_adapter()
    assert hasattr(adapter, "gpcp_available")
    assert adapter.gpcp_available is True

    # Test variable lookup
    meta = adapter.get_variable("precipitation")
    assert meta is not None
    assert meta.id == "precipitation"
    assert meta.units == "mm/day"

    # Test timeseries retrieval
    bbox = BoundingBox(south=8.0, north=37.0, west=68.0, east=97.0)
    ts = adapter.get_timeseries("precipitation", bbox, start="2000-01", end="2020-12")
    assert ts.is_mock is False
    assert ts.provenance.verified is True
    assert len(ts.points) == 252
    assert ts.units == "mm/day"

    # Test end-to-end /analyze endpoint
    client = TestClient(app)
    res = client.post(
        "/analyze",
        json={
            "variable_id": "precipitation",
            "bbox": {"south": 8.0, "north": 37.0, "west": 68.0, "east": 97.0},
            "start": "2000-01",
            "end": "2020-12",
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["is_mock"] is False
    assert data["units"] == "mm/day"
    assert len(data["raw_timeseries"]) == 252
    assert "rate_per_decade" in data["summary"]
    assert "p_value" in data["summary"]
