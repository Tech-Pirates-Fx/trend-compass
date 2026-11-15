"""
High-quality multi-track electronic space adventure song composer for Trend Compass.
Composes a catchy, melodic, and attractive synthwave / space exploration soundtrack.
Renders to a clean stereo WAV file with seamless loop points.
Zero dependencies: standard library (wave, struct, math) + numpy.
"""

import math
import struct
import wave
from pathlib import Path
import numpy as np

SAMPLE_RATE = 44100
BPM = 112.0
BEAT_DUR = 60.0 / BPM
BAR_DUR = BEAT_DUR * 4.0
NUM_BARS = 16  # 16 bars total = 34.285 seconds, perfect loop
TOTAL_DUR = BAR_DUR * NUM_BARS
TOTAL_SAMPLES = int(TOTAL_DUR * SAMPLE_RATE)

print(f"Composing song: {BPM} BPM, {NUM_BARS} bars, {TOTAL_DUR:.2f}s, {TOTAL_SAMPLES} samples...")

# Pre-allocate stereo audio buffer
audio_left = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
audio_right = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

t_axis = np.linspace(0, TOTAL_DUR, TOTAL_SAMPLES, endpoint=False)

def note_to_freq(note_str):
    """Convert note name like 'D4', 'Bb3', 'C#5' to Hz."""
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    flat_map = {'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'}
    name = note_str[:-1]
    octave = int(note_str[-1])
    if name in flat_map:
        name = flat_map[name]
    semitone = notes.index(name)
    midi = 12 * (octave + 1) + semitone
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))

# ==========================================
# 1. DRUMS TRACK (Kick, Snare, Hi-hats)
# ==========================================
print("Synthesizing drums track...")

num_beats = int(NUM_BARS * 4)
for beat in range(num_beats):
    beat_start_time = beat * BEAT_DUR
    beat_idx = int(beat_start_time * SAMPLE_RATE)
    
    # KICK on every beat (4-on-the-floor groove)
    kick_dur = 0.28
    kick_samples = min(int(kick_dur * SAMPLE_RATE), TOTAL_SAMPLES - beat_idx)
    if kick_samples > 0:
        kt = np.linspace(0, kick_dur, kick_samples, endpoint=False)
        # Pitch drops rapidly from 160Hz down to 42Hz
        pitch_env = 42.0 + (160.0 - 42.0) * np.exp(-kt * 32.0)
        phase = 2.0 * np.pi * np.cumsum(pitch_env) / SAMPLE_RATE
        amp_env = np.exp(-kt * 14.0)
        kick_wave = np.sin(phase) * amp_env * 0.42
        # Soft saturation
        kick_wave = np.tanh(kick_wave * 1.5) * 0.35
        audio_left[beat_idx:beat_idx + kick_samples] += kick_wave
        audio_right[beat_idx:beat_idx + kick_samples] += kick_wave

    # SNARE / CLAP on beats 2 and 4
    if beat % 2 == 1:
        snare_dur = 0.22
        snare_samples = min(int(snare_dur * SAMPLE_RATE), TOTAL_SAMPLES - beat_idx)
        if snare_samples > 0:
            st = np.linspace(0, snare_dur, snare_samples, endpoint=False)
            # Tonal snap (180Hz) + shaped noise burst
            tone = np.sin(2.0 * np.pi * 185.0 * st) * np.exp(-st * 28.0) * 0.22
            noise = np.random.uniform(-1, 1, snare_samples) * np.exp(-st * 20.0) * 0.26
            snare_wave = tone + noise
            audio_left[beat_idx:beat_idx + snare_samples] += snare_wave * 0.85
            audio_right[beat_idx:beat_idx + snare_samples] += snare_wave * 0.85

    # HI-HATS on every 8th note + open hat on upbeat
    for eighth in range(2):
        hat_time = beat_start_time + eighth * (BEAT_DUR / 2.0)
        hat_idx = int(hat_time * SAMPLE_RATE)
        hat_dur = 0.09 if eighth == 1 else 0.04
        hat_samples = min(int(hat_dur * SAMPLE_RATE), TOTAL_SAMPLES - hat_idx)
        if hat_samples > 0:
            ht = np.linspace(0, hat_dur, hat_samples, endpoint=False)
            # Highpass metallic noise
            noise = np.random.uniform(-1, 1, hat_samples)
            # Simple high-frequency modulation
            mod = np.sin(2.0 * np.pi * 7500.0 * ht)
            hat_env = np.exp(-ht * (35.0 if eighth == 1 else 70.0))
            hat_wave = (noise * 0.6 + mod * 0.4) * hat_env * (0.12 if eighth == 1 else 0.07)
            audio_left[hat_idx:hat_idx + hat_samples] += hat_wave * 0.7
            audio_right[hat_idx:hat_idx + hat_samples] += hat_wave * 1.1  # slightly panned

