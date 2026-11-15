import type { VariableMeta } from './types';
export function recordBounds(variable?:VariableMeta) {
  const c=variable?.temporal_coverage;
  return c&&/^\d{4}-\d{2}/.test(c.start)&&/^\d{4}-\d{2}/.test(c.end)?{start:c.start.slice(0,7),end:c.end.slice(0,7)}:undefined;
}
export function clampMonth(value:string|undefined,minimum:string,maximum:string) {const month=value?.slice(0,7);return month&&/^\d{4}-(0[1-9]|1[0-2])$/.test(month)?(month<minimum?minimum:month>maximum?maximum:month):minimum;}
export function monthCount(start:string,end:string) {if(!start||!end)return 0;return (Number(end.slice(0,4))-Number(start.slice(0,4)))*12+Number(end.slice(5,7))-Number(start.slice(5,7))+1;}
