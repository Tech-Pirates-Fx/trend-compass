"""
Starlight Odyssey - Catchy, Melodic, Attractive Space Adventure Song for Trend Compass.
Composed with rich multi-track synthesis:
- Upbeat 118 BPM electronic drum kit (punchy kick, crisp snare/clap, sizzling hi-hats, crash cymbal)
- Driving 80s rolling 16th-note synth bassline
- Warm 80s polyphonic lush synthesizer pads (4-chord progression: Dm9 - BbMaj7 - Gm7 - C9)
- Memorable, catchy, uplifting heroic lead melody with vibrato and stereo ping-pong delay
- Crystalline cosmic arpeggiator (starlight bells)
Zero dependencies: standard library + numpy.
"""

import math
import struct
import wave
from pathlib import Path
import numpy as np

SAMPLE_RATE = 44100
BPM = 118.0
BEAT_DUR = 60.0 / BPM
BAR_DUR = BEAT_DUR * 4.0
NUM_BARS = 16  # 16 bars = 32.54 seconds, seamless loop
TOTAL_DUR = BAR_DUR * NUM_BARS
TOTAL_SAMPLES = int(TOTAL_DUR * SAMPLE_RATE)

print(f"Composing Starlight Odyssey: {BPM} BPM, {NUM_BARS} bars, {TOTAL_DUR:.2f}s, {TOTAL_SAMPLES} samples...")

# Stereo buffers
audio_left = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
audio_right = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

t_axis = np.linspace(0, TOTAL_DUR, TOTAL_SAMPLES, endpoint=False)

def note_to_freq(note_str):
    """Convert note name like 'D4', 'Bb3', 'C5' to Hz."""
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
# 1. DRUMS TRACK (Punchy, energetic groove)
# ==========================================
print("Synthesizing energetic drum groove...")
num_beats = int(NUM_BARS * 4)

for beat in range(num_beats):
    beat_time = beat * BEAT_DUR
    beat_idx = int(beat_time * SAMPLE_RATE)

    # 1. KICK: 4-on-the-floor with deep punch
    kick_dur = 0.25
    ks = min(int(kick_dur * SAMPLE_RATE), TOTAL_SAMPLES - beat_idx)
    if ks > 0:
        kt = np.linspace(0, kick_dur, ks, endpoint=False)
        pitch_env = 44.0 + (180.0 - 44.0) * np.exp(-kt * 36.0)
        phase = 2.0 * np.pi * np.cumsum(pitch_env) / SAMPLE_RATE
        amp_env = np.exp(-kt * 15.0)
        kick_wave = np.sin(phase) * amp_env * 0.40
        kick_wave = np.tanh(kick_wave * 1.6) * 0.36
        audio_left[beat_idx:beat_idx + ks] += kick_wave
        audio_right[beat_idx:beat_idx + ks] += kick_wave

    # 2. SNARE / CLAP on beats 2 and 4
    if beat % 2 == 1:
        snare_dur = 0.22
        ss = min(int(snare_dur * SAMPLE_RATE), TOTAL_SAMPLES - beat_idx)
        if ss > 0:
            st = np.linspace(0, snare_dur, ss, endpoint=False)
            tone = np.sin(2.0 * np.pi * 190.0 * st) * np.exp(-st * 26.0) * 0.24
            noise = np.random.uniform(-1, 1, ss) * np.exp(-st * 22.0) * 0.28
            snare_wave = (tone + noise) * 0.8
            audio_left[beat_idx:beat_idx + ss] += snare_wave * 0.9
            audio_right[beat_idx:beat_idx + ss] += snare_wave * 0.9

    # 3. HI-HATS: 16th-note rolling groove
    for sixteenth in range(4):
        hat_time = beat_time + sixteenth * (BEAT_DUR / 4.0)
        hat_idx = int(hat_time * SAMPLE_RATE)
        accent = 1.0 if sixteenth % 2 == 0 else 0.6
        hat_dur = 0.05 if sixteenth % 2 == 0 else 0.03
        hs = min(int(hat_dur * SAMPLE_RATE), TOTAL_SAMPLES - hat_idx)
        if hs > 0:
            ht = np.linspace(0, hat_dur, hs, endpoint=False)
            noise = np.random.uniform(-1, 1, hs)
            hat_env = np.exp(-ht * (40.0 if sixteenth % 2 == 0 else 75.0))
            hat_wave = noise * hat_env * 0.09 * accent
            pan_l = 0.7 if sixteenth % 2 == 0 else 1.1
            pan_r = 1.1 if sixteenth % 2 == 0 else 0.7
            audio_left[hat_idx:hat_idx + hs] += hat_wave * pan_l
            audio_right[hat_idx:hat_idx + hs] += hat_wave * pan_r

    # Crash cymbal on bar 1 and bar 9 downbeat
    if beat in [0, 32]:
        crash_dur = 1.6
        cs = min(int(crash_dur * SAMPLE_RATE), TOTAL_SAMPLES - beat_idx)
        if cs > 0:
            ct = np.linspace(0, crash_dur, cs, endpoint=False)
            crash_noise = np.random.uniform(-1, 1, cs) * np.exp(-ct * 3.5) * 0.18
            audio_left[beat_idx:beat_idx + cs] += crash_noise * 0.9
            audio_right[beat_idx:beat_idx + cs] += crash_noise * 1.1

