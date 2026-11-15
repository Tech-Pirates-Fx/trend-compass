import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../lib/presets.ts',import.meta.url),'utf8');
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};vm.runInNewContext(output,{exports});console.log(JSON.stringify(exports.PRESET_REGIONS));
