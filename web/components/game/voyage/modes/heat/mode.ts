import { ModeManifest } from '../types';
import facts from './facts.json';

export const heatMode: ModeManifest = {
  id: 'heat',
  title: 'Sea of Time',
  tagline: 'Sail across four decades of global thermal anomalies',
  palette: {
    primary: '#f6c76a',
    secondary: '#70d5ba',
    accent: '#ff9d42',
    background: '#071c2c',
    hudFrame: '#bb8648',
    text: '#fff2cf'
  },
  hudFrameColor: '#bb8648',
  backgroundKey: '/voyage-art/bg-heat.png',
  cardKey: '/voyage-art/card-heat.png',
  sfxSet: 'ember-sea',
  tools: ['net', 'compass', 'storm', 'court'],
  twist: 'Net with Mirage reveals deceptive short windows within long-term warming',
  datasetKeys: ['gistemp-v4'],
  caseIds: ['first-light'],
  mentorIntro: [
    "Welcome aboard, Captain. I'm First Mate Piper.",
    "We sail the Sea of Time using real NASA GISTEMP temperature anomaly observations."
  ],
  shippable: true
};

export { facts as heatFacts };
