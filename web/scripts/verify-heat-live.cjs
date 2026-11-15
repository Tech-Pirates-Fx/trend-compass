const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,filename);
const { matchesReceipt } = require('../components/game/domain/heatCase.ts');
const base = process.env.HEAT_TEST_URL || 'http://127.0.0.1:3105/api/py';
async function json(path, body) {
  const response=await fetch(`${base}/${path}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','x-trend-compass-live':'1'},...(body?{body:JSON.stringify(body)}:{})});
  const value=await response.json(); assert.equal(response.ok,true,JSON.stringify(value)); return value;
}
(async()=>{
  const catalog=await json('catalog');
  const meta=catalog.find(v=>v.id==='surface_temperature_anomaly');
  const c=meta.temporal_coverage;
  console.log('Catalog coverage:',JSON.stringify(c));
  const inventory=await json('data-management'); assert.equal(inventory.can_play,true);
  const firstMonth = Number(c.end.slice(0,4))*12 + Number(c.end.slice(5,7))-60;
  const shortStart = `${Math.floor(firstMonth/12)}-${String(firstMonth%12+1).padStart(2,'0')}`;
  for(const start of [shortStart,c.start]) {
    const query={variable_id:meta.id,bbox:{south:8,north:37,west:68,east:97},start,end:c.end,resolution:'monthly',deseasonalize:false};
    const result=await json('analyze',query);
    assert.equal(matchesReceipt(query,result),true);
    console.log(JSON.stringify({start,end:c.end,observations:result.diagnostics.n_observations,verdict:result.summary.verdict,rate:result.summary.rate_per_decade,units:result.summary.units,source:result.provenance.source_url,verified:result.provenance.verified}));
  }
  const invalid=await fetch(`${base}/analyze`,{method:'POST',headers:{'Content-Type':'application/json','x-trend-compass-live':'1'},body:JSON.stringify({variable_id:meta.id,bbox:{south:8,north:37,west:68,east:97},start:'2099-01',end:'1900-01',resolution:'monthly'})});
  assert.equal(invalid.status,422); console.log('Invalid period: HTTP 422 preserved, no cache substitution.');
})().catch(e=>{console.error(e);process.exitCode=1;});
