import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
function load(path) {
  const output=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};vm.runInNewContext(output,{exports,fetch:()=>{throw new Error('No network in this audit');},URLSearchParams,console},{filename:path});return exports;
}
const geo=load('lib/geography.ts'),records=load('lib/records.ts');
const countries=JSON.parse(fs.readFileSync('public/geography/countries.json','utf8')).features;
let assertions=0;
function check(label,fn) {fn();assertions++;console.log(`PASS ${label}`);}
const country=code=>countries.find(c=>c.properties.code===code);
check('Russia crosses the date line',()=>{const b=geo.countryBounds(country('RUS'));assert.ok(b.west>b.east);assert.ok(b.north>b.south);});
check('USA box includes its islands without an almost-global span',()=>{const b=geo.countryBounds(country('USA'));const w=b.west>b.east?360-b.west+b.east:b.east-b.west;assert.ok(w<200);});
check('Fiji crosses the date line',()=>{const b=geo.countryBounds(country('FJI'));assert.ok(b.west>b.east);});
check('Antarctica retains the full longitude range',()=>{const b=geo.countryBounds(country('ATA'));assert.equal(b.west,-180);assert.equal(b.east,180);});
check('Delhi hits India; an Indian Ocean point does not',()=>{assert.equal(geo.containsPoint(country('IND'),77.2,28.6),true);assert.equal(geo.containsPoint(country('IND'),77.2,-20),false);});
check('Fiji hit testing works on both sides of the date line',()=>{assert.equal(geo.containsPoint(country('FJI'),178,-17.8),true);assert.equal(geo.containsPoint(country('FJI'),-179.96,-16.3),true);});
check('All source country vertices fit their returned bounds',()=>{for(const c of countries){const b=geo.countryBounds(c);for(const p of geo.polygons(c).flat(2)){assert.ok(p[1]>=b.south-.001&&p[1]<=b.north+.001,c.properties.name);assert.ok(b.west<=b.east?p[0]>=b.west-.001&&p[0]<=b.east+.001:p[0]>=b.west-.001||p[0]<=b.east+.001,c.properties.name);}}});
check('Country links preserve crossing coordinates',()=>{const p=new URLSearchParams(geo.regionUrl(geo.countryBounds(country('FJI')),'Fiji').split('?')[1]);assert.ok(Number(p.get('west'))>Number(p.get('east')));assert.equal(p.get('region'),'Fiji');});
check('Record defaults and limits come from metadata',()=>{assert.equal(records.recordBounds({temporal_coverage:{start:'1880-01',end:'2024-05'}}).end,'2024-05');assert.equal(records.recordBounds({}),undefined);assert.equal(records.clampMonth('2050-01','1880-01','2024-05'),'2024-05');assert.equal(records.monthCount('2020-01','2021-12'),24);});
function luminance(hex){const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
check('Text token contrast exceeds 4.5:1 in both themes',()=>{for(const [theme,bg,colors] of [['dark','#071217',['#e8f2ef','#a0b6bc','#8ee3ce','#e8c284']],['light','#edf3f2',['#142d35','#47616a','#08695e','#80530a']]])for(const fg of colors){const a=luminance(fg),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,`${theme} ${fg}: ${ratio}`);console.log(`${theme} ${fg}: ${ratio.toFixed(2)}:1`);}});
console.log(`${assertions} focused UI checks passed. Pure geometry/date/token checks; no browser or NASA-data verification implied.`);

