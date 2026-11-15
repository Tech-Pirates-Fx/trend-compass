import { BoundingBox } from './types';
export interface PresetRegion { id:string; name:string; description:string; bbox:BoundingBox; recommendedVariable?:string; badge?:string }
export const PRESET_REGIONS:PresetRegion[]=[
  {id:'western-arctic',name:'Western Arctic',description:'Explore this northern regional box.',bbox:{south:68,west:-160,north:75,east:-130}},
  {id:'east-antarctic',name:'East Antarctic',description:'Explore this southern regional box.',bbox:{south:-75,west:60,north:-65,east:100}},
  {id:'bering-strait',name:'Bering Strait',description:'A selection crossing the international date line.',bbox:{south:62,west:165,north:72,east:-160},badge:'Crosses 180°'},
  {id:'sahel',name:'Sahel',description:'Explore this northern African regional box.',bbox:{south:12,west:-15,north:18,east:15}},
  {id:'amazon-basin',name:'Amazon region',description:'Explore this South American regional box.',bbox:{south:-10,west:-70,north:2,east:-55}},
  {id:'mediterranean',name:'Mediterranean',description:'Explore this regional land and ocean box.',bbox:{south:34,west:-5,north:44,east:25}},
];
