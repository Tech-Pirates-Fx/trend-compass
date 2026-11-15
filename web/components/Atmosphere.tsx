"use client";
import { useEffect, useState } from 'react';
import { CloudRain, Sun, Sparkles, Leaf } from 'lucide-react';
export type AtmosphereMode='stars'|'sun'|'rain';
export function useLowPower() {
  const [lowPower,setLowPower]=useState(false);
  useEffect(()=>{const navigatorWithHints=navigator as Navigator & {deviceMemory?:number;connection?:{saveData?:boolean}};setLowPower(Boolean(navigatorWithHints.connection?.saveData)||Boolean(navigatorWithHints.deviceMemory&&navigatorWithHints.deviceMemory<=4)||navigator.hardwareConcurrency<=2);},[]);
  return [lowPower,setLowPower] as const;
}
export function Atmosphere({mode,lowPower}:{mode:AtmosphereMode;lowPower:boolean}) {
  return <div aria-hidden="true" className={`atmosphere atmosphere-${mode} ${lowPower?'low-power':''}`}>
    <div className="solar-halo"/><div className="lens-flare"/>
    <div className="star-field">{Array.from({length:42},(_,i)=><i key={i} style={{left:`${(i*47+3)%100}%`,top:`${(i*31+7)%100}%`,animationDelay:`${i%7}s`,width:i%5===0?3:1,height:i%5===0?3:1}}/>)}</div>
    {mode==='rain'&&<div className="rain-field">{Array.from({length:16},(_,i)=><i key={i} style={{left:`${(i*23+5)%100}%`,top:`${(i*17+4)%85}%`,animationDelay:`${-(i%6)}s`,width:5+i%4*3,height:9+i%4*5}}/>)}</div>}
  </div>;
}
export function AtmosphereControls({mode,onChange,lowPower,onLowPower}:{mode:AtmosphereMode;onChange:(mode:AtmosphereMode)=>void;lowPower:boolean;onLowPower:()=>void}) {
  return <div className="atmosphere-controls" aria-label="Decorative atmosphere settings"><span className="eyebrow">Set the atmosphere</span><div className="flex gap-1">
    {([{id:'stars',label:'Stars',Icon:Sparkles},{id:'sun',label:'Sun flare',Icon:Sun},{id:'rain',label:'Rain on glass',Icon:CloudRain}] as const).map(({id,label,Icon})=><button key={id} type="button" title={label} aria-label={label} aria-pressed={mode===id} onClick={()=>onChange(id)}><Icon size={15}/></button>)}
    <button type="button" title="Low power mode" aria-label="Low power mode" aria-pressed={lowPower} onClick={onLowPower}><Leaf size={15}/></button>
  </div></div>;
}
