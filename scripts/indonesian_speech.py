import asyncio
import hashlib
import json
import re
import shutil
import tempfile
import unicodedata
from pathlib import Path

import edge_tts

VOICE = 'id-ID-GadisNeural'
RATE = '-8%'
VERSION = 'id-neural-1'
def prepare_text(text):
    text = unicodedata.normalize('NFC', text)
    text = re.sub(r'([A-Za-z]+)-(Nya|Ku|Mu)\b', lambda match: match[1] + match[2].lower(), text)
    text = text.replace('…', '. ').replace('—', ', ').replace('–', ', ')
    text = re.sub(r'\s+', ' ', text).strip()
    return text if text.endswith(('.', '!', '?')) else text + '.'


def speech_key(text):
    return hashlib.sha256(json.dumps([VERSION, VOICE, RATE, text], ensure_ascii=False).encode()).hexdigest()


async def render_clips(clips, folder):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    manifest_path = folder / 'indonesian-speech.json'
    try:
        manifest = json.loads(manifest_path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        manifest = {}
    entries = manifest.get('clips', {})
    semaphore = asyncio.Semaphore(4)
    finished = 0

    async def build(filename, text):
        nonlocal finished
        text = prepare_text(text)
        target = folder / filename
        key = speech_key(text)
        entry = entries.get(filename, {})
        if entry.get('key') == key and target.exists() and target.stat().st_size > 1000 and hashlib.sha256(target.read_bytes()).hexdigest() == entry.get('sha256'):
            return
        async with semaphore:
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as intermediate:
                temp = Path(intermediate.name)
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(temp))
                    if temp.stat().st_size < 1000:
                        raise RuntimeError(f'Invalid audio: {filename}')
                    shutil.move(str(temp), str(target))
                    entries[filename] = {'key': key, 'text': text, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
                    manifest_path.write_text(json.dumps({'version': VERSION, 'voice': VOICE, 'locale': 'id-ID', 'rate': RATE, 'clips': entries}, ensure_ascii=False, indent=2) + '\n')
                    finished += 1
                    if finished % 20 == 0:
                        print(f'Rebuilt {finished} Indonesian clips', flush=True)
                    return
                except Exception:
                    temp.unlink(missing_ok=True)
                    if attempt == 2:
                        raise
                    await asyncio.sleep(2 ** attempt)

    await asyncio.gather(*(build(filename, text) for filename, text in clips))
    print(f'Validated {len(clips)} clips; rebuilt {finished} with {VOICE}', flush=True)
