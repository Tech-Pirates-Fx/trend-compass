/**
 * PiperDialogueManager - Centralized companion narrative script, typewriter progression, pose state, and ed-tech mascot facts
 */

import type { GameLevel, PredictionChoice, ExpeditionType } from "./types";
import { GameAudioManager } from "./GameAudioManager";

type Listener = () => void;

class DialogueState {
  private static instance: DialogueState;

  private currentBeat: number = 0;
  private listeners: Set<Listener> = new Set();

  private constructor() {}

  public static getInstance(): DialogueState {
    if (!DialogueState.instance) {
      DialogueState.instance = new DialogueState();
    }
    return DialogueState.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getBeat(): number {
    return this.currentBeat;
  }

  public setBeat(beat: number): void {
    this.currentBeat = beat;
    this.notify();
  }

  public resetBeat(): void {
    this.currentBeat = 0;
    this.notify();
  }

  public advanceBeat(maxBeats: number): boolean {
    if (this.currentBeat < maxBeats - 1) {
      GameAudioManager.playSound("typewriter");
      this.currentBeat += 1;
      this.notify();
      return true;
    }
    return false;
  }

  public getDialogueLines(
    level: GameLevel,
    targetName: string,
    isTargetLocked: boolean,
    prediction: PredictionChoice,
    hasAnalysisData: boolean,
    expedition?: ExpeditionType
  ): string[] {
    switch (level) {
      case 0:
        return [];
      case 1:
        return [
          "Hello, I am Piper! Chief Navigator aboard Trend Compass.",
          "Our planetary systems are undergoing historic climate shifts.",
          "We must investigate real NASA satellite data from GISTEMP and GPCP!",
          "Press Skip or Click Continue below to enter the Crisis Scenarios!",
        ];
      case 2:
        return [
          "Welcome to the Crisis Scenarios Hub, Navigator!",
          "Five critical planetary realms require our immediate investigation.",
          "Select Heat, Flood, Drought, Canopy & Harvest, or Ocean Currents above!",
        ];
      case 3:
        if (isTargetLocked) {
          return [
            `Target locked on ${targetName}! Coordinates calibrated.`,
            "Review the regional coordinates, then click LOCK TARGET & PROCEED!",
          ];
        }
        return [
          "Examine our planetary astrolabe and select a hotspot beacon!",
          "Or spin the 3D globe to pick any territory for satellite analysis.",
        ];
      case 4:
        if (prediction) {
          const displayChoice =
            prediction === "yes"
              ? "YES (AFFIRMATIVE)"
              : prediction === "no"
              ? "NO (NATURAL VARIABILITY)"
              : prediction.toUpperCase().replace("_", " ");
          return [
            `Hypothesis logged: ${displayChoice}!`,
            "Calibrating sensors to verify against NASA observational archives...",
          ];
        }
        return [
          `NASA Prediction Challenge for ${targetName}:`,
          "Will long-term observational records reveal a statistically significant trend here? YES or NO?",
        ];
      case 5:
        if (hasAnalysisData) {
          return [
            "Analysis complete! High-precision NASA NetCDF observations downloaded.",
            "Preparing the empirical discovery deck...",
          ];
        }
        return [
          "Connecting to NASA observation telemetry...",
          `Streaming satellite records for ${targetName}...`,
          "Computing Theil-Sen slope and Hamed-Rao modified Mann-Kendall test...",
        ];
      case 6:
        return [
          "Empirical Discovery Complete, Navigator!",
          "Review the four scientific answers and your verified research badge below.",
          "You can export your complete scientific research log to CSV or JSON!",
        ];
      default:
        return ["Ready at the helm, Navigator!"];
    }
  }

  public getGuideFact(expedition: ExpeditionType): string {
    switch (expedition) {
      case "flood":
        return "NASA GPCP v2.3 and GPM IMERG merge geostationary infrared satellite imagery with polar microwave sounders across 574 months, corroborated by CSA RADARSAT.";
      case "drought":
        return "NASA GES DISC Data Rods track NLDAS/GLDAS root-zone soil moisture deficits alongside GRACE-FO twin satellite gravitational aquifer measurements.";
      case "canopy":
        return "NASA AppEEARS streams MODIS MOD13C2 vegetation indices (NDVI) at 0.05° resolution, tracking canopy stress and crop yields across global breadbaskets.";
      case "ocean":
        return "NASA Sea Level Change Portal satellite altimetry (TOPEX, Jason, Sentinel-6) tracks global sea surface height variations alongside MUR SST thermohaline records.";
      case "heat":
      default:
        return "NASA GISTEMP v4 combines over 26,000 meteorological stations with NOAA CDO benchmarks into a verified 2°×2° anomaly grid spanning 1880–2026.";
    }
  }

  public getPiperPose(level: GameLevel): string {
    if (level === 6) {
      return "/mascot/piper-fullbody-discovery.png";
    }
    if (level === 4 || level === 5) {
      return "/mascot/piper-fullbody-thinking.png";
    }
    return "/mascot/piper-fullbody-intro.png";
  }
}

export const PiperDialogueManager = DialogueState.getInstance();
