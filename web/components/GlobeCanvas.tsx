"use client";
import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, Pause, Play } from 'lucide-react';
import { Country, containsPoint, polygons, Position } from '../lib/geography';
import { BoundingBox, getBBoxCenter } from '../lib/types';
import {useDataControl} from './DataControl';
import { createEarthTexture } from '../lib/earth-texture';

interface Props { countries: Country[]; selected?: Country; bbox?: BoundingBox; onSelect: (country: Country) => void; lowPower?: boolean }
const rad=Math.PI/180;
export default function GlobeCanvas({countries,selected,bbox,onSelect,lowPower=false}:Props) {
  const {inventory}=useDataControl();const imageryAllowed=Boolean(inventory?.controls.enabled&&inventory.controls.nasa_imagery);
  const canvas=useRef<HTMLCanvasElement>(null);
  const view=useRef({lon:45,lat:18,zoom:1});
  const drag=useRef<{x:number;y:number;lon:number;lat:number;moved:boolean}|null>(null);
  const [hover,setHover]=useState('');
  const hoverCode=useRef('');
  const [paused,setPaused]=useState(false);
  const [unavailable,setUnavailable]=useState(false);
  const [textureAvailable,setTextureAvailable]=useState(false);
  const invalidate=useRef(()=>{});
  const data=useRef({countries,selected,bbox,onSelect}); data.current={countries,selected,bbox,onSelect};
  useEffect(()=>{ if(bbox) { const center=getBBoxCenter(bbox); view.current.lon=center.lon; view.current.lat=Math.max(-70,Math.min(70,center.lat)); setPaused(true); invalidate.current(); } },[bbox]);
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d');
    if(!el||!ctx) {setUnavailable(true);return;}
    let width=0,height=0,frame=0,last=0,dirty=true;
    setTextureAvailable(false);
    const texture=lowPower||!imageryAllowed?null:createEarthTexture(()=>{setTextureAvailable(true);dirty=true;});
    if(lowPower)setTextureAvailable(false);
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const mediaChange=()=>{dirty=true;}; motion.addEventListener('change',mediaChange);
    const themeObserver=new MutationObserver(()=>{dirty=true;}); themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    const resize=new ResizeObserver(()=>{ const rect=el.getBoundingClientRect(); width=rect.width;height=rect.height; const dpr=Math.min(window.devicePixelRatio||1,lowPower?1:1.5); el.width=Math.round(width*dpr);el.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);dirty=true; }); resize.observe(el);
    invalidate.current=()=>{dirty=true;};
    function draw(now:number) {
      frame=requestAnimationFrame(draw);
      if(document.hidden||width===0||now-last< (lowPower?100:33)) return;
      const rotating=!paused&&!lowPower&&!motion.matches&&!drag.current;
      const elapsed=Math.min(100,now-(last||now));last=now;
      if(rotating) {view.current.lon+=elapsed*.0017;dirty=true;}
      if(!dirty)return;dirty=false;
      const dark=document.documentElement.classList.contains('dark');
      const cx=width/2,cy=height/2,r=Math.min(width,height)*.375*view.current.zoom;
      const lon0=view.current.lon*rad,lat0=view.current.lat*rad,cs=Math.cos(lat0),sn=Math.sin(lat0);
      function xyz(p:Position) { const lat=p[1]*rad,d=p[0]*rad-lon0,c=Math.cos(lat);return [c*Math.sin(d),cs*Math.sin(lat)-sn*c*Math.cos(d),sn*Math.sin(lat)+cs*c*Math.cos(d)]; }
      function line(points:Position[], color:string, lineWidth=.55) {
        if(!ctx)return;ctx.beginPath();let pen=false;
        for(const point of points) {const p=xyz(point);if(p[2]<0){pen=false;continue;}const x=cx+r*p[0],y=cy-r*p[1];if(!pen)ctx.moveTo(x,y);else ctx.lineTo(x,y);pen=true;}ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();
      }
      ctx!.clearRect(0,0,width,height);
      const aura=ctx!.createRadialGradient(cx,cy,r*.93,cx,cy,r*1.22);aura.addColorStop(0,'rgba(95,221,207,.12)');aura.addColorStop(.4,'rgba(90,200,201,.07)');aura.addColorStop(1,'rgba(90,200,201,0)');ctx!.fillStyle=aura;ctx!.fillRect(0,0,width,height);
      ctx!.save();ctx!.beginPath();ctx!.arc(cx,cy,r,0,Math.PI*2);ctx!.clip();
      const ocean=ctx!.createRadialGradient(cx-r*.4,cy-r*.45,r*.05,cx+r*.3,cy+r*.3,r*1.3);ocean.addColorStop(0,dark?'#164653':'#b6dcd7');ocean.addColorStop(.65,dark?'#0a2936':'#6dafa9');ocean.addColorStop(1,dark?'#030d17':'#286d75');ctx!.fillStyle=ocean;ctx!.fillRect(0,0,width,height);
      const photograph=texture?.render(width,height,r,view.current.lon,view.current.lat,Math.min(window.devicePixelRatio||1,1.5));if(photograph)ctx!.drawImage(photograph,0,0,width,height);
      for(let lat=-75;lat<=75;lat+=15)line(Array.from({length:181},(_,i)=>[-180+i*2,lat] as Position),dark?'rgba(133,210,209,.13)':'rgba(15,74,79,.2)');
      for(let lon=-180;lon<180;lon+=15)line(Array.from({length:91},(_,i)=>[lon,-90+i*2] as Position),dark?'rgba(133,210,209,.13)':'rgba(15,74,79,.2)');
      for(const country of data.current.countries) {
        const active=country.properties.code===data.current.selected?.properties.code;
        const hovered=country.properties.code===hoverCode.current;
        for(const polygon of polygons(country)) {
          ctx!.beginPath();
          for(const ring of polygon) {
            const vertices=ring.map(xyz),clipped:number[][]=[];
            for(let i=0;i<vertices.length;i++) {const a=vertices[(i+vertices.length-1)%vertices.length],b=vertices[i];if((a[2]>=0)!==(b[2]>=0)) {const t=a[2]/(a[2]-b[2]);let x=a[0]+t*(b[0]-a[0]),y=a[1]+t*(b[1]-a[1]);const l=Math.hypot(x,y);x/=l;y/=l;clipped.push([x,y,0]);}if(b[2]>=0)clipped.push(b);}
            if(clipped.length<3)continue;
            clipped.forEach((p,i)=>{const prev=clipped[(i+clipped.length-1)%clipped.length];if(i===0)ctx!.moveTo(cx+r*p[0],cy-r*p[1]);else if(p[2]===0&&prev[2]===0){const a=Math.atan2(-prev[1],prev[0]),b=Math.atan2(-p[1],p[0]),delta=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;ctx!.arc(cx,cy,r,a,a+delta,delta<0);}else ctx!.lineTo(cx+r*p[0],cy-r*p[1]);});const first=clipped[0],last=clipped[clipped.length-1];if(first[2]===0&&last[2]===0){const a=Math.atan2(-last[1],last[0]),b=Math.atan2(-first[1],first[0]),delta=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;ctx!.arc(cx,cy,r,a,a+delta,delta<0);}ctx!.closePath();
          }
          ctx!.fillStyle=photograph?(active?'rgba(232,194,132,.3)':hovered?'rgba(142,227,206,.2)':'rgba(0,0,0,0)'):active?(dark?'#d4b774':'#8d662c'):hovered?(dark?'#619a89':'#a7c994'):(dark?'#39716e':'#c0d7b9');ctx!.fill('evenodd');
          ctx!.strokeStyle=active?'#ffe0a0':dark?'rgba(143,201,178,.42)':'rgba(34,87,76,.48)';ctx!.lineWidth=active?1.25:.5;ctx!.stroke();
        }
      }
      if(data.current.bbox) { const b=data.current.bbox,e=b.east<b.west?b.east+360:b.east,points:Position[]=[];for(let i=0;i<=60;i++)points.push([b.west+(e-b.west)*i/60,b.south]);for(let i=0;i<=30;i++)points.push([e,b.south+(b.north-b.south)*i/30]);for(let i=60;i>=0;i--)points.push([b.west+(e-b.west)*i/60,b.north]);for(let i=30;i>=0;i--)points.push([b.west,b.south+(b.north-b.south)*i/30]);line(points,dark?'#ffe0a0':'#5c3d00',1.5); }
      const shade=ctx!.createLinearGradient(cx-r,cy-r,cx+r,cy+r*.5);shade.addColorStop(0,'rgba(129,228,214,.06)');shade.addColorStop(.5,'rgba(0,5,15,0)');shade.addColorStop(1,dark?'rgba(0,5,15,.82)':'rgba(0,34,53,.4)');ctx!.fillStyle=shade;ctx!.fillRect(0,0,width,height);ctx!.restore();
      ctx!.beginPath();ctx!.arc(cx,cy,r,0,Math.PI*2);ctx!.strokeStyle=dark?'rgba(139,229,220,.45)':'rgba(26,94,88,.4)';ctx!.lineWidth=1;ctx!.stroke();
      // Instrument ring, ticks and cardinal references are decorative, never observations.
      ctx!.strokeStyle=dark?'rgba(141,187,183,.2)':'rgba(23,76,76,.25)';ctx!.lineWidth=.6;
      ctx!.beginPath();ctx!.ellipse(cx,cy,r*1.14,r*.92,-.38,0,Math.PI*2);ctx!.stroke();
      for(let a=0;a<360;a+=5) {const q=a*rad,out=r*1.075,inner=out-(a%30===0?8:3);ctx!.beginPath();ctx!.moveTo(cx+Math.sin(q)*inner,cy+Math.cos(q)*inner);ctx!.lineTo(cx+Math.sin(q)*out,cy+Math.cos(q)*out);ctx!.stroke();}
    }
    frame=requestAnimationFrame(draw);
    const wheel=(event:WheelEvent)=>{event.preventDefault();view.current.zoom=Math.min(1.65,Math.max(.78,view.current.zoom-event.deltaY*.001));dirty=true;};el.addEventListener('wheel',wheel,{passive:false});
    return ()=>{texture?.dispose();cancelAnimationFrame(frame);resize.disconnect();themeObserver.disconnect();motion.removeEventListener('change',mediaChange);el.removeEventListener('wheel',wheel);};
  },[paused,lowPower,imageryAllowed]);
  useEffect(()=>{invalidate.current();},[countries,selected,bbox]);
  function hit(clientX:number,clientY:number) {
    const rect=canvas.current!.getBoundingClientRect(),r=Math.min(rect.width,rect.height)*.375*view.current.zoom;
    const x=(clientX-rect.left-rect.width/2)/r,y=-(clientY-rect.top-rect.height/2)/r;
    if(x*x+y*y>1)return;
    const z=Math.sqrt(1-x*x-y*y),lat0=view.current.lat*rad;
    const lat=Math.asin(y*Math.cos(lat0)+z*Math.sin(lat0))/rad;
    let lon=view.current.lon+Math.atan2(x,z*Math.cos(lat0)-y*Math.sin(lat0))/rad;lon=((lon+180)%360+360)%360-180;
    return countries.find(country=>containsPoint(country,lon,lat));
  }
  return <div className="globe-stage">
    {unavailable?<div className="globe-unavailable">Globe rendering is unavailable. Use country search or the 2D map below.</div>:<canvas ref={canvas} className="earth-canvas" role="img" aria-label="Interactive globe. Drag to rotate, scroll to zoom. Use the country search below for keyboard selection."
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,lon:view.current.lon,lat:view.current.lat,moved:false};}}
      onPointerMove={e=>{const d=drag.current;if(d){const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>5)d.moved=true;view.current.lon=d.lon-dx*.32;view.current.lat=Math.min(80,Math.max(-80,d.lat+dy*.25));invalidate.current();}else {const c=hit(e.clientX,e.clientY);setHover(c?.properties.name||'');if(hoverCode.current!==(c?.properties.code||'')){hoverCode.current=c?.properties.code||'';invalidate.current();}}}}
      onPointerUp={e=>{const d=drag.current;drag.current=null;if(d&&!d.moved){const country=hit(e.clientX,e.clientY);if(country){setPaused(true);onSelect(country);}}}}
      onPointerCancel={()=>{drag.current=null;}} onPointerLeave={()=>{setHover('');hoverCode.current='';invalidate.current();}} />}
    <span className="globe-image-credit">{textureAvailable?"NASA GIBS · Blue Marble imagery":"Illustrative vector globe"}</span>
    <div className="globe-hover" aria-live="polite">{hover||selected?.properties.name||'Drag to explore · scroll to zoom'}</div>
    <div className="globe-controls">
      <button type="button" aria-label="Zoom in" onClick={()=>{view.current.zoom=Math.min(1.65,view.current.zoom+.15);invalidate.current();}}><Plus size={16}/></button>
      <button type="button" aria-label="Zoom out" onClick={()=>{view.current.zoom=Math.max(.78,view.current.zoom-.15);invalidate.current();}}><Minus size={16}/></button>
      <button type="button" aria-label="Reset globe view" onClick={()=>{view.current={lon:45,lat:18,zoom:1};invalidate.current();}}><RotateCcw size={15}/></button>
      <button type="button" aria-label={paused?'Enable globe rotation':'Pause globe rotation'} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>
    </div>
  </div>;
}


