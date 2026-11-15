"""
Composes Track 2: "Cosmic Lullaby & Starlight"
A mild, ultra-attractive, melodic, and soothing space exploration song.
Tempo: 86 BPM. Key: C Major / A minor.
Rich warm electric piano chords, soft heartbeat groove, sweet pentatonic starlight melody.
"""

import math
import struct
import wave
from pathlib import Path
import numpy as np

SAMPLE_RATE = 44100
BPM = 86.0
BEAT_DUR = 60.0 / BPM
BAR_DUR = BEAT_DUR * 4.0
NUM_BARS = 16  # 16 bars total = 44.65 seconds seamless loop
TOTAL_DUR = BAR_DUR * NUM_BARS
TOTAL_SAMPLES = int(TOTAL_DUR * SAMPLE_RATE)

print(f"Composing Cosmic Lullaby: {BPM} BPM, {NUM_BARS} bars, {TOTAL_DUR:.2f}s...")

audio_left = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
audio_right = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

def note_to_freq(note_str):
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    flat_map = {'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'}
    name = note_str[:-1]
    octave = int(note_str[-1])
    if name in flat_map:
        name = flat_map[name]
    semitone = notes.index(name)
    midi = 12 * (octave + 1) + semitone
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))

# 1. SOFT HEARTBEAT KICK & CHILL GROOVE
num_beats = int(NUM_BARS * 4)
for beat in range(num_beats):
    beat_time = beat * BEAT_DUR
    beat_idx = int(beat_time * SAMPLE_RATE)
    
    # Soft deep kick on beats 1 and 3 (gentle chillhop/downtempo feel)
    if beat % 2 == 0:
        k_dur = 0.32
        k_samp = min(int(k_dur * SAMPLE_RATE), TOTAL_SAMPLES - beat_idx)
        if k_samp > 0:
            kt = np.linspace(0, k_dur, k_samp, endpoint=False)
            penv = 38.0 + (110.0 - 38.0) * np.exp(-kt * 26.0)
            phase = 2.0 * np.pi * np.cumsum(penv) / SAMPLE_RATE
            kwave = np.sin(phase) * np.exp(-kt * 9.0) * 0.32
            audio_left[beat_idx:beat_idx + k_samp] += kwave
            audio_right[beat_idx:beat_idx + k_samp] += kwave

    # Gentle vinyl snap / finger-snap on beat 3
    if beat % 4 == 2:
        s_dur = 0.16
        s_samp = min(int(s_dur * SAMPLE_RATE), TOTAL_SAMPLES - beat_idx)
        if s_samp > 0:
            st = np.linspace(0, s_dur, s_samp, endpoint=False)
            snap = np.sin(2.0 * np.pi * 320.0 * st) * np.exp(-st * 36.0) * 0.14
            shimmer = np.random.uniform(-1, 1, s_samp) * np.exp(-st * 28.0) * 0.11
            audio_left[beat_idx:beat_idx + s_samp] += (snap + shimmer) * 0.8
            audio_right[beat_idx:beat_idx + s_samp] += (snap + shimmer) * 1.1

    # Soft closed hat tick on every 8th note
    for eighth in range(2):
        htime = beat_time + eighth * (BEAT_DUR / 2.0)
        hidx = int(htime * SAMPLE_RATE)
        hdur = 0.05
        hsamp = min(int(hdur * SAMPLE_RATE), TOTAL_SAMPLES - hidx)
        if hsamp > 0:
            ht = np.linspace(0, hdur, hsamp, endpoint=False)
            hnoise = np.random.uniform(-1, 1, hsamp) * np.exp(-ht * 80.0) * 0.038
            audio_left[hidx:hidx + hsamp] += hnoise
            audio_right[hidx:hidx + hsamp] += hnoise

# 2. WARM RHODES / ELECTRIC PIANO CHORDS
# Progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4 (4 bars repeated 4 times)
chords = [
    [note_to_freq(n) for n in ['C3', 'G3', 'B3', 'E4', 'G4']],
    [note_to_freq(n) for n in ['A2', 'E3', 'G3', 'C4', 'E4']],
    [note_to_freq(n) for n in ['F2', 'C3', 'A3', 'E4', 'A4']],
    [note_to_freq(n) for n in ['G2', 'D3', 'G3', 'C4', 'D4']],
]

for bar in range(NUM_BARS):
    chord = chords[bar % 4]
    btime = bar * BAR_DUR
    bidx = int(btime * SAMPLE_RATE)
    bsamp = min(int(BAR_DUR * SAMPLE_RATE), TOTAL_SAMPLES - bidx)
    
    if bsamp > 0:
        bt = np.linspace(0, BAR_DUR, bsamp, endpoint=False)
        c_l = np.zeros(bsamp, dtype=np.float32)
        c_r = np.zeros(bsamp, dtype=np.float32)
        
        for idx, freq in enumerate(chord):
            # Electric piano tone: sine fundamental + 2nd harmonic + 3rd harmonic
            ep_phase = 2.0 * np.pi * freq * bt
            h1 = np.sin(ep_phase)
            h2 = np.sin(ep_phase * 2.0) * 0.28 * np.exp(-bt * 1.8)
            h3 = np.sin(ep_phase * 3.0) * 0.12 * np.exp(-bt * 2.5)
            ep_tone = (h1 + h2 + h3) * np.exp(-bt * 0.5)
            
            pan = (idx / len(chord)) - 0.5
            c_l += ep_tone * (0.5 - pan * 0.35)
            c_r += ep_tone * (0.5 + pan * 0.35)
            
        audio_left[bidx:bidx + bsamp] += c_l * 0.055
        audio_right[bidx:bidx + bsamp] += c_r * 0.055

