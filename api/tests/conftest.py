"""Legacy synthetic endpoint tests opt into mock mode; production defaults to GISTEMP."""
import pytest
from api.app.adapters import reset_adapter
@pytest.fixture(autouse=True)
def synthetic_environment(monkeypatch, tmp_path):
    monkeypatch.setenv('DATA_ADAPTER','mock')
    monkeypatch.setenv('TC_DATA_CONTROL_FILE',str(tmp_path / 'data-control.json'))
    monkeypatch.setenv('TC_DATA_ADMIN_TOKEN','test-local-token')
    reset_adapter()
    yield
    reset_adapter()
