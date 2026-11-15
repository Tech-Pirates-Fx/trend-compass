import type { BoundingBox, AnalyzeResponse } from "../../lib/types";

export type GameLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ExpeditionType = "heat" | "flood" | "drought" | "canopy" | "ocean";
export type PredictionChoice = "rising" | "falling" | "no_significant" | "unsure" | "yes" | "no" | "";

export interface PresetHotspot {
  id: string;
  name: string;
  flag: string;
  tag: string;
  bbox: BoundingBox;
}

export interface HonestOutcome {
  badgeName: string;
  badgeIcon: string;
  points: number;
  title: string;
  commentary: string;
  verdictState: "win" | "close_call" | "prudent";
  verdictBanner: string;
  verdictSubtitle: string;
}
