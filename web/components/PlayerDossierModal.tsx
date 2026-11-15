"use client";

import { useEffect, useState } from "react";
import { X, Award, ShieldCheck, Compass, Zap, Download, Target, Satellite, Radio, RotateCcw } from "lucide-react";
import { PlayerStatsManager, type PlayerCareerStats } from "../lib/player-stats";
import { playChime } from "../lib/game-audio";

interface PlayerDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerDossierModal({ isOpen, onClose }: PlayerDossierModalProps) {
  const [stats, setStats] = useState<PlayerCareerStats>(PlayerStatsManager.getStats());

  useEffect(() => {
    const unsub = PlayerStatsManager.subscribe(() => {
      setStats({ ...PlayerStatsManager.getStats() });
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const nextLevelExp = stats.rankLevel * 250;
  const progressPct = Math.min(100, Math.round((stats.totalExp / Math.max(1, nextLevelExp)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#06141c] via-[#040e15] to-[#02070a] border-2 border-emerald-500/60 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] text-slate-100 p-5 sm:p-6 font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playChime("click");
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-400 transition-colors cursor-pointer"
          aria-label="Close Dossier"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-emerald-500/20">
          <div className="w-12 h-12 rounded-xl border-2 border-emerald-400 bg-black/60 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <Compass size={24} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                OFFICIAL NASA DETECTIVE RECORD
              </span>
              <span className="text-[10px] font-mono text-slate-400">ID: TP-8842</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-wide mt-0.5">
              INVESTIGATOR CAREER DOSSIER
            </h2>
          </div>
        </div>

        {/* Commander Rank & EXP Progress */}
        <div className="mt-5 p-4 rounded-xl bg-black/50 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-950/40 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0">
              {stats.rankLevel >= 4 ? "🌟" : stats.rankLevel >= 3 ? "⚡" : "🧭"}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                ACTIVE COMMISSION
              </span>
              <h3 className="text-lg font-bold font-mono text-amber-300 leading-tight">
                {stats.rankTitle}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Level {stats.rankLevel} · {stats.totalExp} Total EXP
              </p>
            </div>
          </div>

          {/* EXP Progress Bar */}
          <div className="w-full sm:w-48 text-right font-mono text-xs">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Next Rank</span>
              <span className="text-emerald-300 font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Core Performance Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">SCIENTIFIC ACCURACY</span>
            <span className="text-xl font-black font-mono text-emerald-400 block mt-1">
              {stats.scientificAccuracyPct}%
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Verified Empirical</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">MISSIONS COMPLETED</span>
            <span className="text-xl font-black font-mono text-white block mt-1">
              {stats.missionsCompleted}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Heat / Flood / Drought</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">HYPOTHESES CONFIRMED</span>
            <span className="text-xl font-black font-mono text-amber-300 block mt-1">
              {stats.hypothesesConfirmed}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Statistical Wins</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">SKEPTIC DISCOVERIES</span>
            <span className="text-xl font-black font-mono text-purple-300 block mt-1">
              {stats.prudentSkepticCount}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Truth Preserved</span>
          </div>
        </div>

        {/* Space Telemetry & Exploration Matrix */}
        <div className="mt-4 p-4 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
            <Satellite size={14} />
            <span>ORBITAL TELEMETRY &amp; EXPEDITIONS EXPLORED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">ORBITAL VELOCITY</span>
              <span className="text-white font-bold">{stats.orbitalVelocityKmS} km/s</span>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">OBSERVATIONS ANALYZED</span>
              <span className="text-white font-bold">{stats.dataPointsAnalyzed.toLocaleString()} points</span>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">SATELLITE FEEDS SYNCED</span>
              <span className="text-teal-300 font-bold">{stats.satellitesSynced} Verified Feeds</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400">Regions Explored:</span>
            {stats.hotspotsExplored.map((h) => (
              <span key={h} className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Earned NASA Detective Badges */}
        <div className="mt-4">
          <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold mb-2">
            <Award size={14} />
            <span>EARNED DETECTIVE BADGES ({stats.badges.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {stats.badges.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-gradient-to-b from-amber-950/20 to-black/60 border border-amber-500/30 flex items-start gap-2.5 shadow-md"
              >
                <span className="text-2xl shrink-0 mt-0.5">{b.icon}</span>
                <div>
                  <h4 className="text-xs font-bold font-mono text-white leading-tight">{b.name}</h4>
                  <span className="text-[9px] font-mono text-amber-400/80 block mt-0.5">{b.unlockedAt}</span>
                  <p className="text-[10px] text-slate-300 mt-1 font-sans line-clamp-2">{b.description}</p>
                </div>
              </div>
            ))}
            {stats.badges.length === 0 && (
              <p className="text-xs text-slate-400 font-mono col-span-3 py-3 text-center">
                No badges earned yet. Complete your first planetary crisis mission to earn badges!
              </p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playChime("click");
              PlayerStatsManager.exportDossier();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export Official Dossier (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playChime("click");
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
