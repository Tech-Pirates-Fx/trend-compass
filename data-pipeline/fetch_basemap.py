"""Acquire one attributed NASA GIBS contextual map; never numerical trend input."""
import hashlib
import json
from pathlib import Path
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
BASE='https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi'
LAYER='BlueMarble_ShadedRelief_Bathymetry'
def read(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'TrendCompass/1.0'}),timeout=25) as response:
        return response.read()
def main():
    cap_url=BASE+'?service=WMS&version=1.1.1&request=GetCapabilities'
    doc=ET.fromstring(read(cap_url))
    names=[e.text for e in doc.iter() if e.tag.split('}')[-1]=='Name']
    if LAYER not in names:
        raise ValueError('Requested imagery layer is absent from service capabilities')
    params=dict(service='WMS',version='1.1.1',request='GetMap',layers=LAYER,styles='',format='image/jpeg',width=1024,height=512,srs='EPSG:4326',bbox='-180,-90,180,90')
    url=BASE+'?'+urllib.parse.urlencode(params)
    image=read(url)
    if not image.startswith(b'\xff\xd8'):
        raise ValueError('GIBS did not return JPEG imagery')
    output=ROOT/'web/public/imagery';output.mkdir(parents=True,exist_ok=True)
    (output/'nasa-blue-marble.jpg').write_bytes(image)
    metadata=dict(layer=LAYER,source_url=url,capabilities_url=cap_url,retrieval_date=datetime.now(timezone.utc).date().isoformat(),sha256=hashlib.sha256(image).hexdigest(),size_bytes=len(image),width=1024,height=512,usage='Contextual imagery only; not a temperature or precipitation series',credit='NASA GIBS / ESDIS',documentation='https://nasa-gibs.github.io/gibs-api-docs/')
    (output/'provenance.json').write_text(json.dumps(metadata,indent=2)+'\n')
    print(json.dumps(metadata,indent=2))
if __name__=='__main__':
    main()
