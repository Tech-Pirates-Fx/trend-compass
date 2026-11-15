"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AnalyzeResponse } from '../lib/types';
type Journey = { active: boolean; prediction: string; setup: string; station: number; result: string; logged: boolean; view?:'chart'|'brief'|'scan'|'evidence' };
const initial: Journey = { active:false, prediction:'', setup:'', station:0, result:'', logged:false };
const Context = createContext<{journey:Journey; update:(patch:Partial<Journey>)=>void; restart:()=>void}>({journey:initial,update:()=>{},restart:()=>{}});
export function ExpeditionProvider({children}:{children:ReactNode}) {
 const [journey,setJourney]=useState(initial),[ready,setReady]=useState(false);
 useEffect(()=>{try {const saved=JSON.parse(sessionStorage.getItem('tc-expedition-v1')||'null');if(saved&&typeof saved.active==='boolean'&&Number.isInteger(saved.station)&&saved.station>=0&&saved.station<=4&&['','rising','falling','uncertain','skipped'].includes(saved.prediction))setJourney({...initial,...saved});}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{sessionStorage.setItem('tc-expedition-v1',JSON.stringify(journey));}catch{}},[journey,ready]);
 const update=useCallback((patch:Partial<Journey>)=>setJourney(j=>({...j,...patch})),[]);
 const restart=useCallback(()=>setJourney({...initial,active:true}),[]);
 return <Context.Provider value={{journey,update,restart}}>{children}</Context.Provider>;
}
export const useExpedition=()=>useContext(Context);
export function ExpeditionHUD(){const {journey}=useExpedition();const path=(usePathname()||'/');if(!journey.active||!['/','/play','/investigate','/results'].includes(path))return null;return <nav className="journey-hud" aria-label="Expedition progress"><span>VOYAGE 01</span><ol>{['Chart','Predict','Investigate','Evidence','Log'].map((s,i)=><li key={s} aria-current={journey.station===i?'step':undefined} className={journey.station>=i?'reached':''}><b>{journey.station>i?'✓':i+1}</b>{s}</li>)}</ol><Link href={journey.setup?`/play?${journey.setup}`:'/play'}>Mission controls ↗</Link></nav>;}
export function Prediction(){const {journey,update}=useExpedition();return <section className="prediction-panel" aria-labelledby="prediction-title"><p className="eyebrow">CAPTAIN’S HUNCH · OPTIONAL</p><h3 id="prediction-title">What do you think the record will show?</h3><div>{['rising','falling','uncertain','skipped'].map(value=><button type="button" key={value} aria-pressed={journey.prediction===value} onClick={()=>update({prediction:value,station:2,logged:false})}>{value==='rising'?'↗ Rising':value==='falling'?'↘ Falling':value==='uncertain'?'≈ Not sure':'Skip prediction'}</button>)}</div><small>Your guess never changes the analysis. Every honest finding counts.</small></section>;}
export function EvidenceLog({data,query}:{data:AnalyzeResponse;query:string}) {const {journey,update}=useExpedition();const hunch=new URLSearchParams(query).has('preset')?'not recorded for saved voyage':journey.prediction||'not recorded';
 useEffect(()=>{update({station:3,view:'evidence',result:data.is_mock?'Test data returned. This is not a NASA finding.':data.summary.verdict==='inconclusive'?'This record is inconclusive. Check its diagnostics.':data.summary.verdict==='not_significant'?'No significant trend detected. That is a finding too.':'Evidence aboard! Check the rate, uncertainty and source.'});},[data,update]);
 function save(){const entry={saved_at:new Date().toISOString(),prediction:hunch,analysis_query:query,is_mock:data.is_mock,bbox:data.bbox,variable:data.variable,summary:data.summary,diagnostics:data.diagnostics,provenance:data.provenance};const url=URL.createObjectURL(new Blob([JSON.stringify(entry,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='trend-compass-captains-log.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);update({logged:true,station:4});}
 return <section id="evidence-log" className="evidence-log"><div><p className="eyebrow">CAPTAIN’S LOG / {data.is_mock?'TEST RUN':'RETURNED EVIDENCE'}</p><h2>{journey.logged?'Voyage recorded.':'A good detective follows the evidence.'}</h2><p>Hunch: {hunch} · Finding: {data.summary.verdict.replaceAll('_',' ')}. Read the four answers and diagnostics below.</p></div><button className="voyage-button" type="button" onClick={save}>{journey.logged?'Download log again':'Save captain’s log ↓'}</button></section>;
}
