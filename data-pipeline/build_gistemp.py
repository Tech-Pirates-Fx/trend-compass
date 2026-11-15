"""Build a float32, memory-mapped store from the actual monthly GISTEMP grid."""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import gzip
import json
from pathlib import Path
import shutil
import time
import numpy as np
import pandas as pd
import xarray as xr
from download_gistemp import checksum

ROOT=Path(__file__).resolve().parents[1]
OFFICIAL='https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz'
CITATION='GISTEMP Team, 2026: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA GISS. https://data.giss.nasa.gov/gistemp/ (accessed 2026-11-13). Lenssen et al. (2024), doi:10.1029/2023JD040179.'

def load_grid(path):
    dataset=xr.open_dataset(path,decode_cf=True)
    def coordinate(names,axis):
        matches=[name for name in dataset.coords if name.lower() in names or dataset[name].attrs.get('axis')==axis]
        if len(matches)!=1:
            raise ValueError(f'Cannot uniquely identify {axis} coordinate: {matches}')
        return matches[0]
    time_name=coordinate({'time','date'},'T')
    lat_name=coordinate({'lat','latitude'},'Y')
    lon_name=coordinate({'lon','longitude'},'X')
    fields=[name for name in dataset.data_vars if set(dataset[name].dims)=={time_name,lat_name,lon_name}]
    if len(fields)!=1:
        raise ValueError(f'Expected one temperature field, found {fields}')
    array=dataset[fields[0]].transpose(time_name,lat_name,lon_name).rename({time_name:'time',lat_name:'lat',lon_name:'lon'})
    array=array.sortby('lat').sortby('lon')
    if str(array.attrs.get('units','')).lower() not in {'k','degc','degree_celsius','degrees_celsius','c'}:
        raise ValueError('Temperature anomaly units not recognized; inspect before converting')
    if not np.allclose(np.diff(array.lat),2) or not np.allclose(np.diff(array.lon),2):
        raise ValueError('Expected the documented regular 2 degree grid')
    return dataset,array,fields[0]

def table_months(path):
    table=pd.read_csv(path,skiprows=1,na_values=['***','****','*****'])
    table.columns=[str(c).strip() for c in table.columns]
    months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    result={}
    for _,row in table.iterrows():
        for month,label in enumerate(months,1):
            try:value=float(row[label])
            except (ValueError,TypeError):continue
            if np.isfinite(value):result[f'{int(row["Year"]):04d}-{month:02d}']=value
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--from-file',type=Path,default=ROOT/'data-raw/gistemp1200_GHCNv4_ERSSTv5.nc.gz')
    parser.add_argument('--table',type=Path,default=ROOT/'data-raw/GLB.Ts+dSST.csv')
    parser.add_argument('--output',type=Path,default=ROOT/'data-pipeline/processed/gistemp')
    args=parser.parse_args();started=time.monotonic()
    source=args.from_file;input_sha=checksum(source)
    receipts=source.parent/'acquisition.json'
    acquisition=json.loads(receipts.read_text()).get('combined',{}) if receipts.exists() else {}
    verified=bool(acquisition.get('verified') and acquisition.get('sha256')==input_sha and acquisition.get('source_url')==OFFICIAL)
    if source.suffix=='.gz':
        raw=source.with_suffix('')
        with gzip.open(source,'rb') as f,raw.open('wb') as output:shutil.copyfileobj(f,output)
    else:raw=source
    dataset,array,field=load_grid(raw)
    months=pd.DatetimeIndex(array.time.values).to_period('M')
    current=pd.Timestamp(datetime.now(timezone.utc)).tz_localize(None).to_period('M')
    indices=np.flatnonzero(months<current)
    if not len(indices):raise ValueError('No complete calendar months in file')
    array=array.isel(time=indices);months=months[indices]
    if len(months.unique())!=len(months) or not np.array_equal(months.asi8,np.arange(months.asi8[0],months.asi8[-1]+1)):
        raise ValueError('Grid must contain exactly one sample per consecutive month')
    args.output.mkdir(parents=True,exist_ok=True)
    values=np.lib.format.open_memmap(args.output/'values.npy',mode='w+',dtype='float32',shape=array.shape)
    global_means=[];w=np.cos(np.deg2rad(array.lat.values.astype('float64')))[:,None]
    for start in range(0,len(months),120):
        block=np.asarray(array.isel(time=slice(start,start+120)).values,dtype='float32')
        values[start:start+len(block)]=block
        valid=np.isfinite(block)
        numerator=np.nansum(block*w,axis=(1,2));denominator=np.sum(valid*w,axis=(1,2))
        global_means.extend(np.divide(numerator,denominator,out=np.full(len(block),np.nan),where=denominator>0).tolist())
    values.flush();del values
    for name,content in [('lat',array.lat.values),('lon',array.lon.values),('months',months.astype(str).to_numpy(dtype='U7'))]:np.save(args.output/f'{name}.npy',content,allow_pickle=False)
    provenance=dict(dataset_name='GISTEMP v4 Land-Ocean Temperature Index',version='4',source_url=OFFICIAL if verified else None,expected_official_url=OFFICIAL,retrieval_date=acquisition.get('retrieval_date') if verified else None,units='°C anomaly',baseline='1951–1980',spatial_resolution='2° × 2°',temporal_coverage={'start':str(months[0]),'end':str(months[-1])},citation=CITATION,smoothing='1200 km',verified=verified,input_sha256=input_sha,processed_sha256=checksum(args.output/'values.npy'),origin=acquisition.get('origin','UNKNOWN local acquisition'))
    manifest=dict(schema_version=1,shape=list(array.shape),dtype='float32',source_variable=field,source_attributes=dict(array.attrs),source_history=dataset.attrs.get('history'),provenance=provenance,calendar_filter='Exclude current/future calendar months; latest record date comes from file, not a fixed year.',memory='Read-only mmap; regional reduction in blocks of at most 120 months. Deployment target/RAM limit not yet specified; no full-store preload required.')
    (args.output/'manifest.json').write_text(json.dumps(manifest,indent=2,default=str)+'\n')
    report=dict(input=str(source),input_bytes=source.stat().st_size,input_sha256=input_sha,verified=verified,field=field,shape=list(array.shape),coverage=provenance['temporal_coverage'],baseline=provenance['baseline'],store_bytes=sum(p.stat().st_size for p in args.output.iterdir()),grid_last_month=str(months[-1]))
    if args.table.exists():
        reference=table_months(args.table);pairs=[(str(m),g,reference[str(m)]) for m,g in zip(months,global_means) if str(m) in reference and np.isfinite(g)]
        diff=np.array([g-r for _,g,r in pairs]);report['global_comparison']=dict(months=len(pairs),start=pairs[0][0],end=pairs[-1][0],mean_difference=float(diff.mean()),mae=float(abs(diff).mean()),rmse=float(np.sqrt(np.mean(diff**2))),max_abs_difference=float(abs(diff).max()),correlation=float(np.corrcoef([p[1] for p in pairs],[p[2] for p in pairs])[0,1]),table_sha256=checksum(args.table),note='Untuned cos(latitude) cell-center weighted means; the published global table uses the GISS analysis aggregation, so exact equality is not expected. Same retrieval session does not guarantee identical source update vintages.')
        pd.DataFrame(pairs,columns=['month','grid_coslat','published']).assign(difference=diff).to_csv(ROOT/'docs/logs/A-global-comparison.csv',index=False)
    report['elapsed_seconds']=round(time.monotonic()-started,3)
    print(json.dumps(report,indent=2));dataset.close()
if __name__=='__main__':main()
