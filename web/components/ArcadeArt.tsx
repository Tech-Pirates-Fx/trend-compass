"use client";

import React from "react";
import { Sparkles, X, Database, Activity, CheckCircle2, Compass } from "lucide-react";

/**
 * 1. HEAT ILLUS: Dramatic atmospheric warming with radiant sun, thermosphere glow & heatwave ripples.
 */
export function HeatIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#240808] flex items-center justify-center">
      <svg
        viewBox="0 0 200 130"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="heatSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#450a0a" />
            <stop offset="35%" stopColor="#991b1b" />
            <stop offset="65%" stopColor="#ea580c" />
            <stop offset="90%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="200" height="130" fill="url(#heatSky)" />

        {/* Atmospheric Cloud Formations */}
        <path d="M 0 35 Q 25 20, 50 32 T 100 30 T 150 25 T 200 38 L 200 65 L 0 65 Z" fill="#7f1d1d" opacity="0.6" />
        <path d="M 0 50 Q 30 38, 70 48 T 140 44 T 200 52 L 200 80 L 0 80 Z" fill="#9a3412" opacity="0.7" />
        <path d="M 0 65 Q 40 55, 90 62 T 160 58 T 200 68 L 200 95 L 0 95 Z" fill="#c2410c" opacity="0.8" />

        {/* Radiant Sun */}
        <circle cx="100" cy="85" r="32" fill="url(#sunGlow)" />
        <circle cx="100" cy="85" r="14" fill="#ffffff" />

        {/* Earth Horizon Silhouette */}
        <polygon points="0,95 25,90 55,94 85,88 100,89 125,86 160,93 185,89 200,95 200,130 0,130" fill="#290707" />

        {/* Thermal Infrared Shimmer Lines */}
        <rect x="0" y="95" width="200" height="35" fill="#450a0a" opacity="0.9" />
        <line x1="70" y1="99" x2="130" y2="99" stroke="#fef08a" strokeWidth="2" strokeDasharray="6,4" opacity="0.9" />
        <line x1="50" y1="105" x2="150" y2="105" stroke="#fb923c" strokeWidth="2.5" strokeDasharray="10,6" opacity="0.8" />
        <line x1="30" y1="112" x2="170" y2="112" stroke="#ea580c" strokeWidth="2" strokeDasharray="8,5" opacity="0.7" />
        <line x1="15" y1="120" x2="185" y2="120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="12,6" opacity="0.6" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent pointer-events-none animate-pulse" />
    </div>
  );
}

/**
 * 2. FLOOD ILLUS: Game-Grade Cinematic Storm & Flood Radar
 * Towering thunderclouds, branching lightning bolt, torrential rain curtain & turbulent flood swells.
 */
