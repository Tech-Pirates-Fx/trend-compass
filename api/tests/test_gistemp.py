"""Regression checks for real-grid delivery and corrected statistical edge cases."""
import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from api.app.main import app
from api.app.adapters import reset_adapter
from api.app.adapters.gistemp import GistempAdapter, DEFAULT_STORE
from api.app.schemas import BoundingBox, TimeSeriesPoint
from api.app.stats.preprocess import preprocess_timeseries
from api.app.stats.trend import analyze_trends
from api.app.stats.summary import generate_summary

ROOT=Path(__file__).resolve().parents[2]

def test_real_grid_golden_and_provenance(monkeypatch):
    if not DEFAULT_STORE.joinpath('manifest.json').exists():pytest.skip('Acquire official input and run build_gistemp.py to enable real golden check')
    golden=json.loads((ROOT/'tests/audit/gistemp_golden.json').read_text())
    monkeypatch.setenv('DATA_ADAPTER','gistemp');reset_adapter()
    client=TestClient(app)
    response=client.post('/analyze',json=dict(variable_id='surface_temperature_anomaly',bbox=golden['bbox'],start=golden['start'],end=golden['end']))
    assert response.status_code==200,response.text
    data=response.json()
    assert data['is_mock'] is False
    assert data['provenance']['verified'] is True
    assert data['provenance']['input_sha256']==golden['source_sha256']
    for actual,expected in zip(data['raw_timeseries'],golden['first_months']):
        assert actual['t']==expected['date'];assert actual['value']==pytest.approx(expected['value'],abs=1e-5)
    assert data['summary']['rate_per_decade']==pytest.approx(golden['slope_per_decade'],abs=.000051)
    assert [v['id'] for v in client.get('/catalog').json()]==['surface_temperature_anomaly']
    assert client.get('/health').json()['is_mock'] is False
    assert client.post('/analyze',json=dict(variable_id='surface_temperature_anomaly',bbox=golden['bbox'],start=golden['start'],end=golden['end'],resolution='daily')).status_code==422


def test_missing_store_never_falls_back_to_mock(monkeypatch,tmp_path):
    monkeypatch.setenv('GISTEMP_STORE',str(tmp_path));monkeypatch.delenv('DATA_ADAPTER',raising=False);reset_adapter()
    response=TestClient(app).get('/health')
    assert response.status_code==503
    assert 'no mock fallback' in response.json()['detail']


def test_seasonal_slope_is_per_year_not_per_month():
    dates=pd.date_range('2001-01-01',periods=120,freq='MS')
    values=np.arange(120)*.1+np.tile(np.arange(12)*.3,10)
    methods,_,_=analyze_trends(pd.Series(values,index=dates),dates.strftime('%Y-%m-%d').tolist(),0,0,[])
    assert methods['seasonal_mann_kendall'].slope_per_year==pytest.approx(1.2,abs=1e-5)
    assert methods['seasonal_mann_kendall'].slope_per_decade==pytest.approx(12,abs=1e-4)


def test_real_missing_values_are_not_zero_filled_or_given_a_verdict():
    dates=pd.date_range('2001-01-01',periods=36,freq='MS')
    points=[TimeSeriesPoint(t=str(d.date()),value=None if i==15 else float(i)) for i,d in enumerate(dates)]
    clean,_,count,pct,warnings=preprocess_timeseries(points,interpolate_gaps=False)
    assert np.isnan(clean.iloc[15])
    methods,_,line=analyze_trends(clean,[p.t for p in points],count,pct,warnings)
    assert methods['theil_sen'].slope_per_decade==pytest.approx(120)
    assert len(line)==36
    assert 'seasonal_mann_kendall' not in methods
    result=generate_summary('test','unit','2001','2003',methods,inconclusive_reason='Missing observations')
    assert result.verdict=='inconclusive'
    with pytest.raises(ValueError,match='All observations'):
        preprocess_timeseries([TimeSeriesPoint(t='2001-01-01',value=None)],interpolate_gaps=False)
