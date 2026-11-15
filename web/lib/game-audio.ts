/**
 * Lightweight Web Audio synthesizer for space-pirate exploration cues.
 * Pure Web Audio API: zero dependencies, zero network requests, zero audio file decodes.
 * Mute choice is persisted in localStorage.
 * AudioContext is initialized safely only after a user gesture.
 */

import { startBackgroundMusic, pauseBackgroundMusic } from "./background-music";

let audioCtx: AudioContext | null = null;
let isMuted = false;
let ambientGain: GainNode | null = null;
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientFilter: BiquadFilterNode | null = null;
let isAmbientActive = false;

// Initialize mute state from localStorage if available
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("tc-audio-muted");
    if (saved !== null) {
      isMuted = saved === "true";
    }
  } catch {
    // Storage access blocked or unavailable
  }
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  try {
    localStorage.setItem("tc-audio-muted", String(isMuted));
  } catch {
    // Storage access blocked or unavailable
  }

  if (isMuted) {
    stopAmbientHum();
    stopAmbientMusic();
  } else {
    // Attempt ambient hum and background music on user unmute
    startAmbientHum();
    startAmbientMusic();
  }
  return isMuted;
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
  try {
    localStorage.setItem("tc-audio-muted", String(isMuted));
  } catch {
    // Storage access blocked or unavailable
  }
  if (isMuted) {
    stopAmbientHum();
    stopAmbientMusic();
  } else {
    startAmbientHum();
    startAmbientMusic();
  }
}

export function getMuted(): boolean {
  return isMuted;
}

export type ChimeType =
  | "click"
  | "continue"
  | "skip"
  | "select"
  | "hover"
  | "denied"
  | "typewriter"
  | "warp"
  | "coin"
  | "switch_tab"
  | "mission_select"
  | "predict_rising"
  | "predict_falling"
  | "predict_flat"
  | "predict_unsure"
  | "predict_submit"
  | "scan"
  | "evidence_reveal"
  | "badge"
  | "fanfare"
  | "target_lock"
  | "victory";