# ==========================================
# 2. DRIVING 16th-NOTE SYNTH BASSLINE
# ==========================================
print("Synthesizing driving 80s bassline...")
# Chords across 16 bars: 4 bars each: Dm, Bb, Gm, C
bass_notes_by_bar = (
    ["D2"] * 4 +   # Bars 1-4: D minor
    ["Bb1"] * 4 +  # Bars 5-8: Bb major
    ["G1"] * 4 +   # Bars 9-12: G minor
    ["C2"] * 4     # Bars 13-16: C major
)

for bar_idx, root_note in enumerate(bass_notes_by_bar):
    bar_start = bar_idx * BAR_DUR
    root_freq = note_to_freq(root_note)
    oct_freq = root_freq * 2.0

    # 16th note pattern in each bar
    for step in range(16):
        step_time = bar_start + step * (BEAT_DUR / 4.0)
        step_idx = int(step_time * SAMPLE_RATE)
        # Alternate root and octave
        freq = oct_freq if (step % 4 == 2 or step % 4 == 3) else root_freq
        dur = (BEAT_DUR / 4.0) * 0.85
        bs = min(int(dur * SAMPLE_RATE), TOTAL_SAMPLES - step_idx)
        if bs > 0:
            bt = np.linspace(0, dur, bs, endpoint=False)
            # Sawtooth + sub-oscillator
            saw = (2.0 * (bt * freq - np.floor(bt * freq + 0.5)))
            sub = np.sin(2.0 * np.pi * (freq * 0.5) * bt)
            # Lowpass filter sweep
            filt_env = np.exp(-bt * 22.0)
            bass_tone = (saw * 0.7 + sub * 0.5) * (0.3 + 0.7 * filt_env)
            amp_env = np.exp(-bt * 14.0)
            b_sample = np.tanh(bass_tone * 1.5) * amp_env * 0.32
            audio_left[step_idx:step_idx + bs] += b_sample * 0.95
            audio_right[step_idx:step_idx + bs] += b_sample * 0.95

# ==========================================
# 3. LUSH SYNTHESIS PADS (Stereo Chords)
# ==========================================
print("Synthesizing polyphonic lush pads...")
chord_progression = [
    # Bars 1-4: Dm9 (D, F, A, C, E)
    ["D3", "F3", "A3", "C4", "E4"],
    # Bars 5-8: BbMaj9 (Bb, D, F, A, C)
    ["Bb2", "D3", "F3", "A3", "C4"],
    # Bars 9-12: Gm9 (G, Bb, D, F, A)
    ["G2", "Bb2", "D3", "F3", "A3"],
    # Bars 13-16: C9sus4 -> C9 (C, G, Bb, D, E)
    ["C3", "G3", "Bb3", "D4", "E4"],
]

