"use client";

import React, { useState, useEffect, useRef } from "react";
import { Compass, Sparkles, MessageSquare, ChevronRight, X, Volume2, Info, CheckCircle2 } from "lucide-react";
import { ChimeType } from "../lib/game-audio";

export interface PersistentPiperCompanionProps {
  scene: "intro" | "hub" | "briefing" | "prediction" | "scanning" | "discovery";
  selectedExpedition: "gistemp" | "imerg" | "drought" | "modis" | "ocean";
  targetName: string;
  prediction: string;
  analysisData: any;
  outcome: {
    badgeIcon?: string;
    title?: string;
    badgeName?: string;
    points?: number;
    commentary?: string;
  } | null;
  storyBeat: number;
  onAdvanceStory?: () => void;
  onSkipStory?: () => void;
  onProceedToPrediction?: () => void;
  playChime: (sound: ChimeType) => void;
}

const DETECTIVE_TIPS = [
  "Tip: The Theil–Sen estimator calculates median pairwise slopes — totally immune to single-year volcanic eruptions or outlier spikes!",
  "Tip: The Hamed–Rao test corrects for autocorrelation so natural El Niño multi-year cycles don't trick us into false alarms!",
  "Tip: You can spin and drag the 3D globe anytime to explore different planetary coordinates!",
  "Tip: In real science, learning where observations disagree with our intuition is how true discoveries happen!",
  "Tip: NASA GPCP combines microwave radiometers and IR sounders calibrated with surface rain gauges since 1979!",
  "Tip: Unsure is a completely respected scientific answer. True detectives let data decide!",
];

