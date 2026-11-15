"use client";

import React from "react";

/**
 * ScenicPixelLandscape - Authentic 16-bit pixel-art landscape matching Reference Image 1
 * Features:
 * - Dusk sky with layered peach/orange pixel clouds
 * - Stepped pixel mountain ranges in olive/forest greens
 * - Pixelated lake/water basin with reflective ripple bands
 * - Grassy pixel foreground bank
 * Rendered with crisp pixel rendering for authentic retro arcade feel.
 */
export function ScenicPixelLandscape() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <svg
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
        style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pixelSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d99966" />
            <stop offset="25%" stopColor="#e3a772" />
            <stop offset="50%" stopColor="#edb782" />
            <stop offset="75%" stopColor="#f5ca98" />
            <stop offset="100%" stopColor="#fce0b6" />
          </linearGradient>
        </defs>

        {/* 1. Sky Gradient Base */}
        <rect width="400" height="225" fill="url(#pixelSkyGrad)" />

        {/* 2. Pixel Cloud Formations (Top Right & Left) */}
        {/* Cloud Layer 1 - Deep Orange Shadows */}
        <g fill="#bf652e" opacity="0.85">
          <rect x="290" y="80" width="100" height="15" />
          <rect x="310" y="68" width="80" height="14" />
          <rect x="330" y="55" width="60" height="15" />
          <rect x="350" y="45" width="45" height="12" />
          <rect x="0" y="30" width="70" height="14" />
          <rect x="10" y="20" width="45" height="12" />
          <rect x="20" y="42" width="65" height="10" />
        </g>

        {/* Cloud Layer 2 - Warm Amber Midtones */}
        <g fill="#d97d3a" opacity="0.9">
          <rect x="295" y="75" width="85" height="14" />
          <rect x="315" y="62" width="70" height="14" />
          <rect x="335" y="50" width="50" height="12" />
          <rect x="355" y="40" width="35" height="10" />
          <rect x="5" y="25" width="55" height="12" />
          <rect x="15" y="15" width="35" height="10" />
        </g>

        {/* Cloud Layer 3 - Light Peach Highlights */}
        <g fill="#f2a863">
          <rect x="300" y="70" width="70" height="10" />
          <rect x="320" y="58" width="55" height="10" />
          <rect x="340" y="46" width="38" height="8" />
          <rect x="290" y="60" width="22" height="12" />
          <rect x="10" y="22" width="40" height="8" />
          <rect x="280" y="78" width="18" height="10" />
        </g>

        {/* Setting Sun Glow */}
        <rect x="280" y="68" width="28" height="22" fill="#fff1d0" opacity="0.6" />
        <rect x="284" y="64" width="20" height="30" fill="#fff6dd" opacity="0.8" />

        {/* 3. Distant Pixel Mountain Silhouettes (Dark Forest Green) */}
        <g fill="#1b4d3e">
          {/* Main Peak Left */}
          <polygon points="
            0,120 18,105 28,105 45,88 60,88 85,62 105,62 120,78 135,78 
            150,96 170,96 185,110 205,110 230,125 320,125 320,135 0,135
          " />
          {/* Peak Right */}
          <polygon points="
            180,122 200,108 215,108 235,92 250,92 270,105 290,105 310,120 310,135 180,135
          " />
        </g>

        {/* 4. Midground Stepped Pixel Mountain Ridge (Lighter Olive / Moss) */}
        <g fill="#2e6f40">
          <polygon points="
            0,130 15,118 35,118 55,98 75,98 95,78 110,78 130,95 150,95 
            165,112 185,112 210,128 240,128 260,135 0,135
          " />
          {/* Stepped pixel highlights along the ridge */}
          <rect x="95" y="78" width="15" height="5" fill="#4d9b58" />
          <rect x="75" y="98" width="20" height="4" fill="#4d9b58" />
          <rect x="55" y="98" width="20" height="4" fill="#4d9b58" />
          <rect x="35" y="118" width="20" height="4" fill="#4d9b58" />
          <rect x="110" y="82" width="12" height="6" fill="#3a8449" />
          <rect x="130" y="98" width="15" height="5" fill="#3a8449" />
          <rect x="150" y="105" width="15" height="5" fill="#3a8449" />
          <rect x="165" y="115" width="18" height="5" fill="#3a8449" />
        </g>

        {/* Shadowed Canyons on Mountains */}
        <g fill="#163e32">
          <polygon points="98,83 115,100 115,130 95,130" />
          <polygon points="58,102 75,120 75,130 55,130" />
          <polygon points="135,100 150,118 150,130 130,130" />
        </g>

        {/* 5. Pixelated Lake Water Basin / River Shore */}
        {/* Water Surface Base */}
        <rect x="0" y="125" width="400" height="28" fill="#d29668" />
        {/* Water Reflection Ripple Lines */}
        <g fill="#f5ca98">
          <rect x="0" y="127" width="400" height="2" />
          <rect x="40" y="131" width="120" height="2" />
          <rect x="210" y="131" width="150" height="2" />
          <rect x="10" y="135" width="90" height="2" />
          <rect x="140" y="135" width="180" height="2" />
          <rect x="60" y="139" width="130" height="2" />
          <rect x="240" y="139" width="140" height="2" />
          <rect x="20" y="143" width="160" height="2" />
          <rect x="220" y="143" width="150" height="2" />
          <rect x="80" y="147" width="110" height="2" />
          <rect x="250" y="147" width="120" height="2" />
        </g>
        {/* Water Darker Shadow Ripples */}
        <g fill="#ad724c">
          <rect x="110" y="129" width="80" height="2" />
          <rect x="270" y="129" width="90" height="2" />
          <rect x="10" y="133" width="100" height="2" />
          <rect x="170" y="137" width="60" height="2" />
          <rect x="200" y="141" width="35" height="2" />
          <rect x="130" y="145" width="70" height="2" />
        </g>

        {/* Shoreline Pixel Checkerboard Border */}
        <g fill="#2e6f40">
          {Array.from({ length: 40 }).map((_, i) => (
            <rect key={i} x={i * 10} y={124 + (i % 2) * 2} width="5" height="2" />
          ))}
        </g>

        {/* 6. Foreground Grassy Field (Rich Retro Arcade Greens) */}
        {/* Grassy Shore Top Band */}
        <rect x="0" y="148" width="400" height="77" fill="#38804a" />
        
        {/* Deeper Grass Fill */}
        <rect x="0" y="162" width="400" height="63" fill="#327342" />
        <rect x="0" y="180" width="400" height="45" fill="#2b6338" />

        {/* Scattered Pixel Grass Tufts and Details */}
        <g fill="#4ea564">
          <rect x="25" y="154" width="4" height="6" />
          <rect x="31" y="152" width="4" height="8" />
          <rect x="37" y="155" width="4" height="5" />

          <rect x="90" y="158" width="4" height="6" />
          <rect x="96" y="156" width="4" height="8" />

          <rect x="160" y="155" width="4" height="6" />
          <rect x="166" y="153" width="4" height="8" />
          <rect x="172" y="156" width="4" height="5" />

          <rect x="240" y="154" width="4" height="6" />
          <rect x="246" y="151" width="4" height="9" />
          <rect x="252" y="155" width="4" height="5" />

          <rect x="320" y="156" width="4" height="6" />
          <rect x="326" y="153" width="4" height="9" />

          {/* Foreground Tuft Rows */}
          <rect x="50" y="172" width="6" height="8" />
          <rect x="58" y="169" width="6" height="11" />
          <rect x="66" y="173" width="6" height="7" />

          <rect x="130" y="175" width="6" height="7" />
          <rect x="138" y="171" width="6" height="11" />

          <rect x="210" y="174" width="6" height="8" />
          <rect x="218" y="170" width="6" height="12" />

          <rect x="290" y="176" width="6" height="8" />
          <rect x="298" y="172" width="6" height="12" />

          <rect x="370" y="173" width="6" height="9" />
          <rect x="378" y="169" width="6" height="13" />

          {/* Deep Foreground Grass */}
          <rect x="15" y="200" width="8" height="12" />
          <rect x="25" y="196" width="8" height="16" />
          <rect x="35" y="202" width="8" height="10" />

          <rect x="170" y="202" width="8" height="12" />
          <rect x="180" y="197" width="8" height="17" />

          <rect x="340" y="200" width="8" height="12" />
          <rect x="350" y="195" width="8" height="17" />
          <rect x="360" y="201" width="8" height="11" />
        </g>

        {/* Darker Green Soil / Grass Accents */}
        <g fill="#214e2d">
          <rect x="28" y="160" width="10" height="3" />
          <rect x="93" y="164" width="8" height="3" />
          <rect x="163" y="161" width="10" height="3" />
          <rect x="243" y="160" width="12" height="3" />
          <rect x="55" y="180" width="14" height="4" />
          <rect x="135" y="182" width="12" height="4" />
          <rect x="215" y="182" width="14" height="4" />
          <rect x="295" y="184" width="12" height="4" />
        </g>

        {/* Small Wildflowers on Shore */}
        <g fill="#fed7aa">
          <rect x="74" y="156" width="3" height="3" />
          <rect x="185" y="158" width="3" height="3" />
          <rect x="270" y="157" width="3" height="3" />
          <rect x="355" y="159" width="3" height="3" />
        </g>
        <g fill="#fef08a">
          <rect x="108" y="172" width="4" height="4" />
          <rect x="260" y="174" width="4" height="4" />
          <rect x="382" y="198" width="5" height="5" />
        </g>
      </svg>
    </div>
  );
}

export default ScenicPixelLandscape;
