import hashlib
import json
import re
import subprocess
import tempfile
import wave
from fractions import Fraction
from pathlib import Path

import imageio_ffmpeg
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'hymns' / 'audio'
RATE = 44100
VERSION = 'hymns-1'
CLUE_SECONDS = 11

def lily(text, key, reference=35):
    scale = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}
    diatonic = {'c': 0, 'd': 1, 'e': 2, 'f': 3, 'g': 4, 'a': 5, 'b': 6}
    previous = reference
    duration = 1
    notes = []
    for token in text.split():
        match = re.fullmatch(r'([a-grs])(is|es)?([\x27,]*)(\d+)?(\.*)', token)
        if not match:
            raise ValueError('Unknown note: ' + token)
        name, accidental, octaves, number, dots = match.groups()
        if number:
            duration = 4 / int(number)
        length = duration * sum(.5 ** i for i in range(len(dots) + 1))
        if name in ['r', 's']:
            notes.append([None, length])
            continue
        position = diatonic[name] + 7 * round((previous - diatonic[name]) / 7)
        position += 7 * (octaves.count("'") - octaves.count(','))
        previous = position
        alteration = 1 if accidental == 'is' else -1 if accidental == 'es' else key.get(name, 0)
        notes.append([12 * (position // 7 + 1) + scale[name] + alteration, length])
    return notes

def abc(text):
    scale = {'C': 1, 'D': 2, 'E': 4, 'F': 6, 'G': 7, 'A': 9, 'B': 11}
    result = []
    for token in re.findall(r'[A-Ga-g][,\x27]*[0-9/]*', text):
        match = re.fullmatch(r'([A-Ga-g])([,\x27]*)([0-9/]*?)', token)
        name, octave, length = match.groups()
        midi = 60 + scale[name.upper()] + (12 if name.islower() else 0) + 12 * (octave.count("'") - octave.count(','))
        if not length:
            beats = 1
        elif set(length) == {'/'}:
            beats = 1 / (2 ** len(length))
        elif length.endswith('/'):
            beats = float(Fraction(length + '2'))
        else:
            beats = float(Fraction(length))
        result.append([midi, beats])
    return result

def arrangements():
    adeste = "a4 a2 e4 a b2 e, cis'4 b cis d cis2 b4 a a2 gis4 fis gis4 a b cis gis2 fis4. e8 e1 e'2 d4 cis d2 cis b4 cis a b gis4. fis8 e4 a a gis a b a2 e4 cis' cis b cis d cis2 b4 cis d cis b a gis2 a4 d cis2 b4. a8 a2."
    silent = "g4. a8 g4 e2. g4. a8 g4 e2. d'2 d4 b2. c2 c4 g2. a2 a4 c4. b8 a4 g4. a8 g4 e2. a2 a4 c4. b8 a4 g4. a8 g4 e2. d'2 d4 f4. d8 b4 c2. e2. c4 g e g4. f8 d4 c2. c2."
    joy = "d c3/4B// A3/2 G/ F E D3/2 A/ B3/2 B/ c3/2 c/ d3/2 d/ d/c/ B/A/ A3/4G//F/ d/ d/c/ B/A/ A3/4G//F/ F/ F/F/ F/F//G// A3/2 G//F// E/E/ E/E//F// G3/2 F//E// D/ d B/ A3/4G//F/ G/ F E D2"
    sanctissima = json.loads((ROOT / 'hymns' / 'sanctissima-notes.json').read_text())
    return {'adeste': {'tempo': 106, 'notes': lily(adeste, {'f': 1, 'c': 1, 'g': 1})}, 'silent': {'tempo': 100, 'notes': lily(silent, {}, reference=35)}, 'joy': {'tempo': 95, 'notes': abc(joy)}, 'sanctissima': {'tempo': 92, 'notes': [[note, beats * 2] for note, beats in sanctissima]}}

def signal(notes, tempo):
    length = sum(duration for _, duration in notes) * 60 / tempo
    output = np.zeros(int((length + .7) * RATE), dtype=np.float64)
    cursor = .12
    for midi, beats in notes:
        seconds = beats * 60 / tempo
        if midi is not None:
            duration = seconds * .94 + .04
            time = np.arange(int(duration * RATE)) / RATE
            frequency = 440 * 2 ** ((midi - 69) / 12)
            attack = np.minimum(time / .025, 1)
            release = np.minimum(np.maximum(duration - time, 0) / .08, 1)
            envelope = attack * release * np.exp(-time * .8)
            voice = sum(weight * np.sin(2 * np.pi * frequency * harmonic * time) for harmonic, weight in [(1, 1), (2, .24), (3, .08), (.5, .09)]) * envelope
            start = int(cursor * RATE)
            output[start:start + len(voice)] += voice
        cursor += seconds
    dry = output.copy()
    for delay, gain in [(.075, .10), (.135, .075), (.23, .04)]:
        offset = int(delay * RATE)
        output[offset:] += dry[:-offset] * gain
    output *= .67 / max(np.max(np.abs(output)), 1e-6)
    return output

def main():
    FOLDER.mkdir(parents=True, exist_ok=True)
    expected = {'adeste': [69, 69, 64, 69, 71, 64, 73, 71], 'silent': [67, 69, 67, 64, 67, 69, 67, 64], 'sanctissima': [72, 74, 72, 70, 69, 70, 72, 74], 'joy': [74, 73, 71, 69, 67, 66, 64, 62]}
    songs = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./hymns/data.js").songs))'], cwd=ROOT))
    files = {}
    with tempfile.TemporaryDirectory(prefix='elven-hymns-') as temporary:
        for song in songs:
            arrangement = arrangements()[song['id']]
            if [note for note, _ in arrangement['notes'] if note is not None][:8] != expected[song['id']]:
                raise RuntimeError('Melody does not match source: ' + song['id'])
            audio = signal(arrangement['notes'], arrangement['tempo'])
            for clue in [False, True]:
                filename = song['clue'] if clue else song['audio']
                clip = audio[:int(CLUE_SECONDS * RATE)].copy() if clue else audio.copy()
                if clue:
                    count = int(.25 * RATE)
                    clip[-count:] *= np.linspace(1, 0, count)
                if not np.isfinite(clip).all() or np.max(np.abs(clip)) < .1:
                    raise RuntimeError('Invalid signal: ' + filename)
                wav = Path(temporary) / (filename + '.wav')
                with wave.open(str(wav), 'wb') as writer:
                    writer.setnchannels(1)
                    writer.setsampwidth(2)
                    writer.setframerate(RATE)
                    writer.writeframes((clip * 32767).astype('<i2').tobytes())
                target = FOLDER / filename
                subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-v', 'error', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '128k', str(target)], check=True)
                files[filename] = {'song': song['id'], 'kind': 'clue' if clue else 'melody', 'duration': len(clip) / RATE, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
    (FOLDER / 'manifest.json').write_text(json.dumps({'version': VERSION, 'method': 'New instrumental synthesis of public-domain traditional melodies; no singer recording', 'sampleRate': RATE, 'clueSeconds': CLUE_SECONDS, 'clips': files}, indent=2) + '\n')
    print('Generated 4 instrumental hymn melodies and 4 clues')

if __name__ == '__main__':
    main()
