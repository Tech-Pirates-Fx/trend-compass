import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const jsx=(type,props)=>({type,props});
let state,updates=[],blob,clicked=false;
const module={exports:{}};
const code=ts.transpileModule(fs.readFileSync(new URL('../components/Expedition.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(code,{exports:module.exports,require:(name)=>name==='react'?{createContext:()=>({}),useContext:()=>({journey:state,update:p=>updates.push(p)}),useEffect:f=>f()}:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='next/navigation'?{usePathname:()=>'/results'}:{default:'a'},URLSearchParams,Blob,URL:{createObjectURL:b=>{blob=b;return 'blob:test';},revokeObjectURL:()=>{}},document:{createElement:()=>({click:()=>{clicked=true;}})},setTimeout:f=>f()});
const saved=JSON.parse(fs.readFileSync(new URL('../public/demo/presets.json',import.meta.url),'utf8')).entries[0].result;
function button(node){if(!node||typeof node!=='object')return;if(node.type==='button')return node;for(const child of [node.props?.children].flat(Infinity)){const found=button(child);if(found)return found;}}
for(const verdict of ['significant','not_significant','inconclusive']){
 state={prediction:'falling',logged:false};updates=[];clicked=false;
 const data={...saved,summary:{...saved.summary,verdict,p_value:verdict==='inconclusive'?null:saved.summary.p_value}};
 const view=module.exports.EvidenceLog({data,query:'variable_id=surface_temperature_anomaly&start=2000-01&end=2020-12'});
 button(view).props.onClick();const log=JSON.parse(await blob.text());
 assert.deepEqual(log.summary,data.summary);assert.deepEqual(log.provenance,data.provenance);assert.deepEqual(log.bbox,data.bbox);assert.equal(log.prediction,'falling');assert.equal(clicked,true);assert.equal(updates.at(-1).logged,true);
 console.log(`PASS ${verdict}: export preserves real evidence, uncertainty and provenance despite opposite prediction`);
}
state={prediction:'rising',logged:false};const view=module.exports.EvidenceLog({data:saved,query:'preset=arctic'});button(view).props.onClick();assert.equal(JSON.parse(await blob.text()).prediction,'not recorded for saved voyage');console.log('PASS saved voyages do not inherit a live investigation prediction');
console.log('4 focused expedition checks passed. Browser download delivery is a separate manual check.');
