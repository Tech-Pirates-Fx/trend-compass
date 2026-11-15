import { ModeManifest } from '../types';

export const tideMode: ModeManifest = {
  id: 'tide',
  title: 'Lighthouse',
  tagline: 'Watch coastal sea-level confidence beams narrow',
  palette: {
    primary: '#7dcfff',
    secondary: '#c0caf5',
    accent: '#e0af68',
    background: '#0f1f33',
    hudFrame: '#3d6388',
    text: '#e8f2fc'
  },
  hudFrameColor: '#3d6388',
  backgroundKey: '/voyage-art/bg-tide.png',
  cardKey: '/voyage-art/card-tide.png',
  sfxSet: 'coastal-dawn',
  tools: ['net-expanding', 'compass', 'court'],
  twist: 'Extend Net and watch confidence beam narrow to find minimal window',
  datasetKeys: ['nasa-sea-level'],
  caseIds: [],
  mentorIntro: [
    "Welcome to the Lighthouse station, Captain.",
    "Our goal: find the shortest observation window with a verified verdict."
  ],
  shippable: false,
  statusLabel: 'DATA PENDING (SEA LEVEL FILE)'
};
