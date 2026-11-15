"""Offline per-cell annual Sen slope; exploratory BH-FDR Kendall hatching."""
import json
import struct
import zlib
import numpy as np
from scipy import stats
from build_cases import OUT, source

def png(path, rgba):
    height,width,_=rgba.shape
    def chunk(kind,data):
        return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
    raw=b''.join(b'\0'+row.tobytes() for row in rgba)
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',width,height,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))

def build():
    adapter,first,last=source()
    indices=np.flatnonzero((adapter.months>=f'{first}-01')&(adapter.months<=f'{last}-12'))
    monthly=np.asarray(adapter.values[indices],dtype=float).reshape(40,12,90,180)
    counts=np.isfinite(monthly).sum(axis=1)
    sums=np.nansum(monthly,axis=1)
    annual=np.divide(sums,counts,out=np.full(sums.shape,np.nan),where=counts==12)
    complete=np.isfinite(annual).all(axis=0)
    flat=annual[:,complete]; a,b=np.triu_indices(40,1)
    slopes=np.full((90,180),np.nan)
    slopes[complete]=np.median((flat[b]-flat[a])/(b-a)[:,None],axis=0)*10
    p=np.array([stats.kendalltau(np.arange(40),v).pvalue for v in flat.T])
    order=np.argsort(p); accepted=p[order]<=.05*np.arange(1,len(p)+1)/len(p)
    cutoff=float(p[order][np.flatnonzero(accepted)[-1]]) if accepted.any() else -1
    hatch=np.zeros((90,180),bool); hatch[complete]=p<=cutoff
    rgba=np.zeros((90,180,4),dtype=np.uint8)
    # Fixed symmetric legend; clipping is explicitly recorded.
    strength=np.clip(np.abs(np.nan_to_num(slopes))/.8,0,1)
    cold=np.array([59,167,219]); warm=np.array([249,154,66]); neutral=np.array([30,64,84])
    colors=np.where((slopes>=0)[...,None],warm,cold)
    rgba[...,:3]=(neutral+(colors-neutral)*strength[...,None]).astype('uint8')
    rgba[...,3]=complete*255
    OUT.mkdir(parents=True,exist_ok=True); png(OUT/'world.png',rgba[::-1])
    meta=dict(period=dict(start=first,end=last),width=180,height=90,cellDegrees=2,
        units='°C/decade',legendRange=[-.8,.8],clipped=True,
        rule='Sen slope of annual means, last 40 complete years; require all 12 months in all 40 years. Missing cells transparent.',
        significance='Exploratory annual original Kendall p-values, Benjamini-Hochberg FDR q=0.05; serial dependence not corrected. Not confirmed local trends.',
        fdrCutoff=cutoff,slopes=[[float(v) if np.isfinite(v) else None for v in row] for row in slopes[::-1]],
        hatching=hatch[::-1].astype(int).tolist(),provenance=adapter.manifest['provenance'])
    (OUT/'world.json').write_text(json.dumps(meta,separators=(',',':'),allow_nan=False),encoding='utf-8')
    print(f'world {first}-{last}: {int(complete.sum())}/16200 complete cells, BH cutoff={cutoff}; PNG and JSON written')

if __name__=='__main__': build()