for section_idx, chord in enumerate(chord_progression):
    sec_start = section_idx * 4 * BAR_DUR
    sec_dur = 4 * BAR_DUR
    sec_samples = min(int(sec_dur * SAMPLE_RATE), TOTAL_SAMPLES - int(sec_start * SAMPLE_RATE))
    st = np.linspace(0, sec_dur, sec_samples, endpoint=False)

    chord_wave_l = np.zeros(sec_samples, dtype=np.float32)
    chord_wave_r = np.zeros(sec_samples, dtype=np.float32)

    for i, n in enumerate(chord):
        freq = note_to_freq(n)
        # Detuned stereo oscillators for lush chorus
        detune = 0.003 * (i % 2 * 2 - 1)
        w_l = np.sin(2.0 * np.pi * freq * (1.0 - detune) * st)
        w_r = np.sin(2.0 * np.pi * freq * (1.0 + detune) * st)
        # Soft warmth
        w_l += 0.3 * np.sin(2.0 * np.pi * freq * 2.0 * st)
        w_r += 0.3 * np.sin(2.0 * np.pi * freq * 2.0 * st)

        chord_wave_l += w_l * (0.045 / len(chord))
        chord_wave_r += w_r * (0.045 / len(chord))

    # Gentle envelope: attack 0.4s, release 0.4s
    attack_samples = int(0.4 * SAMPLE_RATE)
    release_samples = int(0.4 * SAMPLE_RATE)
    env = np.ones(sec_samples, dtype=np.float32)
    env[:attack_samples] = np.linspace(0, 1, attack_samples)
    env[-release_samples:] = np.linspace(1, 0, release_samples)

    start_idx = int(sec_start * SAMPLE_RATE)
    audio_left[start_idx:start_idx + sec_samples] += chord_wave_l * env * 0.8
    audio_right[start_idx:start_idx + sec_samples] += chord_wave_r * env * 0.8

# ==========================================
# 4. CRYSTALLINE STARLIGHT ARPEGGIO
# ==========================================
print("Synthesizing starlight arpeggiator...")
arp_patterns = [
    # Dm: D4, F4, A4, C5, D5, C5, A4, F4
    ["D4", "F4", "A4", "C5", "D5", "C5", "A4", "F4"],
    # Bb: Bb3, D4, F4, A4, Bb4, A4, F4, D4
    ["Bb3", "D4", "F4", "A4", "Bb4", "A4", "F4", "D4"],
    # Gm: G3, Bb3, D4, F4, G4, F4, D4, Bb3
    ["G3", "Bb3", "D4", "F4", "G4", "F4", "D4", "Bb3"],
    # C: C4, E4, G4, Bb4, C5, Bb4, G4, E4
    ["C4", "E4", "G4", "Bb4", "C5", "Bb4", "G4", "E4"],
]

for section_idx, pattern in enumerate(arp_patterns):
    for bar in range(4):
        bar_idx = section_idx * 4 + bar
        bar_start = bar_idx * BAR_DUR
        for step in range(8):
            step_time = bar_start + step * (BEAT_DUR / 2.0)
            step_idx = int(step_time * SAMPLE_RATE)
            note = pattern[step % len(pattern)]
            freq = note_to_freq(note)
            dur = 0.22
            asamp = min(int(dur * SAMPLE_RATE), TOTAL_SAMPLES - step_idx)
            if asamp > 0:
                at = np.linspace(0, dur, asamp, endpoint=False)
                # Triangle / sine bell chime
                bell = np.sin(2.0 * np.pi * freq * at) * 0.7 + np.sin(2.0 * np.pi * freq * 2.0 * at) * 0.25
                env = np.exp(-at * 16.0)
                awave = bell * env * 0.08
                # Alternating stereo ping-pong
                pan = 0.3 if step % 2 == 0 else 0.7
                audio_left[step_idx:step_idx + asamp] += awave * (1.0 - pan)
                audio_right[step_idx:step_idx + asamp] += awave * pan

