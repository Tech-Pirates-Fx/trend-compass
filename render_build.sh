#!/usr/bin/env bash
# Fail-fast Render build script for Trend Compass API
set -euo pipefail

echo "=== Step 1: Installing Python dependencies ==="
python -m pip install --upgrade pip
python -m pip install -r api/requirements.txt

echo "=== Step 2: Acquiring NASA GISTEMP observations ==="
python data-pipeline/download_gistemp.py

echo "=== Step 3: Building processed GISTEMP binary store ==="
python data-pipeline/build_gistemp.py

echo "=== Step 4: Asserting store readiness and real adapter loading ==="
export PYTHONPATH="."
export DATA_ADAPTER="gistemp"
python -c "
from api.app.adapters import get_adapter
from api.app.schemas import BoundingBox

adapter = get_adapter()
assert not adapter.is_mock, 'DATA_ADAPTER must not be mock in production'

# Test real query (Sahel region, 2000-2020)
bbox = BoundingBox(west=-15.0, south=12.0, east=15.0, north=18.0)
ts = adapter.get_timeseries('surface_temperature_anomaly', bbox, '2000-01', '2020-12')
assert len(ts.points) == 252, f'Expected 252 points, got {len(ts.points)}'
assert not ts.is_mock, 'Timeseries must have is_mock=False'
assert ts.provenance is not None, 'Timeseries must include verified provenance'
assert ts.provenance.dataset_name == 'GISTEMP v4 Land-Ocean Temperature Index', f'Unexpected dataset {ts.provenance.dataset_name}'

print(f'READINESS CHECK PASSED: Verified {len(ts.points)} real observations from {ts.provenance.dataset_name}.')
"

echo "=== Render build completed successfully ==="
