"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Compass,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  X,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { playChime } from "../lib/game-audio";
import type { BoundingBox } from "../lib/types";

export interface VoyageEntry {
  id: string;
  date: string;
  territory: string;
  bbox: BoundingBox;
  missionName: string;
  prediction: "rising" | "falling" | "no_significant" | "unsure" | "yes" | "no";
  verdict: "significant" | "not_significant" | "inconclusive";
  ratePerDecade: number;
  pValue: number | null;
  badgeName: string;
  badgeIcon: string;
  pointsEarned: number;
}

export function getVoyageLog(): VoyageEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("tc-voyage-log");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVoyageEntry(entry: Omit<VoyageEntry, "id" | "date">): VoyageEntry {
  const newEntry: VoyageEntry = {
    ...entry,
    id: `voyage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getVoyageLog();
      const updated = [newEntry, ...existing];
      localStorage.setItem("tc-voyage-log", JSON.stringify(updated.slice(0, 50)));
    } catch {
      // Storage access blocked or unavailable
    }
  }

  return newEntry;
}

export function calculateVoyageStats(log: VoyageEntry[]) {
  const totalPoints = log.reduce((sum, e) => sum + (e.pointsEarned || 0), 0);
  const territories = new Set(log.map((e) => e.territory)).size;
  const uniqueBadges = new Set(log.map((e) => e.badgeName)).size;

  let rank = "Cadet Navigator";
  if (totalPoints >= 300 || log.length >= 5) {
    rank = "Master Star Galleon Commander";
  } else if (totalPoints >= 180 || log.length >= 3) {
    rank = "Astrolabe Officer";
  } else if (totalPoints >= 80 || log.length >= 1) {
    rank = "Planetary Explorer";
  }

  return { totalPoints, expeditions: log.length, territories, uniqueBadges, rank };
}

export function VoyageLogModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [log, setLog] = useState<VoyageEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLog(getVoyageLog());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stats = calculateVoyageStats(log);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Star Galleon Voyage Logbook and Discoveries"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#040e17] border-2 border-amber-400/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-400/30 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full border border-amber-400/60 bg-amber-950/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(202,164,85,0.3)]">
              <Compass size={22} className="animate-spin-slow" />
            </span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Sparkles size={11} />
                <span>TECH PIRATES ARCHIVES</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Star Galleon Voyage Logbook
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime("click");
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Close voyage log"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Captain Rank & Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center">
              <div className="text-[10px] font-mono uppercase text-amber-300/80">
                Explorer Rank
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-200 mt-1 line-clamp-1">
                {stats.rank}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/40 text-center">
              <div className="text-[10px] font-mono uppercase text-teal-300/80">
                Discovery Points
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-teal-300 mt-0.5">
                {stats.totalPoints} pts
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Expeditions Logged
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                {stats.expeditions}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Territories Mapped
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-300 mt-0.5">
                {stats.territories}
              </div>
            </div>
          </div>

          {/* Badges Earned Section */}
          <div>
            <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award size={14} />
              <span>Scientist Badges &amp; Recognitions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-start gap-3">
                <span className="text-2xl">🏅</span>
                <div>
                  <div className="text-xs font-bold text-amber-200">Keen Navigator</div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Accurately predicted a warming or cooling trend confirmed by verified NASA satellite observations.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-start gap-3">
                <span className="text-2xl">🔬</span>
                <div>
                  <div className="text-xs font-bold text-teal-200">Careful Scientist</div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Recognized natural variability or correctly identified an inconclusive trend where data shows no statistically significant drift.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-start gap-3">
                <span className="text-2xl">⚖️</span>
                <div>
                  <div className="text-xs font-bold text-cyan-200">Prudent Skeptic</div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Selected &ldquo;Unsure&rdquo; and waited for the empirical evidence. Uncertainty-aware play is respected science!
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-start gap-3">
                <span className="text-2xl">🧭</span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Honest Observer</div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Accepted observations when they disagreed with prior hunches. In science, truth always supersedes assumption.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Expeditions History List */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Completed Expedition Records</span>
            </h3>

            {log.length === 0 ? (
              <div className="p-6 rounded-xl bg-black/40 border border-dashed border-slate-700 text-center">
                <p className="text-xs text-slate-400">
                  No expeditions completed yet. Embark on your first voyage from the Star Deck to record planetary observations!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {log.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-amber-400" />
                        <span className="font-bold text-white text-sm">
                          {entry.territory}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {entry.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-300">
                        <span>
                          Predicted:{" "}
                          <strong className="text-amber-300 uppercase">
                            {entry.prediction.replace("_", " ")}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Verdict:{" "}
                          <strong
                            className={
                              entry.verdict === "significant"
                                ? "text-teal-400"
                                : "text-slate-300"
                            }
                          >
                            {entry.verdict === "significant"
                              ? "Significant"
                              : "Inconclusive"}
                          </strong>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-amber-200">
                          {entry.ratePerDecade > 0 ? "+" : ""}
                          {entry.ratePerDecade.toFixed(2)} °C/dec
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[11px] font-medium flex items-center gap-1.5">
                        <span>{entry.badgeIcon}</span>
                        <span>{entry.badgeName}</span>
                      </div>
                      <span className="font-mono text-teal-400 font-bold text-xs">
                        +{entry.pointsEarned} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-black/40 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>All logs stored locally on this workstation.</span>
          <button
            type="button"
            onClick={() => {
              playChime("click");
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-teal-500/20 border border-teal-400 text-teal-200 hover:bg-teal-500/30 font-bold transition-all"
          >
            Return to Deck
          </button>
        </div>
      </div>
    </div>
  );
}