# ==========================================
# 2. ROLLING 16th-NOTE SYNTH BASSLINE
# ==========================================
print("Synthesizing rolling synth bass...")

# 4-bar chord progression: Dm -> Bb -> C -> Am (repeated 4 times)
root_notes = ['D2', 'Bb1', 'C2', 'A1']

num_sixteenths = int(NUM_BARS * 16)
sixteenth_dur = BEAT_DUR / 4.0

for s in range(num_sixteenths):
    bar = s // 16
    chord_idx = bar % 4
    base_note = root_notes[chord_idx]
    base_freq = note_to_freq(base_note)
    
    # Octave bouncing pattern: root, root, octave_up, root
    pattern_step = s % 4
    if pattern_step == 2:
        note_freq = base_freq * 2.0  # octave pop
        vol = 0.22
    elif pattern_step == 0:
        note_freq = base_freq
        vol = 0.26
    else:
        note_freq = base_freq
        vol = 0.18
        
    start_time = s * sixteenth_dur
    start_idx = int(start_time * SAMPLE_RATE)
    note_dur = sixteenth_dur * 0.88
    n_samples = min(int(note_dur * SAMPLE_RATE), TOTAL_SAMPLES - start_idx)
    
    if n_samples > 0:
        nt = np.linspace(0, note_dur, n_samples, endpoint=False)
        # Rich sawtooth + sub sine
        phase = 2.0 * np.pi * note_freq * nt
        saw = 2.0 * (phase / (2.0 * np.pi) - np.floor(phase / (2.0 * np.pi) + 0.5))
        sub = np.sin(phase)
        bass_env = np.exp(-nt * 12.0)
        # Lowpass filter warmth
        bass_wave = (saw * 0.6 + sub * 0.4) * bass_env * vol
        audio_left[start_idx:start_idx + n_samples] += bass_wave
        audio_right[start_idx:start_idx + n_samples] += bass_wave

# ==========================================
# 3. LUSH SYNTH CHORD PADS
# ==========================================
print("Synthesizing polyphonic synth pads...")

chord_defs = [
    # Bar 1: D minor 9
    [note_to_freq(n) for n in ['D3', 'F3', 'A3', 'C4', 'E4']],
    # Bar 2: Bb Major 7
    [note_to_freq(n) for n in ['Bb2', 'D3', 'F3', 'A3', 'D4']],
    # Bar 3: C Major add9
    [note_to_freq(n) for n in ['C3', 'E3', 'G3', 'D4', 'E4']],
    # Bar 4: A minor 7
    [note_to_freq(n) for n in ['A2', 'C3', 'E3', 'G3', 'C4']],
]

for bar in range(NUM_BARS):
    chord = chord_defs[bar % 4]
    bar_start_time = bar * BAR_DUR
    bar_start_idx = int(bar_start_time * SAMPLE_RATE)
    bar_samples = min(int(BAR_DUR * SAMPLE_RATE), TOTAL_SAMPLES - bar_start_idx)
    
    if bar_samples > 0:
        bt = np.linspace(0, BAR_DUR, bar_samples, endpoint=False)
        # Pad envelope: gentle attack, sustain, gentle release
        pad_env = np.ones(bar_samples, dtype=np.float32)
        attack_len = int(0.3 * SAMPLE_RATE)
        release_len = int(0.4 * SAMPLE_RATE)
        if bar_samples > attack_len:
            pad_env[:attack_len] = np.linspace(0, 1, attack_len)
        if bar_samples > release_len:
            pad_env[-release_len:] = np.linspace(1, 0, release_len)
            
        chord_wave_l = np.zeros(bar_samples, dtype=np.float32)
        chord_wave_r = np.zeros(bar_samples, dtype=np.float32)
        
        for idx, freq in enumerate(chord):
            # Dual detuned saw/tri oscillators with chorus
            phase1 = 2.0 * np.pi * (freq * 1.002) * bt
            phase2 = 2.0 * np.pi * (freq * 0.998) * bt
            osc1 = np.sin(phase1)
            osc2 = 2.0 * np.abs(2.0 * (phase2 / (2.0 * np.pi) - np.floor(phase2 / (2.0 * np.pi) + 0.5))) - 1.0
            voice = (osc1 * 0.6 + osc2 * 0.4)
            # Stereo spread
            pan = (idx / len(chord)) - 0.5  # -0.5 to +0.5
            chord_wave_l += voice * (0.5 - pan * 0.4)
            chord_wave_r += voice * (0.5 + pan * 0.4)
            
        chord_wave_l = chord_wave_l * pad_env * 0.045
        chord_wave_r = chord_wave_r * pad_env * 0.045
        audio_left[bar_start_idx:bar_start_idx + bar_samples] += chord_wave_l
        audio_right[bar_start_idx:bar_start_idx + bar_samples] += chord_wave_r

