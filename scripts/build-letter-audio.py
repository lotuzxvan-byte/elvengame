import argparse
import asyncio
import hashlib
import json
import subprocess
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'alphabet' / 'audio'
MODEL = 'id_ID-news_tts-medium'
VOICE = 'Piper ' + MODEL
VERSION = 'id-letters-5'
LENGTH_SCALE = 1.25
PRESERVED = {
    'letter-a.mp3': 'c888c310f20445380dacfbd3bf4d1b707a680059bd609bff3872e00477995d08',
    'letter-c.mp3': '022b3c096c0c8f4b52ba3dd41f39d8b4dd7ec2c1f7dc93336bc5cf1ed05c2c6e',
    'letter-e.mp3': 'dd33cc4fe5ea2abb7ceda4a3d523523515eda7beefecfbcd2fabc5f530b2fea9',
    'letter-f.mp3': 'e2bfe786468e3de44af2f29ee464fe34765ea74346f8902241b7f3d0c6d9129d',
    'letter-g.mp3': '7e0753ea35dfdfce106f9d38807e2f003ced4d891fef747202097877dab1a53b',
    'letter-h.mp3': '0bc5aca5396b5b8f8c287b5623bae1065e9fc49704d9fcc64b00e4cadc973184',
    'letter-i.mp3': '0ce11a66436d604954397d74b5a883918148390e9e636bda098c00b62d53a12e',
    'letter-j.mp3': '284e53ffe070cc0b02a63e4a799ac9cb9a7ff191808f2a7ba5344dc168842f26',
    'letter-k.mp3': '7fa2b6d9a0fad72134a77ffd57846102925a781aeb808ab80f3379b97dc4e2f1',
    'letter-l.mp3': 'aa3e66f2b409e999f72de6a13c17df1fc225b7c477898184fe60c832037f8b82',
    'letter-m.mp3': '7931ef2f0c85944496a33969907fbda3b0c2469aa322aa97e1ccf665c401596c',
    'letter-n.mp3': '378fe661bacb4bd14337669e9db47be56c3c48f2a1af20c53041b9a8883438b7',
    'letter-o.mp3': 'afa78d040cdd703d5ec06daabb04e7ead2e54b56d9593e99ec1a0a5c28ad2317',
    'letter-r.mp3': '5e568d941cf3612aad08c31231d3c4f18a24fd624c4a59f151a5e39dab60659b',
    'letter-s.mp3': '0f116682a829e7138881b78fd94ead327a8f9588c45496bbccb5cb2840818d8a',
    'letter-u.mp3': '71fda255557e1747bcfa040af6bb8d92c51b978fb4f41b60ca72a2d6a356decd',
    'letter-x.mp3': 'e82ce3012f4b3a57a9a78a1bd52c628129741877001dda4c2b24867d679cde95',
}
SOURCE = 'https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-huruf/huruf-abjad/'
MODEL_CARD = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/news_tts/medium/MODEL_CARD'


