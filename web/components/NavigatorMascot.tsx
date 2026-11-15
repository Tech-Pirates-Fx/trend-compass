"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useDataControl} from './DataControl';
import {useExpedition} from './Expedition';
export function NavigatorMascot(){
 const {inventory,error}=useDataControl();
 const path=(usePathname()||'/'),{journey,restart}=useExpedition();const [minimized,setMinimized]=useState(false);
 useEffect(()=>{try{setMinimized(sessionStorage.getItem('tc-piper-minimized')==='true'||matchMedia('(max-width: 700px)').matches);}catch{}},[]);
 function toggle(){setMinimized(v=>{try{sessionStorage.setItem('tc-piper-minimized',String(!v));}catch{}return !v;});}
 const dataLocked=Boolean(error||(inventory&&(!inventory.controls.enabled||(path==='/play'&&!inventory.can_play))));
 const evidence=path==='/results'||(path==='/play'&&(journey.station>=3||journey.view==='scan')),chart=path==='/investigate'||path==='/play';
 let pose=0,text='Ahoy! We’re finding how Earth’s temperature changed. Choose your destination, then make a hunch.';
 if(chart&&!evidence){pose=1;text='Choose a country, then lock your destination. I’ll guide you through the evidence.';if(journey.station===1){pose=2;text='Before we look: rising, falling, or not sure? Make your hunch.';}if(journey.station===2){pose=1;text='Ready at the helm. Run the investigation when your record is set.';}}
 else if(evidence){pose=journey.result?(journey.result.includes('inconclusive')||journey.result.includes('No significant')||journey.result.includes('could not')||journey.result.includes('Test data')?3:4):2;text=journey.result||'Searching the record. The result comes from the data service.';if(journey.logged){pose=4;text='Log saved, captain! A careful investigation is the treasure.';}}
 else if(path!=='/'){pose=5;text='The ship’s manifest keeps our people, sources and methods within reach.';}
 if(dataLocked){pose=3;text='Ship data is offline. Open Data Management to enable a mission.';}
 return <aside className={`piper-guide ${minimized?'minimized':''}`} aria-label="First Mate Piper guide">
 {!minimized&&<><div className={`piper-sprite pose-${pose}`} role="img" aria-label={`Piper ${['welcoming','pointing','thinking','concerned','celebrating','listening'][pose]}`}/><div className="piper-bubble"><div className="piper-heading"><strong>PIPER / SHIP COMMS</strong><button type="button" onClick={toggle} aria-label="Minimize Piper">−</button></div><p key={text} aria-live="polite">{text}</p><div className="piper-actions"><Link href={dataLocked?'/data':evidence?'#evidence-log':chart?'#main-content':'/play'}>{dataLocked?'Open Data Management ↗':evidence?'Open captain’s log ↑':chart?'To the controls ↑':'Start playing ↗'}</Link><Link href="/" onClick={restart}>New voyage</Link></div><details><summary>Why this step?</summary><p>{evidence?'A prediction is a guess. Judge the returned rate, confidence interval, test and warnings together. Significance alone does not measure impact.':'A region, measurement and time window define your question. Country selection uses a box, so check its coordinates.'}</p></details></div></>}
 {minimized&&<button type="button" className="piper-reopen" onClick={toggle}><span className="piper-portrait"/>Ask Piper <span>↗</span></button>}
 </aside>;
}
