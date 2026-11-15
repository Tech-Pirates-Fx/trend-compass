"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Volume2, VolumeX, Moon, Sun, Menu, X, ShieldCheck, AlertTriangle, Award } from "lucide-react";
import { playChime, toggleMute, getMuted } from "../lib/game-audio";
import { BackgroundMusicPlayer } from "./BackgroundMusicPlayer";
import { useDataControl } from "./DataControl";
import { PlayerStatsManager, type PlayerCareerStats } from "../lib/player-stats";
import { PlayerDossierModal } from "./PlayerDossierModal";

export function Navbar() {
  const pathname = usePathname() || "/";
  const { inventory } = useDataControl();
  const [dark, setDark] = useState(true);
  const [muted, setMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [stats, setStats] = useState<PlayerCareerStats>(PlayerStatsManager.getStats());

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMuted(getMuted());
    const unsub = PlayerStatsManager.subscribe(() => {
      setStats({ ...PlayerStatsManager.getStats() });
    });
    return unsub;
  }, []);

  function handleToggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tc-theme", next ? "dark" : "light");
    } catch {
      // Theme works without storage.
    }
  }

  function handleToggleAudio() {
    const nextMuted = toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) playChime("click");
  }

  // Exactly three primary game bar destinations
  const navLinks = [
    {
      href: "/",
      label: "PLAY MISSIONS",
      icon: "🕹️",
      active: pathname === "/" || pathname === "/play",
    },
    {
      href: "/about",
      label: "CREW & ABOUT",
      icon: "👥",
      active:
        pathname.startsWith("/about") ||
        pathname.startsWith("/members") ||
        pathname.startsWith("/mission") ||
        pathname.startsWith("/summary"),
    },
    {
      href: "/data",
      label: "DATA VAULT",
      badge: "19",
      icon: "🛡️",
      active: pathname.startsWith("/data") || pathname.startsWith("/sources"),
    },
  ];

  return (
    <header className="voyage-nav sticky top-0 z-50 h-14 border-b border-emerald-500/20 bg-[#040e17]/95 backdrop-blur-md">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={() => playChime("click")}
            className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
            aria-label="Trend Compass Home"
          >
            <span className="w-8 h-8 rounded-lg border-2 border-emerald-400/70 bg-black/60 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.35)] group-hover:scale-105 group-hover:border-emerald-300 transition-all">
              <Compass size={18} strokeWidth={2} className="transition-transform group-hover:rotate-45" />
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-white">
                TREND COMPASS
              </span>
              <div className="flex items-center gap-1 font-mono text-[9px] tracking-widest leading-none mt-0.5">
                <span className="text-slate-400 font-normal lowercase">by</span>
                <span className="text-amber-400 font-bold uppercase">TECH PIRATES</span>
                <span className="text-[10px]">🏴‍☠️</span>
              </div>
            </div>
          </Link>

          {/* Arcade Game Bar Nav Destinations on Desktop */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-2 font-mono text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => playChime("hover")}
                onClick={() => playChime("click")}
                className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all duration-150 active:scale-95 ${
                  link.active
                    ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    : "bg-black/40 border border-slate-700/60 text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-950/30"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Controls: Sensor Pill, Audio, Theme, Mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Career Dossier Button */}
          <button
            type="button"
            onClick={() => {
              playChime("click");
              setIsDossierOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-950/70 via-black/80 to-amber-950/70 border border-amber-500/60 text-amber-300 text-[11px] font-mono hover:border-amber-400 hover:scale-105 transition-all shadow-sm cursor-pointer"
            title="Open Investigator Career Record & Stats"
          >
            <span className="text-xs">🏆</span>
            <span className="font-bold">{stats.totalExp} EXP</span>
            <span className="hidden xl:inline text-slate-400 text-[9px]">· {stats.rankTitle.toUpperCase()}</span>
          </button>

          {/* Master Sensor Status Pill */}
          {inventory?.can_play === false ? (
            <Link
              href="/data"
              onClick={() => playChime("click")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/60 text-amber-300 text-[11px] font-mono hover:bg-amber-900/80 transition-colors"
              title="Observation sensors are offline. Click to open Data Management."
            >
              <AlertTriangle size={12} className="text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">SENSORS OFF</span>
            </Link>
          ) : (
            <Link
              href="/data"
              onClick={() => playChime("click")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono hover:bg-emerald-900/60 transition-colors shadow-sm"
              title="Verified NASA & NOAA telemetry live."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden sm:inline font-bold">19 LIVE DATASETS</span>
            </Link>
          )}

          {/* Mild Ambient Background Music Controller */}
          <BackgroundMusicPlayer />

          {/* Web Audio SFX Toggle */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-slate-700/60 text-slate-300 hover:text-white hover:border-emerald-400/50 text-xs font-mono transition-colors"
            title={muted ? "Unmute game audio" : "Mute game audio"}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
            <span className="text-[10px] hidden lg:inline font-bold">{muted ? "SFX OFF" : "SFX ON"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="w-8 h-8 rounded-lg bg-black/40 border border-slate-700/60 flex items-center justify-center text-amber-300 hover:text-white hover:border-amber-400/50 transition-colors"
            title={dark ? "Switch to daylight mode" : "Switch to cosmic night mode"}
            aria-label="Toggle visual theme"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg bg-black/40 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <nav aria-label="Mobile Navigation" className="md:hidden border-b border-emerald-500/20 bg-[#040e17]/98 px-5 py-3 space-y-2 font-mono text-sm shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                playChime("click");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg font-bold transition-colors ${
                link.active
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[10px]">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {/* Investigator Career Dossier Modal */}
      <PlayerDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </header>
  );
}
