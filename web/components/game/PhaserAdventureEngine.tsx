"use client";

import React, { useEffect, useRef } from "react";
import type { GameLevel, ExpeditionType } from "./types";
import { GameSceneManager, SCENE_KEYS } from "./GameSceneManager";

interface PhaserAdventureEngineProps {
  level: GameLevel;
  expedition: ExpeditionType;
}

export default function PhaserAdventureEngine({
  level,
  expedition,
}: PhaserAdventureEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;

    async function initPhaser() {
      if (typeof window === "undefined" || !containerRef.current) return;

      // Dynamic import of Phaser
      const PhaserModule = await import("phaser");
      const Phaser = (PhaserModule as any).default || PhaserModule;

      if (isCancelled || !containerRef.current) return;

      // Clean up previous instance if any
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }

      // =======================================================================
      // SCENE 1: STAR GALLEON COCKPIT SCENE
      // =======================================================================
      class StarGalleonScene extends Phaser.Scene {
        private stars: Array<{ x: number; y: number; size: number; speed: number; alpha: number }> = [];
        private starGraphics: any;
        private cockpitGraphics: any;

        constructor() {
          super({ key: "StarGalleonScene" });
        }

        create() {
          const { width, height } = this.scale;
          this.starGraphics = this.add.graphics();
          this.cockpitGraphics = this.add.graphics();

          // Initialize 160 parallax stars in 3 depth layers
          this.stars = [];
          for (let i = 0; i < 160; i++) {
            this.stars.push({
              x: Math.random() * width,
              y: Math.random() * height,
              size: Math.random() < 0.6 ? 1 : Math.random() < 0.9 ? 1.8 : 2.5,
              speed: Math.random() * 0.4 + 0.1,
              alpha: Math.random() * 0.7 + 0.3,
            });
          }

          this.drawStaticCockpit(width, height);
          this.cameras.main.fadeIn(300, 0, 0, 0);
        }

        private drawStaticCockpit(width: number, height: number) {
          this.cockpitGraphics.clear();

          // Distant celestial nebula glow
          this.cockpitGraphics.fillStyle(0x0a192f, 0.4);
          this.cockpitGraphics.fillCircle(width * 0.5, height * 0.4, Math.min(width, height) * 0.45);

          this.cockpitGraphics.fillStyle(0x0f3460, 0.25);
          this.cockpitGraphics.fillCircle(width * 0.35, height * 0.35, Math.min(width, height) * 0.35);

          // Cockpit frame canopy mullion struts
          this.cockpitGraphics.lineStyle(2, 0x1e293b, 0.6);
          this.cockpitGraphics.strokeCircle(width * 0.5, height * 0.5, Math.min(width, height) * 0.48);

          // Viewport bracket reticles
          const cx = width * 0.5;
          const cy = height * 0.5;
          const r = Math.min(width, height) * 0.44;
          this.cockpitGraphics.lineStyle(1.5, 0x06b6d4, 0.3);
          this.cockpitGraphics.strokeCircle(cx, cy, r);
        }

        update(time: number, delta: number) {
          const { width, height } = this.scale;
          this.starGraphics.clear();

          // Animate parallax stars drifting smoothly to the left
          for (const s of this.stars) {
            s.x -= s.speed * (delta / 16.6);
            if (s.x < 0) {
              s.x = width;
              s.y = Math.random() * height;
            }

            // Twinkle effect
            const currentAlpha = Math.min(1, Math.max(0.1, s.alpha + Math.sin(time * 0.003 + s.x) * 0.15));
            this.starGraphics.fillStyle(0xffffff, currentAlpha);
            this.starGraphics.fillCircle(s.x, s.y, s.size);
          }
        }
      }

      // =======================================================================
      // SCENE 2: MISSION SELECTION SCENE (HEAT VS FLOOD SPLIT REALMS)
      // =======================================================================
      class MissionSelectScene extends Phaser.Scene {
        private embers: Array<{ x: number; y: number; speedY: number; speedX: number; size: number; alpha: number }> = [];
        private raindrops: Array<{ x: number; y: number; speed: number; length: number; alpha: number }> = [];
        private effectsGraphics: any;
        private lastLightningTime: number = 0;

        constructor() {
          super({ key: "MissionSelectScene" });
        }

        create() {
          const { width, height } = this.scale;
          this.effectsGraphics = this.add.graphics();

          // Left half: 60 Heat embers drifting upward
          this.embers = [];
          for (let i = 0; i < 60; i++) {
            this.embers.push({
              x: Math.random() * (width * 0.5),
              y: Math.random() * height,
              speedY: Math.random() * 0.8 + 0.4,
              speedX: (Math.random() - 0.5) * 0.3,
              size: Math.random() * 2.5 + 1,
              alpha: Math.random() * 0.8 + 0.2,
            });
          }

          // Right half: 90 Flood raindrops falling downward
          this.raindrops = [];
          for (let i = 0; i < 90; i++) {
            this.raindrops.push({
              x: width * 0.5 + Math.random() * (width * 0.5),
              y: Math.random() * height,
              speed: Math.random() * 7 + 8,
              length: Math.random() * 12 + 8,
              alpha: Math.random() * 0.6 + 0.3,
            });
          }

          this.cameras.main.fadeIn(300, 0, 0, 0);
        }

        update(time: number, delta: number) {
          const { width, height } = this.scale;
          this.effectsGraphics.clear();

          // Update Heat embers
          for (const e of this.embers) {
            e.y -= e.speedY * (delta / 16.6);
            e.x += e.speedX * (delta / 16.6);
            if (e.y < 0) {
              e.y = height;
              e.x = Math.random() * (width * 0.5);
            }
            this.effectsGraphics.fillStyle(0xf59e0b, e.alpha);
            this.effectsGraphics.fillCircle(e.x, e.y, e.size);
          }

          // Update Flood raindrops
          this.effectsGraphics.lineStyle(1.2, 0x38bdf8, 0.7);
          for (const r of this.raindrops) {
            r.y += r.speed * (delta / 16.6);
            r.x -= 0.6 * (delta / 16.6);
            if (r.y > height) {
              r.y = 0;
              r.x = width * 0.5 + Math.random() * (width * 0.5);
            }
            this.effectsGraphics.beginPath();
            this.effectsGraphics.moveTo(r.x, r.y);
            this.effectsGraphics.lineTo(r.x - 1, r.y + r.length);
            this.effectsGraphics.strokePath();
          }

          // Occasional soft lightning flash in the storm quadrant (every 5-8 seconds)
          if (time - this.lastLightningTime > 6000 + Math.random() * 3000) {
            this.lastLightningTime = time;
            this.effectsGraphics.fillStyle(0x0284c7, 0.2);
            this.effectsGraphics.fillRect(width * 0.5, 0, width * 0.5, height);
          }
        }
      }

      // =======================================================================
      // SCENE 3: HOLOTANK EXPLORATION SCENE
      // =======================================================================
      class HolotankScene extends Phaser.Scene {
        private platformGraphics: any;
        private rotationAngle: number = 0;

        constructor() {
          super({ key: "HolotankScene" });
        }

        create() {
          this.platformGraphics = this.add.graphics();
          this.cameras.main.fadeIn(300, 0, 0, 0);
        }

        update(time: number, delta: number) {
          const { width, height } = this.scale;
          this.rotationAngle += 0.008 * (delta / 16.6);

          this.platformGraphics.clear();

          const cx = width * 0.5;
          const cy = height * 0.5;
          const rx = Math.min(width, height) * 0.42;
          const ry = rx * 0.35;

          // Hologram projection base rings on the floor
          this.platformGraphics.lineStyle(2, 0x14b8a6, 0.4);
          this.platformGraphics.strokeEllipse(cx, cy + rx * 0.6, rx * 1.6, ry * 1.6);

          this.platformGraphics.lineStyle(1, 0x06b6d4, 0.25);
          this.platformGraphics.strokeEllipse(cx, cy + rx * 0.6, rx * 1.9, ry * 1.9);

          // Rotating holographic coordinate ticks
          const numTicks = 12;
          for (let i = 0; i < numTicks; i++) {
            const angle = this.rotationAngle + (i * Math.PI * 2) / numTicks;
            const px = cx + Math.cos(angle) * (rx * 0.8);
            const py = cy + rx * 0.6 + Math.sin(angle) * (ry * 0.8);
            this.platformGraphics.fillStyle(0x2dd4bf, 0.6);
            this.platformGraphics.fillCircle(px, py, 2.5);
          }
        }
      }

      // =======================================================================
      // SCENE 4: PREDICTION MONOLITH SCENE
      // =======================================================================
      class PredictionScene extends Phaser.Scene {
        private chamberGraphics: any;
        private pulseTime: number = 0;

        constructor() {
          super({ key: "PredictionScene" });
        }

        create() {
          this.chamberGraphics = this.add.graphics();
          this.cameras.main.fadeIn(300, 0, 0, 0);
        }

        update(time: number, delta: number) {
          const { width, height } = this.scale;
          this.pulseTime += delta * 0.003;
          this.chamberGraphics.clear();

          // Ambient cosmic energy grid lines in the background
          const pulse = (Math.sin(this.pulseTime) + 1) * 0.5;
          this.chamberGraphics.lineStyle(1, 0x3b82f6, 0.15 + pulse * 0.1);

          for (let y = 0; y < height; y += 80) {
            this.chamberGraphics.lineBetween(0, y, width, y);
          }
          for (let x = 0; x < width; x += 100) {
            this.chamberGraphics.lineBetween(x, 0, x, height);
          }
        }
      }

      // =======================================================================
      // SCENE 5: TELEMETRY RADAR SCANNING SCENE
      // =======================================================================
      class TelemetryRadarScene extends Phaser.Scene {
        private radarGraphics: any;
        private sweepAngle: number = 0;
        private waves: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

        constructor() {
          super({ key: "TelemetryRadarScene" });
        }

        create() {
          this.radarGraphics = this.add.graphics();
          this.cameras.main.fadeIn(300, 0, 0, 0);
        }

        update(time: number, delta: number) {
          const { width, height } = this.scale;
          this.sweepAngle += 0.035 * (delta / 16.6);
          this.radarGraphics.clear();

          const cx = width * 0.5;
          const cy = height * 0.44;
          const maxRadius = Math.min(width, height) * 0.28;

          // Concentric radar range rings
          const rings = [0.25, 0.5, 0.75, 1.0];
          for (const factor of rings) {
            this.radarGraphics.lineStyle(1.2, 0x14b8a6, 0.25);
            this.radarGraphics.strokeCircle(cx, cy, maxRadius * factor);
          }

          // Crosshair axes
          this.radarGraphics.lineStyle(1, 0x14b8a6, 0.2);
          this.radarGraphics.lineBetween(cx - maxRadius, cy, cx + maxRadius, cy);
          this.radarGraphics.lineBetween(cx, cy - maxRadius, cx, cy + maxRadius);

          // Sweeping radar beam line
          const beamX = cx + Math.cos(this.sweepAngle) * maxRadius;
          const beamY = cy + Math.sin(this.sweepAngle) * maxRadius;
          this.radarGraphics.lineStyle(2.5, 0x2dd4bf, 0.85);
          this.radarGraphics.lineBetween(cx, cy, beamX, beamY);

          // Sweeping radar sector trail
          this.radarGraphics.fillStyle(0x0d9488, 0.15);
          this.radarGraphics.slice(cx, cy, maxRadius, this.sweepAngle - 0.4, this.sweepAngle, false);
          this.radarGraphics.fillPath();

          // Audio-frequency oscilloscope simulation bars at bottom of canvas
          const numBars = 12;
          const barWidth = 8;
          const barGap = 6;
          const totalWidth = numBars * (barWidth + barGap);
          const startX = cx - totalWidth * 0.5;
          const baseY = height * 0.88;

          for (let i = 0; i < numBars; i++) {
            const barH = 8 + Math.abs(Math.sin(time * 0.005 + i * 0.6)) * 26;
            this.radarGraphics.fillStyle(0x38bdf8, 0.75);
            this.radarGraphics.fillRect(startX + i * (barWidth + barGap), baseY - barH, barWidth, barH);
          }
        }
      }

      // =======================================================================
      // SCENE 6: CELEBRATION DISCOVERY SCENE
      // =======================================================================
      class CelebrationScene extends Phaser.Scene {
        private celebrationGraphics: any;
        private particles: Array<{ x: number; y: number; speedY: number; speedX: number; color: number; alpha: number; size: number }> = [];

        constructor() {
          super({ key: "CelebrationScene" });
        }

        create() {
          const { width, height } = this.scale;
          this.celebrationGraphics = this.add.graphics();

          // 80 golden starlight confetti particles cascading downward
          this.particles = [];
          const colors = [0xf59e0b, 0xfbbf24, 0x38bdf8, 0x2dd4bf, 0xffffff];
          for (let i = 0; i < 80; i++) {
            this.particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              speedY: Math.random() * 1.5 + 0.8,
              speedX: (Math.random() - 0.5) * 0.8,
              color: colors[Math.floor(Math.random() * colors.length)],
              alpha: Math.random() * 0.8 + 0.2,
              size: Math.random() * 3 + 1.5,
            });
          }

          this.cameras.main.fadeIn(300, 0, 0, 0);
        }

        update(time: number, delta: number) {
          const { width, height } = this.scale;
          this.celebrationGraphics.clear();

          // Render celebration particles
          for (const p of this.particles) {
            p.y += p.speedY * (delta / 16.6);
            p.x += p.speedX * (delta / 16.6);
            if (p.y > height) {
              p.y = 0;
              p.x = Math.random() * width;
            }
            this.celebrationGraphics.fillStyle(p.color, p.alpha);
            this.celebrationGraphics.fillCircle(p.x, p.y, p.size);
          }
        }
      }

      // =======================================================================
      // PHASER GAME CONFIGURATION
      // =======================================================================
      const sceneMap: Record<GameLevel, any> = {
        0: StarGalleonScene,
        1: StarGalleonScene,
        2: MissionSelectScene,
        3: HolotankScene,
        4: PredictionScene,
        5: TelemetryRadarScene,
        6: CelebrationScene,
      };

      const ActiveInitialScene = sceneMap[level] || StarGalleonScene;

      const config = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: true,
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0, x: 0 }, debug: false },
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        // Phaser rejects duplicate scene keys, including the initial scene.
        scene: [ActiveInitialScene, ...Object.values(sceneMap).filter(Scene => Scene !== ActiveInitialScene)],
      };

      const game = new Phaser.Game(config);
      gameInstanceRef.current = game;
      GameSceneManager.getInstance().registerGame(game, SCENE_KEYS[level]);
    }

    initPhaser();

    return () => {
      isCancelled = true;
      if (gameInstanceRef.current) {
        GameSceneManager.getInstance().unregisterGame();
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Level & Expedition transitions
  useEffect(() => {
    if (gameInstanceRef.current) {
      GameSceneManager.getInstance().transitionToLevel(level, expedition);
    }
  }, [level, expedition]);

  return (
    <div
      ref={containerRef}
      id="phaser-game-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}
