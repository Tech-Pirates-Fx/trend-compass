"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  ShieldCheck,
  Globe,
  Database,
  BarChart3,
  Sparkles,
  ExternalLink,
  Play,
  Award,
  Radio,
  Satellite,
  Code2,
  Users,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  dept: string;
  college: string;
  isLead?: boolean;
  theme: "gold" | "cyan" | "emerald" | "purple" | "blue" | "rose";
  photo: string;
  motto: string;
  skills: string[];
  github?: string;
  githubLabel?: string;
  email?: string;
}

export default function AboutPage() {
  const members: Member[] = [
    {
      id: "sam-joshua",
      name: "Sam Joshua C",
      role: "TEAM LEAD · CAPTAIN",
      dept: "III CSE",
      college: "Francis Xavier Engineering College",
      isLead: true,
      theme: "gold",
      photo: "/images/members/sam-joshua.jpg?v=3",
      motto: "“Chart truth across the cosmic noise; never forge a trend.”",
      skills: ["Project Architecture", "NASA Earthdata", "Scientific Governance", "System Strategy"],
      github: "https://github.com/samjoshua7",
      githubLabel: "@samjoshua7",
      email: "samjoshua.paldwin@gmail.com",
    },
    {
      id: "ramakrishna",
      name: "Ramakrishna S",
      role: "LEAD FULL-STACK ENGINEER",
      dept: "III CSE",
      college: "Francis Xavier Engineering College",
      theme: "cyan",
      photo: "/images/members/ramakrishna.jpg?v=3",
      motto: "“Fast, mathematically robust, and accessible to every citizen detective.”",
      skills: ["FastAPI Backend", "Next.js 14", "3D WebGL Globe", "High-Perf Ingest"],
      github: "https://github.com/nijesh7",
      githubLabel: "@nijesh7",
      email: "nijeshsrk@gmail.com",
    },
    {
      id: "sathish",
      name: "Sathish S",
      role: "DATA SYSTEMS SPECIALIST",
      dept: "III CSE",
      college: "Francis Xavier Engineering College",
      theme: "emerald",
      photo: "/images/members/sathish.jpg?v=3",
      motto: "“Every byte of NASA telemetry must be clean, verified, and unshakeable.”",
      skills: ["NetCDF4 Pipelines", "Cryptographic Receipts", "Cold-Start Cache", "Spatial Indexing"],
      email: "sathish@fxec.ac.in",
    },
    {
      id: "santhosh",
      name: "Santhosh S",
      role: "STATISTICAL MODELING & AUDIT",
      dept: "III CSE",
      college: "Francis Xavier Engineering College",
      theme: "purple",
      photo: "/images/members/santhosh.jpg?v=3",
      motto: "“True signals emerge when you account for serial autocorrelation.”",
      skills: ["Theil–Sen Robust Slope", "Hamed–Rao Correction", "p-Value Validation", "SciPy Stats"],
      email: "santhosh@fxec.ac.in",
    },
    {
      id: "sam-brainard",
      name: "SAM BRAINARD M",
      role: "CARTOGRAPHY & GIS OFFICER",
      dept: "II ECE",
      college: "Francis Xavier Engineering College",
      theme: "blue",
      photo: "/images/members/sam-brainard.jpg?v=3",
      motto: "“No territory is lost when your spatial coordinates are true.”",
      skills: ["Spherical Geometry", "Antimeridian Math", "NASA GIBS Layers", "Signal Processing"],
      email: "sambrainard@fxec.ac.in",
    },
    {
      id: "rafin-antony",
      name: "Rafin Antony A",
      role: "SATELLITE TELEMETRY SPECIALIST",
      dept: "II ECE",
      college: "Francis Xavier Engineering College",
      theme: "rose",
      photo: "/images/members/rafin-antony.jpg?v=3",
      motto: "“Decoding orbital radio waves into actionable environmental telemetry.”",
      skills: ["Remote Sensing", "SWOT & RADARSAT", "Telemetry Feeds", "Spectral Radiance"],
      email: "rafinantony@fxec.ac.in",
    },
  ];

  const lead = members[0];
  const middleRow = members.slice(1, 4);
  const bottomRow = members.slice(4, 6);

  return (
    <div className="min-h-screen bg-[#020710] text-slate-100 font-mono py-8 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* =========================================================================
            1. PUNCHY MISSION HEADER (ZERO BLOAT)
            ========================================================================= */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-amber-400">⚔️</span>
            <span>NASA SPACE APPS CHALLENGE 2026</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-300 font-bold">TEAM TECH PIRATES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-green-400 drop-shadow-[0_0_25px_rgba(34,197,94,0.5)]">
            ABOUT TREND COMPASS
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 font-sans font-normal leading-relaxed">
            An open-source scientific research adventure that places <strong className="text-white">146 years</strong> of authentic
            NASA &amp; NOAA satellite telemetry into your hands. Using rigorous <strong className="text-emerald-300">Theil-Sen regression</strong> and{" "}
            <strong className="text-emerald-300">Hamed-Rao modified Mann-Kendall</strong> statistics, Trend Compass eliminates guesswork
            to detect true planetary climate signals across 5 playable crisis scenarios.
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={14} fill="currentColor" />
              <span>Launch Mission</span>
            </Link>
            <Link
              href="/data"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md"
            >
              <ShieldCheck size={14} />
              <span>Inspect 19 Data Feeds</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            2. FOUR CORE SCIENTIFIC PILLARS (COMPACT KPI STRIP)
            ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#06111a] border border-cyan-500/30 text-center shadow-lg">
            <span className="text-[10px] text-cyan-300 uppercase tracking-widest block font-bold">Time Horizon</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">146 Years</div>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">1880–2026 GISTEMP NetCDF</p>
          </div>

          <div className="p-4 rounded-xl bg-[#07130f] border border-emerald-500/30 text-center shadow-lg">
            <span className="text-[10px] text-emerald-300 uppercase tracking-widest block font-bold">Active Sources</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">19 Verified</div>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">NASA, NOAA, SWOT, GPCP</p>
          </div>

          <div className="p-4 rounded-xl bg-[#140e06] border border-amber-500/30 text-center shadow-lg">
            <span className="text-[10px] text-amber-300 uppercase tracking-widest block font-bold">Game Expeditions</span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">5 Crisis Modes</div>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">Heat, Flood, Drought, Soil, Crop</p>
          </div>

          <div className="p-4 rounded-xl bg-[#130713] border border-purple-500/30 text-center shadow-lg">
            <span className="text-[10px] text-purple-300 uppercase tracking-widest block font-bold">Scientific Honor</span>
            <div className="text-xl sm:text-2xl font-black text-purple-300 mt-1">100% Honest</div>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">Hamed-Rao Variance Corrected</p>
          </div>
        </div>

        {/* =========================================================================
            3. HEXAGONAL TEAM ROSTER — SAM JOSHUA ON TOP
            ========================================================================= */}
        <section className="pt-4 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-widest">
              <Users size={14} />
              <span>THE EXPEDITION SQUAD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
              TEAM TECH PIRATES
            </h2>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              Undergraduate scientists and software engineers from Francis Xavier Engineering College, Tamil Nadu, India.
            </p>
          </div>

          {/* Hexagonal Formation Cluster */}
          <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center gap-4 sm:gap-6 pt-2 pb-4">

            {/* TOP ROW (APEX): SAM JOSHUA C — TEAM LEAD */}
            <div className="w-full flex justify-center">
              <div className="group relative w-full max-w-md p-5 rounded-2xl bg-gradient-to-b from-[#1c1305] to-[#0c0802] border-2 border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_45px_rgba(245,158,11,0.55)] transition-all duration-300">
                {/* Crown Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[10px] sm:text-xs tracking-widest uppercase shadow-md flex items-center gap-1.5 select-none">
                  <span>👑</span>
                  <span>TEAM LEAD · CAPTAIN</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mt-1">
                  {/* Photo with glowing hexagonal ring */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0 bg-black/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lead.photo}
                      alt={lead.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center justify-center sm:justify-start gap-2">
                      <span>{lead.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {lead.dept}
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-200/90 font-bold uppercase tracking-wider">
                      {lead.college}
                    </p>
                    <p className="text-xs text-slate-300 italic font-sans pt-1 leading-snug">
                      {lead.motto}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1 justify-center sm:justify-start">
                      {lead.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-black/50 border border-amber-500/30 text-[10px] text-amber-200 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                    {lead.github && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 justify-center sm:justify-start">
                        <a
                          href={lead.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] text-amber-300 font-bold transition-all"
                        >
                          <Code2 size={11} />
                          <span>{lead.githubLabel || "@github"}</span>
                          <ExternalLink size={9} />
                        </a>
                        {lead.email && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lead.email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW (3 MEMBERS): LEAD ENGINEER, DATA SYSTEMS, STATISTICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {middleRow.map((m) => {
                const borderClass =
                  m.theme === "cyan"
                    ? "border-cyan-500/50 hover:border-cyan-400 shadow-cyan-950/50"
                    : m.theme === "emerald"
                    ? "border-emerald-500/50 hover:border-emerald-400 shadow-emerald-950/50"
                    : "border-purple-500/50 hover:border-purple-400 shadow-purple-950/50";

                const tagColor =
                  m.theme === "cyan"
                    ? "text-cyan-300 bg-cyan-950/70 border-cyan-500/30"
                    : m.theme === "emerald"
                    ? "text-emerald-300 bg-emerald-950/70 border-emerald-500/30"
                    : "text-purple-300 bg-purple-950/70 border-purple-500/30";

                return (
                  <div
                    key={m.id}
                    className={`group relative p-4 rounded-xl bg-[#050b14] border-2 ${borderClass} shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-600 shrink-0 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.photo}
                            alt={m.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-white truncate">{m.name}</h4>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border mt-0.5 ${tagColor}`}>
                            {m.role}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{m.dept}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 italic font-sans leading-snug line-clamp-2">
                        {m.motto}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-800">
                      {m.skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-slate-300 border border-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>

                    {(m.github || m.email) && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1">
                        {m.github ? (
                          <a
                            href={m.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-[9px] text-cyan-300 font-bold transition-all"
                          >
                            <Code2 size={10} />
                            <span>{m.githubLabel || "@github"}</span>
                            <ExternalLink size={8} />
                          </a>
                        ) : <span />}
                        {m.email && (
                          <span className="text-[9px] text-slate-400 font-mono">
                            {m.email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* BOTTOM ROW (2 MEMBERS, CENTERED): CARTOGRAPHY & SATELLITE TELEMETRY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {bottomRow.map((m) => {
                const borderClass =
                  m.theme === "blue"
                    ? "border-blue-500/50 hover:border-blue-400"
                    : "border-rose-500/50 hover:border-rose-400";

                const tagColor =
                  m.theme === "blue"
                    ? "text-blue-300 bg-blue-950/70 border-blue-500/30"
                    : "text-rose-300 bg-rose-950/70 border-rose-500/30";

                return (
                  <div
                    key={m.id}
                    className={`group relative p-4 rounded-xl bg-[#050b14] border-2 ${borderClass} shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-600 shrink-0 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.photo}
                            alt={m.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-white truncate">{m.name}</h4>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border mt-0.5 ${tagColor}`}>
                            {m.role}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{m.dept}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 italic font-sans leading-snug line-clamp-2">
                        {m.motto}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-800">
                      {m.skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-slate-300 border border-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>

                    {m.email && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                        <span className="text-[9px] text-slate-400 font-mono">
                          {m.email}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. QUICK EXTERNAL LINKS & CITATION FOOTER
            ========================================================================= */}
        <div className="p-4 rounded-xl bg-black/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-emerald-400" />
            <span className="font-bold text-white">Trend Compass · Tech Pirates</span>
            <span className="hidden sm:inline">| Built with verified NASA GISS &amp; NOAA datasets</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-emerald-300 hover:text-white flex items-center gap-1 font-bold">
              <span>Play Missions</span>
              <span>&rarr;</span>
            </Link>
            <Link href="/data" className="text-emerald-300 hover:text-white flex items-center gap-1 font-bold">
              <span>19 Datasets</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