export function FloodIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#020b18] flex items-center justify-center">
      <svg
        viewBox="0 0 200 130"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="floodStormSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="35%" stopColor="#081b36" />
            <stop offset="70%" stopColor="#0f2b5c" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <radialGradient id="lightningAura" cx="55%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#cffafe" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#0284c7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="floodWaveTop" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          <linearGradient id="floodDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="50%" stopColor="#075985" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          <filter id="lightningGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Deep Tempest Background Sky */}
        <rect width="200" height="130" fill="url(#floodStormSky)" />

        {/* Ionization Lightning Aura */}
        <circle cx="110" cy="40" r="65" fill="url(#lightningAura)" />

        {/* Distant Radar Scan Horizon Arcs (GPM Satellite Swath) */}
        <ellipse cx="100" cy="95" rx="85" ry="30" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3,4" opacity="0.4" />
        <ellipse cx="100" cy="95" rx="60" ry="20" fill="none" stroke="#67e8f9" strokeWidth="0.8" strokeDasharray="5,5" opacity="0.5" />

        {/* Deep Cumulonimbus Storm Clouds - Layer 1 (Dark Anvil) */}
        <path d="M 0 35 Q 25 15, 55 28 T 115 22 T 165 18 T 200 32 L 200 70 L 0 70 Z" fill="#091427" opacity="0.9" />

        {/* Mid Storm Cloud Billows - Layer 2 */}
        <circle cx="45" cy="42" r="30" fill="#0f2244" />
        <circle cx="85" cy="32" r="36" fill="#172e59" />
        <circle cx="125" cy="36" r="32" fill="#13274c" />
        <circle cx="165" cy="44" r="26" fill="#0c1b36" />
        <circle cx="195" cy="50" r="22" fill="#091427" />
        <circle cx="10" cy="52" r="24" fill="#091427" />

        {/* Front Cloud Highlights (Silver Lining) */}
        <path d="M 30 52 Q 60 44, 90 48 T 150 44 T 195 56" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.65" />

        {/* Branching High-Voltage Lightning Bolt */}
        <g filter="url(#lightningGlow)">
          {/* Main Trunk */}
          <polyline
            points="112,18 106,34 114,35 102,52 110,54 94,76 102,78 88,102"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Outer Cyan Corona */}
          <polyline
            points="112,18 106,34 114,35 102,52 110,54 94,76 102,78 88,102"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
          {/* Fork 1 */}
          <polyline
            points="106,34 94,44 98,45 88,58"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Fork 2 */}
          <polyline
            points="102,52 116,62 112,64 122,76"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* Fork 3 */}
          <polyline
            points="94,76 80,86 84,87 74,98"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>

        {/* Heavy Slanted Rain Curtain (Volumetric Precipitation) */}
        <g stroke="#38bdf8" strokeWidth="1.4" opacity="0.8" strokeDasharray="8,10">
          <line x1="20" y1="55" x2="5" y2="115" />
          <line x1="38" y1="52" x2="23" y2="118" />
          <line x1="56" y1="58" x2="41" y2="122" />
          <line x1="74" y1="50" x2="59" y2="125" />
          <line x1="92" y1="54" x2="77" y2="120" />
          <line x1="110" y1="52" x2="95" y2="126" />
          <line x1="128" y1="56" x2="113" y2="124" />
          <line x1="146" y1="50" x2="131" y2="122" />
          <line x1="164" y1="54" x2="149" y2="120" />
          <line x1="182" y1="52" x2="167" y2="118" />
          <line x1="198" y1="56" x2="183" y2="116" />
        </g>

        {/* Fine Mist Rainfall Streamlines */}
        <g stroke="#bae6fd" strokeWidth="0.8" opacity="0.6" strokeDasharray="4,6">
          <line x1="30" y1="60" x2="18" y2="115" />
          <line x1="65" y1="58" x2="53" y2="120" />
          <line x1="102" y1="62" x2="90" y2="124" />
          <line x1="138" y1="58" x2="126" y2="122" />
          <line x1="174" y1="60" x2="162" y2="118" />
        </g>

        {/* Flood Surge Water - Back Swell */}
        <path
          d="M 0 94 Q 25 86, 50 93 T 100 89 T 150 94 T 200 90 L 200 130 L 0 130 Z"
          fill="#0369a1"
          opacity="0.85"
        />

        {/* Flood Surge Water - Mid Swell */}
        <path
          d="M 0 102 Q 30 94, 60 101 T 120 98 T 180 103 T 200 100 L 200 130 L 0 130 Z"
          fill="url(#floodWaveTop)"
          opacity="0.95"
        />

        {/* White-Water Foaming Crests */}
        <path
          d="M 15 97 Q 35 92, 55 97"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 85 94 Q 105 89, 125 94"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M 155 98 Q 175 93, 195 98"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Deep Turbulent Flood Foreground */}
        <path
          d="M 0 112 Q 25 106, 50 112 T 100 110 T 150 113 T 200 109 L 200 130 L 0 130 Z"
          fill="url(#floodDeep)"
        />

        {/* Surface Water Reflections & Splashes */}
        <ellipse cx="90" cy="104" r="3" fill="#ffffff" opacity="0.9" />
        <ellipse cx="94" cy="101" r="1.5" fill="#bae6fd" opacity="0.9" />
        <ellipse cx="86" cy="102" r="1.2" fill="#bae6fd" opacity="0.8" />
        <ellipse cx="130" cy="108" r="2.5" fill="#ffffff" opacity="0.85" />
        <ellipse cx="45" cy="109" r="2.5" fill="#ffffff" opacity="0.85" />
        <ellipse cx="170" cy="107" r="2" fill="#ffffff" opacity="0.8" />
      </svg>
      {/* Dynamic Storm Pulse Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/25 via-transparent to-transparent pointer-events-none animate-pulse" />
    </div>
  );
}

/**
 * 3. DROUGHT ILLUS: Continental hydrological drought — parched cracked earth fissures & arid landscape.
 */
export function DroughtIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#261604] flex items-center justify-center">
      <svg
        viewBox="0 0 200 130"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="droughtSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
        </defs>

        <rect width="200" height="130" fill="url(#droughtSky)" />

        {/* Blazing Dry Sun */}
        <circle cx="160" cy="30" r="18" fill="#fef08a" opacity="0.9" />
        <circle cx="160" cy="30" r="30" fill="#fde047" opacity="0.25" />

        {/* Distant Arid Canyon Hills */}
        <path d="M 0 65 Q 50 52, 100 62 T 200 58 L 200 130 L 0 130 Z" fill="#78350f" />
        <path d="M 0 80 Q 45 70, 95 78 T 190 74 L 200 80 L 200 130 L 0 130 Z" fill="#592005" />

        {/* Parched Continental Basin */}
        <polygon points="0,96 45,92 90,99 140,94 200,100 200,130 0,130" fill="#3b1403" />

        {/* Deep Hydrological Drought Earth Fissures */}
        <g stroke="#1a0800" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
          <path d="M 22 96 L 36 106 L 30 116 L 42 126" />
          <path d="M 36 106 L 50 110 L 58 120" />
          <path d="M 78 98 L 86 108 L 102 112 L 108 124" />
          <path d="M 86 108 L 80 120" />
          <path d="M 128 95 L 138 104 L 132 116 L 144 128" />
          <path d="M 138 104 L 154 108 L 162 120" />
          <path d="M 172 100 L 180 110 L 194 116" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-amber-600/20 via-transparent to-transparent pointer-events-none animate-pulse" />
    </div>
  );
}

