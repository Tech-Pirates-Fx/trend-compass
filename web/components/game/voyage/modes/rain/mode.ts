import { ModeManifest } from '../types';

export const rainMode: ModeManifest = {
  id: 'rain',
  title: 'Monsoon Signal',
  tagline: 'Disentangle seasonal rainfall surges from long-term trends',
  palette: {
    primary: '#7aa2f7',
    secondary: '#a9b1d6',
    accent: '#7dcfff',
    background: '#0e1726',
    hudFrame: '#3b5998',
    text: '#c0caf5'
  },
  hudFrameColor: '#3b5998',
  backgroundKey: '/voyage-art/bg-rain.png',
  cardKey: '/voyage-art/card-rain.png',
  sfxSet: 'monsoon-rain',
  tools: ['sails', 'net', 'compass', 'storm', 'court'],
  twist: 'Sails tool is central; avoid the "one wet month is not a trend" trap',
  datasetKeys: ['gpcp-v2.3'],
  caseIds: [],
  mentorIntro: [
    "Heads up, Captain! Rain surges with seasons.",
    "We must calm the seasonal sails before hunting true trends."
  ],
  shippable: false,
  statusLabel: 'DATA PENDING (GPCP PROVENANCE)'
};
