"use client";
import { useEffect, useState } from 'react';
import { useDataControl } from './DataControl';
import { checkHealth } from '../lib/api';
import { Radio, AlertTriangle, CircleHelp } from 'lucide-react';
export function DataStatus() {
  const {inventory,error}=useDataControl();
  const [status,setStatus]=useState<'loading'|'mock'|'real'|'verified'|'offline'>('loading');
  useEffect(()=>{let active=true;checkHealth().then(h=>{if(active)setStatus(h.is_mock?'mock':h.verified?'verified':'real');}).catch(()=>{if(active)setStatus('offline');});return ()=>{active=false;};},[]);
  const label={loading:'Checking data connection',mock:'Simulation mode · not NASA measurements',real:'Observation adapter connected · check dataset provenance',verified:'Official NASA observations connected',offline:'Data service unavailable · explore the map freely'}[status];
  const Icon=status==='mock'?AlertTriangle:(status==='real'||status==='verified')?Radio:CircleHelp;
  return <span className={`data-status ${status==='mock'?'status-warning':''}`} role="status"><Icon size={13} aria-hidden="true"/>{error?'Data control service unavailable':inventory&&!inventory.can_play?'Mission data disabled or unavailable':label}</span>;
}

