"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export type BackdropTheme = "default" | "heat" | "flood" | "drought" | "vegetation" | "ocean";

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  layer: 1 | 2 | 3;
}

interface Meteor {
  active: boolean;
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  alpha: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  phase: number;
  color: string;
}

interface RainStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

export function CosmicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname() || "/";
  const [theme, setTheme] = useState<BackdropTheme>("default");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  
  const animFrameId = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rainRef = useRef<RainStreak[]>([]);
  
  // Lightning state for Flood mode
  const lightningRef = useRef<{ active: boolean; alpha: number; nextTime: number }>({
    active: false,
    alpha: 0,
    nextTime: Date.now() + 6000,
  });

  const meteorRef = useRef<Meteor>({
    active: false,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    length: 0,
    alpha: 0,
    speed: 0,
  });
  const nextMeteorTime = useRef<number>(Date.now() + 4000);

  // Synchronize theme with document data attribute or custom event
  useEffect(() => {
    function checkTheme() {
      if (typeof document !== "undefined") {
        const docTheme = document.documentElement.dataset.expedition as BackdropTheme;
        if (docTheme && docTheme !== theme) {
          setTheme(docTheme);
        }
      }
    }

    checkTheme();

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: BackdropTheme }>;
      if (customEvent.detail?.theme) {
        setTheme(customEvent.detail.theme);
      }
    };

    window.addEventListener("tc-expedition-change", handleThemeChange);
    const observer = new MutationObserver(() => checkTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-expedition"] });

    return () => {
      window.removeEventListener("tc-expedition-change", handleThemeChange);
      observer.disconnect();
    };
  }, [theme]);

  // Check user preferences on mount
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motionQuery.matches);
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const isLowPower =
      Boolean(nav.connection?.saveData) ||
      Boolean(nav.deviceMemory && nav.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    setLowPower(Boolean(isLowPower));

    try {
      const savedPaused = localStorage.getItem("tc-orbit-paused");
      if (savedPaused === "true") setPaused(true);
    } catch {}

    return () => {
      motionQuery.removeEventListener("change", syncMotion);
    };
  }, []);

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tc-orbit-paused", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Initialize background elements
  const initEnvironment = useCallback((width: number, height: number, curTheme: BackdropTheme) => {
    // 1. Stars
    const stars: Star[] = [];
    const count = 130;
    for (let i = 0; i < count; i++) {
      const layerRand = Math.random();
      const layer: 1 | 2 | 3 = layerRand < 0.65 ? 1 : layerRand < 0.9 ? 2 : 3;
      const size = layer === 1 ? Math.random() * 0.8 + 0.6 : layer === 2 ? Math.random() * 0.9 + 1.2 : Math.random() * 1.2 + 2.0;

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        baseAlpha: Math.random() * 0.5 + 0.35,
        twinkleSpeed: Math.random() * 0.002 + 0.001,
        phase: Math.random() * Math.PI * 2,
        layer,
      });
    }
    starsRef.current = stars;

    // 2. Specific Theme Particles
    particlesRef.current = [];
    rainRef.current = [];

    if (curTheme === "heat") {
      // Warm rising ember particles
      const embers: Particle[] = [];
      for (let i = 0; i < 65; i++) {
        embers.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 0.9 + 0.45), // upward drift
          size: Math.random() * 2.8 + 1.2,
          alpha: Math.random() * 0.75 + 0.25,
          maxAlpha: Math.random() * 0.75 + 0.25,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5 ? "#f97316" : Math.random() > 0.5 ? "#ef4444" : "#fef08a",
        });
      }
      particlesRef.current = embers;
    } else if (curTheme === "flood") {
      // Slanted torrential rain streaks
      const rain: RainStreak[] = [];
      for (let i = 0; i < 115; i++) {
        rain.push({
          x: Math.random() * (width + 250) - 100,
          y: Math.random() * height,
          length: Math.random() * 26 + 18,
          speed: Math.random() * 9 + 15,
          alpha: Math.random() * 0.4 + 0.18,
        });
      }
      rainRef.current = rain;
    } else if (curTheme === "drought") {
      // Floating arid dust motes
      const dust: Particle[] = [];
      for (let i = 0; i < 55; i++) {
        dust.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.random() * 0.7 + 0.25, // slow eastward desert wind
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2.4 + 1.1,
          alpha: Math.random() * 0.55 + 0.2,
          maxAlpha: Math.random() * 0.65 + 0.25,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.6 ? "#fbbf24" : Math.random() > 0.3 ? "#d97706" : "#b45309",
        });
      }
      particlesRef.current = dust;
    } else if (curTheme === "vegetation") {
      // Floating emerald bio-spores
      const spores: Particle[] = [];
      for (let i = 0; i < 40; i++) {
        spores.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -(Math.random() * 0.35 + 0.15),
          size: Math.random() * 2.4 + 1.0,
          alpha: Math.random() * 0.65 + 0.25,
          maxAlpha: 0.85,
          phase: Math.random() * Math.PI * 2,
          color: "#34d399",
        });
      }
      particlesRef.current = spores;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initEnvironment(width, height, theme);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();

    const drawFrame = (time: number) => {
      const dt = Math.min(time - lastTime, 100);
      lastTime = time;

      // ==========================================
      // 1. DYNAMIC ATMOSPHERIC BASE GRADIENT
      // ==========================================
      const baseGrad = ctx.createLinearGradient(0, 0, 0, height);

      if (theme === "heat") {
        // Fiery Atmospheric Thermosphere
        baseGrad.addColorStop(0, "#190404");
        baseGrad.addColorStop(0.45, "#3b0c07");
        baseGrad.addColorStop(0.85, "#260606");
        baseGrad.addColorStop(1, "#120202");
      } else if (theme === "flood") {
        // Stormy Oceanic Tempest
        baseGrad.addColorStop(0, "#010712");
        baseGrad.addColorStop(0.5, "#081b38");
        baseGrad.addColorStop(0.85, "#031024");
        baseGrad.addColorStop(1, "#020713");
      } else if (theme === "drought") {
        // Parched Desert Sepia Horizon
        baseGrad.addColorStop(0, "#1c0d02");
        baseGrad.addColorStop(0.5, "#361b05");
        baseGrad.addColorStop(0.85, "#1f0f03");
        baseGrad.addColorStop(1, "#0f0701");
      } else if (theme === "vegetation") {
        // Deep Biosphere Canopy Night
        baseGrad.addColorStop(0, "#011209");
        baseGrad.addColorStop(0.5, "#042414");
        baseGrad.addColorStop(0.85, "#02170d");
        baseGrad.addColorStop(1, "#010d07");
      } else {
        // Deep Space Cosmic Navy
        baseGrad.addColorStop(0, "#020509");
        baseGrad.addColorStop(0.5, "#040d18");
        baseGrad.addColorStop(1, "#02060b");
      }

      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // 2. THEMATIC CELESTIAL AURORA / GLOW
      // ==========================================
      const auroraPhase = time * 0.0003;
      const auroraX = width * (0.65 + Math.sin(auroraPhase) * 0.08);
      const auroraY = height * (0.35 + Math.cos(auroraPhase * 0.8) * 0.05);
      const auroraGrad = ctx.createRadialGradient(
        auroraX,
        auroraY,
        width * 0.05,
        auroraX,
        auroraY,
        width * 0.6
      );

      if (theme === "heat") {
        auroraGrad.addColorStop(0, "rgba(234, 88, 12, 0.28)"); // Glowing radiant heat
        auroraGrad.addColorStop(0.5, "rgba(220, 38, 38, 0.14)");
        auroraGrad.addColorStop(1, "rgba(25, 4, 4, 0)");
      } else if (theme === "flood") {
        auroraGrad.addColorStop(0, "rgba(2, 132, 199, 0.24)"); // Surge tempest cyan
        auroraGrad.addColorStop(0.5, "rgba(30, 58, 138, 0.16)");
        auroraGrad.addColorStop(1, "rgba(1, 7, 18, 0)");
      } else if (theme === "drought") {
        auroraGrad.addColorStop(0, "rgba(245, 158, 11, 0.24)"); // Harsh solar glare
        auroraGrad.addColorStop(0.5, "rgba(180, 83, 9, 0.14)");
        auroraGrad.addColorStop(1, "rgba(28, 13, 2, 0)");
      } else if (theme === "vegetation") {
        auroraGrad.addColorStop(0, "rgba(16, 185, 129, 0.22)"); // Emerald aurora
        auroraGrad.addColorStop(0.5, "rgba(5, 150, 105, 0.12)");
        auroraGrad.addColorStop(1, "rgba(1, 18, 9, 0)");
      } else {
        auroraGrad.addColorStop(0, "rgba(20, 184, 166, 0.12)"); // Teal glow
        auroraGrad.addColorStop(0.45, "rgba(99, 102, 241, 0.07)");
        auroraGrad.addColorStop(1, "rgba(2, 6, 12, 0)");
      }

      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // 2B. RADIANT SOLAR CORONA (Heat & Drought)
      // ==========================================
      if (theme === "heat" || theme === "drought") {
        const sunX = width * 0.82;
        const sunY = height * 0.18;
        const sunR = theme === "heat" ? 44 : 36;

        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(time * 0.0004);
        const rayCount = 12;
        for (let r = 0; r < rayCount; r++) {
          const rayAngle = (r / rayCount) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(rayAngle) * (sunR + 6), Math.sin(rayAngle) * (sunR + 6));
          ctx.lineTo(Math.cos(rayAngle) * (sunR + 32), Math.sin(rayAngle) * (sunR + 32));
          ctx.strokeStyle =
            theme === "heat"
              ? "rgba(249, 115, 22, 0.32)"
              : "rgba(245, 158, 11, 0.28)";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
        ctx.restore();

        const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.4);
        if (theme === "heat") {
          sunGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          sunGrad.addColorStop(0.28, "rgba(254, 240, 138, 0.85)");
          sunGrad.addColorStop(0.6, "rgba(239, 68, 68, 0.35)");
          sunGrad.addColorStop(1, "rgba(25, 4, 4, 0)");
        } else {
          sunGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          sunGrad.addColorStop(0.3, "rgba(253, 224, 71, 0.8)");
          sunGrad.addColorStop(0.65, "rgba(217, 119, 6, 0.3)");
          sunGrad.addColorStop(1, "rgba(28, 13, 2, 0)");
        }
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // ==========================================
      // 3. CURVED PLANETARY EARTH LIMB
      // ==========================================
      const planetCenterX = width * 0.7;
      const planetCenterY = height * 1.65;
      const planetRadius = height * 1.1;

      const atmoGrad = ctx.createRadialGradient(
        planetCenterX,
        planetCenterY,
        planetRadius * 0.94,
        planetCenterX,
        planetCenterY,
        planetRadius * 1.08
      );

      if (theme === "heat") {
        atmoGrad.addColorStop(0, "rgba(249, 115, 22, 0.45)"); // Thermal crimson rim
        atmoGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.25)");
        atmoGrad.addColorStop(1, "rgba(18, 2, 2, 0)");
      } else if (theme === "flood") {
        atmoGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)"); // Tempest ocean cyan
        atmoGrad.addColorStop(0.5, "rgba(30, 64, 175, 0.22)");
        atmoGrad.addColorStop(1, "rgba(2, 7, 19, 0)");
      } else if (theme === "drought") {
        atmoGrad.addColorStop(0, "rgba(251, 191, 36, 0.42)"); // Scorched amber rim
        atmoGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.22)");
        atmoGrad.addColorStop(1, "rgba(15, 7, 1, 0)");
      } else {
        atmoGrad.addColorStop(0, "rgba(14, 165, 233, 0.35)"); // Standard atmospheric cyan
        atmoGrad.addColorStop(0.5, "rgba(45, 212, 191, 0.18)");
        atmoGrad.addColorStop(1, "rgba(2, 6, 12, 0)");
      }

      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, planetRadius * 1.08, 0, Math.PI * 2);
      ctx.fillStyle = atmoGrad;
      ctx.fill();

      // Sharp luminous mesosphere horizon arc
      ctx.save();
      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, planetRadius, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle =
        theme === "heat"
          ? "rgba(254, 215, 170, 0.65)"
          : theme === "flood"
          ? "rgba(186, 230, 253, 0.65)"
          : theme === "drought"
          ? "rgba(254, 240, 138, 0.65)"
          : "rgba(186, 230, 253, 0.55)";
      ctx.lineWidth = 2.0;
      ctx.shadowColor =
        theme === "heat"
          ? "rgba(249, 115, 22, 0.85)"
          : theme === "flood"
          ? "rgba(56, 189, 248, 0.85)"
          : "rgba(245, 158, 11, 0.85)";
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();

      // Earth body silhouette
      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, planetRadius - 1, 0, Math.PI * 2);
      const earthGrad = ctx.createRadialGradient(
        planetCenterX,
        planetCenterY,
        planetRadius * 0.4,
        planetCenterX,
        planetCenterY,
        planetRadius
      );
      earthGrad.addColorStop(0, "#010408");
      earthGrad.addColorStop(0.85, theme === "heat" ? "#1a0505" : "#030d17");
      earthGrad.addColorStop(1, theme === "heat" ? "#2b0a08" : "#071b29");
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // ==========================================
      // 4. PARALLAX STAR FIELD
      // ==========================================
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!paused && !reducedMotion) {
          if (s.layer === 2) {
            s.x += 0.008 * dt;
            if (s.x > width) s.x = 0;
          } else if (s.layer === 1) {
            s.x += 0.002 * dt;
            if (s.x > width) s.x = 0;
          }
        }

        const twinkle = Math.sin(time * s.twinkleSpeed + s.phase);
        const alpha = Math.max(0.15, Math.min(1, s.baseAlpha + twinkle * 0.28));

        ctx.fillStyle = `rgba(235, 245, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        if (s.layer === 3 && alpha > 0.6) {
          ctx.strokeStyle = `rgba(202, 164, 85, ${(alpha * 0.4).toFixed(2)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - s.size * 2.5, s.y);
          ctx.lineTo(s.x + s.size * 2.5, s.y);
          ctx.moveTo(s.x, s.y - s.size * 2.5);
          ctx.lineTo(s.x, s.y + s.size * 2.5);
          ctx.stroke();
        }
      }

      // ==========================================
      // 5. THEMATIC PARTICLES & EFFECTS
      // ==========================================
      if (!paused && !reducedMotion) {
        if (theme === "heat" || theme === "drought" || theme === "vegetation") {
          // Render floating heat embers / dust motes / bio spores
          const particles = particlesRef.current;
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx * (dt * 0.06);
            p.y += p.vy * (dt * 0.06);

            // Wrap around boundaries
            if (p.y < -10) {
              p.y = height + 10;
              p.x = Math.random() * width;
            } else if (p.y > height + 10) {
              p.y = -10;
              p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            const pulse = Math.sin(time * 0.004 + p.phase) * 0.25;
            const curAlpha = Math.max(0.1, Math.min(p.maxAlpha, p.alpha + pulse));

            ctx.save();
            ctx.fillStyle = p.color;
            ctx.globalAlpha = curAlpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (theme === "flood") {
          // Render cascading torrential rain streaks
          const rain = rainRef.current;
          ctx.save();
          ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
          ctx.lineWidth = 1.2;

          for (let i = 0; i < rain.length; i++) {
            const r = rain[i];
            r.y += r.speed * (dt * 0.06);
            r.x -= (r.speed * 0.25) * (dt * 0.06); // slanted down-left

            if (r.y > height + 20) {
              r.y = -30;
              r.x = Math.random() * (width + 200) - 100;
            }

            ctx.beginPath();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x - 4, r.y + r.length);
            ctx.stroke();
          }
          ctx.restore();

          // Atmospheric lightning flash
          const lt = lightningRef.current;
          if (!lt.active && time > lt.nextTime) {
            lt.active = true;
            lt.alpha = 0.35;
          }
          if (lt.active) {
            ctx.fillStyle = `rgba(165, 243, 252, ${lt.alpha.toFixed(2)})`;
            ctx.fillRect(0, 0, width, height);
            lt.alpha -= dt * 0.0025;
            if (lt.alpha <= 0) {
              lt.active = false;
              lt.nextTime = time + Math.random() * 8000 + 7000; // 7-15s interval
            }
          }
        }
      }

      // ==========================================
      // 6. HIGH-CONTRAST LEGIBILITY VIGNETTE
      // ==========================================
      // Ensures UI cards, text, and 3D globe remain 100% crisp, readable, and never washed out!
      const centerVignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.08,
        width * 0.5,
        height * 0.5,
        width * 0.78
      );
      // Dark frosted obsidian core that guarantees razor-sharp text legibility across all themes
      centerVignette.addColorStop(0, "rgba(1, 4, 10, 0.68)");
      centerVignette.addColorStop(0.55, "rgba(1, 3, 8, 0.88)");
      centerVignette.addColorStop(1, "rgba(0, 1, 4, 0.98)");
      ctx.fillStyle = centerVignette;
      ctx.fillRect(0, 0, width, height);

      if (!paused && !reducedMotion && !document.hidden) {
        animFrameId.current = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame(performance.now());

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      } else if (!paused && !reducedMotion) {
        lastTime = performance.now();
        animFrameId.current = requestAnimationFrame(drawFrame);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [paused, reducedMotion, theme, initEnvironment]);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dynamic Thematic Atmosphere Edge Glow */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
            theme === "heat"
              ? "shadow-[inset_0_0_160px_rgba(234,88,12,0.32),inset_0_0_60px_rgba(220,38,38,0.22)]"
              : theme === "flood"
              ? "shadow-[inset_0_0_160px_rgba(2,132,199,0.32),inset_0_0_60px_rgba(56,189,248,0.20)]"
              : theme === "drought"
              ? "shadow-[inset_0_0_160px_rgba(245,158,11,0.32),inset_0_0_60px_rgba(217,119,6,0.22)]"
              : "shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]"
          }`}
        />
        <div className="cockpit-canopy-arch pointer-events-none" />
      </div>

      {/* Accessible Sky Controls Pill */}
      <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePause}
          className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-slate-700/80 bg-slate-950/80 text-slate-300 hover:text-white hover:border-amber-400/60 shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5"
          title="Toggle atmospheric sky motion"
          aria-pressed={paused || reducedMotion}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              paused || reducedMotion
                ? "bg-slate-500"
                : theme === "heat"
                ? "bg-red-400 animate-pulse"
                : theme === "flood"
                ? "bg-cyan-400 animate-pulse"
                : theme === "drought"
                ? "bg-amber-400 animate-pulse"
                : "bg-teal-400 animate-pulse"
            }`}
          />
          <span>
            {reducedMotion
              ? "Sky: Reduced"
              : paused
              ? "▶ Resume Sky"
              : theme === "heat"
              ? "Heat Sky Active"
              : theme === "flood"
              ? "Flood Sky Active"
              : theme === "drought"
              ? "Drought Sky Active"
              : "⏸ Pause Sky"}
          </span>
        </button>
      </div>
    </>
  );
}
