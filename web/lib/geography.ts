import type { BoundingBox } from './types';
export type Position = [number, number];
export interface Country { type: 'Feature'; properties: { name: string; code: string }; geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Position[][] | Position[][][] } }
let countryPromise: Promise<Country[]> | undefined;
export function loadCountries(): Promise<Country[]> {
  if (!countryPromise) countryPromise = fetch('/geography/countries.json').then(r => { if (!r.ok) throw new Error('Country map unavailable'); return r.json(); }).then(data => data.features).catch(error => { countryPromise = undefined; throw error; });
  return countryPromise;
}
export const polygons = (country: Country): Position[][][] => country.geometry.type === 'Polygon' ? [country.geometry.coordinates as Position[][]] : country.geometry.coordinates as Position[][][];
export function countryBounds(country: Country): BoundingBox {
  const points = polygons(country).flat(2);
  const lons = points.map(p => (p[0] + 360) % 360).sort((a,b) => a-b);
  let gap = -1, index = 0;
  for (let i=0; i<lons.length; i++) { const next = i === lons.length-1 ? lons[0]+360 : lons[i+1]; if (next-lons[i]>gap) { gap=next-lons[i]; index=i; } }
  const wrap = (n:number) => n > 180 ? n-360 : n;
  const west = wrap(lons[(index+1)%lons.length]), east = wrap(lons[index]);
  // Antarctica spans every meridian; it must not lose a wedge to sparse coast vertices.
  return { south: Math.max(-90, Math.min(...points.map(p=>p[1]))), north: Math.min(90, Math.max(...points.map(p=>p[1]))), west: country.properties.code === 'ATA' ? -180 : west, east: country.properties.code === 'ATA' ? 180 : east };
}
export function containsPoint(country: Country, lon: number, lat: number): boolean {
  const insideRing = (ring: Position[]) => {
    // Unwrap sequential vertices, then move the query longitude into that interval.
    const unwrapped: Position[] = [];
    for (const point of ring) { let x=point[0]; const prev=unwrapped.at(-1)?.[0]; if (prev!==undefined) { while(x-prev>180) x-=360; while(x-prev< -180) x+=360; } unwrapped.push([x,point[1]]); }
    const center = unwrapped.reduce((s,p)=>s+p[0],0)/unwrapped.length;
    let x=lon; while(x-center>180) x-=360; while(x-center< -180) x+=360;
    let inside=false;
    for(let i=0,j=unwrapped.length-1;i<unwrapped.length;j=i++) { const a=unwrapped[i],b=unwrapped[j]; if((a[1]>lat)!==(b[1]>lat) && x<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]) inside=!inside; }
    return inside;
  };
  return polygons(country).some(poly=>insideRing(poly[0]) && !poly.slice(1).some(insideRing));
}
export function regionUrl(bbox: BoundingBox, country?: string): string {
  const params = new URLSearchParams(Object.entries(bbox).map(([k,v])=>[k,String(v)]));
  if(country) params.set('region',country);
  params.set('step','2');
  return `/?${params}`;
}