/**
 * 4. GREEN COVER ILLUS: Forest canopy, continental biosphere greenness & NDVI satellite tracking.
 */
export function GreenCoverIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#061e12] flex items-center justify-center">
      <svg
        viewBox="0 0 200 130"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="canopySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#022c22" />
            <stop offset="60%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>

        <rect width="200" height="130" fill="url(#canopySky)" />

        {/* Distant Misty Forest Hills */}
        <path d="M 0 75 Q 40 58, 90 68 T 170 62 T 200 70 L 200 130 L 0 130 Z" fill="#047857" opacity="0.7" />
        <path d="M 0 88 Q 50 78, 110 84 T 200 80 L 200 130 L 0 130 Z" fill="#065f46" opacity="0.9" />

        {/* Biosphere Tree Crowns */}
        <circle cx="30" cy="98" r="22" fill="#059669" />
        <circle cx="55" cy="92" r="26" fill="#10b981" />
        <circle cx="85" cy="96" r="24" fill="#047857" />
        <circle cx="115" cy="88" r="28" fill="#10b981" />
        <circle cx="145" cy="94" r="24" fill="#059669" />
        <circle cx="175" cy="92" r="25" fill="#34d399" />
        <circle cx="195" cy="99" r="20" fill="#047857" />

        {/* Foreground Pine & Canopy Crowns */}
        <polygon points="40,118 48,95 56,118" fill="#064e3b" />
        <polygon points="100,122 110,90 120,122" fill="#064e3b" />
        <polygon points="155,120 162,94 170,120" fill="#064e3b" />

        {/* Sunlight Shimmer through Foliage */}
        <circle cx="115" cy="84" r="8" fill="#a7f3d0" opacity="0.4" />
        <line x1="20" y1="124" x2="180" y2="124" stroke="#047857" strokeWidth="6" />
      </svg>
    </div>
  );
}

/**
 * 5. OCEAN WARMING ILLUS: Sea Surface Temperature (SST), marine currents & oceanic circulation.
 */
