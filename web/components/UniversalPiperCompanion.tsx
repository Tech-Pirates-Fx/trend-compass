"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Award, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { playChime, toggleMute, getMuted } from "../lib/game-audio";

interface UniversalPiperCompanionProps {
  onOpenDossier: () => void;
}

export function UniversalPiperCompanion({ onOpenDossier }: UniversalPiperCompanionProps) {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(getMuted());
  }, []);

  // Do not render on full-screen game mode or voyage (where game engine has its own Piper)
  if (pathname === "/" || pathname === "/play" || pathname === "/voyage") {
    return null;
  }

  function getContextualMessage(): {
    title: string;
    dialogue: string;
    quickLink?: { label: string; href: string };
  } {
    if (pathname.startsWith("/data") || pathname.startsWith("/sources")) {
      return {
        title: "DATA VAULT LOGBOOK 📜",
        dialogue:
          "Ahoy, Navigator! Ye stand before our 15-dataset telemetry vault! Step 1: Click any row to inspect official publication dates and cryptographic SHA-256 receipts. Step 2: Toggle server switches below to test offline fail-safes!",
        quickLink: { label: "Play Crisis Missions", href: "/" },
      };
    }
    if (pathname.startsWith("/about") || pathname.startsWith("/crew")) {
      return {
        title: "TECH PIRATES ROSTER 🏴‍☠️",
        dialogue:
          "Welcome to our pirate quarters, Matey! Captain Sam Joshua C leads our 6-member engineering crew crowned in the apex golden card. Every formula and regression line is peer-reviewed and 100% reproducible!",
        quickLink: { label: "Board the Galleon", href: "/" },
      };
    }
    if (pathname.startsWith("/judge")) {
      return {
        title: "HACKATHON AUDIT BRIEFING ⚖️",
        dialogue:
          "Avast ye, Space Apps Judges! Ye can audit our real GISTEMP v4 NetCDF arrays, independent non-parametric Python math, and local server-enforced controls right here. Zero synthetic numbers on this ship!",
        quickLink: { label: "Audit Telemetry", href: "/data" },
      };
    }
    if (
      pathname.startsWith("/summary") ||
      pathname.startsWith("/results") ||
      pathname.startsWith("/investigate")
    ) {
      return {
        title: "CHIEF SCIENCE ADVISOR 🧭",
        dialogue:
          "Shiver me timbers, look at those curves! Theil-Sen calculates true monotonic drift without outlier skew, while Hamed-Rao modified Mann-Kendall silences autocorrelated noise storms!",
        quickLink: { label: "Data Vault", href: "/data" },
      };
    }
    return {
      title: "FIRST MATE PIPER 🦜",
      dialogue:
        "Ahoy, Navigator! Exploring the ship's archives? Ye can inspect yer investigator career dossier, verify our satellite observation grids, or jump back to the flight deck anytime!",
      quickLink: { label: "Embark on Mission", href: "/" },
    };
  }

  const context = getContextualMessage();

  return (
    <aside
      aria-label="First Mate Piper Companion"
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-6 z-40 select-none font-sans"
    >
      {/* =========================================================================
          PIRATE PARCHMENT SPEECH BUBBLE (WITH NAUTICAL FRAME & ARROW POINTER)
          ========================================================================= */}
      {isOpen && (
        <div className="relative mb-3 w-80 sm:w-96 rounded-2xl border-2 border-[#b45309] bg-gradient-to-b from-[#2a170a]/98 via-[#1c0f06]/98 to-[#100803]/98 p-4 shadow-[0_0_35px_rgba(245,158,11,0.35)] backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 text-slate-100">
          {/* Decorative Pirate Header Banner */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#b45309]/40">
            <div className="flex items-center gap-1.5">
              <span className="text-base">📜</span>
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#fef08a] drop-shadow">
                {context.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const nextMuted = toggleMute();
                  setMuted(nextMuted);
                  if (!nextMuted) playChime("click");
                }}
                className="p-1 rounded text-amber-300/80 hover:text-white transition-colors cursor-pointer"
                title={muted ? "Unmute Audio" : "Mute Audio"}
              >
                {muted ? (
                  <VolumeX size={13} className="text-red-400" />
                ) : (
                  <Volume2 size={13} className="text-[#fef08a]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  playChime("click");
                  setIsOpen(false);
                }}
                className="p-1 rounded text-amber-300/80 hover:text-white transition-colors cursor-pointer"
                title="Close Scroll"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Pirate Dialogue Text */}
          <p className="text-xs text-[#fef3c7] font-sans font-medium leading-relaxed mb-3.5 drop-shadow-sm">
            {context.dialogue}
          </p>

          {/* Nautical Action Buttons */}
          <div className="pt-2.5 border-t border-[#b45309]/30 flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => {
                playChime("click");
                onOpenDossier();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#381a08] hover:bg-[#52250b] border border-[#b45309] text-[#fef08a] font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Award size={12} className="text-amber-400" />
              <span>Career Dossier</span>
            </button>

            {context.quickLink && (
              <Link
                href={context.quickLink.href}
                onClick={() => playChime("click")}
                className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-slate-700 hover:border-[#b45309] text-slate-200 font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>{context.quickLink.label}</span>
                <ExternalLink size={10} className="text-amber-400" />
              </Link>
            )}
          </div>

          {/* Speech Bubble Arrow Pointer Tail pointing down to Piper */}
          <div className="absolute -bottom-3 right-8 sm:right-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-[#b45309]" />
          <div className="absolute -bottom-2.5 right-8 sm:right-10 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[10px] border-t-[#100803]" />
        </div>
      )}

      {/* =========================================================================
          NATURAL STANDING PIPER (OUTWARDS SPRITE, NO CIRCLE WRAPPER)
          ========================================================================= */}
      <div className="flex flex-col items-end">
        {!isOpen && (
          <div className="mb-1 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#211105]/95 to-[#120703]/95 border border-[#b45309]/60 text-[#fef08a] text-[10px] sm:text-[11px] font-mono font-bold shadow-lg backdrop-blur-md animate-bounce">
            <span>Talk to Piper</span>
            <span>💬</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            playChime("click");
            setIsOpen(!isOpen);
          }}
          className="group relative cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Talk with First Mate Piper"
        >
          <div className="relative flex flex-col items-center">
            {/* Full-body Standing Piper (Naturally Outward with Shadow) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot/piper-fullbody-intro.png"
              alt="First Mate Piper"
              className="h-28 sm:h-36 md:h-40 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] animate-piper-idle"
            />

            {/* Pirate Gold Tag Badge Beneath */}
            <div className="-mt-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#2a1708] to-[#120703] border-2 border-[#b45309] text-[#fef08a] font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1">
              <span>🏴‍☠️</span>
              <span>1ST MATE PIPER</span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