export function PersistentPiperCompanion({
  scene,
  selectedExpedition,
  targetName,
  prediction,
  analysisData,
  outcome,
  storyBeat,
  onAdvanceStory,
  onSkipStory,
  onProceedToPrediction,
  playChime,
}: PersistentPiperCompanionProps) {
  const [minimized, setMinimized] = useState(false);
  const [tipIndex, setTipIndex] = useState<number | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const lastDialogueRef = useRef<string>("");

  // Determine canonical Piper image based on gameplay state
  const piperPose =
    scene === "discovery"
      ? "/mascot/piper-fullbody-discovery.png"
      : scene === "prediction" || scene === "scanning"
      ? "/mascot/piper-fullbody-thinking.png"
      : "/mascot/piper-fullbody-intro.png";

  // Context-aware centralized dialogue script
  let dialogueText = "";
  let actionButton: React.ReactNode = null;

  if (tipIndex !== null) {
    dialogueText = DETECTIVE_TIPS[tipIndex];
    actionButton = (
      <button
        type="button"
        onMouseEnter={() => playChime("hover")}
        onClick={() => {
          playChime("click");
          setTipIndex(null);
        }}
        className="px-2.5 py-1 rounded bg-amber-400 text-black text-[10px] font-mono font-black uppercase tracking-wider hover:bg-amber-300 transition-all shadow-md active:scale-95"
      >
        Got it! ➔
      </button>
    );
  } else {
    switch (scene) {
      case "intro":
        if (storyBeat === 0) {
          dialogueText =
            "Ahoy, detective! Ready to explore Earth? Let's uncover the planet's hidden climate trends!";
          actionButton = (
            <button
              type="button"
              onMouseEnter={() => playChime("hover")}
              onClick={() => {
                playChime("continue");
                onAdvanceStory?.();
              }}
              className="px-3 py-1 rounded bg-emerald-400 text-black text-[10px] font-mono font-black uppercase tracking-wider hover:bg-emerald-300 transition-all shadow-md active:scale-95 flex items-center gap-1"
            >
              <span>Continue</span>
              <ChevronRight size={12} />
            </button>
          );
        } else if (storyBeat === 1) {
          dialogueText =
            "Standard weather graphs can deceive with short-term blips. We run non-parametric NASA satellite algorithms to find the real truth!";
          actionButton = (
            <button
              type="button"
              onMouseEnter={() => playChime("hover")}
              onClick={() => {
                playChime("continue");
                onAdvanceStory?.();
              }}
              className="px-3 py-1 rounded bg-emerald-400 text-black text-[10px] font-mono font-black uppercase tracking-wider hover:bg-emerald-300 transition-all shadow-md active:scale-95 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={12} />
            </button>
          );
        } else {
          dialogueText =
            "Plot your course on the Star Galleon astrolabe. Select a planetary crisis to investigate!";
          actionButton = (
            <button
              type="button"
              onMouseEnter={() => playChime("hover")}
              onClick={() => {
                playChime("mission_select");
                onSkipStory?.();
              }}
              className="px-3.5 py-1 rounded bg-amber-400 text-black text-[10px] font-mono font-black uppercase tracking-wider hover:bg-amber-300 transition-all shadow-md active:scale-95 flex items-center gap-1"
            >
              <span>Enter Scenarios</span>
              <ChevronRight size={12} />
            </button>
          );
        }
        break;

      case "hub":
        if (selectedExpedition === "gistemp") {
          dialogueText =
            "Mission 01: Global Heat! Track 146 years of NASA GISTEMP temperature anomalies across planetary coordinates.";
        } else if (selectedExpedition === "imerg") {
          dialogueText =
            "Mission 02: Flood & Extreme Rainfall! Stream 574 months of NASA GPCP satellite radar observations.";
        } else {
          dialogueText =
            "Choose your expedition! Select Heat or Flood above to enter the mission arena.";
        }
        break;

      case "briefing":
        if (selectedExpedition === "imerg") {
          dialogueText = `Radar sweep locked onto ${targetName}! Spin the 3D globe or pick a flood basin, then proceed to log your hunch!`;
        } else {
          dialogueText = `Coordinates locked on ${targetName}! All 252 monthly records calibrated. Spin the 3D globe or proceed to prediction!`;
        }
        break;

      case "prediction":
        if (prediction) {
          dialogueText = `Hypothesis logged: ${prediction.toUpperCase()}! Click the launch button above to ping NASA satellites and test your hunch!`;
        } else {
          dialogueText =
            selectedExpedition === "imerg"
              ? `What do you predict for monthly rainfall in ${targetName}? Wetter, drier, stable, or unsure?`
              : `What do you predict for surface temperature in ${targetName}? Rising, falling, stable, or unsure?`;
        }
        break;

      case "scanning":
        dialogueText = `Scanning NASA satellite archives for ${targetName}... Sensors calibrating, stand by!`;
        break;

      case "discovery":
        dialogueText = outcome?.commentary
          ? `Discovery complete! ${outcome.commentary}`
          : `Discovery complete! Excellent investigation! Verified NASA evidence revealed below.`;
        break;

      default:
        dialogueText = "Ready at the helm, detective! I'm here to guide your planetary investigation.";
    }
  }

  // Animate speech pulse whenever dialogue changes
  useEffect(() => {
    if (dialogueText !== lastDialogueRef.current) {
      lastDialogueRef.current = dialogueText;
      setIsTalking(true);
      const timer = setTimeout(() => setIsTalking(false), 800);
      return () => clearTimeout(timer);
    }
  }, [dialogueText]);

  // Click Piper interaction for tips
  const handlePiperClick = () => {
    playChime("typewriter");
    setTipIndex((prev) => (prev === null ? 0 : (prev + 1) % DETECTIVE_TIPS.length));
  };

  const isFloodTheme = selectedExpedition === "imerg";

  if (minimized) {
    return (
      <div className="fixed bottom-3 left-3 z-50 animate-in fade-in duration-200">
        <button
          type="button"
          onMouseEnter={() => playChime("hover")}
          onClick={() => {
            playChime("click");
            setMinimized(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/85 border-2 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all font-mono text-xs font-bold"
          title="Open First Mate Piper Dialogue"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={piperPose}
            alt="Piper"
            className="w-7 h-7 rounded-full object-cover border border-amber-300"
          />
          <span>First Mate Piper</span>
          <ChevronRight size={14} className="text-amber-400 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pb-2 pointer-events-none select-none transition-all duration-300"
      aria-label="First Mate Piper Companion"
    >
      <div className="w-full max-w-5xl mx-auto flex items-end gap-3 pointer-events-auto">
      {/* Interactive Mascot Sprite */}
      <div
        className="shrink-0 cursor-pointer group relative select-none"
        onClick={handlePiperClick}
        title="Click First Mate Piper for detective tips!"
      >
        {/* Glow halo behind Piper */}
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-80 transition-opacity ${
            isFloodTheme ? "bg-cyan-500" : "bg-amber-400"
          }`}
        />

        {/* Mascot Avatar Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={piperPose}
          alt="First Mate Piper"
          className={`h-24 sm:h-32 md:h-36 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] animate-piper-idle group-hover:scale-105 active:scale-95 transition-transform duration-200 ${
            isTalking ? "brightness-110" : ""
          }`}
        />

        {/* Click hint pill */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/85 border border-amber-400 text-[8px] font-mono font-bold text-amber-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          💡 Click for Tip
        </div>
      </div>

      {/* RPG Dialogue Window */}
      <div
        className={`flex-1 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md border-2 font-mono transition-all duration-200 ${
          isFloodTheme
            ? "bg-[#021324]/95 border-cyan-400/90 shadow-[0_0_25px_rgba(6,182,212,0.35)]"
            : "bg-[#04121a]/95 border-emerald-500/90 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
        }`}
      >
        {/* Top Header & Nameplate */}
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Compass
              size={13}
              className={`${isFloodTheme ? "text-cyan-400" : "text-emerald-400"} animate-spin-slow`}
            />
            <span
              className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                isFloodTheme ? "text-cyan-200" : "text-emerald-200"
              }`}
            >
              FIRST MATE PIPER · NAVIGATOR
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Wave Indicator */}
            <div className="flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded bg-black/60 border border-white/10">
              <span className={`w-0.5 rounded-full ${isFloodTheme ? "bg-cyan-400" : "bg-emerald-400"} piper-wave-bar-1`} />
              <span className="w-0.5 rounded-full bg-teal-300 piper-wave-bar-2" />
              <span className={`w-0.5 rounded-full ${isFloodTheme ? "bg-cyan-400" : "bg-emerald-400"} piper-wave-bar-3`} />
              <span className="text-[7.5px] text-slate-300 font-bold ml-1 uppercase hidden sm:inline">
                ACTIVE
              </span>
            </div>

            {/* Minimize button */}
            <button
              type="button"
              onMouseEnter={() => playChime("hover")}
              onClick={() => {
                playChime("click");
                setMinimized(true);
              }}
              className="text-slate-400 hover:text-white text-xs px-1 hover:bg-white/10 rounded transition-colors"
              title="Minimize Piper"
            >
              −
            </button>
          </div>
        </div>

        {/* Dynamic Dialogue Text */}
        <p className="text-[11px] sm:text-xs text-slate-100 leading-snug drop-shadow-sm min-h-[32px] flex items-center">
          <span>{dialogueText}</span>
          <span className="typing-cursor ml-1" />
        </p>

        {/* Action Button Row */}
        {actionButton && <div className="mt-2 flex items-center justify-end gap-2">{actionButton}</div>}
      </div>
    </div>
  </aside>
);
}
