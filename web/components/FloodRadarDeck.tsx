"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  CloudRain,
  Droplets,
  Radio,
  MapPin,
  Activity,
  Shield,
  Waves,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Search,
  Crosshair,
} from "lucide-react";
import { Country } from "../lib/geography";

// Dynamically load GlobeCanvas to prevent SSR canvas issues
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-cyan-300 font-mono text-xs gap-2">
      <div className="w-8 h-8 rounded-full border border-cyan-400 border-t-transparent animate-spin" />
      <span>Calibrating Planetary Astrolabe…</span>
    </div>
  ),
});

export interface FloodBasin {
  name: string;
  region: string;
  riskLevel: "CRITICAL" | "ELEVATED" | "MONITORED";
  rainfallRate: string;
  bbox: { south: number; north: number; west: number; east: number };
  description: string;
}

export const FLOOD_BASINS: FloodBasin[] = [
  {
    name: "Ganges-Brahmaputra Delta",
    region: "India / Bangladesh",
    riskLevel: "CRITICAL",
    rainfallRate: "8.5 mm/day",
    bbox: { south: 20.0, north: 28.0, west: 86.0, east: 94.0 },
    description: "Vulnerable to extreme summer monsoon surges, Himalayan glacial runoff, and Bay of Bengal cyclone storm surges.",
  },
  {
    name: "Indus River Basin",
    region: "Pakistan / NW India",
    riskLevel: "CRITICAL",
    rainfallRate: "4.2 mm/day",
    bbox: { south: 24.0, north: 37.0, west: 67.0, east: 76.0 },
    description: "Site of catastrophic 2022 mega-floods submerged 1/3 of the basin under persistent monsoonal low-pressure systems.",
  },
  {
    name: "Yangtze River Basin",
    region: "Central China",
    riskLevel: "ELEVATED",
    rainfallRate: "6.8 mm/day",
    bbox: { south: 26.0, north: 34.0, west: 102.0, east: 122.0 },
    description: "East Asian summer Meiyu front triggers heavy plum rains across the Three Gorges watershed and central plain.",
  },
  {
    name: "Mississippi River Plain",
    region: "United States",
    riskLevel: "ELEVATED",
    rainfallRate: "5.1 mm/day",
    bbox: { south: 29.0, north: 38.0, west: -94.0, east: -88.0 },
    description: "Gulf moisture corridors fuel prolonged spring squalls and flood plain inundation across the lower valley.",
  },
  {
    name: "Rhine River Basin",
    region: "Western Europe",
    riskLevel: "MONITORED",
    rainfallRate: "3.4 mm/day",
    bbox: { south: 47.0, north: 52.0, west: 6.0, east: 10.0 },
    description: "Atlantic atmospheric river deluges trapped over central European topography caused severe 2021 flooding.",
  },
  {
    name: "Amazon Tropical Basin",
    region: "Brazil / South America",
    riskLevel: "MONITORED",
    rainfallRate: "9.2 mm/day",
    bbox: { south: -10.0, north: 4.0, west: -72.0, east: -50.0 },
    description: "World's largest hydrological system exhibiting intensification of wet-season rainfall pulses and river swell.",
  },
];

interface FloodRadarDeckProps {
  targetName: string;
  targetBBox: { south: number; north: number; west: number; east: number };
  countries: Country[];
  selectedCountry: Country | null;
  onSelectCountry: (country: Country) => void;
  onSelectTarget: (name: string, bbox: { south: number; north: number; west: number; east: number }) => void;
  onProceed: () => void;
  onSwitchToHeat: () => void;
  onOpenInstrument: (instrumentId: string) => void;
  playChime: (sound: any) => void;
}

