"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Compass,
  Crosshair,
  Volume2,
  VolumeX,
  Menu,
  ChevronRight,
  TrendingUp,
  MapPin,
  BarChart3,
  ShieldCheck,
  Radio,
  Download,
  X,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import type { GameLevel, ExpeditionType, PredictionChoice, PresetHotspot } from "./types";
import { MissionManager } from "./MissionManager";
import { GameProgressManager } from "./GameProgressManager";
import { PiperDialogueManager } from "./PiperDialogueManager";
import { NASAAnalysisManager } from "./NASAAnalysisManager";
import { DiscoveryManager } from "./DiscoveryManager";
import { GameAudioManager } from "./GameAudioManager";
import {
  HeatIllustration,
  FloodIllustration,
  DroughtIllustration,
  GreenCoverIllustration,
  OceanWarmingIllustration,
} from "../ArcadeArt";
import { ScenicPixelLandscape } from "../ScenicPixelLandscape";
import { TimeSeriesChart } from "../TimeSeriesChart";
import { StatsDetailsTable } from "../StatsDetailsTable";
import { ProvenancePanel } from "../VoyageUI";
import { VoyageLogModal, saveVoyageEntry } from "../VoyageLogModal";
import type { Country } from "../../lib/geography";
import { countryBounds, loadCountries } from "../../lib/geography";
import type { AnalyzeResponse } from "../../lib/types";
import { PlayerStatsManager, type PlayerCareerStats } from "../../lib/player-stats";
import { PlayerDossierModal } from "../PlayerDossierModal";

// Dynamic import of Three.js / Canvas 2D GlobeCanvas
const GlobeCanvas = dynamic(() => import("../GlobeCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-teal-300 font-mono text-xs gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
      <span className="tracking-widest uppercase">Projecting Planetary Astrolabe…</span>
    </div>
  ),
});

