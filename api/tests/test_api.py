from fastapi.testclient import TestClient
from api.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["phase"] == 2
    assert "adapter" in data
    assert data["is_mock"] is True


def test_catalog_endpoint():
    response = client.get("/catalog")
    assert response.status_code == 200
    variables = response.json()
    assert len(variables) >= 5
    ids = [v["id"] for v in variables]
    assert "air_temperature" in ids
    assert "precipitation" in ids
    assert "vegetation_greenness" in ids
    assert "sea_surface_temperature" in ids
    assert "soil_moisture" in ids
    for v in variables:
        assert v["is_placeholder"] is True
        assert "placeholder" in v["placeholder_note"].lower()
        assert "temporal_coverage" in v
        assert "start" in v["temporal_coverage"]
        assert "end" in v["temporal_coverage"]
        assert len(v["available_resolutions"]) >= 1


def test_timeseries_endpoint():
    payload = {
        "variable_id": "air_temperature",
        "bbox": {"south": 10.0, "west": 20.0, "north": 15.0, "east": 25.0},
        "start": "2005-01",
        "end": "2020-12",
        "resolution": "monthly",
    }
    response = client.post(
        f"/timeseries?variable_id={payload['variable_id']}&start={payload['start']}&end={payload['end']}&resolution={payload['resolution']}",
        json=payload["bbox"],
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_mock"] is True
    assert len(data["points"]) > 0


def test_analyze_endpoint_full():
    payload = {
        "variable_id": "air_temperature",
        "bbox": {
            "south": 68.0,
            "west": -160.0,
            "north": 75.0,
            "east": -130.0,
        },
        "start": "2000-01",
        "end": "2025-12",
        "resolution": "monthly",
        "deseasonalize": True,
        "alpha": 0.05,
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Check structure
    assert data["is_mock"] is True
    assert "MOCK" in data["source"]
    assert data["deseasonalize_applied"] is True
    assert len(data["raw_timeseries"]) == 312
    assert data["deseasonalized_timeseries"] is not None
    assert len(data["trend_line"]) == 312

    # Check methods
    methods = data["methods"]
    assert "ols" in methods
    assert "theil_sen" in methods
    assert "mann_kendall_hamed_rao" in methods
    assert methods["ols"]["slope_per_decade"] is not None

    # Check diagnostics
    diag = data["diagnostics"]
    assert diag["n_observations"] == 312
    assert diag["missing_count"] >= 0

    # Check summary
    summary = data["summary"]
    assert summary["verdict"] in ("significant", "not_significant")
    assert summary["rate_per_decade"] is not None
    assert len(summary["plain_language"]) > 20


def test_analyze_antimeridian_box():
    """Verify that a bounding box crossing the 180 antimeridian (west > east) works cleanly."""
    payload = {
        "variable_id": "air_temperature",
        "bbox": {
            "south": 60.0,
            "west": 170.0,  # 170 E
            "north": 70.0,
            "east": -170.0,  # 170 W (crosses 180)
        },
        "start": "2005-01",
        "end": "2020-12",
        "resolution": "monthly",
        "deseasonalize": False,
        "alpha": 0.05,
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["raw_timeseries"]) == 192
    assert data["summary"]["verdict"] in ("significant", "not_significant")


def test_analyze_daily_resolution():
    """Verify daily resolution works end-to-end for variables supporting it."""
    payload = {
        "variable_id": "air_temperature",
        "bbox": {
            "south": 30.0,
            "west": -100.0,
            "north": 40.0,
            "east": -90.0,
        },
        "start": "2020-01-01",
        "end": "2022-12-31",
        "resolution": "daily",
        "deseasonalize": True,
        "alpha": 0.05,
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resolution"] == "daily"
    assert len(data["raw_timeseries"]) >= 730


def test_analyze_invalid_dates_rejected_422():
    """Verify API returns 422 for inverted date ranges instead of silent fallback."""
    payload = {
        "variable_id": "air_temperature",
        "bbox": {"south": 0.0, "west": 0.0, "north": 10.0, "east": 10.0},
        "start": "2025-01",
        "end": "2010-12",
        "resolution": "monthly",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422
    assert "precede" in response.json()["detail"].lower()


def test_analyze_too_short_range_rejected_422():
    """Verify API returns 422 when record length is under 24 months."""
    payload = {
        "variable_id": "air_temperature",
        "bbox": {"south": 0.0, "west": 0.0, "north": 10.0, "east": 10.0},
        "start": "2020-01",
        "end": "2020-06",
        "resolution": "monthly",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422
    assert "too short" in response.json()["detail"].lower()


def test_analyze_unsupported_resolution_rejected_422():
    """Verify API returns 422 when requested resolution is not supported by variable."""
    payload = {
        "variable_id": "precipitation",
        "bbox": {"south": 0.0, "west": 0.0, "north": 10.0, "east": 10.0},
        "start": "2010-01",
        "end": "2020-12",
        "resolution": "daily",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422
    assert "not supported" in response.json()["detail"].lower()


def test_analyze_unknown_variable_returns_404():
    payload = {
        "variable_id": "nonexistent_variable",
        "bbox": {"south": 0.0, "west": 0.0, "north": 10.0, "east": 10.0},
        "start": "2000-01",
        "end": "2020-12",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 404
