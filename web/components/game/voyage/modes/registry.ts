import { ModeManifest, ModeId } from './types';
import { heatMode } from './heat/mode';
import { labMode } from './lab/mode';
import { rainMode } from './rain/mode';
import { oceanMode } from './ocean/mode';
import { greenMode } from './green/mode';
import { skyMode } from './sky/mode';
import { tideMode } from './tide/mode';

export const allModes: ModeManifest[] = [
  heatMode,
  rainMode,
  oceanMode,
  greenMode,
  skyMode,
  tideMode,
  labMode,
];

export function getModes(showAll = false): ModeManifest[] {
  if (showAll) {
    return allModes;
  }
  return allModes.filter((m) => m.shippable);
}

export function getModeById(id: string): ModeManifest | undefined {
  return allModes.find((m) => m.id === id);
}