# ==========================================
# 4. MEMORABLE ADVENTURE LEAD MELODY
# ==========================================
print("Synthesizing heroic adventure lead melody...")

# Lead melody notes and durations (in 16th notes: 16 per bar)
# 16 bars = 256 sixteenth notes
melody_bars_1_to_8 = [
    # Bar 1 (Dm): A4 -> D5 -> F5
    ('A4', 4), ('D5', 4), ('F5', 6), ('E5', 2),
    # Bar 2 (Bb): D5 -> Bb4 -> C5
    ('D5', 4), ('Bb4', 4), ('C5', 8),
    # Bar 3 (C): E5 -> G5 -> E5 -> D5
    ('E5', 4), ('G5', 4), ('E5', 4), ('D5', 4),
    # Bar 4 (Am): C5 -> A4 -> C5
    ('C5', 6), ('A4', 6), ('C5', 4),
    # Bar 5 (Dm): A4 -> D5 -> F5 -> A5 (Climbing higher!)
    ('A4', 4), ('D5', 4), ('F5', 4), ('A5', 4),
    # Bar 6 (Bb): G5 -> F5 -> D5
    ('G5', 6), ('F5', 2), ('D5', 8),
    # Bar 7 (C): E5 -> G5 -> A5 -> C6
    ('E5', 4), ('G5', 4), ('A5', 4), ('C6', 4),
    # Bar 8 (Am): D6 -> C6 -> A5 (Satisfying phrase turnaround)
    ('D6', 6), ('C6', 4), ('A5', 6),
]

# Repeat melody for bars 9 to 16 with subtle variations on the finale
melody_bars_9_to_16 = [
    # Bar 9-14: same driving motif
    ('A4', 4), ('D5', 4), ('F5', 6), ('E5', 2),
    ('D5', 4), ('Bb4', 4), ('C5', 8),
    ('E5', 4), ('G5', 4), ('E5', 4), ('D5', 4),
    ('C5', 6), ('A4', 6), ('C5', 4),
    ('A4', 4), ('D5', 4), ('F5', 4), ('A5', 4),
    ('G5', 6), ('F5', 2), ('D5', 8),
    # Bar 15-16: Grand heroic finale climbing to climax and resolving smoothly
    ('F5', 4), ('G5', 4), ('A5', 4), ('C6', 4),
    ('D6', 8), ('D5', 8),  # Triumphant octave landing at loop edge
]

full_melody = melody_bars_1_to_8 + melody_bars_9_to_16

cur_sixteenth = 0
for note_name, dur_sixteenths in full_melody:
    start_time = cur_sixteenth * sixteenth_dur
    note_dur = dur_sixteenths * sixteenth_dur
    note_freq = note_to_freq(note_name)
    
    start_idx = int(start_time * SAMPLE_RATE)
    # Give lead note slight staccato or legato tail
    sound_dur = note_dur * 0.92
    n_samples = min(int(sound_dur * SAMPLE_RATE), TOTAL_SAMPLES - start_idx)
    
    if n_samples > 0:
        mt = np.linspace(0, sound_dur, n_samples, endpoint=False)
        # Expressive vibrato (5.5 Hz)
        vibrato = 1.0 + 0.008 * np.sin(2.0 * np.pi * 5.5 * mt)
        phase = 2.0 * np.pi * note_freq * np.cumsum(vibrato) / SAMPLE_RATE
        
        # Analog lead timbre: sine + square harmonic
        lead_osc1 = np.sin(phase)
        lead_osc2 = np.sign(np.sin(phase * 2.0)) * 0.25
        lead_raw = (lead_osc1 * 0.75 + lead_osc2 * 0.25)
        
        # ADSR envelope
        lead_env = np.ones(n_samples, dtype=np.float32)
        attack_samp = min(int(0.04 * SAMPLE_RATE), n_samples)
        decay_samp = min(int(0.12 * SAMPLE_RATE), n_samples)
        lead_env[:attack_samp] = np.linspace(0, 1.2, attack_samp)
        lead_env[attack_samp:attack_samp + decay_samp] = np.linspace(1.2, 1.0, decay_samp)
        release_samp = min(int(0.08 * SAMPLE_RATE), n_samples)
        lead_env[-release_samp:] = np.linspace(1.0, 0, release_samp)
        
        lead_signal = lead_raw * lead_env * 0.16
        
        audio_left[start_idx:start_idx + n_samples] += lead_signal * 0.95
        audio_right[start_idx:start_idx + n_samples] += lead_signal * 0.95
        
        # Stereo ping-pong echo delay on lead
        echo_delay_sec = BEAT_DUR * 0.75  # dotted 8th echo
        echo_idx = start_idx + int(echo_delay_sec * SAMPLE_RATE)
        echo_samples = min(n_samples, TOTAL_SAMPLES - echo_idx)
        if echo_samples > 0:
            audio_left[echo_idx:echo_idx + echo_samples] += lead_signal[:echo_samples] * 0.05
            audio_right[echo_idx:echo_idx + echo_samples] += lead_signal[:echo_samples] * 0.12

    cur_sixteenth += dur_sixteenths

