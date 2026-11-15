import { SourcedFact } from '../modes/types';

export interface ResearchLogEntry {
  timestamp: string;
  modeId: string;
  caseId: string;
  dataset: string;
  bbox: { south: number; north: number; west: number; east: number };
  period: { start: string; end: string };
  playerEstimate: number;
  engineSenSlope: number;
  ci95: [number, number];
  hrPValue: number;
  engineVerdict: string;
  playerVerdict: string;
  confidence: string;
  score: number;
  trust: number;
  limitations: string[];
  mirageFound?: boolean;
}

const ATLAS_STORAGE_KEY = 'voyage-atlas-facts-v1';
const RESEARCH_LOG_STORAGE_KEY = 'voyage-research-log-v1';

export function saveFactToAtlas(fact: SourcedFact): void {
  try {
    const existing: SourcedFact[] = JSON.parse(localStorage.getItem(ATLAS_STORAGE_KEY) || '[]');
    if (!existing.some(f => f.id === fact.id)) {
      existing.push(fact);
      localStorage.setItem(ATLAS_STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {}
}

export function getAtlasFacts(): SourcedFact[] {
  try {
    return JSON.parse(localStorage.getItem(ATLAS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveResearchLog(entry: ResearchLogEntry): void {
  try {
    const existing: ResearchLogEntry[] = JSON.parse(localStorage.getItem(RESEARCH_LOG_STORAGE_KEY) || '[]');
    existing.push(entry);
    localStorage.setItem(RESEARCH_LOG_STORAGE_KEY, JSON.stringify(existing));
  } catch {}
}

export function getResearchLogs(): ResearchLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RESEARCH_LOG_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function exportResearchLogJSON(): void {
  const data = getResearchLogs();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voyage-research-log-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportResearchLogCSV(): void {
  const data = getResearchLogs();
  if (data.length === 0) {
    const emptyBlob = new Blob(['timestamp,modeId,caseId,playerEstimate,engineSenSlope,hrPValue,engineVerdict,playerVerdict,confidence,score\n'], { type: 'text/csv' });
    const emptyUrl = URL.createObjectURL(emptyBlob);
    const a = document.createElement('a');
    a.href = emptyUrl;
    a.download = `voyage-research-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(emptyUrl);
    return;
  }
  const headers = [
    'timestamp',
    'modeId',
    'caseId',
    'dataset',
    'south',
    'north',
    'west',
    'east',
    'periodStart',
    'periodEnd',
    'playerEstimate',
    'engineSenSlope',
    'ci95Lower',
    'ci95Upper',
    'hrPValue',
    'engineVerdict',
    'playerVerdict',
    'confidence',
    'score',
    'trust',
    'mirageFound'
  ];
  const rows = data.map(d => [
    d.timestamp,
    d.modeId,
    d.caseId,
    `"${d.dataset}"`,
    d.bbox.south,
    d.bbox.north,
    d.bbox.west,
    d.bbox.east,
    d.period.start,
    d.period.end,
    d.playerEstimate.toFixed(4),
    d.engineSenSlope.toFixed(4),
    d.ci95[0].toFixed(4),
    d.ci95[1].toFixed(4),
    d.hrPValue,
    d.engineVerdict,
    d.playerVerdict,
    d.confidence,
    d.score,
    d.trust,
    d.mirageFound ? 'true' : 'false'
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voyage-research-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
