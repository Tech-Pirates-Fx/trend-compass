"use client";

import React from "react";
import { Compass, ChevronRight } from "lucide-react";
import type { GameLevel } from "./types";

export interface PersistentPiperProps {
  level: GameLevel;
  pose: string;
  currentLine: string;
  canAdvance: boolean;
  onAdvance: () => void;
  isTargetLocked: boolean;
  onActionClick?: () => void;
  actionText?: string;
}

export function PersistentPiper({
  level,
  pose,
  currentLine,
  canAdvance,
  onAdvance,
  isTargetLocked,
  onActionClick,
  actionText,
}: PersistentPiperProps) {
  return (
    <div className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 z-40 flex items-end justify-between gap-3 pointer-events-none select-none">
      {/* PIPER MASCOT + INTERACTIVE DIALOGUE BOX (ANCHORED AT BOTTOM-LEFT) */}
      <div className="flex items-end gap-2.5 sm:gap-4 max-w-2xl pointer-events-auto">
        {/* Mascot Avatar */}
        <div className="shrink-0 relative group select-none">
          <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl group-hover:bg-amber-400/40 transition-all pointer-events-none" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pose}
            alt="First Mate Piper"
            className="h-28 sm:h-36 md:h-40 object-contain animate-piper-idle drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
          />
        </div>

        {/* Connected Dialogue Bubble Box */}
        <div className="flex-1 bg-[#04121a]/95 border-2 border-amber-400/80 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md font-mono text-white flex flex-col justify-between min-h-[92px] sm:min-h-[105px]">
          {/* Header Nameplate */}
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-amber-400/30 text-[10px] text-amber-300">
            <span className="font-black tracking-wider flex items-center gap-1">
              <Compass size={12} className="animate-spin-slow text-amber-400" />
              FIRST MATE PIPER · NAVIGATOR
            </span>

            {/* Speech Waveform Animation */}
            <div className="flex items-end gap-0.5 h-2.5 px-1 rounded bg-black/60">
              <span className="w-0.5 rounded bg-amber-400 piper-wave-bar-1" />
              <span className="w-0.5 rounded bg-teal-300 piper-wave-bar-2" />
              <span className="w-0.5 rounded bg-amber-400 piper-wave-bar-3" />
            </div>
          </div>

          {/* Current Dialogue Sentence */}
          <p className="text-xs sm:text-sm text-slate-100 font-sans font-medium leading-snug drop-shadow-sm flex items-center min-h-[32px]">
            <span>{currentLine}</span>
            <span className="typing-cursor ml-1" />
          </p>

          {/* Dialogue Continuation Button or Next Step Hint */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="hidden sm:inline">
              Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-600 text-white font-bold">Space</kbd> or <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-600 text-white font-bold">Enter ↵</kbd>
            </span>

            {canAdvance ? (
              <button
                type="button"
                onClick={onAdvance}
                className="px-3 py-1 rounded-lg bg-emerald-400 text-black font-black uppercase tracking-wider hover:bg-emerald-300 transition-all flex items-center gap-1 shadow-md active:scale-95 ml-auto cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight size={13} />
              </button>
            ) : (
              <span className="text-amber-300 font-bold ml-auto flex items-center gap-1">
                {level === 1 && "Click Start Adventure below ➔"}
                {level === 2 && "Click an expedition above ➔"}
                {level === 3 && (isTargetLocked ? "Lock target & proceed ➔" : "Click a hotspot on the globe ➔")}
                {level === 4 && "Select your prediction above ➔"}
                {level === 5 && "Scanning telemetry in progress…"}
                {level === 6 && "Discovery Complete! ➔"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT CONTEXTUAL ACTION CONTROLS */}
      {actionText && onActionClick && (
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            type="button"
            onClick={onActionClick}
            className="arcade-physical-btn arcade-physical-btn-gold px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black flex items-center gap-2 shadow-2xl animate-in zoom-in-95 duration-200 cursor-pointer"
          >
            <span>{actionText}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
