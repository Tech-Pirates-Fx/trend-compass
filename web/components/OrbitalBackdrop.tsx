"use client";
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
export function OrbitalBackdrop(){
 const path=(usePathname()||'/'),video=useRef<HTMLVideoElement>(null);
 const [paused,setPaused]=useState(false),[quiet,setQuiet]=useState(true),[visible,setVisible]=useState(true),[failed,setFailed]=useState(false);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;const sync=()=>setQuiet(media.matches||Boolean(connection?.saveData));sync();media.addEventListener('change',sync);const visibility=()=>setVisible(!document.hidden);visibility();document.addEventListener('visibilitychange',visibility);try{setPaused(localStorage.getItem('tc-orbit-paused')==='true');}catch{}return()=>{media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility);};},[]);
 const moving=(path==='/'||path==='/play')&&!paused&&!quiet&&visible&&!failed;
 useEffect(()=>{if(!video.current)return;if(moving)video.current.play().catch(()=>setFailed(true));else video.current.pause();},[moving]);
 return <><div className="orbital-backdrop" aria-hidden="true"><video ref={video} muted playsInline loop preload={quiet?'none':'metadata'} poster="/video/orbital-galleon-poster.jpg" onError={()=>setFailed(true)}>{!quiet&&<source src="/video/orbital-galleon.mp4" type="video/mp4"/>}</video><div className="orbital-vignette"/><div className="ship-window"/></div>{path==='/'&&<button type="button" className="orbit-control" onClick={()=>{setPaused(p=>{try{localStorage.setItem('tc-orbit-paused',String(!p));}catch{}return !p;});}} aria-pressed={paused||quiet||failed}>{quiet?'Still sky · reduced motion/data':failed?'Still sky · video unavailable':paused?'▶ Resume orbital sky':'Ⅱ Pause orbital sky'}</button>}</>;
}
