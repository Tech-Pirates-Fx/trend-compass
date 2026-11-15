import { ModeManifest } from '../types';
import facts from './facts.json';

export const labMode: ModeManifest = {
  id: 'lab',
  title: 'Open Seas Research Lab',
  tagline: 'Full research suite: explore any region or upload custom data',
  palette: {
    primary: '#2ac3de',
    secondary: '#9ece6a',
    accent: '#e0af68',
    background: '#0f1722',
    hudFrame: '#2c4056',
    text: '#d5e2f0'
  },
  hudFrameColor: '#2c4056',
  backgroundKey: '/voyage-art/bg-lab.png',
  cardKey: '/voyage-art/card-lab.png',
  sfxSet: 'lab-terminal',
  tools: ['net', 'sails', 'compass', 'storm', 'court', 'export'],
  twist: 'Unrestricted regional exploration, all tools unlocked, and full export',
  datasetKeys: ['gistemp-v4', 'custom-csv'],
  caseIds: ['first-light'],
  mentorIntro: [
    "Welcome to the Research Lab, Captain.",
    "Here every tool is unlocked, and your complete findings export to CSV or JSON."
  ],
  shippable: true
};

export { facts as labFacts };
