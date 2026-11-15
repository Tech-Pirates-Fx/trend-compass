/**
 * GameAudioManager - Audio and Sound Effects Manager for the 2D Adventure Game
 */

import { playChime, toggleMute, getMuted, setMuted, ChimeType } from "../../lib/game-audio";

class AudioManager {
  private static instance: AudioManager;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public playSound(sound: ChimeType): void {
    playChime(sound);
  }

  public toggleMute(): boolean {
    return toggleMute();
  }

  public isMuted(): boolean {
    return getMuted();
  }

  public setMuted(muted: boolean): void {
    setMuted(muted);
  }
}

export const GameAudioManager = AudioManager.getInstance();