async def render_letters(model_dir=None):
    data = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./alphabet/words.js")))'], cwd=ROOT))
    key = hashlib.sha256(json.dumps([VERSION, VOICE, LENGTH_SCALE, PRESERVED, data['letterNames'], data['letterPronunciations']], ensure_ascii=False).encode()).hexdigest()
    manifest_path = FOLDER / 'letter-pronunciation.json'
    if manifest_path.exists():
        current = json.loads(manifest_path.read_text())
        if current.get('key') == key and len(current.get('clips', {})) == 26 and all((FOLDER / name).exists() and hashlib.sha256((FOLDER / name).read_bytes()).hexdigest() == clip.get('sha256') for name, clip in current['clips'].items()):
            print('Validated 26 Indonesian letter clips', flush=True)
            return
    import imageio_ffmpeg
    import numpy as np
    from piper import PiperVoice, SynthesisConfig
    model_dir = Path(model_dir) if model_dir else Path.home() / '.cache' / 'elven-letter-voice'
    model_path = model_dir / (MODEL + '.onnx')
    if not model_path.exists():
        subprocess.run(['python', '-m', 'piper.download_voices', MODEL, '--download-dir', str(model_dir)], check=True)
    voice = PiperVoice.load(str(model_path))
    if voice.config.espeak_voice != 'id':
        raise RuntimeError('An Indonesian phonemizer is required')
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    FOLDER.mkdir(parents=True, exist_ok=True)
    entries = {}
    with tempfile.TemporaryDirectory(prefix='elven-letter-build-') as temporary:
        temp = Path(temporary)
        for index, pronunciation in enumerate(data['letterPronunciations']):
            filename = 'letter-' + data['alphabet'][index].lower() + '.mp3'
            if filename in PRESERVED:
                raw = (FOLDER / filename).read_bytes()
                if hashlib.sha256(raw).hexdigest() != PRESERVED[filename]:
                    raise RuntimeError('Preserved recording changed: ' + filename)
                pcm = subprocess.check_output([ffmpeg, '-v', 'error', '-i', str(FOLDER / filename), '-f', 'f32le', '-ac', '1', '-ar', '22050', '-'])
                entries[filename] = {'letter': data['alphabet'][index], 'name': data['letterNames'][index], 'pronunciation': pronunciation, 'text': pronunciation + '.', 'voice': 'id-ID-GadisNeural', 'method': 'preserved recording', 'version': VERSION, 'duration': len(pcm) / 4 / 22050, 'sha256': PRESERVED[filename]}
                (temp / filename).write_bytes(raw)
                continue
            phonemes = voice.phonemize(pronunciation + '.')[0]
            if pronunciation in ['i', 'ki']:
                position = phonemes.index('i')
                phonemes.insert(position + 1, 'ː')
            audio = voice.phoneme_ids_to_audio(voice.phonemes_to_ids(phonemes), SynthesisConfig(length_scale=LENGTH_SCALE, noise_scale=.35, noise_w_scale=.4))
            if not np.isfinite(audio).all() or len(audio) < voice.config.sample_rate * .15 or np.max(np.abs(audio)) < 1e-5:
                raise RuntimeError('Empty or inaudible letter: ' + pronunciation)
            audio = audio / np.max(np.abs(audio)) * .8
            audio = np.concatenate([np.zeros(int(.12 * voice.config.sample_rate)), audio, np.zeros(int(.18 * voice.config.sample_rate))])
            filename = 'letter-' + data['alphabet'][index].lower() + '.mp3'
            wav_path = temp / (filename + '.wav')
            with wave.open(str(wav_path), 'wb') as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(voice.config.sample_rate)
                wav.writeframes((audio * 32767).astype('<i2').tobytes())
            output = temp / filename
            subprocess.run([ffmpeg, '-y', '-v', 'error', '-i', str(wav_path), '-codec:a', 'libmp3lame', '-b:a', '96k', str(output)], check=True)
            entries[filename] = {'letter': data['alphabet'][index], 'name': data['letterNames'][index], 'pronunciation': pronunciation, 'text': pronunciation + '.', 'phonemes': phonemes, 'voice': VOICE, 'version': VERSION, 'duration': len(audio) / voice.config.sample_rate, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}
        for filename in entries:
            (FOLDER / filename).write_bytes((temp / filename).read_bytes())
        manifest_path.write_text(json.dumps({'version': VERSION, 'key': key, 'voices': [VOICE, 'id-ID-GadisNeural'], 'locale': 'id-ID', 'lengthScale': LENGTH_SCALE, 'reference': SOURCE, 'modelCard': MODEL_CARD, 'method': 'Preserve existing correct recordings; synthesize replacement Indonesian letter phonemes with silence padding', 'clips': entries}, ensure_ascii=False, indent=2) + '\n')
        generic_path = FOLDER / 'indonesian-speech.json'
        generic = json.loads(generic_path.read_text())
        generic['clips'] = {filename: entry for filename, entry in generic['clips'].items() if not filename.startswith('letter-')}
        generic_path.write_text(json.dumps(generic, ensure_ascii=False, indent=2) + '\n')
    print('Generated and checked 26 Indonesian letter clips', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model-dir')
    args = parser.parse_args()
    asyncio.run(render_letters(args.model_dir))
