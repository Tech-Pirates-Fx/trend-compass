"""One bounded anonymous monthly IMERG sample check; no login or bulk download."""
from datetime import datetime,timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.parse
import urllib.request
import h5py
ROOT=Path(__file__).resolve().parents[1]
BASE='https://gpm1.gesdisc.eosdis.nasa.gov/data/GPM_L3/GPM_3IMERGM.07/'
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag=='a':self.links.extend(value for key,value in attrs if key=='href')
def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'TrendCompass/1.0'}),timeout=20)
def main():
    year=datetime.now(timezone.utc).year-1
    listing=BASE+str(year)+'/'
    with get(listing) as r:
        parser=Links();parser.feed(r.read(2_000_000).decode('utf-8','replace'))
    files=sorted(link for link in parser.links if link.upper().endswith('.HDF5'))
    if not files:raise ValueError('No monthly HDF5 file links were exposed; access is not demonstrated')
    url=urllib.parse.urljoin(listing,files[-1])
    out=ROOT/'data-raw/imerg-sample.h5'
    with get(url) as r:
        first=r.read(8)
        if first!=b'\x89HDF\r\n\x1a\n':raise ValueError('Archive returned a login/HTML response instead of HDF5')
        size=8
        with out.open('wb') as f:
            f.write(first)
            while block:=r.read(1024*1024):
                size+=len(block)
                if size>64*1024*1024:raise ValueError('Sample exceeded the explicit 64 MiB spike cap; no bulk acquisition attempted')
                f.write(block)
    fields={}
    with h5py.File(out) as f:
        def inspect(name,obj):
            if isinstance(obj,h5py.Dataset):fields[name]=dict(shape=list(obj.shape),dtype=str(obj.dtype),units=str(obj.attrs.get('units','UNKNOWN')))
        f.visititems(inspect)
    result=dict(source_url=url,retrieval_date=datetime.now(timezone.utc).date().isoformat(),sha256=hashlib.sha256(out.read_bytes()).hexdigest(),size_bytes=out.stat().st_size,fields=fields,status='One real file obtained; full-series access/volume/QA not yet demonstrated')
    out.with_suffix('.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
if __name__=='__main__':
    try:main()
    except Exception as e:
        print(f'BLOCKED: {type(e).__name__}: {e}. No credentials used and no bulk download attempted. Human can export a monthly IMERG V07 area-averaged CSV from Giovanni into data-samples/imerg-monthly.csv with its original metadata.');raise SystemExit(1)