export function playChime(type: ChimeType) {
  if (isMuted) return;
  const ctx = getContext();
  if (!ctx) return;

  // Gentle check for reduced motion / sensory preference
  const prefersQuiet =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const volumeMultiplier = prefersQuiet ? 0.35 : 1.0;

  const now = ctx.currentTime;

  switch (type) {
    case "hover": {
      // Very light, tactile micro-tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.025);
      gain.gain.setValueAtTime(0.025 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
      break;
    }

    case "typewriter": {
      // Gentle retro chatter blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const pitch = 450 + Math.random() * 120;
      osc.frequency.setValueAtTime(pitch, now);
      gain.gain.setValueAtTime(0.04 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
      break;
    }

    case "denied": {
      // Sci-fi locked access double-buzz
      [0, 0.08].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        const start = now + offset;
        osc.frequency.setValueAtTime(140, start);
        gain.gain.setValueAtTime(0.08 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.06);
      });
      break;
    }

    case "switch_tab": {
      // Swift console snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.045);
      gain.gain.setValueAtTime(0.06 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
      break;
    }

    case "warp": {
      // Sci-fi scanner warp charging whoosh
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.45);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.45);
      gain.gain.setValueAtTime(0.08 * volumeMultiplier, now);
      gain.gain.linearRampToValueAtTime(0.14 * volumeMultiplier, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.48);
      break;
    }

    case "coin": {
      // Satisfying gold point chime (B5 -> E6 -> G#6)
      const freqs = [987.77, 1318.51, 1661.22];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const start = now + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
      break;
    }

    case "click":
    case "continue": {
      // Tactile ship console tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
      gain.gain.setValueAtTime(0.08 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
      break;
    }

    case "skip": {
      // Swift dual-tap tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);
      gain.gain.setValueAtTime(0.06 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }

    case "select":
    case "mission_select": {
      // Musical major triad chime (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const start = now + idx * 0.045;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
      break;
    }

    case "predict_rising": {
      // Warm ascending two-tone (D5 -> G5)
      const freqs = [587.33, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
      break;
    }

    case "predict_falling": {
      // Smooth descending two-tone (G5 -> D5)
      const freqs = [783.99, 587.33];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
      break;
    }

    case "predict_flat": {
      // Balanced resonant tone (E5 with soft harmonic)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0.08 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
      break;
    }

    case "predict_unsure": {
      // Inquisitive, gentle interval (A4 -> C5)
      const freqs = [440.0, 523.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const start = now + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.07 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
      break;
    }

    case "predict_submit": {
      // Solid target-lock chord (F4 + A4 + C5)
      const freqs = [349.23, 440.0, 523.25];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      });
      break;
    }

    case "scan": {
      // Sonar pulse / radar sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.28);
      gain.gain.setValueAtTime(0.05 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
      break;
    }

    case "evidence_reveal": {
      // Warm resolution chord (C5 -> G5 -> C6)
      const freqs = [523.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
      break;
    }

    case "badge":
    case "fanfare":
    case "victory": {
      // Triumphant discovery flourish with subtle golden shimmer
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const start = now + idx * 0.065;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12 * volumeMultiplier, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
      break;
    }

    case "target_lock": {
      // Crisp holographic coordinate lock blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.05); // B5
      gain.gain.setValueAtTime(0.08 * volumeMultiplier, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
      break;
    }
  }
}

/**
 * Very quiet, comforting ambient ship/space hum (detuned low sines through a 120Hz lowpass).
 * Plays only after a user gesture, if sound is unmuted.
 */
export function startAmbientHum() {
  if (isMuted || isAmbientActive) return;
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;

  try {
    ambientFilter = ctx.createBiquadFilter();
    ambientFilter.type = "lowpass";
    ambientFilter.frequency.setValueAtTime(110, ctx.currentTime);

    ambientGain = ctx.createGain();
    // Very quiet: 0.012 volume so it sits well behind dialogue and game actions
    ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 2.0);

    ambientOsc1 = ctx.createOscillator();
    ambientOsc1.type = "sine";
    ambientOsc1.frequency.setValueAtTime(55, ctx.currentTime); // Low A1

    ambientOsc2 = ctx.createOscillator();
    ambientOsc2.type = "sine";
    ambientOsc2.frequency.setValueAtTime(56.2, ctx.currentTime); // Slightly detuned for gentle acoustic beat

    ambientOsc1.connect(ambientFilter);
    ambientOsc2.connect(ambientFilter);
    ambientFilter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientOsc1.start();
    ambientOsc2.start();
    isAmbientActive = true;
  } catch {
    // Ambient sound init gracefully ignored if AudioContext is not ready
  }
}

export function stopAmbientHum() {
  if (!isAmbientActive || !ambientGain || !audioCtx) return;
  try {
    ambientGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (ambientOsc1) {
        ambientOsc1.stop();
        ambientOsc1.disconnect();
        ambientOsc1 = null;
      }
      if (ambientOsc2) {
        ambientOsc2.stop();
        ambientOsc2.disconnect();
        ambientOsc2 = null;
      }
      if (ambientFilter) {
        ambientFilter.disconnect();
        ambientFilter = null;
      }
      if (ambientGain) {
        ambientGain.disconnect();
        ambientGain = null;
      }
      isAmbientActive = false;
    }, 550);
  } catch {
    isAmbientActive = false;
  }
}

/**
 * Background music delegation to background-music.ts engine.
 */
export function startAmbientMusic() {
  if (isMuted) return;
  startBackgroundMusic();
}

export function stopAmbientMusic() {
  pauseBackgroundMusic();
}

// Pause ambient sound & music when window tab is hidden
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAmbientHum();
      stopAmbientMusic();
    } else if (!isMuted) {
      startAmbientHum();
      startAmbientMusic();
    }
  });
}
