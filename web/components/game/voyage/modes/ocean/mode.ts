import { ModeManifest } from '../types';

export const oceanMode: ModeManifest = {
  id: 'ocean',
  title: 'Deep Current',
  tagline: 'Submerge into dual ocean basins and compare marine trends',
  palette: {
    primary: '#2ac3de',
    secondary: '#73daca',
    accent: '#0db9d7',
    background: '#081e28',
    hudFrame: '#164855',
    text: '#b4f9f8'
  },
  hudFrameColor: '#164855',
  backgroundKey: '/voyage-art/bg-ocean.png',
  cardKey: '/voyage-art/card-ocean.png',
  sfxSet: 'deep-sub',
  tools: ['net-dual', 'compass', 'storm', 'court-compare'],
  twist: 'Two-basin comparison requiring differential claim in court',
  datasetKeys: ['ersst-v5'],
  caseIds: [],
  mentorIntro: [
    "Diving deep, Captain. Compare two ocean basins side by side.",
    "One basin may warm while another stays resilient."
  ],
  shippable: false,
  statusLabel: 'DATA PENDING (ERSST GRID)'
};