# ==========================================
# 5. SPARKLING SPACE ARPEGGIO (CELLESTIAL CHIMES)
# ==========================================
print("Synthesizing celestial arpeggiator...")

arp_scales = [
    # Dm
    ['D5', 'F5', 'A5', 'C6', 'D6', 'C6', 'A5', 'F5'],
    # Bb
    ['D5', 'F5', 'Bb5', 'D6', 'F6', 'D6', 'Bb5', 'F5'],
    # C
    ['E5', 'G5', 'C6', 'E6', 'G6', 'E6', 'C6', 'G5'],
    # Am
    ['C5', 'E5', 'A5', 'C6', 'E6', 'C6', 'A5', 'E5'],
]

for s in range(num_sixteenths):
    bar = s // 16
    chord_idx = bar % 4
    scale = arp_scales[chord_idx]
    note_name = scale[s % len(scale)]
    note_freq = note_to_freq(note_name)
    
    start_time = s * sixteenth_dur
    start_idx = int(start_time * SAMPLE_RATE)
    note_dur = sixteenth_dur * 0.8
    n_samples = min(int(note_dur * SAMPLE_RATE), TOTAL_SAMPLES - start_idx)
    
    if n_samples > 0:
        at = np.linspace(0, note_dur, n_samples, endpoint=False)
        phase = 2.0 * np.pi * note_freq * at
        # Pure glass-like sine with quick decay
        arp_wave = np.sin(phase) * np.exp(-at * 22.0) * 0.065
        # Ping pong pan based on 16th step
        pan = np.sin(s * 0.8) * 0.6
        audio_left[start_idx:start_idx + n_samples] += arp_wave * (0.5 - pan * 0.4)
        audio_right[start_idx:start_idx + n_samples] += arp_wave * (0.5 + pan * 0.4)

# ==========================================
# 6. MASTERING & SOFT LIMITER
# ==========================================
print("Mastering audio (soft limiter & normalization)...")

# Smooth loop boundary crossfade (20ms at ends to guarantee 0 click)
fade_len = int(0.02 * SAMPLE_RATE)
fade_in = np.linspace(0, 1, fade_len)
fade_out = np.linspace(1, 0, fade_len)
audio_left[:fade_len] = audio_left[:fade_len] * fade_in + audio_left[-fade_len:] * fade_out
audio_right[:fade_len] = audio_right[:fade_len] * fade_in + audio_right[-fade_len:] * fade_out

# Gentle analog saturation
master_l = np.tanh(audio_left * 1.3) * 0.82
master_r = np.tanh(audio_right * 1.3) * 0.82

# Normalize to safe peak -1.5 dB (0.84)
max_peak = max(np.max(np.abs(master_l)), np.max(np.abs(master_r)))
if max_peak > 0:
    master_l = (master_l / max_peak) * 0.84
    master_r = (master_r / max_peak) * 0.84

out_dir = Path(__file__).resolve().parents[1] / 'public' / 'audio'
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / 'star-galleon-theme.wav'

# Convert to 16-bit PCM stereo
pcm_left = (master_l * 32767.0).astype(np.int16)
pcm_right = (master_r * 32767.0).astype(np.int16)

# Interleave stereo channels
interleaved = np.empty((TOTAL_SAMPLES * 2,), dtype=np.int16)
interleaved[0::2] = pcm_left
interleaved[1::2] = pcm_right

with wave.open(str(out_file), 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(interleaved.tobytes())

file_size_mb = out_file.stat().st_size / (1024 * 1024)
print(f"SUCCESS: Rendered {out_file.name} ({file_size_mb:.2f} MB, {TOTAL_DUR:.2f}s loop)")