# ==========================================
# 5. CATCHY HEROIC LEAD MELODY
# ==========================================
print("Synthesizing heroic lead melody...")
# 16-bar melodic phrase (Bars 1-8 call, Bars 9-16 triumphant resolution)
# Format: (bar, beat_offset, duration_in_beats, note)
melody_events = [
    # Phrase 1 (Bars 1-4)
    (0, 0.0, 1.5, "A4"),
    (0, 1.5, 0.5, "F4"),
    (0, 2.0, 1.0, "D4"),
    (0, 3.0, 1.0, "E4"),
    (1, 0.0, 2.0, "F4"),
    (1, 2.0, 1.0, "G4"),
    (1, 3.0, 1.0, "A4"),
    (2, 0.0, 2.5, "D5"),
    (2, 2.5, 0.5, "C5"),
    (2, 3.0, 1.0, "A4"),
    (3, 0.0, 3.0, "F4"),

    # Phrase 2 (Bars 5-8) - Upbeat climb
    (4, 0.0, 1.5, "F4"),
    (4, 1.5, 0.5, "G4"),
    (4, 2.0, 1.0, "A4"),
    (4, 3.0, 1.0, "Bb4"),
    (5, 0.0, 2.0, "C5"),
    (5, 2.0, 1.0, "D5"),
    (5, 3.0, 1.0, "E5"),
    (6, 0.0, 2.5, "F5"),
    (6, 2.5, 0.5, "E5"),
    (6, 3.0, 1.0, "D5"),
    (7, 0.0, 3.0, "A4"),

    # Phrase 3 (Bars 9-12) - Expressive starlight bridge
    (8, 0.0, 1.5, "G4"),
    (8, 1.5, 0.5, "A4"),
    (8, 2.0, 1.0, "Bb4"),
    (8, 3.0, 1.0, "C5"),
    (9, 0.0, 2.0, "D5"),
    (9, 2.0, 1.0, "C5"),
    (9, 3.0, 1.0, "Bb4"),
    (10, 0.0, 2.0, "A4"),
    (10, 2.0, 1.0, "G4"),
    (10, 3.0, 1.0, "F4"),
    (11, 0.0, 3.0, "G4"),

    # Phrase 4 (Bars 13-16) - Grand heroic cadence to D
    (12, 0.0, 1.0, "A4"),
    (12, 1.0, 1.0, "C5"),
    (12, 2.0, 1.0, "D5"),
    (12, 3.0, 1.0, "E5"),
    (13, 0.0, 2.0, "F5"),
    (13, 2.0, 1.0, "E5"),
    (13, 3.0, 1.0, "C5"),
    (14, 0.0, 3.0, "D5"),
    (15, 0.0, 2.5, "D5"),
]

