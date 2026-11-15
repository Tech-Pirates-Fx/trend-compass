export type ModeId = 'heat' | 'rain' | 'ocean' | 'green' | 'sky' | 'tide' | 'lab';

export interface SourcedFact {
  id: string;
  text: string;
  sourceUrl: string;
  sourceTitle: string;
  retrievedDate: string;
}

export interface ModePalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  hudFrame: string;
  text: string;
}

export interface ModeManifest {
  id: ModeId;
  title: string;
  tagline: string;
  palette: ModePalette;
  hudFrameColor: string;
  backgroundKey: string;
  cardKey: string;
  sfxSet: string;
  tools: string[];
  twist: string;
  datasetKeys: string[];
  caseIds: string[];
  mentorIntro: string[];
  shippable: boolean;
  statusLabel?: string;
}
