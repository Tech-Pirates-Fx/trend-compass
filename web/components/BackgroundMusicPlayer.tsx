"use client";

import { useEffect, useState, useRef } from "react";
import { Music, Volume2, VolumeX, Play, Pause, Sparkles, Sliders, Check, Disc } from "lucide-react";
import {
  subscribeToBgm,
  startBackgroundMusic,
  pauseBackgroundMusic,
  toggleBgmMute,
  setBgmVolume,
  setBgmTrack,
  setupGlobalAutoplay,
  BgmState,
  BgmTrackId,
  BGM_TRACKS,
} from "../lib/background-music";

export function BackgroundMusicPlayer() {
  const [bgmState, setBgmState] = useState<BgmState>({
    isPlaying: false,
    isMuted: false,
    volume: 0.35,
    trackId: "odyssey",
    hasUserInteracted: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupGlobalAutoplay();

    const unsubscribe = subscribeToBgm((nextState) => {
      setBgmState(nextState);
    });

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isAudioActive = bgmState.isPlaying && !bgmState.isMuted;
  const currentTrack = BGM_TRACKS[bgmState.trackId] || BGM_TRACKS.anthem;

  function handleMainButtonClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!bgmState.isPlaying) {
      startBackgroundMusic();
    } else {
      toggleBgmMute();
    }
  }

  function handleToggleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Navbar Music Control Pill */}
      <div className="flex items-center rounded-lg bg-black/45 border border-slate-700/60 p-0.5 shadow-sm transition-all hover:border-amber-400/50">
        <button
          type="button"
          onClick={handleMainButtonClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            isAudioActive
              ? "text-teal-300 hover:text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title={
            !bgmState.isPlaying
              ? "Play background music"
              : bgmState.isMuted
              ? "Unmute soundtrack"
              : "Mute soundtrack"
          }
          aria-label="Toggle soundtrack"
        >
          {/* Animated 4-Bar Equalizer when active, or flat bars when muted/paused */}
          <div className="flex items-end gap-[2px] h-3.5 w-3.5 pb-[1px]" aria-hidden="true">
            <span
              className={`w-[2.5px] rounded-full transition-all duration-300 ${
                isAudioActive
                  ? "bg-teal-400 bgm-bar-anim-1"
                  : "bg-slate-600 h-[3px]"
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full transition-all duration-300 ${
                isAudioActive
                  ? "bg-amber-300 bgm-bar-anim-2"
                  : "bg-slate-600 h-[3px]"
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full transition-all duration-300 ${
                isAudioActive
                  ? "bg-teal-300 bgm-bar-anim-3"
                  : "bg-slate-600 h-[3px]"
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full transition-all duration-300 ${
                isAudioActive
                  ? "bg-amber-400 bgm-bar-anim-4"
                  : "bg-slate-600 h-[3px]"
              }`}
            />
          </div>

          <span className="text-[10.5px] font-semibold tracking-wide hidden sm:inline">
            {isAudioActive ? "MUSIC: ON" : bgmState.isMuted ? "MUSIC: OFF" : "MUSIC"}
          </span>
        </button>

        {/* Options Drawer Trigger */}
        <button
          type="button"
          onClick={handleToggleOpen}
          className="px-1.5 py-1 text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-r-md transition-colors"
          title="Adjust soundtrack, volume, and song selection"
          aria-label="Open soundtrack settings"
          aria-expanded={isOpen}
        >
          <Sliders size={12} />
        </button>
      </div>

      {/* Floating Glass Settings Popover */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-84 rounded-xl bg-[#07131e]/98 border border-teal-500/30 p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 font-mono"
          role="dialog"
          aria-label="Soundtrack Settings"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-teal-950/80 border border-teal-500/40 text-teal-400">
                <Music size={14} />
              </span>
              <div>
                <div className="text-[11px] font-bold text-white tracking-wider uppercase">
                  Space Adventure Soundtrack
                </div>
                <div className="text-[9px] text-teal-300/80">Continuous Background Music</div>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                isAudioActive
                  ? "bg-teal-950/70 border-teal-400/50 text-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.25)]"
                  : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
            >
              {isAudioActive ? "● PLAYING" : "PAUSED"}
            </span>
          </div>

          {/* Current Song Display & Quick Play/Pause */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-slate-800 mb-3">
            <div className="flex flex-col">
              <span className="text-[11px] text-amber-200 font-bold flex items-center gap-1.5">
                <span>{currentTrack.icon}</span>
                {currentTrack.title}
              </span>
              <span className="text-[9px] text-slate-400 line-clamp-1">
                {currentTrack.subtitle} · {currentTrack.bpm} BPM
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!bgmState.isPlaying) {
                  startBackgroundMusic();
                } else if (bgmState.isMuted) {
                  toggleBgmMute();
                } else {
                  pauseBackgroundMusic();
                }
              }}
              className={`p-2 rounded-lg border font-bold transition-all shadow-sm ${
                isAudioActive
                  ? "bg-teal-500/20 border-teal-400/60 text-teal-300 hover:bg-teal-500/30"
                  : "bg-amber-500/20 border-amber-400/60 text-amber-300 hover:bg-amber-500/30"
              }`}
              title={isAudioActive ? "Pause Music" : "Play Music"}
            >
              {isAudioActive ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
          </div>

          {/* Volume Control */}
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-300 flex items-center gap-1">
                {bgmState.isMuted || bgmState.volume === 0 ? (
                  <VolumeX size={12} className="text-red-400" />
                ) : (
                  <Volume2 size={12} className="text-teal-400" />
                )}
                Volume
              </span>
              <span className="text-amber-300 font-bold">
                {bgmState.isMuted ? "Muted" : `${Math.round(bgmState.volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.01"
                value={bgmState.volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBgmVolume(val);
                  if (bgmState.isMuted) toggleBgmMute();
                  if (!bgmState.isPlaying) startBackgroundMusic();
                }}
                className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 px-0.5">
              <span>Quiet (5%)</span>
              <span>Mild Default (35%)</span>
              <span>Full (80%)</span>
            </div>
          </div>

          {/* Song Selection */}
          <div className="space-y-1.5 mb-3">
            <div className="text-[10px] text-slate-300 font-bold tracking-wider uppercase flex items-center gap-1">
              <Disc size={11} className="text-amber-400" />
              Select Soundtrack
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(BGM_TRACKS) as BgmTrackId[]).map((trackKey) => {
                const track = BGM_TRACKS[trackKey];
                const isSelected = bgmState.trackId === trackKey;
                return (
                  <button
                    key={trackKey}
                    type="button"
                    onClick={() => {
                      setBgmTrack(trackKey);
                      if (!bgmState.isPlaying) startBackgroundMusic();
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-[10px] border transition-all ${
                      isSelected
                        ? "bg-teal-500/20 border-teal-400 text-white font-bold shadow-sm"
                        : "bg-black/30 border-slate-800 text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{track.icon}</span>
                      <div>
                        <div className="font-bold">{track.title}</div>
                        <div className="text-[8.5px] text-slate-400 font-normal">{track.subtitle}</div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-teal-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-800/80 text-[8.5px] text-slate-400 flex items-center justify-between">
            <span>✨ Seamless playback across all pages</span>
            <span className="text-teal-400/80">Stereo 44.1kHz</span>
          </div>
        </div>
      )}
    </div>
  );
}