for bar, offset, dur_beats, note in melody_events:
    note_time = bar * BAR_DUR + offset * BEAT_DUR
    note_idx = int(note_time * SAMPLE_RATE)
    dur_sec = dur_beats * BEAT_DUR
    freq = note_to_freq(note)
    ms = min(int(dur_sec * SAMPLE_RATE), TOTAL_SAMPLES - note_idx)
    if ms > 0:
        mt = np.linspace(0, dur_sec, ms, endpoint=False)
        # Gentle vibrato: 5.5 Hz frequency modulation
        vibrato_depth = 0.012 if dur_sec > 0.8 else 0.004
        vibrato = np.sin(2.0 * np.pi * 5.5 * mt) * vibrato_depth
        mod_freq = freq * (1.0 + vibrato)
        phase = 2.0 * np.pi * np.cumsum(mod_freq) / SAMPLE_RATE

        # Rich sawtooth + square lead with warmth
        saw = 2.0 * ((phase / (2.0 * np.pi)) - np.floor((phase / (2.0 * np.pi)) + 0.5))
        square = np.sign(np.sin(phase))
        lead_tone = saw * 0.65 + square * 0.25

        # ADSR Envelope
        attack = min(0.04, dur_sec * 0.1)
        decay = min(0.1, dur_sec * 0.2)
        release = min(0.08, dur_sec * 0.15)
        att_samples = int(attack * SAMPLE_RATE)
        dec_samples = int(decay * SAMPLE_RATE)
        rel_samples = int(release * SAMPLE_RATE)
        env = np.ones(ms, dtype=np.float32) * 0.85
        if att_samples > 0:
            env[:att_samples] = np.linspace(0, 1.0, att_samples)
        if dec_samples > 0 and ms > att_samples + dec_samples:
            env[att_samples:att_samples + dec_samples] = np.linspace(1.0, 0.85, dec_samples)
        if rel_samples > 0 and ms > rel_samples:
            env[-rel_samples:] = np.linspace(0.85, 0.0, rel_samples)

        lead_wave = lead_tone * env * 0.24

        # Add stereo lead with gentle chorus
        audio_left[note_idx:note_idx + ms] += lead_wave * 0.95
        audio_right[note_idx:note_idx + ms] += lead_wave * 0.95

        # Stereo Ping-Pong Delay Echo (dotted 8th delay = 3/4 beat)
        delay_time = BEAT_DUR * 0.75
        delay_samples = int(delay_time * SAMPLE_RATE)
        echo_idx = note_idx + delay_samples
        if echo_idx < TOTAL_SAMPLES:
            echo_len = min(ms, TOTAL_SAMPLES - echo_idx)
            audio_left[echo_idx:echo_idx + echo_len] += lead_wave[:echo_len] * 0.06
            audio_right[echo_idx:echo_idx + echo_len] += lead_wave[:echo_len] * 0.14

# ==========================================
# 6. MASTERING & CLEAN SEAMLESS LOOP
# ==========================================
print("Mastering & soft-limiting audio...")

# Soft limiting via tanh
peak = max(np.max(np.abs(audio_left)), np.max(np.abs(audio_right)))
print(f"Pre-master peak amplitude: {peak:.3f}")
if peak > 0:
    target_peak = 0.88
    gain = target_peak / max(peak, 0.88)
    audio_left = np.tanh(audio_left * gain) * 0.90
    audio_right = np.tanh(audio_right * gain) * 0.90

# Ensure seamless loop crossfade (15ms at boundary)
xfade_samples = int(0.015 * SAMPLE_RATE)
fade_in = np.linspace(0, 1, xfade_samples)
fade_out = np.linspace(1, 0, xfade_samples)
audio_left[:xfade_samples] = audio_left[:xfade_samples] * fade_in + audio_left[-xfade_samples:] * fade_out
audio_right[:xfade_samples] = audio_right[:xfade_samples] * fade_in + audio_right[-xfade_samples:] * fade_out

# Output path
out_path = Path(__file__).resolve().parent.parent / "public" / "audio" / "starlight-odyssey.wav"
out_path.parent.mkdir(parents=True, exist_ok=True)

# Write 16-bit PCM Stereo WAV
left_16 = np.clip(audio_left * 32767.0, -32768, 32767).astype(np.int16)
right_16 = np.clip(audio_right * 32767.0, -32768, 32767).astype(np.int16)

# Interleave stereo channels
interleaved = np.empty((TOTAL_SAMPLES * 2,), dtype=np.int16)
interleaved[0::2] = left_16
interleaved[1::2] = right_16

with wave.open(str(out_path), "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(interleaved.tobytes())

file_size_mb = out_path.stat().st_size / (1024 * 1024)
print(f"SUCCESS: Rendered {out_path.name} ({file_size_mb:.2f} MB, {TOTAL_DUR:.2f}s loop)")
