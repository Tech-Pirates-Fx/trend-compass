"""Raw-grid audit independent of the adapter's reduction and rank-test code."""
import faulthandler
faulthandler.dump_traceback_later(30, repeat=False)
import json
import os
from pathlib import Path
import sys
import numpy as np
import pandas as pd
from scipy.stats import norm
import xarray as xr
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
os.environ['DATA_ADAPTER']='gistemp'
from fastapi.testclient import TestClient
from api.app.main import app
from api.app.adapters import reset_adapter

REGIONS={
 'Western Arctic':dict(south=68,west=-160,north=75,east=-130),
 'East Antarctic':dict(south=-75,west=60,north=-65,east=100),
 'Bering Strait':dict(south=62,west=165,north=72,east=-160),
 'Sahel':dict(south=12,west=-15,north=18,east=15),
 'Amazon region':dict(south=-10,west=-70,north=2,east=-55),
}

def rank_statistics(y):
    n=len(y);x=np.arange(n,dtype=float)
    slopes=np.concatenate([(y[i+1:]-y[i])/(x[i+1:]-x[i]) for i in range(n-1)])
    slope=float(np.median(slopes))
    score=sum(np.sign(y[i+1:]-y[i]).sum() for i in range(n-1))
    counts=np.unique(y,return_counts=True)[1]
    variance=(n*(n-1)*(2*n+5)-sum(t*(t-1)*(2*t+5) for t in counts))/18
    def probability(var):return float(2*norm.sf(abs((score-np.sign(score))/np.sqrt(var)))) if var>0 else (1.0 if score==0 else None)
    original=probability(variance)
    ranks=pd.Series(y-slope*np.arange(1,n+1)).rank(method='average').to_numpy()
    centered=ranks-ranks.mean();denom=np.dot(centered,centered)
    acf=np.correlate(centered,centered,'full')[n-1:]/denom if denom else np.zeros(n)
    threshold=norm.ppf(.975)/np.sqrt(n)
    correction=1+2*sum((n-k)*(n-k-1)*(n-k-2)*acf[k] for k in range(1,n) if abs(acf[k])>threshold)/(n*(n-1)*(n-2))
    return slope*120,original,probability(variance*correction)

def main():
    ds=xr.open_dataset(ROOT/'data-raw/gistemp1200_GHCNv4_ERSSTv5.nc')
    fields=[name for name,var in ds.data_vars.items() if set(var.dims)=={'time','lat','lon'}]
    grid=ds[fields[0]]
    months=pd.DatetimeIndex(grid.time.values).strftime('%Y-%m')
    end=months[-1];start=f'{int(end[:4])-25}-01'
    subset=grid.isel(time=np.flatnonzero((months>=start)&(months<=end)))
    reset_adapter();client=TestClient(app)
    report={'input':'Official NASA GISS grid acquired 2026-11-13','start':start,'end':end,'regions':[]}
    for name,b in REGIONS.items():
        lat=(subset.lat>=b['south'])&(subset.lat<b['north'])
        lon=((subset.lon>=b['west'])|(subset.lon<b['east'])) if b['west']>b['east'] else ((subset.lon>=b['west'])&(subset.lon<b['east']))
        regional=subset.where(lat&lon,drop=True).astype('float64')
        weights=np.cos(np.deg2rad(regional.lat.astype('float64')))
        series=regional.weighted(weights).mean(('lat','lon'),skipna=True).values.astype(float)
        if not np.isfinite(series).all():raise ValueError(f'Audit interval has missing data: {name}')
        slope,mk,hr=rank_statistics(series)
        response=client.post('/analyze',json=dict(variable_id='surface_temperature_anomaly',bbox=b,start=start,end=end,resolution='monthly',deseasonalize=False))
        assert response.status_code==200,response.text
        data=response.json();api_values=np.array([p['value'] for p in data['raw_timeseries']])
        diff=float(abs(series-api_values).max())
        # xarray's float32 reduction can differ slightly from float64 accumulator.
        assert diff<1e-5,(name,diff)
        assert abs(slope-data['summary']['rate_per_decade'])<.000051
        assert abs(mk-data['methods']['mann_kendall_original']['p_value'])<1e-10
        print(name, 'series error', diff, 'independent HR', hr, 'API HR', data['methods']['mann_kendall_hamed_rao']['p_value'], flush=True)
        # Record disagreements rather than hiding regions or tuning values to match.
        report['regions'].append(dict(region=name,bbox=b,observations=len(series),slope_per_decade=slope,mk_p=mk,hamed_rao_p=hr,api_rate=data['summary']['rate_per_decade'],api_hr_p=data['summary']['p_value'],max_series_abs_difference=diff,verdict=data['summary']['verdict']))
        if name=='Sahel':
            golden=dict(source_sha256=data['provenance']['input_sha256'],start=start,end=end,bbox=b,first_months=[dict(date=p['t'],value=float(v)) for p,v in zip(data['raw_timeseries'][:6],series[:6])],slope_per_decade=slope)
            (ROOT/'tests/audit/gistemp_golden.json').write_text(json.dumps(golden,indent=2)+'\n')
    reference=pd.read_csv(ROOT/'data-raw/GLB.Ts+dSST.csv',skiprows=1,na_values=['***','****','*****'])
    monthly=reference.melt(id_vars=['Year'],value_vars=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])
    lookup={f'{int(row.Year)}-{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].index(row.variable)+1:02d}':float(row.value) for row in monthly.itertuples() if pd.notna(row.value)}
    global_means=[]
    for offset in range(0,len(months),120):
        global_means.extend(grid.isel(time=slice(offset,offset+120)).weighted(np.cos(np.deg2rad(grid.lat))).mean(('lat','lon'),skipna=True).values.tolist())
    d=np.array([g-lookup[m] for m,g in zip(months,global_means) if m in lookup])
    report['independent_global']=dict(months=len(d),mean_difference=float(d.mean()),mae=float(abs(d).mean()),rmse=float(np.sqrt(np.mean(d*d))))
    report['hr_agreement'] = all(r['hamed_rao_p'] is not None and abs(r['hamed_rao_p']-r['api_hr_p'])<1e-10 for r in report['regions'])
    report['conclusion']='Regional means, pairwise median slopes and tie-corrected original MK agree within stated tolerances. Hamed–Rao agreement is explicitly reported above. Global comparison is untuned; published aggregation is not expected to be identical.'
    print(json.dumps(report,indent=2));ds.close();faulthandler.cancel_dump_traceback_later()
if __name__=='__main__':main()

