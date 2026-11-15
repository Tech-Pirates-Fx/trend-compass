"use client";

import React from "react";

export interface MemberData {
  id: string;
  name: string;
  yearDept: string;
  college: string;
  position: string; // "CPT", "DAT", "ENG", "STA", "TEL", "COM"
  cardTheme: "gold" | "silver" | "purple" | "teal";
  specialtyTitle: string;
  roleDescription: string;
  keyResponsibilities: string[];
  toolsAndTech: string[];
  motto: string;
  photoUrl?: string;
}

export function FutMemberCard({
  member,
  onClick,
}: {
  member: MemberData;
  onClick?: () => void;
}) {
  // Metallic theme configurations matching the reference card image
  const themeStyles = {
    gold: {
      rim: "from-amber-200 via-yellow-400 to-amber-700",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]",
      accentText: "text-amber-400",
      badge: "border-amber-400/40 text-amber-300 bg-amber-400/10",
      cardBg: "from-[#141006] via-[#0d0e12] to-[#07080a]",
    },
    silver: {
      rim: "from-slate-100 via-slate-300 to-slate-500",
      glow: "shadow-[0_0_20px_rgba(226,232,240,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
      accentText: "text-slate-300",
      badge: "border-slate-300/40 text-slate-200 bg-white/10",
      cardBg: "from-[#121417] via-[#0c0e11] to-[#060709]",
    },
    purple: {
      rim: "from-fuchsia-200 via-purple-400 to-indigo-700",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(168,85,247,0.45)]",
      accentText: "text-purple-300",
      badge: "border-purple-400/40 text-purple-200 bg-purple-400/10",
      cardBg: "from-[#150721] via-[#0e0917] to-[#06040a]",
    },
    teal: {
      rim: "from-teal-200 via-cyan-400 to-emerald-600",
      glow: "shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_30px_rgba(20,184,166,0.45)]",
      accentText: "text-teal-300",
      badge: "border-teal-400/40 text-teal-200 bg-teal-400/10",
      cardBg: "from-[#051614] via-[#091014] to-[#04070a]",
    },
  };

  const currentTheme = themeStyles[member.cardTheme] || themeStyles.gold;

  return (
    <div className="flex flex-col items-center group cursor-pointer" onClick={onClick}>
      {/* =========================================================================
          FUT CARD CONTAINER (Clean, Proportional, Matching User Image)
          ========================================================================= */}
      <div
        className={`relative w-[210px] sm:w-[225px] xl:w-[240px] h-[310px] sm:h-[325px] xl:h-[345px] rounded-[18px] p-[2.5px] bg-gradient-to-b ${currentTheme.rim} ${currentTheme.glow} transition-all duration-300 group-hover:scale-[1.03] select-none`}
      >
        {/* Card Inner Face */}
        <div
          className={`w-full h-full rounded-[15.5px] bg-gradient-to-b ${currentTheme.cardBg} relative overflow-hidden flex flex-col justify-between p-3.5 border border-white/10`}
        >
          {/* Specular Diagonal Sheen / Foil Gloss Reflection */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background:
                "linear-gradient(130deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 38%, transparent 55%, rgba(255,255,255,0.06) 80%, transparent 100%)",
            }}
          />

          {/* Background Sphere Geometry (Matching Soccer Ball / Earth Sphere in image) */}
          <div className="absolute top-7 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full pointer-events-none opacity-25 z-0">
            <svg viewBox="0 0 200 200" className="w-full h-full text-white/50" fill="none" stroke="currentColor">
              <circle cx="100" cy="100" r="95" strokeWidth="2" />
              <ellipse cx="100" cy="100" rx="70" ry="95" strokeWidth="1.2" strokeDasharray="4 2" />
              <ellipse cx="100" cy="100" rx="35" ry="95" strokeWidth="1.2" />
              <line x1="100" y1="5" x2="100" y2="195" strokeWidth="1.5" />
              <line x1="5" y1="100" x2="195" y2="100" strokeWidth="1.5" />
              <ellipse cx="100" cy="60" rx="87" ry="15" strokeWidth="1.2" strokeDasharray="3 3" />
              <ellipse cx="100" cy="140" rx="87" ry="15" strokeWidth="1.2" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* =====================================================================
              CARD TOP: POSITION CODE & INSIGNIA
              ===================================================================== */}
          <div className="relative z-10 flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border ${currentTheme.badge}`}
            >
              {member.position}
            </span>

            <div className="flex items-center gap-1.5">
              {/* Flag */}
              <div className="w-5 h-3.5 rounded-[2px] overflow-hidden border border-white/20 shadow-sm flex flex-col">
                <div className="h-1/3 bg-[#FF9933]" />
                <div className="h-1/3 bg-white flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#000080]" />
                </div>
                <div className="h-1/3 bg-[#128807]" />
              </div>
              {/* Shield */}
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px]">
                ⚓
              </div>
            </div>
          </div>

          {/* =====================================================================
              CARD CENTER: ATHLETIC PORTRAIT / CROSSED-ARMS SILHOUETTE
              ===================================================================== */}
          <div className="relative z-10 flex-1 flex items-center justify-center -my-1">
            {member.photoUrl ? (
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 xl:w-36 xl:h-36 rounded-full p-[2.5px] bg-gradient-to-b ${currentTheme.rim} shadow-2xl group-hover:scale-105 transition-transform duration-300`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border border-white/20 relative bg-slate-950">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Subtle specular reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/15 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="w-36 h-36 relative flex items-center justify-center">
                <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-xl">
                  <defs>
                    <linearGradient id={`heroGrad-${member.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#d1d5db" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Head */}
                  <ellipse cx="100" cy="42" rx="22" ry="26" fill={`url(#heroGrad-${member.id})`} />
                  {/* Neck */}
                  <path d="M88 64 L88 82 L112 82 L112 64 Z" fill={`url(#heroGrad-${member.id})`} />

                  {/* Broad Shoulders & Torso */}
                  <path
                    d="M50 96 C50 82, 80 80, 100 80 C120 80, 150 82, 150 96 L160 145 C158 175, 140 215, 100 215 C60 215, 42 175, 40 145 Z"
                    fill={`url(#heroGrad-${member.id})`}
                  />

                  {/* Left Arm crossing across chest */}
                  <path
                    d="M48 98 L36 140 C34 156, 50 168, 70 166 L125 158 C135 156, 140 148, 138 140 L125 130 L75 138 L58 108 Z"
                    fill="#f3f4f6"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                  />

                  {/* Right Arm crossing under left arm */}
                  <path
                    d="M152 98 L164 140 C166 156, 150 168, 130 166 L75 158 C65 156, 60 148, 62 140 L75 130 L125 138 L142 108 Z"
                    fill="#e5e7eb"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                  />

                  {/* Creases */}
                  <path d="M72 145 C90 148, 110 148, 128 145" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                  <path d="M80 156 C95 158, 105 158, 120 156" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M86 82 L100 110 L114 82" stroke="#4b5563" strokeWidth="2" fill="none" />
                </svg>
              </div>
            )}
          </div>

          {/* =====================================================================
              CARD LOWER: NAME, DEPT, COLLEGE & SPECIALTY
              ===================================================================== */}
          <div className="relative z-10 flex flex-col text-center">
            {/* Player Name */}
            <h3 className="text-sm sm:text-base font-black tracking-wider text-white uppercase drop-shadow truncate">
              {member.name}
            </h3>
            <div className="w-12 h-0.5 mx-auto my-1 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            {/* Department & Year */}
            <p className={`text-[11px] font-black tracking-widest uppercase ${currentTheme.accentText} leading-none mt-0.5`}>
              {member.yearDept}
            </p>

            {/* College */}
            <p className="text-[8.5px] font-mono tracking-tight text-white/70 uppercase truncate mt-1">
              {member.college}
            </p>

            {/* Specialty Badge */}
            <div className="mt-2 py-1 px-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
              <p className="text-[9.5px] font-bold text-white/90 truncate tracking-wide">
                {member.specialtyTitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elliptical Drop Shadow Under Each Card (Matches Reference Image) */}
      <div className="w-32 h-3.5 bg-black/60 rounded-full blur-md -mt-1 group-hover:scale-90 group-hover:opacity-40 transition-all pointer-events-none" />
    </div>
  );
}
