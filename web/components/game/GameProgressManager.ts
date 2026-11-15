/**
 * GameProgressManager - Manages sequential 6-level adventure progress, score, and warp transitions
 */

import type { GameLevel, PredictionChoice } from "./types";
import { GameAudioManager } from "./GameAudioManager";

type Listener = () => void;

class ProgressState {
  private static instance: ProgressState;

  private currentLevel: GameLevel = 0;
  private isWarping: boolean = false;
  private prediction: PredictionChoice = "";
  private predictionConfirmed: boolean = false;
  private points: number = 0;
  private listeners: Set<Listener> = new Set();

  private constructor() {}

  public static getInstance(): ProgressState {
    if (!ProgressState.instance) {
      ProgressState.instance = new ProgressState();
    }
    return ProgressState.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getLevel(): GameLevel {
    return this.currentLevel;
  }

  public setLevel(lvl: GameLevel): void {
    this.currentLevel = lvl;
    this.notify();
  }

  public getIsWarping(): boolean {
    return this.isWarping;
  }

  public getPrediction(): PredictionChoice {
    return this.prediction;
  }

  public setPrediction(pred: PredictionChoice): void {
    this.prediction = pred;
    this.notify();
  }

  public isPredictionConfirmed(): boolean {
    return this.predictionConfirmed;
  }

  public setPredictionConfirmed(confirmed: boolean): void {
    this.predictionConfirmed = confirmed;
    this.notify();
  }

  public getPoints(): number {
    return this.points;
  }

  public addPoints(pts: number): void {
    this.points += pts;
    this.notify();
  }

  public warpTo(nextLevel: GameLevel, actionBefore?: () => void): void {
    GameAudioManager.playSound("warp");
    this.isWarping = true;
    this.notify();

    if (actionBefore) {
      actionBefore();
    }

    setTimeout(() => {
      this.currentLevel = nextLevel;
      this.notify();
      setTimeout(() => {
        this.isWarping = false;
        this.notify();
      }, 350);
    }, 450);
  }

  public reset(): void {
    this.currentLevel = 0;
    this.isWarping = false;
    this.prediction = "";
    this.predictionConfirmed = false;
    this.notify();
  }
}

export const GameProgressManager = ProgressState.getInstance();
