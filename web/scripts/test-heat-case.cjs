// Focused behavioral checks; scientific values below are explicit test fixtures.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
const { initialCase, caseReducer: reduce, expectedConclusion, matchesReceipt, restoreDraft } = require('../components/game/domain/heatCase.ts');
const { matchVerifiedHotspot, getVerifiedHotspots } = require('../lib/hotspots-cache.ts');
const original = Object.values(getVerifiedHotspots()).find(r => r.variable.id === 'surface_temperature_anomaly');
const copy = x => JSON.parse(JSON.stringify(x));
const query = { variable_id: original.variable.id, bbox: original.bbox, start: original.raw_timeseries[0].t.slice(0,7), end: original.raw_timeseries.at(-1).t.slice(0,7), resolution: original.resolution, deseasonalize: original.deseasonalize_applied };
const shortQuery = { ...query, start: original.raw_timeseries.at(-60).t.slice(0,7) };
const shortResult = { ...copy(original), raw_timeseries: original.raw_timeseries.slice(-60) };
const receipt = (q,r) => ({query:q,result:r,acquired:'2026-11-15T00:00:00Z'});
let count = 0;
function check(name, fn) { fn(); count++; process.stdout.write(`PASS ${name}\n`); }
check('report and completion cannot be reached without objectives', () => {
  assert.equal(reduce(initialCase,{type:'visit',station:'report'}).station,'board');
  assert.equal(reduce(initialCase,{type:'visit',station:'complete'}).station,'board');
  assert.equal(reduce(initialCase,{type:'submit',conclusion:'rising',magnitude:'measured',limitation:'regional'}).station,'board');
});
check('exact cached receipt is preserved; nearby coordinates, dates and settings rejected', () => {
  assert.deepEqual(matchVerifiedHotspot(query),original);
  for(const changed of [{bbox:{...query.bbox,north:query.bbox.north+.01}},{start:'1999-01'},{variable_id:'unknown'},{deseasonalize:!query.deseasonalize},{alpha:.1}]) assert.throws(()=>matchVerifiedHotspot({...query,...changed}));
});
check('wrong query, unverified input and mock input rejected', () => {
  assert.equal(matchesReceipt({...query,start:'1999-01'},original),false);
  assert.equal(matchesReceipt(query,{...original,is_mock:true}),false);
  assert.equal(matchesReceipt(query,{...original,provenance:{verified:false}}),false);
});
function prepared(result=original) {
  let state = reduce(initialCase,{type:'receive',kind:'short',receipt:receipt(shortQuery,shortResult)});
  state=reduce(state,{type:'receive',kind:'long',receipt:receipt(query,result)});
  for(const kind of ['short','long']) state=reduce(state,{type:'pin',kind});
  state=reduce(state,{type:'source'});
  return reduce(state,{type:'compare',answer:'limited'});
}
check('pinning is idempotent and comparison requires both receipts',()=>{
  let s=reduce(initialCase,{type:'pin',kind:'short'}); assert.equal(s.pinned.length,0);
  s=prepared(); s=reduce(s,{type:'pin',kind:'short'}); assert.equal(s.pinned.length,2);
  assert.equal(reduce(initialCase,{type:'compare',answer:'limited'}).comparison,false);
});
check('overconfident comparison and report can be revised',()=>{
  let s=reduce(prepared(),{type:'compare',answer:'universal'}); assert.equal(s.comparison,false);
  s=reduce(s,{type:'compare',answer:'limited'});
  s=reduce(s,{type:'submit',conclusion:'wrong',magnitude:'measured',limitation:'regional'}); assert.notEqual(s.station,'complete');
  s=reduce(s,{type:'submit',conclusion:expectedConclusion(original),magnitude:'measured',limitation:'regional'}); assert.equal(s.station,'complete');
});
check('all verdicts and both slope directions have valid endings without guessing rewards',()=>{
  for(const [verdict,rate,answer] of [['significant',1,'rising'],['significant',-1,'falling'],['not_significant',1,'not_significant'],['inconclusive',1,'inconclusive']]) {
    const fixture={...copy(original),summary:{...original.summary,verdict,rate_per_decade:rate}};
    assert.equal(expectedConclusion(fixture),answer);
    const s=reduce(prepared(fixture),{type:'submit',conclusion:answer,magnitude:'measured',limitation:'regional'}); assert.equal(s.station,'complete');
  }
});
check('replaced evidence invalidates pin, source inspection and comparison',()=>{
  const s=reduce(prepared(),{type:'receive',kind:'short',receipt:receipt(shortQuery,shortResult)});
  assert.equal(s.pinned.includes('short'),false); assert.equal(s.sourceRead,false); assert.equal(s.comparison,false);
});
check('incompatible periods rejected',()=>{
  const s=reduce(prepared(),{type:'receive',kind:'long',receipt:receipt(shortQuery,shortResult)});
  assert.notEqual(s.evidence.long.query.start,shortQuery.start);
});
check('save restore cannot grant evidence or completion and invalid versions reset',()=>{
  assert.deepEqual(restoreDraft({version:1,station:'complete',evidence:{},shortStart:'2020-13',end:'2020-12'}),{station:'archive',shortStart:undefined,longStart:undefined,end:'2020-12'});
  assert.deepEqual(restoreDraft({version:999,station:'complete'}),{station:'board'});
  assert.deepEqual(restoreDraft(null),{station:'board'});
});
process.stdout.write(`${count} behavioral checks passed. Mutated scientific outcomes are test-only fixtures.\n`);