export function FloodRadarDeck({
  targetName,
  targetBBox,
  countries,
  selectedCountry,
  onSelectCountry,
  onSelectTarget,
  onProceed,
  onSwitchToHeat,
  onOpenInstrument,
  playChime,
}: FloodRadarDeckProps) {
  const [radarSweepAngle, setRadarSweepAngle] = useState(0);
  const [activeTab, setActiveTab] = useState<"basins" | "radar" | "instruments">("basins");
  const [filterQuery, setFilterQuery] = useState("");

  // Animated Doppler Radar Sweep (60 FPS rotation)
  useEffect(() => {
    let animId: number;
    let start = performance.now();
    const loop = (now: number) => {
      const elapsed = now - start;
      setRadarSweepAngle((elapsed * 0.09) % 360);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const filteredBasins = FLOOD_BASINS.filter(
    (b) =>
      b.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.region.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-6xl mx-auto py-2 gap-3 z-30 font-mono text-white animate-in fade-in duration-300">
      {/* ===================================================================
          TOP FLOOD RADAR HUD BAR
          =================================================================== */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-[#02182b]/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#22d3ee]">
            <CloudRain size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-cyan-200 tracking-wider uppercase flex items-center gap-2">
              <span>NASA GPCP v2.3 · EXTREME PRECIPITATION RADAR</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] bg-cyan-500/25 border border-cyan-300 text-cyan-100 font-bold">
                RADAR ARMED
              </span>
            </div>
            <div className="text-[10px] text-cyan-300/80">
              Multi-Satellite Microwave Sounders (SSM/I, SSMIS) + GPM Ku-Band Radar · 1979–2026 Climate Record
            </div>
          </div>
        </div>

        {/* Rain Reflectivity Scale Legend */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] bg-black/70 px-3 py-1.5 rounded-lg border border-cyan-500/30">
          <span className="text-cyan-400 font-bold uppercase">RAIN RATE (mm/d):</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">0-2 Light</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">2-10 Moderate</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-900 border border-blue-400 text-blue-200 font-bold">10-25 Heavy</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-900 border border-purple-400 text-purple-200 font-bold">25+ Deluge</span>
        </div>
      </div>

      {/* ===================================================================
          MAIN FLOOD OPERATIONS CONSOLE (SPLIT VIEW)
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        {/* LEFT / CENTER (7 cols): DOPPLER RADAR TERMINAL & GLOBAL BASIN MATRIX */}
        <div className="lg:col-span-7 rounded-2xl bg-[#021324]/95 border-2 border-cyan-500/80 p-4 shadow-2xl flex flex-col justify-between gap-3 relative overflow-hidden backdrop-blur-md">
          {/* Cyan Corner Brackets */}
          <div className="hud-corner-tl text-cyan-400" />
          <div className="hud-corner-tr text-cyan-400" />
          <div className="hud-corner-bl text-cyan-400" />
          <div className="hud-corner-br text-cyan-400" />

          {/* Terminal Sub-header */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <div className="flex items-center gap-2">
              <Crosshair size={14} className="text-cyan-400 animate-spin" />
              <span className="text-xs font-black text-cyan-200 tracking-wider uppercase">
                INTERACTIVE GLOBAL PRECIPITATION GLOBE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>CLICK &amp; DRAG GLOBE</span>
            </div>
          </div>

          {/* 3D Canvas Globe with Sci-Fi Radar Reticle & Brackets */}
          <div className="h-52 sm:h-56 w-full relative rounded-xl overflow-hidden bg-black/70 border-2 border-cyan-500/50 flex items-center justify-center shadow-inner group">
            <GlobeCanvas
              countries={countries}
              selected={selectedCountry || undefined}
              bbox={targetBBox}
              onSelect={onSelectCountry}
            />

            {/* Targeting Reticle Centerpiece */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-cyan-400/25 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-blue-400/35" />
                <div className="w-2 h-2 rounded-full bg-cyan-400/70 animate-ping" />
              </div>
            </div>

            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/90 px-2.5 py-1 rounded border border-cyan-500/40 backdrop-blur-sm flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>⌖ TARGET: {targetName.toUpperCase()}</span>
            </div>
            <div className="absolute top-2 right-2 text-[9px] font-mono text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/30">
              2.5°×2.5° GPCP
            </div>
            <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/30">
              ACTIVE SENSORS
            </div>
          </div>

          {/* Major Flood Basins Grid (Quick-select flood hotspots) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Waves size={13} className="text-cyan-400" />
                <span>SELECT RIVER BASIN OR DELUGE HOTSPOT:</span>
              </span>
              <span className="text-[10px] text-cyan-400/70">Click to arm sensors</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FLOOD_BASINS.map((basin) => {
                const isSelected = targetName === basin.name;
                return (
                  <button
                    key={basin.name}
                    type="button"
                    onMouseEnter={() => playChime("hover")}
                    onClick={() => {
                      playChime("click");
                      onSelectTarget(basin.name, basin.bbox);
                    }}
                    className={`p-2 rounded-lg text-left transition-all active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? "bg-cyan-500/30 border-2 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] text-white scale-102"
                        : "bg-black/60 border border-cyan-500/40 text-cyan-100 hover:border-cyan-400 hover:bg-cyan-950/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black tracking-tight line-clamp-1">
                        {basin.name}
                      </span>
                      <span
                        className={`text-[8.5px] px-1 py-0.2 rounded font-bold uppercase ${
                          basin.riskLevel === "CRITICAL"
                            ? "bg-red-500/30 border border-red-400 text-red-200"
                            : basin.riskLevel === "ELEVATED"
                            ? "bg-amber-500/30 border border-amber-400 text-amber-200"
                            : "bg-cyan-500/30 border border-cyan-400 text-cyan-200"
                        }`}
                      >
                        {basin.riskLevel}
                      </span>
                    </div>
                    <div className="text-[9px] text-cyan-300/80 font-mono">
                      {basin.region} · {basin.rainfallRate}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT (5 cols): FLOOD TELEMETRY, INSTRUMENTS & LAUNCH PREDICTION */}
        <div className="lg:col-span-5 rounded-2xl bg-[#021324]/95 border-2 border-cyan-500/80 p-4 shadow-2xl flex flex-col justify-between gap-3 relative backdrop-blur-md">
          {/* Cyan Corner Brackets */}
          <div className="hud-corner-tl text-cyan-400" />
          <div className="hud-corner-tr text-cyan-400" />
          <div className="hud-corner-bl text-cyan-400" />
          <div className="hud-corner-br text-cyan-400" />

          <div className="space-y-2.5">
            {/* Header: Flood Station Telemetry */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <span className="text-xs font-black text-cyan-200 tracking-wider uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                <span>FLOOD OBSERVATION INSTRUMENTS</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-bold uppercase">
                3 RADAR TOOLS
              </span>
            </div>

            {/* 3 Interactive Flood Instrument Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onMouseEnter={() => playChime("hover")}
                onClick={() => {
                  playChime("coin");
                  onOpenInstrument("gpcp_radar");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/70 border-2 border-cyan-500/80 text-cyan-100 font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-900 hover:border-cyan-400 hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <CloudRain size={15} className="text-cyan-300" />
                  <span>1. NASA GPCP v2.3 RADAR</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-normal">SPECS ➔</span>
              </button>

              <button
                type="button"
                onMouseEnter={() => playChime("hover")}
                onClick={() => {
                  playChime("coin");
                  onOpenInstrument("rainfall_trend");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/70 border-2 border-cyan-500/80 text-cyan-100 font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-900 hover:border-cyan-400 hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Activity size={15} className="text-teal-300" />
                  <span>2. THEIL–SEN RAINFALL RATE</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-normal">SPECS ➔</span>
              </button>

              <button
                type="button"
                onMouseEnter={() => playChime("hover")}
                onClick={() => {
                  playChime("coin");
                  onOpenInstrument("monsoon_mk");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/70 border-2 border-cyan-500/80 text-cyan-100 font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-900 hover:border-cyan-400 hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Shield size={15} className="text-cyan-400" />
                  <span>3. MONSOON HAMED–RAO MK</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-normal">SPECS ➔</span>
              </button>
            </div>

            {/* Target Basin Telemetry Card */}
            <div className="p-3 rounded-xl bg-black/80 border border-cyan-500/50 font-mono space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  LOCKED FLOOD BASIN
                </span>
                <span className="text-[10px] text-teal-300 font-bold">
                  {targetBBox.south.toFixed(1)}° to {targetBBox.north.toFixed(1)}° Lat
                </span>
              </div>
              <div className="text-lg font-black text-white flex items-center gap-2">
                <MapPin size={16} className="text-cyan-400" />
                <span className="line-clamp-1">{targetName}</span>
              </div>
              <div className="text-[10.5px] text-slate-200">
                Archive: <strong className="text-cyan-200">NASA GPCP v2.3 Multi-Satellite Precipitation (2000–2020)</strong> · 252 Records
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS: PROCEED TO PREDICTION OR SWITCH TO HEAT */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onMouseEnter={() => playChime("hover")}
              onClick={() => {
                playChime("continue");
                onProceed();
              }}
              className="arcade-physical-btn arcade-physical-btn-blue text-cyan-100 w-full py-3.5 text-xs sm:text-sm font-black tracking-wider uppercase shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-95"
            >
              <span>PROCEED TO DETECTIVE PREDICTION ➔</span>
            </button>

            <button
              type="button"
              onMouseEnter={() => playChime("hover")}
              onClick={onSwitchToHeat}
              className="arcade-physical-btn arcade-physical-btn-red text-red-200 w-full py-2 text-xs font-bold"
            >
              SWITCH TO LIVE HEAT EXPEDITION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
