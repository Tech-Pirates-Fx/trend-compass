export type Box={south:number;north:number;west:number;east:number};
export type VoyageCase={id:string;archetype:string;variable:string;units:string;bbox:Box;period:{start:string;end:string};series:{t:string;v:number|null}[];windowTable:{s:number;e:number;senSlopePerDecade:number;dir:string;coverage:number}[];seasonal:null;stormSlopes:number[];stormModel:{seed:number;rho:number;residualSd:number;draws:number};answerKey:{senSlopePerDecade:number;ci95:[number,number];hrP:number;olsP:number;verdict:string;method:string};provenance:{dataset:string;version:string;sourceUrl:string;retrievalDate:string;sha256:string;verified:boolean;citation:string;baseline:string};isMock:boolean;builderRule:string;limitations:string[]};
export type Slot='WHAT'|'WHERE'|'HOW MUCH'|'SIGNIFICANT';
export type Token={id:string;caseId:string;tool:string;slot:Slot|'LIMITATION';inputs:{bbox:Box;period:VoyageCase['period']};result:string|number;provenance:VoyageCase['provenance']};
export type Phase='sea'|'net'|'compass'|'storm'|'court'|'reveal'|'mutiny';
export type State={phase:Phase;distance:number;fuel:number;trust:number;volleys:number;estimate:number;significant:boolean;tokens:Token[];slots:Partial<Record<Slot,string>>;limitation?:string;confidence:'Certain'|'Likely'|'Unsure';message:string;attempts:number;score:number;beaconEntered:boolean};
export const initial=():State=>({phase:'sea',distance:0,fuel:100,trust:100,volleys:0,estimate:0,significant:false,tokens:[],slots:{},confidence:'Likely',message:'Sail to the light. Arrows / WASD, or tap the chart.',attempts:0,score:0,beaconEntered:false});
export type Action={type:'sail';distance:number;atPort:boolean}|{type:'enter';near:boolean}|{type:'net';bbox:Box}|{type:'estimate';value:number}|{type:'lockCompass'}|{type:'fire'}|{type:'flag';significant:boolean}|{type:'lockStorm'}|{type:'place';tokenId:string;slot:Slot|'LIMITATION'}|{type:'confidence'}|{type:'submit'}|{type:'retry'};
export function range(c:VoyageCase){const y=c.series.flatMap(p=>p.v===null?[]:[p.v]);return Math.max(.1,(Math.max(...y)-Math.min(...y))/((Number(c.period.end.slice(0,4))-Number(c.period.start.slice(0,4))+1)/10));}
export function calibration(correct:boolean,confidence:State['confidence']){return correct?({Certain:100,Likely:70,Unsure:40}[confidence]):({Certain:-100,Likely:-50,Unsure:-20}[confidence]);}
export function matches(t:Token,c:VoyageCase){return t.caseId===c.id&&JSON.stringify(t.inputs.bbox)===JSON.stringify(c.bbox)&&JSON.stringify(t.inputs.period)===JSON.stringify(c.period)&&t.provenance.sha256===c.provenance.sha256;}
export function reduce(s:State,a:Action,c:VoyageCase):State{
 const token=(id:string,tool:string,slot:Token['slot'],result:Token['result']):Token=>({id,caseId:c.id,tool,slot,inputs:{bbox:c.bbox,period:c.period},result,provenance:c.provenance});
 if(a.type==='retry'&&(s.phase==='mutiny'||s.phase==='reveal'))return {...initial(),attempts:s.attempts+1,message:'Fresh voyage. Your previous claim earned no duplicate rewards.'};
 if(a.type==='sail'&&s.phase==='sea'&&Number.isFinite(a.distance)&&a.distance>=0)return {...s,distance:s.distance+a.distance,fuel:a.atPort?100:Math.max(15,s.fuel-a.distance*.018)};
 if(a.type==='enter'&&s.phase==='sea'&&a.near)return {...s,phase:'net',beaconEntered:true,message:'Cast over the marked archive box. Drag corner to corner; N casts by keyboard.'};
 if(a.type==='net'&&s.phase==='net'){
  if(JSON.stringify(a.bbox)!==JSON.stringify(c.bbox))return {...s,message:'No matching archive receipt. Cast the marked box; other waters unlock after P1.'};
  return {...s,phase:'compass',tokens:[token('where','Net','WHERE',JSON.stringify(c.bbox)),token('limit','Net','LIMITATION',c.limitations[0])],message:'Rotate the compass to fit the observations. Left/right fine-tune; Enter locks.'};
 }
 if(a.type==='estimate'&&s.phase==='compass'&&Number.isFinite(a.value))return {...s,estimate:Math.max(-range(c),Math.min(range(c),a.value))};
 if(a.type==='lockCompass'&&s.phase==='compass')return {...s,phase:'storm',tokens:[...s.tokens,token('what','Compass','WHAT',s.estimate>0?'rising':s.estimate<0?'falling':'flat'),token('how','Compass','HOW MUCH',s.estimate)],message:'Fire with Space / tap cannon. Drag the verdict flag: left = not significant, right = significant.'};
 if(a.type==='fire'&&s.phase==='storm'&&s.volleys<6)return {...s,volleys:s.volleys+1,message:`${(s.volleys+1)*50} of 300 seeded noise slopes released. Official verdict uses Hamed–Rao.`};
 if(a.type==='flag'&&s.phase==='storm')return {...s,significant:a.significant};
 if(a.type==='lockStorm'&&s.phase==='storm'&&s.volleys===6)return {...s,phase:'court',tokens:[...s.tokens,token('sig','Storm','SIGNIFICANT',s.significant?'significant':'not_significant')],message:'Drag receipts into matching slots and attach the limitation. Keyboard: 1–5 places tokens; C confidence; Enter submits.'};
 if(a.type==='place'&&s.phase==='court'){
  const t=s.tokens.find(t=>t.id===a.tokenId);
  if(!t||!matches(t,c)||t.slot!==a.slot)return {...s,message:'Receipt bounced: tool, case, region and period must match the slot.'};
  return a.slot==='LIMITATION'?{...s,limitation:t.id,message:String(t.result)}:{...s,slots:{...s.slots,[a.slot]:t.id},message:`${a.slot} receipt attached.`};
 }
 if(a.type==='confidence'&&s.phase==='court')return {...s,confidence:s.confidence==='Likely'?'Certain':s.confidence==='Certain'?'Unsure':'Likely'};
 if(a.type==='submit'&&s.phase==='court'){
  if(Object.keys(s.slots).length!==4||!s.limitation)return {...s,message:'Four matching receipts and an earned limitation are required.'};
  const [lo,hi]=c.answerKey.ci95;
  const direction=s.estimate*c.answerKey.senSlopePerDecade>0;
  const magnitude=s.estimate>=lo&&s.estimate<=hi;
  const significant=s.significant===(c.answerKey.verdict==='significant');
  const correct=direction&&magnitude&&significant;
  const penalty=correct?0:s.confidence==='Certain'?100:s.confidence==='Likely'?50:20;
  const trust=Math.max(0,s.trust-penalty);
  return {...s,trust,score:calibration(correct,s.confidence),phase:trust===0?'mutiny':'reveal',message:correct?'Verified finding: your direction, estimate and verdict match the engine.':`Revise your claim: ${!direction?'direction; ':''}${!magnitude?'estimate outside slope interval; ':''}${!significant?'significance verdict; ':''}retry is free.`};
 }
 return s;
}
export function validateCase(c:VoyageCase):VoyageCase{
 if(!c||c.id!=='first-light'||c.isMock||c.provenance?.verified!==true||!/^https:\/\/data\.giss\.nasa\.gov\//.test(c.provenance.sourceUrl)||!(/^[a-f0-9]{64}$/).test(c.provenance.sha256))throw Error('Verified NASA case receipt unavailable.');
 if(c.series.length!==480||c.series.some(p=>p.v===null||!Number.isFinite(p.v))||c.stormSlopes.length!==300||c.stormSlopes.some(v=>!Number.isFinite(v))||!Number.isFinite(c.answerKey.senSlopePerDecade)||c.answerKey.ci95.some(v=>!Number.isFinite(v))||!Number.isFinite(c.answerKey.hrP))throw Error('Incomplete case; no substitute observations used.');
 return c;
}
export async function loadCase(signal:AbortSignal){
 const r=await fetch('/voyage/catalog.json',{signal});if(!r.ok)throw Error('Voyage catalog unavailable.');
 const catalog=await r.json(); const entry=catalog.cases[0]; if(!entry)throw Error('Clear Current archetype unavailable in the real record.');
 const response=await fetch(entry.path,{signal});if(!response.ok)throw Error('Case file unavailable.');
 const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
 if(hash!==entry.sha256)throw Error('Case checksum mismatch.');
 return validateCase(JSON.parse(new TextDecoder().decode(bytes)));
}
