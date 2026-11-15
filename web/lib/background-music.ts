/**
 * Attractive Space Adventure Soundtrack Engine for Trend Compass.
 * Plays high-quality, catchy, melodic space tracks with seamless looping,
 * instant persistence across page navigations, and volume/mute controls.
 */

export type BgmTrackId = "odyssey" | "anthem" | "lullaby" | "ambient";

export interface BgmState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0.0 to 1.0 (default 0.35 - clear, mild, attractive)
  trackId: BgmTrackId;
  hasUserInteracted: boolean;
}

export interface TrackMetadata {
  id: BgmTrackId;
  title: string;
  subtitle: string;
  description: string;
  bpm: number;
  icon: string;
  src?: string;
}

export const BGM_TRACKS: Record<BgmTrackId, TrackMetadata> = {
  odyssey: {
    id: "odyssey",
    title: "Starlight Odyssey",
    subtitle: "Heroic Space Adventure",
    description: "Catchy 118 BPM synthwave with driving 80s bassline, crisp drums, lush polyphonic pads & uplifting melody.",
    bpm: 118,
    icon: "⭐",
    src: "/audio/starlight-odyssey.wav",
  },
  anthem: {
    id: "anthem",
    title: "Star Galleon Anthem",
    subtitle: "Upbeat Synthwave Space Theme",
    description: "Punchy 112 BPM groove with rolling 16th bassline and heroic lead synthesizer.",
    bpm: 112,
    icon: "🚀",
    src: "/audio/star-galleon-theme.wav",
  },
  lullaby: {
    id: "lullaby",
    title: "Cosmic Lullaby",
    subtitle: "Sweet Starlight Melody",
    description: "Soothing 86 BPM chillwave groove with warm electric piano and crystalline celesta bells.",
    bpm: 86,
    icon: "✨",
    src: "/audio/cosmic-lullaby.wav",
  },
  ambient: {
    id: "ambient",
    title: "Deep Space Drift",
    subtitle: "Mild Ambient Atmosphere",
    description: "Pure meditative space drift with breathing resonant filters and gentle celestial bells.",
    bpm: 60,
    icon: "🌌",
  },
};

type BgmListener = (state: BgmState) => void;

// Singleton state
let audioElement: HTMLAudioElement | null = null;
let fadeInterval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<BgmListener>();

const DEFAULT_VOLUME = 0.35;
let state: BgmState = {
  isPlaying: false,
  isMuted: false,
  volume: DEFAULT_VOLUME,
  trackId: "odyssey",
  hasUserInteracted: false,
};

// Read saved preferences from localStorage
if (typeof window !== "undefined") {
  try {
    const savedMuted = localStorage.getItem("tc-bgm-muted");
    if (savedMuted !== null) state.isMuted = savedMuted === "true";

    const savedVol = localStorage.getItem("tc-bgm-volume");
    if (savedVol !== null) {
      const v = parseFloat(savedVol);
      if (!isNaN(v) && v >= 0 && v <= 1) state.volume = v;
    }

    const savedTrack = localStorage.getItem("tc-bgm-track");
    if (savedTrack === "odyssey" || savedTrack === "anthem" || savedTrack === "lullaby" || savedTrack === "ambient") {
      state.trackId = savedTrack;
    }
  } catch {}
}

function notifyListeners() {
  const snapshot: BgmState = { ...state };
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (err) {
      console.warn("BGM listener error:", err);
    }
  });
}

export function subscribeToBgm(listener: BgmListener): () => void {
  listeners.add(listener);
  listener({ ...state });
  return () => {
    listeners.delete(listener);
  };
}

export function getBgmState(): BgmState {
  return { ...state };
}

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  if (!audioElement) {
    audioElement = new Audio();
    audioElement.loop = true;
    audioElement.preload = "auto";

    const activeTrack = BGM_TRACKS[state.trackId];
    if (activeTrack.src) {
      audioElement.src = activeTrack.src;
    }
    audioElement.volume = state.isMuted ? 0 : state.volume;

    // Handle end/loop events cleanly
    audioElement.addEventListener("ended", () => {
      if (state.isPlaying && !state.isMuted) {
        audioElement?.play().catch(() => {});
      }
    });
  }

  return audioElement;
}

