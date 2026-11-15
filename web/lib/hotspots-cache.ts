/**
 * Hotspots Cache & Fallback Matcher
 * Provides verified NASA GISTEMP v4 & GPCP v2.3 analysis results for deployed platforms (Vercel)
 * where the backend service may not be running locally or is cold-starting.
 */

import type { AnalyzeRequest, AnalyzeResponse } from "./types";
import gameHotspotsData from "../public/demo/game-hotspots.json";

const HOTSPOTS: Record<string, AnalyzeResponse> = gameHotspotsData as unknown as Record<string, AnalyzeResponse>;

export function matchVerifiedHotspot(req: AnalyzeRequest): AnalyzeResponse {
  return matchExactHotspot(req);
}

function matchExactHotspot(req: AnalyzeRequest): AnalyzeResponse {
  for (const value of Object.values(HOTSPOTS)) {
    const dates = value.raw_timeseries.map(p => p.t.slice(0, 7)).sort();
    if (value.is_mock || value.provenance?.verified !== true ||
        value.variable.id !== req.variable_id || value.resolution !== (req.resolution || "monthly") ||
        value.deseasonalize_applied !== Boolean(req.deseasonalize) ||
        (req.alpha !== undefined && req.alpha !== 0.05) ||
        dates[0] !== req.start || dates[dates.length - 1] !== req.end) continue;
    if ((["south", "north", "west", "east"] as const).every(k => value.bbox[k] === req.bbox[k])) {
      return JSON.parse(JSON.stringify(value)) as AnalyzeResponse;
    }
  }
  throw new Error("No saved observation matches this exact variable, region, period and analysis configuration.");
}

export function getVerifiedHotspots(): Record<string, AnalyzeResponse> {
  return HOTSPOTS;
}
