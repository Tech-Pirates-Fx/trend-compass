"use client";
import { useEffect, useId, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, Search, MapPin, AlertTriangle } from 'lucide-react';
import { Country, countryBounds, loadCountries, regionUrl } from '../lib/geography';
import { BoundingBox, getBBoxWidthDeg } from '../lib/types';
const Globe = dynamic(()=>import('./GlobeCanvas'),{ssr:false,loading:()=> <div className="globe-stage globe-loading"><span className="eyebrow">Unfurling the world map…</span></div>});
interface Props { value?: BoundingBox; onChange?: (bbox:BoundingBox,name?:string)=>void; landing?: boolean; lowPower?: boolean }
export function CountryExplorer({value,onChange,landing=false,lowPower=false}:Props) {
  const id=useId();
  const [countries,setCountries]=useState<Country[]>([]),[error,setError]=useState(''),[query,setQuery]=useState(''),[selected,setSelected]=useState<Country>();
  useEffect(()=>{let active=true;loadCountries().then(c=>{if(active)setCountries(c);}).catch(()=>{if(active)setError('Country boundaries could not load. The 2D map and numeric coordinates remain available in the investigation.');});return ()=>{active=false;};},[]);
  const selectedBounds=useMemo(()=>selected?countryBounds(selected):undefined,[selected]);
  const bbox=value||selectedBounds;
  const matches=countries.filter(c=>c.properties.name.toLowerCase().includes(query.toLowerCase()));
  function choose(country:Country) {setSelected(country);setQuery('');onChange?.(countryBounds(country),country.properties.name);}
  const fewCells=bbox && getBBoxWidthDeg(bbox)*(bbox.north-bbox.south)/4<4;
  return <div className={`country-explorer ${landing?'explorer-landing':''}`}>
    <div className="globe-coordinate top-coordinate"><span>EARTH / ORBITAL VIEW</span><span>01 — EXPLORE</span></div>
    <Globe countries={countries} selected={selected} bbox={bbox} onSelect={choose} lowPower={lowPower}/>
    <div className="country-search-panel glass-card">
      <div className="flex justify-between gap-2 items-center mb-3"><span className="eyebrow text-[var(--gold)]">Choose your coordinates</span><MapPin size={14} className="text-[var(--gold)]" aria-hidden="true"/></div>
      <label className="sr-only" htmlFor={`${id}-search`}>Search countries</label>
      <div className="country-search"><Search size={16} aria-hidden="true"/><input id={`${id}-search`} type="search" placeholder="Find a country…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <label className="sr-only" htmlFor={`${id}-country`}>Select country from search results</label>
      <select id={`${id}-country`} className="country-select" value={selected?.properties.code||''} onChange={e=>{const c=countries.find(c=>c.properties.code===e.target.value);if(c)choose(c);}}>
        <option value="">{countries.length?`${matches.length} countries · select one`:'Loading country map…'}</option>
        {selected&&!matches.includes(selected)&&<option value={selected.properties.code}>{selected.properties.name}</option>}
        {matches.map(c=><option key={c.properties.code} value={c.properties.code}>{c.properties.name}</option>)}
      </select>
      {!matches.length&&countries.length>0&&<p className="text-xs text-[var(--muted)] mt-2">No match at this map scale. Select your area with the 2D map or coordinates.</p>}
      {error&&<p role="alert" className="text-xs text-[var(--gold)] mt-2">{error}</p>}
      {selected&&<div className="selected-country" aria-live="polite"><span>{selected.properties.name}</span><span className="eyebrow">{selectedBounds?.south.toFixed(1)}° to {selectedBounds?.north.toFixed(1)}°</span></div>}
      <p className="text-[11px] leading-relaxed text-[var(--muted)] mt-3">Country selection uses a bounding box, not the exact outline. Islands may widen it. Small countries may be absent at this map scale.</p>
      {fewCells&&<p className="text-xs text-[var(--gold)] mt-2 flex gap-2"><AlertTriangle size={14} className="shrink-0"/>Selection covers fewer than about four 2° grid cells. Try a wider box.</p>}
      {landing&&<Link href={bbox?regionUrl(bbox,selected?.properties.name):'/play'} className="country-continue">{selected?`Play in ${selected.properties.name}`:'Start playing · choose a destination'}<ArrowUpRight size={15}/></Link>}
    </div>
    <p className="geography-credit">Made with Natural Earth · public-domain country boundaries</p>
  </div>;
}

