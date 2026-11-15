import { ModeManifest } from '../types';

export const skyMode: ModeManifest = {
  id: 'sky',
  title: 'Sky Sentinel',
  tagline: 'Probe aerosol haze and test autocorrelated persistence',
  palette: {
    primary: '#bb9af7',
    secondary: '#f7768e',
    accent: '#ff9e64',
    background: '#181226',
    hudFrame: '#4e3370',
    text: '#e0d8f0'
  },
  hudFrameColor: '#4e3370',
  backgroundKey: '/voyage-art/bg-sky.png',
  cardKey: '/voyage-art/card-sky.png',
  sfxSet: 'dusk-static',
  tools: ['net', 'storm-serial', 'court-audit'],
  twist: 'Storm emphasis; Court includes OLS-versus-Hamed-Rao discrepancy check',
  datasetKeys: ['modis-aerosol'],
  caseIds: [],
  mentorIntro: [
    "Atmospheric haze lingers and drifts with serial autocorrelation.",
    "Standard OLS can be fooled; Hamed-Rao guards against false signals."
  ],
  shippable: false,
  statusLabel: 'DATA PENDING (AEROSOL GIOVANNI CSV)'
};
