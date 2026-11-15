"""Deterministic Voyage case builder. No network, no authored answer keys."""
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from api.app.adapters.gistemp import GistempAdapter
from api.app.schemas import BoundingBox
from api.app.stats.trend import analyze_trends, compute_lag1_autocorrelation

OUT = ROOT / 'web/public/voyage'
RULE = ('Last 40 complete calendar years; scan fixed 20-degree boxes south-to-north, '
        'west-to-east; first complete monthly record with HR p<0.05 and nonzero '
        'Sen sign stable in every annual-boundary window of 15+ years. No tuning.')

def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1048576), b''): h.update(block)
    return h.hexdigest()

def source():
    adapter = GistempAdapter()
    p = adapter.manifest['provenance']
    if not p['verified'] or digest(adapter.store/'values.npy') != p['processed_sha256']:
        raise ValueError('Verified, hash-matching GISTEMP store required')
    years = sorted({int(m[:4]) for m in adapter.months if str(m).endswith('-12')})
    end = years[-1]
    return adapter, end-39, end

def windows(y, first):
    result=[]
    for s in range(36):
        for e in range(s+5,41):
            segment=y[s*12:e*12]
            slope=float(stats.theilslopes(segment, np.arange(len(segment))).slope*120)
            result.append(dict(s=first+s,e=first+e-1,senSlopePerDecade=slope,
                               dir='rising' if slope>0 else 'falling' if slope<0 else 'flat',coverage=1))
    return result

def storms(y, seed=20261115):
    x=np.arange(len(y)); fit=stats.theilslopes(y,x)
    residual=y-(fit.intercept+fit.slope*x)
    rho=float(np.clip(compute_lag1_autocorrelation(residual),-.98,.98))
    sd=float(np.std(residual,ddof=1)); rng=np.random.default_rng(seed)
    slopes=[]
    for _ in range(300):
        z=np.empty(len(y)); z[0]=rng.normal(0,sd)
        innovation=rng.normal(0,sd*np.sqrt(1-rho*rho),len(y)-1)
        for i in range(1,len(y)): z[i]=rho*z[i-1]+innovation[i-1]
        slopes.append(float(stats.theilslopes(z,x).slope*120))
    return slopes,dict(seed=seed,rho=rho,residualSd=sd,draws=300)

def build():
    adapter,first,last=source(); logs=[RULE]; selected=None
    for south in range(-60,61,20):
        for west in range(-180,161,20):
            bbox=BoundingBox(south=south,north=south+20,west=west,east=west+20)
            series=adapter.get_timeseries(adapter.VARIABLE_ID,bbox,f'{first}-01',f'{last}-12')
            y=np.array([p.value if p.value is not None else np.nan for p in series.points])
            if len(y)!=480 or not np.isfinite(y).all(): continue
            dates=[p.t for p in series.points]
            methods,diagnostics,_=analyze_trends(pd.Series(y),dates,0,0,[])
            hr=methods.get('mann_kendall_hamed_rao'); sen=methods['theil_sen']
            if not hr or not hr.is_significant or sen.slope_per_decade==0: continue
            table=windows(y,first)
            stable=all(w['senSlopePerDecade']*sen.slope_per_decade>0 for w in table if w['e']-w['s']+1>=15)
            logs.append(f'{bbox.model_dump()} HR={hr.p_value} stable={stable}')
            if not stable: continue
            # Keep all 15+ year windows, deterministic thinning of shorter windows to cap at 600.
            long=[w for w in table if w['e']-w['s']+1>=15]
            short=[w for w in table if w['e']-w['s']+1<15]
            short=[short[i] for i in np.linspace(0,len(short)-1,600-len(long),dtype=int)]
            noise,noise_meta=storms(y)
            p=adapter.manifest['provenance']
            selected=dict(id='first-light',archetype='Clear Current',variable=adapter.VARIABLE_ID,
                units='°C anomaly',bbox=bbox.model_dump(),period=dict(start=f'{first}-01',end=f'{last}-12'),
                series=[dict(t=p.t,v=p.value) for p in series.points],windowTable=sorted(long+short,key=lambda w:(w['s'],w['e'])),
                seasonal=None,stormSlopes=noise,stormModel=noise_meta,
                answerKey=dict(senSlopePerDecade=sen.slope_per_decade,ci95=[sen.ci_lower_decade,sen.ci_upper_decade],
                    hrP=hr.p_value,olsP=methods['ols'].p_value,verdict='significant',method=hr.display_name),
                provenance=dict(dataset=p['dataset_name'],version=p['version'],sourceUrl=p['source_url'],
                    retrievalDate=p['retrieval_date'],sha256=p['input_sha256'],processedSha256=p['processed_sha256'],
                    verified=True,citation=p['citation'],baseline=p['baseline']),isMock=False,builderRule=RULE,
                limitations=['Regional box average; not a country outline.','Significance does not identify a cause.',
                    'Slope interval does not correct serial dependence.'],warnings=diagnostics.warnings)
            break
        if selected: break
    OUT.mkdir(parents=True,exist_ok=True); (OUT/'cases').mkdir(exist_ok=True)
    if selected:
        data=json.dumps(selected,sort_keys=True,allow_nan=False,separators=(',',':'))+'\n'
        (OUT/'cases/first-light.json').write_bytes(data.encode('utf-8'))
        (OUT/'catalog.json').write_text(json.dumps(dict(cases=[dict(id=selected['id'],bbox=selected['bbox'],path='/voyage/cases/first-light.json',sha256=hashlib.sha256(data.encode()).hexdigest())])),encoding='utf-8')
        logs.append(f"SELECTED {selected['bbox']} {selected['period']} windows={len(selected['windowTable'])} storms=300 sha256={hashlib.sha256(data.encode()).hexdigest()}")
    else:
        (OUT/'catalog.json').write_text('{"cases":[]}',encoding='utf-8'); logs.append('Clear Current archetype unavailable')
    (ROOT/'docs/logs/case-builder.txt').write_text('\n'.join(logs)+'\n',encoding='utf-8')
    print('\n'.join(logs))
    return selected

if __name__=='__main__': build()
