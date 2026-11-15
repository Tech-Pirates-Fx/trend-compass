import { ModeManifest } from '../types';

export const greenMode: ModeManifest = {
  id: 'green',
  title: 'Green Pulse',
  tagline: 'Track Earth vegetation cycles and harvest trends',
  palette: {
    primary: '#9ece6a',
    secondary: '#e0af68',
    accent: '#73daca',
    background: '#0a1d12',
    hudFrame: '#2e5e3b',
    text: '#cfc9c2'
  },
  hudFrameColor: '#2e5e3b',
  backgroundKey: '/voyage-art/bg-green.png',
  cardKey: '/voyage-art/card-green.png',
  sfxSet: 'forest-pulse',
  tools: ['sails', 'compass', 'storm', 'court'],
  twist: 'Strong seasonality; Compass only counts after Sails',
  datasetKeys: ['modis-ndvi'],
  caseIds: [],
  mentorIntro: [
    "Look at that planetary canopy breathing each spring, Captain.",
    "Only after flattening the seasonal pulse can we detect the true harvest."
  ],
  shippable: false,
  statusLabel: 'DATA PENDING (NDVI GIOVANNI CSV)'
};