export function OceanWarmingIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#02182b] flex items-center justify-center">
      <svg
        viewBox="0 0 200 130"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="oceanSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="currentGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <rect width="200" height="130" fill="url(#oceanSky)" />

        {/* Distant Sea Horizon */}
        <line x1="0" y1="65" x2="200" y2="65" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />

        {/* Deep Oceanic Swells */}
        <path d="M 0 72 Q 25 67, 50 72 T 100 72 T 150 72 T 200 72 L 200 130 L 0 130 Z" fill="#0369a1" opacity="0.7" />
        <path d="M 0 85 Q 30 79, 60 85 T 120 85 T 180 85 T 200 85 L 200 130 L 0 130 Z" fill="#0284c7" opacity="0.8" />
        <path d="M 0 98 Q 25 90, 50 98 T 100 98 T 150 98 T 200 98 L 200 130 L 0 130 Z" fill="#075985" />
        <path d="M 0 112 Q 35 104, 70 112 T 140 112 T 200 112 L 200 130 L 0 130 Z" fill="#0c4a6e" />

        {/* Thermal Current Streamlines (Marine Heat Transfer) */}
        <path d="M 15 90 Q 60 80, 110 88 T 190 84" fill="none" stroke="url(#currentGradient)" strokeWidth="2.5" strokeDasharray="8,4" />
        <path d="M 5 106 Q 70 96, 130 104 T 195 100" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="12,5" opacity="0.9" />

        {/* Sea Spray Foam Highlights */}
        <circle cx="50" cy="97" r="1.5" fill="#ffffff" opacity="0.9" />
        <circle cx="100" cy="97" r="1.5" fill="#ffffff" opacity="0.9" />
        <circle cx="150" cy="97" r="1.5" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
}

/**
 * 6. NASA DETECTIVE INSTRUMENT MODAL
 * Explains real-world NASA Earth observation instruments and statistical methodology.
 */
export interface InstrumentInfo {
  id: string;
  title: string;
  tag: string;
  description: string;
  impact: string;
  nasaRole: string;
  icon: React.ReactNode;
}

export const NASA_INSTRUMENTS_DATA: Record<string, InstrumentInfo> = {
  gistemp: {
    id: "gistemp",
    title: "NASA GISTEMP v4 NetCDF Anomaly Grid",
    tag: "Earth Observation Instrument",
    description:
      "NASA Goddard Institute for Space Studies (GISS) combines surface air temperature data over land with sea surface temperature measurements on a 2°×2° grid (1880–2026, 1200 km smoothing).",
    impact: "Provides 1,762 continuous monthly anomaly observations relative to the 1951–1980 baseline with verifiable SHA-256 cryptographic provenance.",
    nasaRole: "GISTEMP v4 serves as the gold standard for global and regional climate trend detection across scientific consensus bodies.",
    icon: <Database className="text-amber-400" size={24} />,
  },
  sen_slope: {
    id: "sen_slope",
    title: "Theil–Sen Robust Median Slope Estimator",
    tag: "Non-Parametric Climatology",
    description:
      "Calculates the median of all pairwise slopes between data points across time. Unlike ordinary linear regression (OLS), Theil–Sen is completely robust to extreme single-year anomalies and volcanic eruptions.",
    impact: "Yields a realistic, non-parametric decadal warming rate (°C per decade) with 95% rank confidence intervals.",
    nasaRole: "Recommended by the World Meteorological Organization (WMO) for robust trend assessment in noisy climatological records.",
    icon: <Activity className="text-teal-400" size={24} />,
  },
  hamed_rao: {
    id: "hamed_rao",
    title: "Hamed–Rao Modified Mann–Kendall Test",
    tag: "Statistical Significance Rigor",
    description:
      "Geophysical time series exhibit serial autocorrelation (lag-k persistence), which artificially deflates variance in standard tests. The Hamed–Rao modification adjusts the variance of the Mann-Kendall S statistic.",
    impact: "Guarantees that declared trend signals are genuine multi-decadal shifts rather than short-term autocorrelation artifacts.",
    nasaRole: "Provides the decisive statistical verdict (p < 0.05) required to answer the hackathon question: IS IT SIGNIFICANT?",
    icon: <CheckCircle2 className="text-emerald-400" size={24} />,
  },
  gpcp_radar: {
    id: "gpcp_radar",
    title: "NASA / NOAA GPCP v2.3 Multi-Satellite Precipitation Grid",
    tag: "Earth Observation Satellite Pipeline",
    description:
      "Global Precipitation Climatology Project (co-led by Dr. George Huffman and Dr. Robert Adler at NASA Goddard Space Flight Center) combines microwave radiometers (SSM/I, SSMIS) and geostationary infrared sounders on a global 2.5°×2.5° grid (1979–2026).",
    impact: "Delivers 574 consecutive months of real multi-satellite precipitation observations calibrated against surface rain-gauge networks.",
    nasaRole: "Serves as the benchmark satellite precipitation Climate Data Record (CDR) for detecting global hydrological shifts and extreme monsoon variations.",
    icon: <Database className="text-cyan-400" size={24} />,
  },
  rainfall_trend: {
    id: "rainfall_trend",
    title: "Theil–Sen Precipitation Rate Estimator",
    tag: "Non-Parametric Hydrology",
    description:
      "Calculates median pairwise slopes across monthly precipitation time series in mm/day. Resilient to extreme flood spikes, typhoon deluges, and dry spells.",
    impact: "Provides honest decadal rainfall drift rates (mm/day per decade) and 95% rank confidence bounds.",
    nasaRole: "Enables robust, distribution-free trend calculation on highly skewed precipitation records.",
    icon: <Activity className="text-cyan-300" size={24} />,
  },
  monsoon_mk: {
    id: "monsoon_mk",
    title: "Hamed–Rao Modified Mann–Kendall for Precipitation",
    tag: "Monsoon Statistical Rigor",
    description:
      "Precipitation patterns exhibit strong seasonal autocorrelation and multi-year ENSO persistence. The Hamed–Rao modification corrects variance to prevent false-alarm trends.",
    impact: "Accurately answers whether observed regional rainfall changes are statistically distinct from natural monsoon variability.",
    nasaRole: "Provides the verified p-value (α = 0.05) to objectively confirm or refute long-term flood and drought trends.",
    icon: <CheckCircle2 className="text-cyan-400" size={24} />,
  },
};