export function GameEngine({ initialLevel }: { initialLevel?: GameLevel } = {}) {
  // Synchronized state with Managers
  const [level, setLevelState] = useState<GameLevel>(
    initialLevel !== undefined ? initialLevel : GameProgressManager.getLevel()
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWarping, setIsWarping] = useState<boolean>(GameProgressManager.getIsWarping());
  const [expedition, setExpeditionState] = useState<ExpeditionType>(MissionManager.getExpedition());
  const [targetName, setTargetName] = useState<string>(MissionManager.getTargetName());
  const [targetBBox, setTargetBBox] = useState(MissionManager.getTargetBBox());
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(MissionManager.getSelectedCountry());
  const [isTargetLocked, setIsTargetLocked] = useState<boolean>(MissionManager.isLocked());
  const [dialogueBeat, setDialogueBeat] = useState<number>(PiperDialogueManager.getBeat());
  const [prediction, setPredictionState] = useState<PredictionChoice>(GameProgressManager.getPrediction());

  // Countries geography data
  const [countries, setCountries] = useState<Country[]>([]);

  // NASA Analysis state
  const [scanTelemetry, setScanTelemetry] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string>("");

  // Modals & UI drawers
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [muted, setMutedLocal] = useState<boolean>(false);
  const [evidenceTab, setEvidenceTab] = useState<"summary" | "chart" | "stats" | "provenance">("summary");
  const [playerStats, setPlayerStats] = useState<PlayerCareerStats>(PlayerStatsManager.getStats());

  useEffect(() => {
    const unsub = PlayerStatsManager.subscribe(() => {
      setPlayerStats({ ...PlayerStatsManager.getStats() });
    });
    return unsub;
  }, []);

  // Load geography and mute status on mount
  useEffect(() => {
    loadCountries()
      .then((c) => setCountries(c))
      .catch(() => {});
    setMutedLocal(GameAudioManager.isMuted());
  }, []);

  // Video autoplay helper
  useEffect(() => {
    if (level === 0 && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [level]);

  // Subscribe to manager updates
  useEffect(() => {
    if (initialLevel !== undefined) GameProgressManager.setLevel(initialLevel);
    const unsubProgress = GameProgressManager.subscribe(() => {
      setLevelState(GameProgressManager.getLevel());
      setIsWarping(GameProgressManager.getIsWarping());
      setPredictionState(GameProgressManager.getPrediction());
    });

    const unsubMission = MissionManager.subscribe(() => {
      setExpeditionState(MissionManager.getExpedition());
      setTargetName(MissionManager.getTargetName());
      setTargetBBox(MissionManager.getTargetBBox());
      setSelectedCountry(MissionManager.getSelectedCountry());
      setIsTargetLocked(MissionManager.isLocked());
    });

    const unsubDialogue = PiperDialogueManager.subscribe(() => {
      setDialogueBeat(PiperDialogueManager.getBeat());
    });

    return () => {
      unsubProgress();
      unsubMission();
      unsubDialogue();
    };
  }, [initialLevel]);

  // Update atmosphere theme attribute
  useEffect(() => {
    if (typeof document !== "undefined") {
      const docTheme = expedition === "flood" ? "flood" : "heat";
      document.documentElement.dataset.expedition = docTheme;
      window.dispatchEvent(
        new CustomEvent("tc-expedition-change", { detail: { theme: docTheme } })
      );
    }
  }, [expedition]);

  // Dialogue lines for current state
  const dialogueLines = useMemo(() => {
    return PiperDialogueManager.getDialogueLines(
      level,
      targetName,
      isTargetLocked,
      prediction,
      Boolean(analysisData),
      expedition
    );
  }, [level, targetName, isTargetLocked, prediction, analysisData, expedition]);

  const canAdvanceDialogue = dialogueBeat < dialogueLines.length - 1;

  // Advance dialogue
  const handleAdvanceDialogue = useCallback(() => {
    if (canAdvanceDialogue) {
      PiperDialogueManager.advanceBeat(dialogueLines.length);
    } else if (level === 1) {
      GameAudioManager.playSound("click");
      PiperDialogueManager.resetBeat();
      GameProgressManager.warpTo(2);
    }
  }, [canAdvanceDialogue, dialogueLines.length, level]);

  // Global Keyboard listener for Space / Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (level === 0) {
          handleLaunchMission();
        } else if (canAdvanceDialogue) {
          handleAdvanceDialogue();
        } else if (level === 1) {
          handleStartAdventure();
        } else if (level === 3 && isTargetLocked) {
          handleLockTargetAndProceed();
        } else if (level === 6) {
          handleRestartExpedition();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canAdvanceDialogue, handleAdvanceDialogue, level, isTargetLocked]);

  // Level 0: Start Flow / Launch Mission
  const handleLaunchMission = () => {
    GameAudioManager.playSound("warp");
    PiperDialogueManager.resetBeat();
    GameProgressManager.warpTo(1);
  };

  // Level 1: Start Adventure / Skip
  const handleStartAdventure = () => {
    GameAudioManager.playSound("click");
    PiperDialogueManager.resetBeat();
    GameProgressManager.warpTo(2);
  };

  // Back Navigation
  const handleGoBack = () => {
    GameAudioManager.playSound("click");
    PiperDialogueManager.resetBeat();
    if (level === 1) GameProgressManager.warpTo(0);
    else if (level === 2) GameProgressManager.warpTo(1);
    else if (level === 3) GameProgressManager.warpTo(2);
    else if (level === 4) GameProgressManager.warpTo(3);
    else if (level === 5) GameProgressManager.warpTo(4);
    else if (level === 6) GameProgressManager.warpTo(2);
  };

  // Level 2: Select Expedition
  const handleSelectExpedition = (chosen: ExpeditionType) => {
    GameAudioManager.playSound("mission_select");
    MissionManager.setExpedition(chosen);
    PiperDialogueManager.resetBeat();
    setAnalysisData(null);
    GameProgressManager.setPrediction("");
    GameProgressManager.warpTo(3);
  };

  // Level 3: Select Hotspot
  const handleSelectHotspot = (spot: PresetHotspot) => {
    GameAudioManager.playSound("hover");
    MissionManager.setHotspot(spot);
    PiperDialogueManager.resetBeat();
    GameAudioManager.playSound("target_lock");
  };

  // Level 3: Select Country on 3D Globe
  const handleGlobeCountrySelect = (country: Country) => {
    const bbox = countryBounds(country);
    MissionManager.setCountry(country, bbox);
    PiperDialogueManager.resetBeat();
    GameAudioManager.playSound("target_lock");
  };

  // Level 3: Proceed to Prediction
  const handleLockTargetAndProceed = () => {
    GameAudioManager.playSound("click");
    PiperDialogueManager.resetBeat();
    GameProgressManager.warpTo(4);
  };

  // Level 4: Select Prediction
  const handleSelectPrediction = (choice: PredictionChoice) => {
    if (choice === "yes" || choice === "rising") GameAudioManager.playSound("predict_rising");
    else if (choice === "no" || choice === "falling") GameAudioManager.playSound("predict_falling");
    else if (choice === "no_significant") GameAudioManager.playSound("predict_flat");
    else GameAudioManager.playSound("click");

    GameProgressManager.setPrediction(choice);
    PiperDialogueManager.resetBeat();

    // Auto-advance to Level 5 after brief reflection
    setTimeout(() => {
      GameProgressManager.warpTo(5, () => {
        executeScanWorkflow(choice);
      });
    }, 1100);
  };

  // Level 5: Execute real NASA Analysis
  const executeScanWorkflow = async (selectedPred: PredictionChoice) => {
    setAnalysisError("");
    setScanTelemetry([]);

    try {
      const result = await NASAAnalysisManager.executeScan(
        expedition,
        targetBBox,
        targetName,
        (msg) => setScanTelemetry((prev) => [...prev, msg])
      );

      setAnalysisData(result);

      // Evaluate honest badge & outcome
      const outcome = DiscoveryManager.evaluateOutcome(selectedPred, result, expedition);
      GameProgressManager.addPoints(outcome.points);

      // Save to local voyage logbook
      saveVoyageEntry({
        territory: targetName,
        bbox: targetBBox,
        missionName: MissionManager.getMissionTitle(),
        prediction: selectedPred || "unsure",
        verdict: result.summary.verdict,
        ratePerDecade: result.summary.rate_per_decade,
        pValue: result.summary.p_value,
        badgeName: outcome.badgeName,
        badgeIcon: outcome.badgeIcon,
        pointsEarned: outcome.points,
      });

      // Update persistent user career record in PlayerStatsManager
      PlayerStatsManager.recordMissionOutcome(
        outcome.verdictState,
        outcome.points,
        expedition,
        targetName,
        outcome.badgeName,
        outcome.badgeIcon,
        result.raw_timeseries?.length || 252
      );

      // Advance to Level 6 Discovery!
      setTimeout(() => {
        PiperDialogueManager.resetBeat();
        GameProgressManager.warpTo(6, () => {
          if (outcome.verdictState === "win") {
            GameAudioManager.playSound("victory");
          } else if (outcome.verdictState === "prudent") {
            GameAudioManager.playSound("badge");
          } else {
            GameAudioManager.playSound("fanfare");
          }
        });
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sensor telemetry failed";
      setAnalysisError(msg);
    }
  };

  // Level 6: Replay / Next Mission
  const handleRestartExpedition = () => {
    GameAudioManager.playSound("click");
    PiperDialogueManager.resetBeat();
    GameProgressManager.warpTo(2);
  };

  // Level 6: Discovery Outcome
  const discoveryOutcome = useMemo(() => {
    if (!analysisData) return null;
    return DiscoveryManager.evaluateOutcome(prediction, analysisData, expedition);
  }, [analysisData, prediction, expedition]);

  // Dynamic Scene Title for Top Green Arcade Banner
  const sceneHeaderTitle = useMemo(() => {
    switch (level) {
      case 0:
        return "TREND COMPASS";
      case 1:
        return "EARTH CLIMATE CRISIS";
      case 2:
        return "CRISIS SCENARIOS";
      case 3:
        return "PLANETARY ASTROLABE";
      case 4:
        return "AI CLIMATE PREDICTION MODEL";
      case 5:
        return "SATELLITE TELEMETRY SCAN";
      case 6:
        return "DISCOVERY LOGBOOK";
      default:
        return "TREND COMPASS";
    }
  }, [level]);

  const sceneSubtitle = useMemo(() => {
    switch (level) {
      case 0:
        return "by Tech Pirates";
      case 1:
        return "A Learning Adventure";
      case 2:
        return "A Learning Adventure";
      case 3:
        return "Target Geographic Calibration";
      case 4:
        return "NASA Hypothesis Calibration";
      case 5:
        return "NASA GISTEMP & GPCP Live Ingest";
      case 6:
        return "Empirical Findings & Research Debrief";
      default:
        return "NASA Observation System";
    }
  }, [level]);

  return (
    <div className="relative w-screen h-screen max-h-screen overflow-hidden select-none font-mono text-white bg-[#030712] flex flex-col justify-between">
      {/* ===================================================================
          FULL-SCREEN HYPERSPACE WARP TRANSITION OVERLAY
          =================================================================== */}
      {isWarping && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-72 h-72 rounded-full border-4 border-green-400/80 warp-speed-active flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-2 border-amber-300/60" />
            <div className="w-24 h-24 rounded-full bg-green-400/40 blur-lg" />
          </div>
          <span className="absolute text-green-300 font-mono text-xs tracking-widest uppercase font-black drop-shadow-[0_0_12px_#22c55e]">
            WARP ACCELERATION · SECTOR SHIFT
          </span>
        </div>
      )}

      {/* ===================================================================
          TOP GREEN ARCADE FRAME BANNER (ONLY FOR LEVEL >= 1)
          =================================================================== */}
      {level >= 1 && (
        <div className="relative z-40 w-full pt-3 px-3 sm:px-6">
          <header className="arcade-frame-green w-full h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between">
            {/* Left: Yellow Status Pips & Back Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="arcade-status-indicator hidden sm:flex">
                <span className="arcade-status-pip" />
                <span className="arcade-status-pip" />
                <span className="arcade-status-pip" />
              </div>

              {level >= 1 && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-2.5 py-1 rounded bg-[#2a1708] border border-[#f59e0b] text-[#fef08a] hover:bg-[#3d220b] transition-all text-[11px] font-bold flex items-center gap-1 active:scale-95 cursor-pointer shadow-md"
                >
                  <ArrowLeft size={13} />
                  <span>BACK</span>
                </button>
              )}
            </div>

            {/* Center: Glowing Green Pixel Title & Subtitle */}
            <div className="text-center flex flex-col items-center justify-center">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-[#22c55e] tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.6)] uppercase">
                {sceneHeaderTitle}
              </h1>
              <span className="text-[10px] sm:text-xs text-[#86efac] tracking-widest font-sans font-medium -mt-0.5">
                {sceneSubtitle}
              </span>
            </div>

            {/* Right: Skip Button (Level 1) or Audio/Menu Controls & Yellow Pips */}
            <div className="flex items-center gap-2 sm:gap-3">
              {level === 1 ? (
                <button
                  type="button"
                  onClick={handleStartAdventure}
                  className="px-3 sm:px-4 py-1.5 rounded bg-[#381a08] border-2 border-[#b45309] text-[#fef08a] hover:bg-[#52250b] hover:border-[#f59e0b] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer transition-all"
                >
                  <span>SKIP</span>
                  <span className="text-[10px]">⏭</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Player Career Dossier Button */}
                  <button
                    type="button"
                    onClick={() => {
                      GameAudioManager.playSound("click");
                      setIsDossierOpen(true);
                    }}
                    className="px-2 sm:px-2.5 py-1 rounded bg-black/60 border border-amber-500/60 text-amber-300 hover:bg-amber-950/40 font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    title="Open Investigator Career Record & Stats"
                  >
                    <span>🏆</span>
                    <span className="hidden sm:inline">{playerStats.totalExp} EXP</span>
                  </button>

                  {/* Audio Mute Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = GameAudioManager.toggleMute();
                      setMutedLocal(next);
                      if (!next) GameAudioManager.playSound("click");
                    }}
                    className="p-1.5 rounded bg-black/60 border border-green-500/50 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title={muted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {muted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-green-400" />}
                  </button>

                  {/* Game Menu Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      GameAudioManager.playSound("click");
                      setIsMenuOpen(true);
                    }}
                    className="p-1.5 rounded bg-black/60 border border-green-500/50 text-green-300 hover:bg-green-500/20 transition-all cursor-pointer"
                    title="Open Game Menu"
                  >
                    <Menu size={14} />
                  </button>
                </div>
              )}

              <div className="arcade-status-indicator hidden sm:flex">
                <span className="arcade-status-pip" />
                <span className="arcade-status-pip" />
                <span className="arcade-status-pip" />
              </div>
            </div>
          </header>
        </div>
      )}

      {/* ===================================================================
          MAIN GAME VIEWPORT (ZERO VERTICAL SCROLLBARS GUARANTEED)
          =================================================================== */}
      <main className={`relative flex-1 min-h-0 w-full overflow-hidden flex flex-col items-center justify-center ${level === 0 ? "p-0" : "p-3 sm:p-5"}`}>

        {/* -----------------------------------------------------------------
            SCENE 0: LANDING PAGE HOMESCREEN (TREND COMPASS BY TECH PIRATES)
            ----------------------------------------------------------------- */}
        {level === 0 && (
          <div className="relative w-full h-full flex flex-col justify-between items-center text-center overflow-hidden py-4 sm:py-6 px-4">
            {/* Seamless Loop Space Background Video */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/video/orbital-galleon-poster.jpg"
                className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-125"
              >
                <source src="/video/orbital-galleon.mp4" type="video/mp4" />
              </video>
              {/* Cinematic Space Atmosphere & Vignette Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/45 to-[#030712]/90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(2,6,23,0.85)_85%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 pointer-events-none" />
            </div>

            {/* Top Utility Bar on Homescreen */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-black/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-mono tracking-widest uppercase backdrop-blur-md shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">NASA Observation Network</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 font-bold">19 Live Data Feeds</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = GameAudioManager.toggleMute();
                    setMutedLocal(next);
                    if (!next) GameAudioManager.playSound("click");
                  }}
                  className="p-2 rounded-lg bg-black/60 hover:bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                  title={muted ? "Unmute Audio" : "Mute Audio"}
                >
                  {muted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-green-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    GameAudioManager.playSound("click");
                    setIsMenuOpen(true);
                  }}
                  className="p-2 rounded-lg bg-black/60 hover:bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                  title="System Menu"
                >
                  <Menu size={15} />
                </button>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Center Hero: Large Brand Text & Actions */}
            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center pointer-events-auto">
              {/* NASA Space Apps Challenge Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-[11px] sm:text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse mb-3 sm:mb-4">
                <Sparkles size={13} className="text-amber-400" />
                <span>NASA SPACE APPS CHALLENGE</span>
                <Sparkles size={13} className="text-emerald-400" />
              </div>

              {/* Large Brand Title: TREND COMPASS */}
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-mono tracking-wider uppercase drop-shadow-[0_0_40px_rgba(34,197,94,0.7)] text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-200 to-emerald-500 leading-none select-none text-center">
                TREND COMPASS
              </h1>

              {/* Subtitle: by Tech Pirates */}
              <div className="text-sm sm:text-lg md:text-xl font-mono text-emerald-400 font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-2.5 mt-2 sm:mt-3">
                <span className="text-slate-400 font-normal lowercase tracking-normal text-xs sm:text-sm">by</span>
                <span className="text-amber-300 font-black tracking-[0.2em] drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                  TECH PIRATES
                </span>
                <span className="text-base sm:text-xl select-none">🏴‍☠️</span>
              </div>

              {/* Brief Mission Tagline */}
              <p className="max-w-xl text-center text-xs sm:text-sm text-slate-300 font-sans font-normal mt-2 sm:mt-3 px-4 leading-relaxed opacity-90 drop-shadow-md">
                Embark on an ed-tech research voyage across 146 years of real planetary climate data.
                Test satellite hypotheses across 5 crisis scenarios and discover empirical Earth science truths.
              </p>

              {/* Big [Start] Button */}
              <button
                type="button"
                onClick={handleLaunchMission}
                onMouseEnter={() => GameAudioManager.playSound("hover")}
                className="group relative inline-flex items-center justify-center gap-3 px-10 sm:px-16 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 border-2 border-emerald-200 text-black font-mono font-black text-xl sm:text-2xl md:text-3xl tracking-[0.25em] uppercase shadow-[0_0_40px_rgba(34,197,94,0.75)] hover:shadow-[0_0_65px_rgba(34,197,94,1)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden mt-6 sm:mt-8 select-none"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                <span className="text-emerald-950 font-black text-xl sm:text-2xl">▶</span>
                <span className="text-slate-950 font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">START</span>
                <span className="text-emerald-950 font-black text-xl sm:text-2xl">◀</span>
              </button>

              {/* Small [About Us] and [Data Management] page buttons directly underneath */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-5">
                <Link
                  href="/about"
                  onMouseEnter={() => GameAudioManager.playSound("hover")}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-black/60 hover:bg-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white font-mono text-xs sm:text-sm font-bold tracking-wider transition-all duration-150 shadow-lg backdrop-blur-md hover:scale-105 active:scale-95"
                >
                  <BookOpen size={14} className="text-emerald-400" />
                  <span>ABOUT US</span>
                </Link>

                <Link
                  href="/data"
                  onMouseEnter={() => GameAudioManager.playSound("hover")}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-black/60 hover:bg-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white font-mono text-xs sm:text-sm font-bold tracking-wider transition-all duration-150 shadow-lg backdrop-blur-md hover:scale-105 active:scale-95"
                >
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>DATA MANAGEMENT</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">19</span>
                </Link>
              </div>

              {/* Keyboard prompt hint */}
              <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-emerald-400/70 font-mono tracking-widest uppercase animate-pulse select-none">
                [ PRESS SPACE OR ENTER TO START ]
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom 5 Crisis Game Modes Pill */}
            <div className="relative z-10 w-full max-w-4xl mx-auto pb-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-mono text-slate-400 pointer-events-none select-none">
              <span className="text-emerald-400/90 font-bold flex items-center gap-1">🔥 HEAT WAVE</span>
              <span className="text-slate-600">·</span>
              <span className="text-blue-400/90 font-bold flex items-center gap-1">🌊 FLOOD RISK</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400/90 font-bold flex items-center gap-1">🌾 DROUGHT STRESS</span>
              <span className="text-slate-600">·</span>
              <span className="text-lime-400/90 font-bold flex items-center gap-1">🌱 SALINIZED SOIL</span>
              <span className="text-slate-600">·</span>
              <span className="text-teal-400/90 font-bold flex items-center gap-1">🛰️ CROPS MANAGEMENT</span>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            SCENE 1: THE CRISIS BEGINS (MATCHING REFERENCE IMAGE 1)
            ----------------------------------------------------------------- */}
        {level === 1 && (
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {/* 16-Bit Pixel Landscape Backdrop */}
            <ScenicPixelLandscape />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom: Pixel Mascot Piper + RPG Dialogue Box */}
            <div className="relative z-30 w-full max-w-4xl mx-auto flex items-end gap-3 sm:gap-6 pb-2 sm:pb-4 pointer-events-auto">
              {/* Mascot Piper Avatar standing on the grass bank */}
              <div className="shrink-0 relative select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot/piper-fullbody-intro.png"
                  alt="First Mate Piper"
                  className="h-28 sm:h-36 md:h-44 object-contain animate-piper-idle drop-shadow-[0_12px_25px_rgba(0,0,0,0.9)]"
                />
              </div>

              {/* RPG Dialogue Window */}
              <div
                onClick={handleAdvanceDialogue}
                className="rpg-dialogue-window-green flex-1 p-3.5 sm:p-5 cursor-pointer active:scale-[0.99] transition-transform select-none"
              >
                {/* Nameplate tag on top-left of box */}
                <div className="absolute -top-3 left-4 rpg-nameplate-green">
                  FIRST MATE PIPER
                </div>

                {/* Dialogue Text */}
                <p className="text-sm sm:text-base md:text-lg text-slate-100 font-mono font-medium leading-relaxed mt-1">
                  {dialogueLines[dialogueBeat] || dialogueLines[0]}
                </p>

                {/* Flashing Prompt */}
                <div className="mt-2 text-center text-[10px] sm:text-xs text-[#22c55e] font-mono tracking-widest animate-pulse font-bold">
                  + CLICK TO CONTINUE +
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            SCENE 2: CRISIS SCENARIOS HUB (MATCHING REFERENCE IMAGE 2)
            ----------------------------------------------------------------- */}
        {level === 2 && (
          <div className="relative w-full h-full max-w-5xl flex flex-col justify-between items-center py-1">
            {/* 5 Scenario Cards Grid: 3 on Top Row, 2 on Bottom Row */}
            <div className="w-full flex-1 flex flex-col justify-center items-center gap-3 sm:gap-4 max-h-[62vh]">
              {/* Top Row: Heat, Flood, Drought */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5 w-full max-w-3xl">
                {/* Card 1: Heat */}
                <div
                  onClick={() => handleSelectExpedition("heat")}
                  onMouseEnter={() => GameAudioManager.playSound("hover")}
                  className="arcade-scenario-card is-playable cursor-pointer group"
                >
                  <div className="w-full h-24 sm:h-28 overflow-hidden relative">
                    <HeatIllustration />
                  </div>
                  <div className="p-2 sm:p-2.5 text-center bg-[#150a04] border-t border-[#92400e]">
                    <h3 className="text-xs sm:text-sm font-black text-[#fef08a] uppercase tracking-wider group-hover:text-green-300">
                      Heat
                    </h3>
                    <span className="text-[9px] text-[#f59e0b] font-mono font-bold block mt-0.5">NASA GISTEMP v4</span>
                  </div>
                </div>

                {/* Card 2: Flood */}
                <div
                  onClick={() => handleSelectExpedition("flood")}
                  onMouseEnter={() => GameAudioManager.playSound("hover")}
                  className="arcade-scenario-card is-playable is-playable-flood cursor-pointer group"
                >
                  <div className="w-full h-24 sm:h-28 overflow-hidden relative">
                    <FloodIllustration />
                  </div>
                  <div className="p-2 sm:p-2.5 text-center bg-[#04121a] border-t border-[#0369a1]">
                    <h3 className="text-xs sm:text-sm font-black text-[#7dd3fc] uppercase tracking-wider group-hover:text-green-300">
                      Flood
                    </h3>
                    <span className="text-[9px] text-[#38bdf8] font-mono font-bold block mt-0.5">GPCP v2.3 · GPM</span>
                  </div>
                </div>

                {/* Card 3: Drought */}
                <div
                  onClick={() => handleSelectExpedition("drought")}
                  onMouseEnter={() => GameAudioManager.playSound("hover")}
                  className="arcade-scenario-card is-playable cursor-pointer group"
                >
                  <div className="w-full h-24 sm:h-28 overflow-hidden relative">
                    <DroughtIllustration />
                  </div>
                  <div className="p-2 sm:p-2.5 text-center bg-[#180d04] border-t border-[#92400e]">
                    <h3 className="text-xs sm:text-sm font-black text-[#fde047] uppercase tracking-wider group-hover:text-green-300">
                      Drought
                    </h3>
                    <span className="text-[9px] text-[#facc15] font-mono font-bold block mt-0.5">Data Rods · GRACE</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Canopy & Harvest, Ocean Currents */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-xl">
                {/* Card 4: Canopy & Harvest */}
                <div
                  onClick={() => handleSelectExpedition("canopy")}
                  onMouseEnter={() => GameAudioManager.playSound("hover")}
                  className="arcade-scenario-card is-playable cursor-pointer group"
                >
                  <div className="w-full h-24 sm:h-28 overflow-hidden relative">
                    <GreenCoverIllustration />
                  </div>
                  <div className="p-2 sm:p-2.5 text-center bg-[#071609] border-t border-[#15803d]">
                    <h3 className="text-xs sm:text-sm font-black text-[#86efac] uppercase tracking-wider group-hover:text-green-300">
                      Canopy &amp; Harvest
                    </h3>
                    <span className="text-[9px] text-[#4ade80] font-mono font-bold block mt-0.5">AppEEARS · MODIS NDVI</span>
                  </div>
                </div>

                {/* Card 5: Ocean Currents */}
                <div
                  onClick={() => handleSelectExpedition("ocean")}
                  onMouseEnter={() => GameAudioManager.playSound("hover")}
                  className="arcade-scenario-card is-playable is-playable-flood cursor-pointer group"
                >
                  <div className="w-full h-24 sm:h-28 overflow-hidden relative">
                    <OceanWarmingIllustration />
                  </div>
                  <div className="p-2 sm:p-2.5 text-center bg-[#021422] border-t border-[#0284c7]">
                    <h3 className="text-xs sm:text-sm font-black text-[#38bdf8] uppercase tracking-wider group-hover:text-green-300">
                      Ocean Currents
                    </h3>
                    <span className="text-[9px] text-[#67e8f9] font-mono font-bold block mt-0.5">Sea Level Altimetry · MUR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Mascot Piper + GUIDE Box (Matching Screenshot 2) */}
            <div className="w-full max-w-4xl flex items-end justify-between gap-4 mt-2">
              <div className="flex items-end gap-3">
                {/* Mascot Piper Avatar */}
                <div className="shrink-0 relative select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mascot/piper-fullbody-intro.png"
                    alt="Guide"
                    className="h-20 sm:h-24 object-contain animate-piper-idle"
                  />
                </div>

                {/* GUIDE Box */}
                <div className="rpg-dialogue-window-green p-3 max-w-md relative select-none">
                  <div className="absolute -top-2.5 left-3 rpg-nameplate-green text-[10px] py-0.5 px-2">
                    GUIDE
                  </div>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed mt-1">
                    {PiperDialogueManager.getGuideFact(expedition)}
                  </p>
                </div>
              </div>

              {/* Step Dots: 6 Steps Indicator */}
              <div className="flex items-center gap-1.5 pb-2">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <span
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all ${
                      step === 2
                        ? "bg-[#22c55e] scale-125 shadow-[0_0_8px_#22c55e]"
                        : step < 2
                        ? "bg-[#86efac]"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            SCENE 3: PLANETARY ASTROLABE (3D GLOBE & HOTSPOT SELECTION)
            ----------------------------------------------------------------- */}
        {level === 3 && (
          <div className="relative w-full h-full max-w-5xl flex flex-col justify-between items-center py-1">
            <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-between gap-4 max-h-[66vh]">
              {/* Left: 3D Interactive Earth Astrolabe */}
              <div className="relative w-full md:w-1/2 h-56 sm:h-72 md:h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                <GlobeCanvas
                  countries={countries}
                  selected={selectedCountry || undefined}
                  bbox={targetBBox}
                  onSelect={handleGlobeCountrySelect}
                />
              </div>

              {/* Right: Target Hotspots & Mission Specifications */}
              <div className="w-full md:w-1/2 flex flex-col justify-between h-full bg-[#120a05] border-2 border-[#92400e] rounded-2xl p-4 shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#92400e]/40 mb-3">
                    <span className="text-xs text-[#fef08a] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Crosshair size={14} className="text-green-400 animate-spin-slow" />
                      TARGET SPECIFICATIONS
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/60 text-green-300 text-[10px] font-bold border border-green-500/40">
                      {isTargetLocked ? "COORDINATES LOCKED" : "SELECT HOTSPOT"}
                    </span>
                  </div>

                  <div className="bg-black/60 rounded-xl p-3 border border-slate-800 space-y-1 mb-3">
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <MapPin size={14} className="text-[#f59e0b]" />
                      <span>{targetName.toUpperCase()}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      Bounding Box: [{targetBBox.south.toFixed(1)}°S, {targetBBox.north.toFixed(1)}°N, {targetBBox.west.toFixed(1)}°W, {targetBBox.east.toFixed(1)}°E]
                    </div>
                  </div>

                  {/* Regional Hotspot Buttons */}
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                    Verified Hotspot Sectors:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                    {MissionManager.getHotspots().map((spot) => {
                      const isSelected = targetName === spot.name;
                      return (
                        <button
                          key={spot.id}
                          type="button"
                          onClick={() => handleSelectHotspot(spot)}
                          className={`p-2 rounded-lg text-left text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-[#22c55e] text-black font-black border border-[#86efac] shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                              : "bg-black/50 border border-slate-700 text-slate-300 hover:border-[#f59e0b] hover:text-white"
                          }`}
                        >
                          <span className="text-sm">{spot.flag}</span>
                          <span className="truncate">{spot.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lock Target & Proceed Action Button */}
                <div className="pt-3 border-t border-[#92400e]/40">
                  <button
                    type="button"
                    onClick={handleLockTargetAndProceed}
                    className="arcade-physical-btn arcade-physical-btn-green w-full py-2.5 text-xs font-black tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>LOCK TARGET &amp; PROCEED</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Step Dots: 6 Steps Indicator */}
            <div className="flex items-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <span
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === 3
                      ? "bg-[#22c55e] scale-125 shadow-[0_0_8px_#22c55e]"
                      : step < 3
                      ? "bg-[#86efac]"
                      : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            SCENE 4: PREDICTION CHALLENGE MODAL (MATCHING REFERENCE IMAGE 3)
            ----------------------------------------------------------------- */}
        {level === 4 && (
          <div className="relative w-full h-full max-w-4xl flex flex-col justify-between items-center py-2">
            {/* Modal Box with Gold Pixel Border Matching Reference Image 3 */}
            <div className="w-full flex-1 max-h-[68vh] bg-[#140b06] border-4 border-[#92400e] rounded-2xl p-5 sm:p-7 relative shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col justify-between">
              {/* Header Title & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#92400e]/50">
                <span className="text-xs sm:text-sm font-black text-[#f59e0b] uppercase tracking-wider">
                  AI CLIMATE PREDICTION MODEL
                </span>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Prediction Modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body: Left Avatar Circle + Right RPG Question Window */}
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 my-2">
                {/* Large Circular Framed Avatar with Amber Glow (Matching Screenshot 3) */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full border-4 border-[#b45309] shadow-[0_0_35px_rgba(245,158,11,0.35)] flex items-center justify-center bg-radial from-[#381a08] to-[#120703] shrink-0">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/piper-fullbody-intro.png"
                      alt="Observer"
                      className="h-32 sm:h-40 md:h-48 object-contain animate-piper-idle"
                    />
                  </div>
                </div>

                {/* Right: RPG Dialogue Window with Green Border & Big Tactile Buttons */}
                <div className="rpg-dialogue-window-green flex-1 p-4 sm:p-6 w-full max-w-lg relative select-none">
                  {/* Nameplate tag on top-left of box */}
                  <div className="absolute -top-3 left-4 rpg-nameplate-green">
                    FIRST MATE PIPER
                  </div>

                  {/* Prompt Question */}
                  <p className="text-sm sm:text-base text-slate-100 font-mono font-medium leading-relaxed mt-2 mb-5">
                    What about <span className="text-[#fef08a] font-bold">{targetName}</span> over the 20-year observation record? Will NASA satellite data confirm a statistically significant climate shift?
                  </p>

                  {/* Big Tactile 3D Action Buttons: YES and NO (Matching Screenshot 3) */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
                    <button
                      type="button"
                      onClick={() => handleSelectPrediction("yes")}
                      className="arcade-physical-btn arcade-physical-btn-green py-3 text-base sm:text-lg font-black tracking-widest shadow-xl flex items-center justify-center gap-2"
                    >
                      <span>YES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectPrediction("no")}
                      className="arcade-physical-btn arcade-physical-btn-red py-3 text-base sm:text-lg font-black tracking-widest shadow-xl flex items-center justify-center gap-2"
                    >
                      <span>NO</span>
                    </button>
                  </div>

                  {/* Secondary Scientific Option */}
                  <div className="mt-4 pt-3 border-t border-green-500/20 flex justify-between items-center text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectPrediction("unsure")}
                      className="text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      🧭 Withhold Bias (Let NASA Data Decide)
                    </button>
                    <span className="text-slate-400">P-value &lt; 0.05 Test</span>
                  </div>
                </div>
              </div>

              {/* Bottom Target Tag */}
              <div className="text-center text-[11px] text-slate-400 font-mono">
                SATELLITE SENSORS CALIBRATING ON {targetName.toUpperCase()}
              </div>
            </div>

            {/* Step Dots: 6 Steps Indicator */}
            <div className="flex items-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <span
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === 4
                      ? "bg-[#22c55e] scale-125 shadow-[0_0_8px_#22c55e]"
                      : step < 4
                      ? "bg-[#86efac]"
                      : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            SCENE 5: SATELLITE TELEMETRY SCAN (RADAR SWEEP & NETCDF INGEST)
            ----------------------------------------------------------------- */}
        {level === 5 && (
          <div className="relative w-full h-full max-w-4xl flex flex-col justify-between items-center py-2">
            <div className="w-full flex-1 max-h-[68vh] flex flex-col items-center justify-center gap-5">
              {/* Radar Rotating Reticle */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full border-2 border-green-500/60 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <div className="absolute inset-2 rounded-full border border-green-500/30 border-dashed animate-spin-slow" />
                <div className="absolute inset-8 rounded-full border border-green-500/40" />
                <div className="absolute w-full h-0.5 bg-green-500/30" />
                <div className="absolute h-full w-0.5 bg-green-500/30" />
                <div className="w-4 h-4 rounded-full bg-green-400 shadow-[0_0_15px_#22c55e] animate-ping" />
                <Crosshair size={24} className="text-green-300 absolute" />
              </div>

              {/* Streaming Live Telemetry Terminal */}
              <div className="w-full max-w-xl bg-black/90 border-2 border-green-500/70 rounded-xl p-4 font-mono text-xs shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-green-500/30 text-[10px] text-green-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Radio size={12} className="animate-spin-slow text-green-400" />
                    LIVE OBSERVATIONAL TELEMETRY FEED
                  </span>
                  <span>252 NODES SYNCED</span>
                </div>

                <div className="space-y-1 text-slate-200 min-h-[90px]">
                  {scanTelemetry.slice(-5).map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-green-400">&gt;</span>
                      <span className="text-[11px] text-green-200 font-medium">{log}</span>
                    </div>
                  ))}
                  {scanTelemetry.length === 0 && (
                    <div className="text-slate-400 animate-pulse text-[11px]">
                      Locking orbital transceivers on {targetName}...
                    </div>
                  )}
                </div>

                {analysisError && (
                  <div className="mt-2.5 p-2 rounded bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center justify-between">
                    <span>{analysisError}</span>
                    <button
                      type="button"
                      onClick={() => executeScanWorkflow(prediction)}
                      className="px-2.5 py-1 rounded bg-red-600 text-white font-bold cursor-pointer"
                    >
                      Retry Ingest
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step Dots: 6 Steps Indicator */}
            <div className="flex items-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <span
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === 5
                      ? "bg-[#22c55e] scale-125 shadow-[0_0_8px_#22c55e]"
                      : step < 5
                      ? "bg-[#86efac]"
                      : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
            SCENE 6: DISCOVERY LOGBOOK (THE 4 ANSWERS & ED-TECH RESEARCH DEBRIEF)
            ----------------------------------------------------------------- */}
        {level === 6 && analysisData && (
          <div className="relative w-full h-full max-w-5xl flex flex-col justify-between items-center py-1">
            <div className="w-full flex-1 flex flex-col justify-center gap-2.5 max-h-[70vh]">
              {/* BOLD GAME OUTCOME BANNER: YOU WON! vs YOU TRIED CLOSELY! */}
              {discoveryOutcome && (
                <div
                  className={`w-full p-3 sm:p-3.5 rounded-xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl animate-in zoom-in-95 duration-200 select-none ${
                    discoveryOutcome.verdictState === "win"
                      ? "bg-gradient-to-r from-emerald-950/90 via-green-950/70 to-emerald-950/90 border-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.45)] text-emerald-200"
                      : discoveryOutcome.verdictState === "prudent"
                      ? "bg-gradient-to-r from-slate-950/90 via-indigo-950/70 to-slate-950/90 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.35)] text-indigo-200"
                      : "bg-gradient-to-r from-amber-950/90 via-orange-950/70 to-amber-950/90 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_10px_currentColor]">
                      {discoveryOutcome.verdictState === "win" ? "🏆" : discoveryOutcome.verdictState === "prudent" ? "⚖️" : "⚡"}
                    </span>
                    <div>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h3 className="text-sm sm:text-base font-black font-mono tracking-wider text-white uppercase drop-shadow-md">
                          {discoveryOutcome.verdictBanner}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                            discoveryOutcome.verdictState === "win"
                              ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50"
                              : "bg-amber-500/30 text-amber-300 border border-amber-400/50"
                          }`}
                        >
                          +{discoveryOutcome.points} EXP
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-sans mt-0.5">
                        {discoveryOutcome.verdictSubtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-black tracking-widest uppercase border ${
                        discoveryOutcome.verdictState === "win"
                          ? "bg-emerald-500/30 text-emerald-300 border-emerald-400"
                          : "bg-amber-500/30 text-amber-300 border-amber-400"
                      }`}
                    >
                      {discoveryOutcome.verdictState === "win" ? "MISSION ACCOMPLISHED" : "EMPIRICAL BREAKTHROUGH"}
                    </span>
                  </div>
                </div>
              )}

              {/* THE FOUR SCIENTIFIC ANSWERS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
                {/* 1. WHAT */}
                <div className="bg-[#120a05] border-2 border-[#b45309] rounded-xl p-3 shadow-lg">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f59e0b] flex items-center gap-1 mb-1">
                    <BarChart3 size={12} />
                    1. WHAT CHANGED?
                  </span>
                  <h4 className="text-xs sm:text-sm font-black font-mono text-white truncate">
                    {analysisData.variable.name}
                  </h4>
                  <div className="mt-1.5 pt-1 border-t border-[#b45309]/30 text-[10px] text-slate-300 font-mono truncate">
                    {analysisData.source}
                  </div>
                </div>

                {/* 2. WHERE */}
                <div className="bg-[#051410] border-2 border-[#15803d] rounded-xl p-3 shadow-lg">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 flex items-center gap-1 mb-1">
                    <MapPin size={12} />
                    2. WHERE DID IT CHANGE?
                  </span>
                  <h4 className="text-xs sm:text-sm font-black font-mono text-white truncate">
                    {targetName}
                  </h4>
                  <div className="mt-1.5 pt-1 border-t border-[#15803d]/30 text-[10px] text-slate-300 font-mono">
                    [{targetBBox.south.toFixed(1)}° to {targetBBox.north.toFixed(1)}° Lat]
                  </div>
                </div>

                {/* 3. HOW MUCH */}
                <div className="bg-[#140b04] border-2 border-[#b45309] rounded-xl p-3 shadow-lg">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#fef08a] flex items-center gap-1 mb-1">
                    <TrendingUp size={12} />
                    3. HOW MUCH PER DECADE?
                  </span>
                  <h4 className="text-sm sm:text-base font-black font-mono text-[#fef08a]">
                    {analysisData.summary.rate_per_decade > 0 ? "+" : ""}
                    {analysisData.summary.rate_per_decade.toFixed(2)}{" "}
                    <span className="text-[10px] font-normal text-slate-300">
                      {analysisData.units}/decade
                    </span>
                  </h4>
                  <div className="mt-1.5 pt-1 border-t border-[#b45309]/30 text-[10px] text-slate-300 font-mono">
                    95% CI: [{analysisData.summary.ci_lower_decade.toFixed(2)} to {analysisData.summary.ci_upper_decade.toFixed(2)}]
                  </div>
                </div>

                {/* 4. IS IT SIGNIFICANT */}
                <div className="bg-[#031518] border-2 border-[#0e7490] rounded-xl p-3 shadow-lg">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1 mb-1">
                    <ShieldCheck size={12} />
                    4. IS IT SIGNIFICANT?
                  </span>
                  <h4 className="text-xs sm:text-sm font-black font-mono text-cyan-300">
                    {analysisData.summary.verdict === "significant"
                      ? "YES · SIGNIFICANT"
                      : "NATURAL VARIABILITY"}
                  </h4>
                  <div className="mt-1.5 pt-1 border-t border-[#0e7490]/30 text-[10px] text-slate-300 font-mono">
                    p = {analysisData.summary.p_value !== null ? analysisData.summary.p_value.toFixed(4) : "N/A"}
                  </div>
                </div>
              </div>

              {/* MASCOT DEBRIEF & HONEST BADGE CARD */}
              {discoveryOutcome && (
                <div className="bg-[#100803] border-2 border-[#92400e] rounded-xl p-3.5 shadow-xl flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-3 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/piper-fullbody-discovery.png"
                      alt="Piper Discovery"
                      className="h-16 sm:h-20 object-contain animate-piper-idle"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl">{discoveryOutcome.badgeIcon}</span>
                        <span className="px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#fef08a] font-mono text-[10px] font-bold uppercase">
                          +{discoveryOutcome.points} EXP
                        </span>
                      </div>
                      <h5 className="text-xs sm:text-sm font-black text-white mt-0.5">
                        {discoveryOutcome.badgeName}
                      </h5>
                    </div>
                  </div>

                  <p className="flex-1 text-xs text-slate-200 font-sans leading-relaxed">
                    {discoveryOutcome.commentary}
                  </p>

                  {/* Scientific Data & Export Controls */}
                  <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEvidenceDrawerOpen(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <BarChart3 size={13} className="text-green-400" />
                      <span>PLOTS &amp; DATA</span>
                    </button>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => DiscoveryManager.exportCsv(analysisData)}
                        className="px-2 py-1 rounded bg-[#2a1708] hover:bg-[#3d220b] border border-[#b45309] text-[11px] font-mono font-bold text-[#fef08a] flex items-center gap-1 cursor-pointer"
                        title="Download Research CSV"
                      >
                        <Download size={11} />
                        <span>CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => DiscoveryManager.exportJson(analysisData, expedition, targetName)}
                        className="px-2 py-1 rounded bg-[#041a12] hover:bg-[#072a1e] border border-green-600 text-[11px] font-mono font-bold text-green-300 flex items-center gap-1 cursor-pointer"
                        title="Download Research JSON"
                      >
                        <Download size={11} />
                        <span>JSON</span>
                      </button>
                      <Link
                        href="/data"
                        className="px-2 py-1 rounded bg-[#021822] hover:bg-[#032535] border border-cyan-600 text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Inspect all 19 verified NASA data feeds"
                      >
                        <ShieldCheck size={11} />
                        <span>19 SOURCES</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Expedition Action Button */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleRestartExpedition}
                  className="arcade-physical-btn arcade-physical-btn-green px-8 py-2.5 text-xs font-black tracking-wider shadow-xl flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>NEXT CRISIS EXPEDITION</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Step Dots: 6 Steps Indicator */}
            <div className="flex items-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <span
                  key={step}
                  className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================
          SLIDE-OUT SCIENTIFIC EVIDENCE DRAWER (PLOTLY CHARTS & STATS)
          =================================================================== */}
      {isEvidenceDrawerOpen && analysisData && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl h-full bg-[#030c14] border-l-2 border-teal-500/60 p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-teal-400" size={20} />
                  <h3 className="text-lg font-bold font-mono text-white">
                    EMPIRICAL EVIDENCE &amp; STATISTICAL AUDIT
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEvidenceDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setEvidenceTab("summary")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    evidenceTab === "summary"
                      ? "bg-teal-400 text-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setEvidenceTab("chart")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    evidenceTab === "chart"
                      ? "bg-teal-400 text-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Time Series Plot
                </button>
                <button
                  type="button"
                  onClick={() => setEvidenceTab("stats")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    evidenceTab === "stats"
                      ? "bg-teal-400 text-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Statistical Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setEvidenceTab("provenance")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    evidenceTab === "provenance"
                      ? "bg-teal-400 text-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Data Provenance
                </button>
              </div>

              {/* Tab Contents */}
              {evidenceTab === "summary" && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-black/60 border border-slate-700 space-y-2">
                    <p className="text-slate-200">
                      <strong>Variable:</strong> {analysisData.variable.name} ({analysisData.units})
                    </p>
                    <p className="text-slate-200">
                      <strong>Primary Test:</strong> {analysisData.summary.primary_method}
                    </p>
                    <p className="text-slate-200">
                      <strong>Theil-Sen Slope:</strong>{" "}
                      {analysisData.summary.rate_per_decade > 0 ? "+" : ""}
                      {analysisData.summary.rate_per_decade.toFixed(3)} {analysisData.units}/decade
                    </p>
                    <p className="text-slate-200">
                      <strong>Hamed-Rao p-value:</strong>{" "}
                      {analysisData.summary.p_value !== null ? analysisData.summary.p_value.toFixed(5) : "N/A"}
                    </p>
                    <p className="text-slate-200">
                      <strong>Observations:</strong> {analysisData.diagnostics.n_observations} monthly points
                    </p>
                    <p className="text-slate-200">
                      <strong>Lag-1 Autocorrelation:</strong>{" "}
                      {analysisData.diagnostics.lag1_autocorrelation.toFixed(3)}
                    </p>
                  </div>
                </div>
              )}

              {evidenceTab === "chart" && (
                <div className="min-h-[350px]">
                  <TimeSeriesChart
                    rawSeries={analysisData.raw_timeseries}
                    deseasonalizedSeries={analysisData.deseasonalized_timeseries}
                    trendLine={analysisData.trend_line}
                    units={analysisData.units}
                    variableName={analysisData.variable.name}
                  />
                </div>
              )}

              {evidenceTab === "stats" && (
                <div className="overflow-x-auto">
                  <StatsDetailsTable
                    methods={analysisData.methods}
                    diagnostics={analysisData.diagnostics}
                    units={analysisData.units}
                  />
                </div>
              )}

              {evidenceTab === "provenance" && analysisData.provenance && (
                <div>
                  <ProvenancePanel provenance={analysisData.provenance} />
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={() => DiscoveryManager.exportCsv(analysisData)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                <span>Download Scientific CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEvidenceDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono font-bold hover:text-white cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          IN-GAME MENU DRAWER
          =================================================================== */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-80 h-full bg-[#0e0704] border-r-2 border-[#b45309] p-5 flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#b45309]/40 mb-4 text-[#fef08a]">
                <span className="font-black flex items-center gap-2">
                  <Compass size={15} />
                  TREND COMPASS SYSTEM
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDossierOpen(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-black/60 hover:from-amber-900/60 border border-amber-500/60 text-left flex items-center justify-between text-amber-300 cursor-pointer transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🏆</span>
                    <span className="font-bold">Investigator Career Dossier</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 border border-amber-500/40 text-amber-400 font-bold">
                    {playerStats.totalExp} EXP
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    GameProgressManager.warpTo(0);
                  }}
                  className="w-full p-2.5 rounded-xl bg-black/50 hover:bg-emerald-950/60 border border-emerald-500/40 text-left flex items-center gap-2 text-slate-200 cursor-pointer"
                >
                  <Compass size={14} className="text-emerald-400" />
                  <span>Title Screen / Homescreen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    GameProgressManager.warpTo(2);
                  }}
                  className="w-full p-2.5 rounded-xl bg-black/50 hover:bg-[#2a1708] border border-[#b45309]/40 text-left flex items-center gap-2 text-slate-200 cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Crisis Scenarios Hub</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    GameProgressManager.warpTo(3);
                  }}
                  className="w-full p-2.5 rounded-xl bg-black/50 hover:bg-cyan-950/60 border border-cyan-500/40 text-left flex items-center gap-2 text-slate-200 cursor-pointer"
                >
                  <MapPin size={14} className="text-cyan-400" />
                  <span>Planetary Astrolabe</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLogbookOpen(true);
                  }}
                  className="w-full p-2.5 rounded-xl bg-black/50 hover:bg-[#2a1708] border border-[#b45309]/40 text-left flex items-center gap-2 text-slate-200 cursor-pointer"
                >
                  <BookOpen size={14} className="text-[#f59e0b]" />
                  <span>Voyage Logbook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleRestartExpedition();
                  }}
                  className="w-full p-2.5 rounded-xl bg-black/50 hover:bg-[#2a1708] border border-[#b45309]/40 text-left flex items-center gap-2 text-slate-200 cursor-pointer"
                >
                  <RotateCcw size={14} className="text-green-400" />
                  <span>Restart Expedition</span>
                </button>

                <div className="h-px bg-emerald-500/20 my-1" />

                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-black/40 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>📖</span>
                    <span>CREW &amp; MISSION BRIEFING</span>
                  </span>
                  <ChevronRight size={14} className="text-emerald-400" />
                </Link>

                <Link
                  href="/data"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-black/40 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>🛡️</span>
                    <span>19 SATELLITE DATASETS</span>
                  </span>
                  <ChevronRight size={14} className="text-emerald-400" />
                </Link>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    System Information
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div>Status: Online (19 of 26 In App)</div>
                    <div>Source: NASA GISTEMP, GPCP, Sea Level</div>
                    <div>Satellites: MODIS, GPM, AIRS, SWOT</div>
                    <div>Integrity: 100% SHA-256 Verified</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="arcade-physical-btn arcade-physical-btn-gold w-full py-2 text-xs font-bold text-center cursor-pointer"
            >
              Resume Adventure
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          VOYAGE LOGBOOK MODAL & CAREER DOSSIER MODAL
          =================================================================== */}
      <VoyageLogModal isOpen={isLogbookOpen} onClose={() => setIsLogbookOpen(false)} />
      <PlayerDossierModal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} />
    </div>
  );
}

export default GameEngine;
