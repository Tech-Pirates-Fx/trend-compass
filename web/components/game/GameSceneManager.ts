/**
 * GameSceneManager - Coordinates active Phaser scenes, camera transitions, and environmental states
 */

import type { GameLevel, ExpeditionType } from "./types";

export type SceneKey =
  | "TitleScene"
  | "StarGalleonScene"
  | "MissionSelectScene"
  | "HolotankScene"
  | "PredictionScene"
  | "TelemetryRadarScene"
  | "CelebrationScene";

export const SCENE_KEYS: Record<GameLevel, SceneKey> = {
  0: "TitleScene",
  1: "StarGalleonScene",
  2: "MissionSelectScene",
  3: "HolotankScene",
  4: "PredictionScene",
  5: "TelemetryRadarScene",
  6: "CelebrationScene",
};

export class GameSceneManager {
  private static instance: GameSceneManager;
  private currentSceneKey: SceneKey = "StarGalleonScene";
  private phaserGame: any = null; // Phaser.Game instance

  private constructor() {}

  public static getInstance(): GameSceneManager {
    if (!GameSceneManager.instance) {
      GameSceneManager.instance = new GameSceneManager();
    }
    return GameSceneManager.instance;
  }

  public registerGame(game: any, initialSceneKey: SceneKey = "StarGalleonScene"): void {
    this.phaserGame = game;
    this.currentSceneKey = initialSceneKey;
  }

  public unregisterGame(): void {
    this.phaserGame = null;
  }

  public getActiveSceneKey(): SceneKey {
    return this.currentSceneKey;
  }

  public transitionToLevel(level: GameLevel, expedition: ExpeditionType): void {
    const targetSceneKey = SCENE_KEYS[level];
    if (!this.phaserGame || !this.phaserGame.scene) return;

    if (this.currentSceneKey === targetSceneKey) {
      // Refresh current scene data if needed (e.g., expedition theme change)
      const activeScene = this.phaserGame.scene.getScene(targetSceneKey);
      if (activeScene && typeof activeScene.onThemeChange === "function") {
        activeScene.onThemeChange(expedition);
      }
      return;
    }

    const currentScene = this.phaserGame.scene.getScene(this.currentSceneKey);
    if (currentScene && currentScene.cameras && currentScene.cameras.main) {
      currentScene.cameras.main.fadeOut(250, 0, 0, 0);
      currentScene.time.delayedCall(250, () => {
        this.phaserGame.scene.stop(this.currentSceneKey);
        this.phaserGame.scene.start(targetSceneKey, { expedition, level });
        this.currentSceneKey = targetSceneKey;
      });
    } else {
      this.phaserGame.scene.stop(this.currentSceneKey);
      this.phaserGame.scene.start(targetSceneKey, { expedition, level });
      this.currentSceneKey = targetSceneKey;
    }
  }

  public updateTheme(expedition: ExpeditionType): void {
    if (!this.phaserGame || !this.phaserGame.scene) return;
    const activeScene = this.phaserGame.scene.getScene(this.currentSceneKey);
    if (activeScene && typeof activeScene.onThemeChange === "function") {
      activeScene.onThemeChange(expedition);
    }
  }
}
