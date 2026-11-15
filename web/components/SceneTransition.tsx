"use client";
import {useEffect,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
export function SceneTransition(){
 const router=useRouter(),path=(usePathname()||'/');const [travel,setTravel]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>setTravel(false),180);return()=>clearTimeout(timer);},[path]);
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>;let fallback:ReturnType<typeof setTimeout>;function navigate(event:MouseEvent){const a=(event.target as Element)?.closest?.('a');if(!a||a.target||a.hasAttribute('download')||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname||url.hash)return;event.preventDefault();setTravel(true);timer=setTimeout(()=>router.push(url.pathname+url.search),matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);fallback=setTimeout(()=>setTravel(false),5000);}document.addEventListener('click',navigate,true);return()=>{document.removeEventListener('click',navigate,true);clearTimeout(timer);clearTimeout(fallback);};},[router]);
 return travel?<div className="scene-wipe" role="status"><span className="loading-compass"/><p>Plotting your course…</p></div>:null;
}
