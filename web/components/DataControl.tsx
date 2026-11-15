"use client";
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import Link from 'next/link';
import type {VariableMeta} from '../lib/types';
export type Controls = {
  enabled: boolean;
  gistemp: boolean;
  gpcp: boolean;
  sea_level: boolean;
  appeears: boolean;
  data_rods: boolean;
  giovanni: boolean;
  noaa_cdo: boolean;
  knmi: boolean;
  swot: boolean;
  radarsat: boolean;
  earth_info: boolean;
  instruments: boolean;
  global_table: boolean;
  saved_voyages: boolean;
  nasa_imagery: boolean;
};
export type Inventory={controls:Controls;variables:VariableMeta[];files:{name:string;bytes:number;role:string}[];can_play:boolean;store_error:string|null;admin_scope:string;services:{name:string;route:string;source:string}[]};
const Context=createContext<{inventory:Inventory|null;error:string;refresh:()=>Promise<void>}>({inventory:null,error:'',refresh:async()=>{}});
export async function fetchInventory(){const response=await fetch('/api/py/data-management',{cache:'no-store'});if(!response.ok)throw Error('Data control service unavailable. Start the backend to check enabled sources.');return await response.json() as Inventory;}
export function DataControlProvider({children}:{children:ReactNode}){
 const [inventory,setInventory]=useState<Inventory|null>(null),[error,setError]=useState('');
 const refresh=useCallback(async()=>{try{setInventory(await fetchInventory());setError('');}catch(e){setInventory(null);setError(e instanceof Error?e.message:'Data control unavailable');}},[]);
 useEffect(()=>{refresh();const timer=setInterval(refresh,5000);const focus=()=>refresh();window.addEventListener('focus',focus);return()=>{clearInterval(timer);window.removeEventListener('focus',focus);};},[refresh]);
 return <Context.Provider value={{inventory,error,refresh}}>{children}</Context.Provider>;
}
export const useDataControl=()=>useContext(Context);
export function DataGate({children,saved=false}:{children:ReactNode;saved?:boolean}){
 const {inventory,error,refresh}=useDataControl();
 const enabled=inventory?.controls.enabled&&(saved?inventory.controls.saved_voyages:inventory.can_play);
 if(enabled)return <>{children}</>;
 return <section className="data-locked"><span className="eyebrow">SHIP SYSTEMS / DATA LOCK</span><h1>{inventory?'Mission offline.':'Checking the ship’s data…'}</h1><p>{error||(!inventory?'Confirming which observation sources are available.':saved?'Saved voyages are switched off. Enable them in Data Management.':'No observation data is enabled for this mission. Enable NASA temperature data in Data Management to start playing.')}</p><div><Link className="voyage-button" href="/data">Open Data Management</Link><button className="secondary-cta" type="button" onClick={refresh}>Check again</button></div></section>;
}