// Backward-compatible alias
export const SOLUTIONS_DATA = NASA_INSTRUMENTS_DATA;

export function NasaInstrumentModal({
  instrumentId,
  onClose,
}: {
  instrumentId: string | null;
  onClose: () => void;
}) {
  if (!instrumentId || !NASA_INSTRUMENTS_DATA[instrumentId]) return null;
  const inst = NASA_INSTRUMENTS_DATA[instrumentId];
  const isFloodInst =
    inst.id === "gpcp_radar" ||
    inst.id === "rainfall_trend" ||
    inst.id === "monsoon_mk";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono"
    >
      <div
        className={`w-full max-w-lg ${
          isFloodInst ? "bg-[#021526] border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.45)]" : "bg-[#04121a] border-2 border-teal-500/50 shadow-[0_0_50px_rgba(45,212,191,0.3)]"
        } rounded-2xl p-6 space-y-4`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b ${
            isFloodInst ? "border-cyan-500/30" : "border-teal-500/30"
          } pb-3`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl ${
                isFloodInst
                  ? "bg-cyan-950/80 border border-cyan-400/60"
                  : "bg-teal-950/80 border border-teal-400/60"
              } flex items-center justify-center`}
            >
              {inst.icon}
            </div>
            <div>
              <span
                className={`text-[10px] font-bold ${
                  isFloodInst ? "text-cyan-400" : "text-teal-400"
                } uppercase tracking-widest`}
              >
                {inst.tag}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {inst.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-slate-200">{inst.description}</p>

          <div
            className={`p-3 rounded-xl ${
              isFloodInst
                ? "bg-cyan-950/50 border border-cyan-500/40 text-cyan-200"
                : "bg-teal-950/50 border border-teal-500/40 text-teal-200"
            } space-y-1`}
          >
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Sparkles
                size={12}
                className={isFloodInst ? "text-cyan-400" : "text-teal-400"}
              />
              <span>DETECTIVE CAPABILITY:</span>
            </span>
            <p>{inst.impact}</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-1">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Compass size={12} className="text-amber-400" />
              <span>NASA SCIENTIFIC VALIDITY:</span>
            </span>
            <p>{inst.nasaRole}</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`${
              isFloodInst ? "arcade-physical-btn-blue text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.5)]" : "game-btn-gold"
            } px-6 py-2 text-xs uppercase tracking-wider font-bold rounded-lg`}
          >
            RETURN TO EXPEDITION
          </button>
        </div>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const SolutionModal = NasaInstrumentModal;