/**
 * Start or resume playing background music.
 */
export async function startBackgroundMusic(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const audio = getAudioElement();
  if (!audio) return false;

  state.isPlaying = true;
  state.hasUserInteracted = true;

  const activeTrack = BGM_TRACKS[state.trackId];
  if (activeTrack.src && !audio.src.includes(activeTrack.src)) {
    audio.src = activeTrack.src;
  }

  audio.muted = state.isMuted;
  audio.volume = state.isMuted ? 0 : state.volume;

  try {
    await audio.play();
    notifyListeners();
    return true;
  } catch (err) {
    // Autoplay may be restricted until user gesture
    console.warn("Autoplay deferred until user interaction:", err);
    return false;
  }
}

/**
 * Pause background music with a gentle fade.
 */
export function pauseBackgroundMusic(): void {
  state.isPlaying = false;
  const audio = getAudioElement();
  if (audio) {
    audio.pause();
  }
  notifyListeners();
}

/**
 * Toggle mute state for background music.
 */
export function toggleBgmMute(): boolean {
  state.isMuted = !state.isMuted;
  try {
    localStorage.setItem("tc-bgm-muted", String(state.isMuted));
  } catch {}

  const audio = getAudioElement();
  if (audio) {
    audio.muted = state.isMuted;
    audio.volume = state.isMuted ? 0 : state.volume;
  }

  if (!state.isMuted && !state.isPlaying) {
    startBackgroundMusic();
  }

  notifyListeners();
  return state.isMuted;
}

/**
 * Set master volume (0.0 to 1.0).
 */
export function setBgmVolume(volume: number): void {
  const clamped = Math.max(0.01, Math.min(1.0, volume));
  state.volume = clamped;
  try {
    localStorage.setItem("tc-bgm-volume", clamped.toFixed(2));
  } catch {}

  const audio = getAudioElement();
  if (audio && !state.isMuted) {
    audio.volume = clamped;
  }

  notifyListeners();
}

/**
 * Switch soundtrack ("anthem", "lullaby", "ambient").
 */
export async function setBgmTrack(trackId: BgmTrackId): Promise<void> {
  if (state.trackId === trackId) return;
  state.trackId = trackId;
  try {
    localStorage.setItem("tc-bgm-track", trackId);
  } catch {}

  const audio = getAudioElement();
  if (audio) {
    const track = BGM_TRACKS[trackId];
    if (track.src) {
      const wasPlaying = state.isPlaying;
      audio.src = track.src;
      audio.volume = state.isMuted ? 0 : state.volume;
      if (wasPlaying && !state.isMuted) {
        try {
          await audio.play();
        } catch {}
      }
    }
  }

  notifyListeners();
}

// Backward-compatible alias for mood
export type BgmMood = BgmTrackId;
export function setBgmMood(mood: BgmMood): void {
  setBgmTrack(mood);
}

// ==========================================
// Global Autoplay Setup (First Gesture)
// ==========================================

let hasSetupGlobalAutoplay = false;

export function setupGlobalAutoplay(): void {
  if (typeof window === "undefined" || hasSetupGlobalAutoplay) return;
  hasSetupGlobalAutoplay = true;

  const onFirstInteraction = () => {
    state.hasUserInteracted = true;
    window.removeEventListener("pointerdown", onFirstInteraction);
    window.removeEventListener("keydown", onFirstInteraction);
    window.removeEventListener("touchstart", onFirstInteraction);

    // If not explicitly muted, start the attractive song!
    if (!state.isMuted && !state.isPlaying) {
      startBackgroundMusic();
    }
  };

  window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
  window.addEventListener("keydown", onFirstInteraction, { passive: true });
  window.addEventListener("touchstart", onFirstInteraction, { passive: true });

  // Duck audio when tab is hidden, resume when active
  document.addEventListener("visibilitychange", () => {
    const audio = getAudioElement();
    if (!audio) return;

    if (document.hidden) {
      if (state.isPlaying) {
        audio.pause();
      }
    } else {
      if (state.isPlaying && !state.isMuted) {
        audio.play().catch(() => {});
      }
    }
  });
}