# 3. SWEET, ATTRACTIVE STARLIGHT MELODY (BELL/CELESTA)
# Soothing, memorable theme
melody = [
    # Bar 1 (C): G4 -> E5 -> D5
    ('G4', 4), ('E5', 6), ('D5', 6),
    # Bar 2 (Am): C5 -> B4 -> A4
    ('C5', 4), ('B4', 4), ('A4', 8),
    # Bar 3 (F): A4 -> C5 -> E5 -> G5
    ('A4', 4), ('C5', 4), ('E5', 4), ('G5', 4),
    # Bar 4 (G): F5 -> E5 -> D5
    ('F5', 6), ('E5', 2), ('D5', 8),
    
    # Bar 5 (C): G4 -> E5 -> G5 -> C6
    ('G4', 4), ('E5', 4), ('G5', 4), ('C6', 4),
    # Bar 6 (Am): B5 -> A5 -> E5
    ('B5', 4), ('A5', 4), ('E5', 8),
    # Bar 7 (F): F5 -> A5 -> C6 -> D6
    ('F5', 4), ('A5', 4), ('C6', 4), ('D6', 4),
    # Bar 8 (G): C6 -> B5 -> C6
    ('C6', 6), ('B5', 2), ('C6', 8),
    
    # Repeat with sweet octave variation on bars 9-16
    ('G4', 4), ('E5', 6), ('D5', 6),
    ('C5', 4), ('B4', 4), ('A4', 8),
    ('A4', 4), ('C5', 4), ('E5', 4), ('G5', 4),
    ('F5', 6), ('E5', 2), ('D5', 8),
    
    ('G4', 4), ('E5', 4), ('G5', 4), ('C6', 4),
    ('B5', 4), ('A5', 4), ('E5', 8),
    ('A5', 4), ('B5', 4), ('C6', 4), ('D6', 4),
    ('E6', 8), ('C6', 8),
]

cur_sixteenth = 0
sixteenth_dur = BEAT_DUR / 4.0

for note_name, dur_sixteenths in melody:
    stime = cur_sixteenth * sixteenth_dur
    sidx = int(stime * SAMPLE_RATE)
    ndur = dur_sixteenths * sixteenth_dur * 0.94
    freq = note_to_freq(note_name)
    nsamp = min(int(ndur * SAMPLE_RATE), TOTAL_SAMPLES - sidx)
    
    if nsamp > 0:
        mt = np.linspace(0, ndur, nsamp, endpoint=False)
        phase = 2.0 * np.pi * freq * mt
        # Crystalline chime bell: fundamental + 2.76x overtone
        bell = np.sin(phase) + np.sin(phase * 2.756) * 0.22 * np.exp(-mt * 4.0)
        env = np.exp(-mt * 1.8)
        sig = bell * env * 0.12
        
        audio_left[sidx:sidx + nsamp] += sig * 0.95
        audio_right[sidx:sidx + nsamp] += sig * 0.95
        
        # Soft delay echo (half-beat)
        d_idx = sidx + int(BEAT_DUR * 0.5 * SAMPLE_RATE)
        d_samp = min(nsamp, TOTAL_SAMPLES - d_idx)
        if d_samp > 0:
            audio_left[d_idx:d_idx + d_samp] += sig[:d_samp] * 0.04
            audio_right[d_idx:d_idx + d_samp] += sig[:d_samp] * 0.09
            
    cur_sixteenth += dur_sixteenths

# 4. GENTLE SUB BASS
bass_roots = ['C2', 'A1', 'F1', 'G1']
for bar in range(NUM_BARS):
    root_freq = note_to_freq(bass_roots[bar % 4])
    btime = bar * BAR_DUR
    bidx = int(btime * SAMPLE_RATE)
    bsamp = min(int(BAR_DUR * SAMPLE_RATE), TOTAL_SAMPLES - bidx)
    if bsamp > 0:
        bt = np.linspace(0, BAR_DUR, bsamp, endpoint=False)
        sub_wave = np.sin(2.0 * np.pi * root_freq * bt) * 0.22
        audio_left[bidx:bidx + bsamp] += sub_wave
        audio_right[bidx:bidx + bsamp] += sub_wave

# Normalize & Export
fade_len = int(0.02 * SAMPLE_RATE)
fade_in = np.linspace(0, 1, fade_len)
fade_out = np.linspace(1, 0, fade_len)
audio_left[:fade_len] = audio_left[:fade_len] * fade_in + audio_left[-fade_len:] * fade_out
audio_right[:fade_len] = audio_right[:fade_len] * fade_in + audio_right[-fade_len:] * fade_out

master_l = np.tanh(audio_left * 1.2) * 0.8
master_r = np.tanh(audio_right * 1.2) * 0.8

max_peak = max(np.max(np.abs(master_l)), np.max(np.abs(master_r)))
if max_peak > 0:
    master_l = (master_l / max_peak) * 0.82
    master_r = (master_r / max_peak) * 0.82

out_dir = Path(__file__).resolve().parents[1] / 'public' / 'audio'
out_file = out_dir / 'cosmic-lullaby.wav'

pcm_left = (master_l * 32767.0).astype(np.int16)
pcm_right = (master_r * 32767.0).astype(np.int16)
interleaved = np.empty((TOTAL_SAMPLES * 2,), dtype=np.int16)
interleaved[0::2] = pcm_left
interleaved[1::2] = pcm_right

with wave.open(str(out_file), 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(interleaved.tobytes())

print(f"SUCCESS: Rendered {out_file.name} ({out_file.stat().st_size / (1024*1024):.2f} MB, {TOTAL_DUR:.2f}s loop)")
