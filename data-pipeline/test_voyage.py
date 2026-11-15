"""Real-store builder checks. No network or invented scientific results."""
import importlib.util
import json
from pathlib import Path
import sys
import numpy as np
from scipy import stats

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from build_cases import source, storms, windows, OUT

def test_case_receipt_and_clear_current():
    adapter,first,last=source()
    c=json.loads((OUT/'cases/first-light.json').read_text(encoding='utf-8'))
    assert c['provenance']['processedSha256']==adapter.manifest['provenance']['processed_sha256']
    assert c['period']==dict(start=f'{first}-01',end=f'{last}-12')
    y=np.array([p['v'] for p in c['series']])
    assert round(float(stats.theilslopes(y,np.arange(len(y))).slope*120),4)==c['answerKey']['senSlopePerDecade']
    full=windows(y,first)
    assert all(w['senSlopePerDecade']*c['answerKey']['senSlopePerDecade']>0 for w in full if w['e']-w['s']+1>=15)
    assert len(c['windowTable'])==600
    noise,meta=storms(y)
    again,_=storms(y)
    assert noise==again==c['stormSlopes']
    assert meta==c['stormModel']

def test_world_missing_and_fdr():
    w=json.loads((OUT/'world.json').read_text(encoding='utf-8'))
    slopes=np.array(w['slopes'],dtype=float); hatch=np.array(w['hatching'])
    assert slopes.shape==(90,180)
    assert np.isnan(slopes).any()
    assert not hatch[np.isnan(slopes)].any()
    assert 'Benjamini-Hochberg' in w['significance']
    assert w['provenance']['verified']
