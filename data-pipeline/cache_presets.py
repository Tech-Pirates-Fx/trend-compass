"""Precompute attributed real-data examples from the same active GISTEMP store."""
import json
import os
from pathlib import Path
import subprocess
import sys
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT));os.environ['DATA_ADAPTER']='gistemp'
from fastapi.testclient import TestClient
from api.app.main import app
from api.app.adapters import get_adapter

def main():
    presets=json.loads(subprocess.check_output(['node',str(ROOT/'web/scripts/export-presets.mjs')],text=True))
    variable=get_adapter().list_variables()[0];end=variable.temporal_coverage.end;start=f'{int(end[:4])-25}-01'
    client=TestClient(app);entries=[]
    for preset in presets:
        request=dict(variable_id=variable.id,bbox=preset['bbox'],start=start,end=end,resolution='monthly',deseasonalize=False,alpha=.05)
        response=client.post('/analyze',json=request)
        if response.status_code!=200:raise ValueError(response.text)
        result=response.json()
        if result['is_mock'] or not result['provenance']['verified']:raise ValueError('Refusing to cache unverified or mock observations')
        entries.append(dict(id=preset['id'],name=preset['name'],request=request,result=result))
        print(preset['id'],result['summary']['rate_per_decade'],result['summary']['verdict'])
    payload=dict(calculated_at=datetime.now(timezone.utc).isoformat(),description='Saved regional investigations from the official GISTEMP input, not live requests. Source and dates are included per entry.',entries=entries)
    out=ROOT/'web/public/demo/presets.json';out.write_text(json.dumps(payload,separators=(',',':'))+'\n');print('Saved',len(entries),'real examples;',out.stat().st_size,'bytes')
if __name__=='__main__':main()
