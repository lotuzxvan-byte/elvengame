import asyncio
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

import edge_tts

from indonesian_speech import prepare_text

ROOT = Path(__file__).resolve().parents[1]
VOICE = 'id-ID-ArdiNeural'
RATE = '-12%'
VERSION = 'prayer-male-id-1'
FOLDER = ROOT / 'prayers' / 'audio'


async def main():
    voices = await edge_tts.list_voices()
    if not any(v['ShortName'] == VOICE and v['Gender'] == 'Male' and v['Locale'] == 'id-ID' for v in voices):
        raise RuntimeError('Requested Indonesian male voice is unavailable')
    clips = json.loads(subprocess.check_output(['node', '-e', 'global.CatholicPrayers=require("./prayers/data.js"); console.log(JSON.stringify(require("./prayers/audio-text.js").clips()))'], cwd=ROOT))
    FOLDER.mkdir(parents=True, exist_ok=True)
    manifest_path = FOLDER / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    entries = manifest.get('clips', {})
    semaphore = asyncio.Semaphore(3)

    async def build(clip):
        text = prepare_text(clip['text'])
        filename = clip['id'] + '.mp3'
        target = FOLDER / filename
        key = hashlib.sha256(json.dumps([VERSION, VOICE, RATE, text], ensure_ascii=False).encode()).hexdigest()
        entry = entries.get(filename, {})
        if entry.get('key') == key and target.exists() and target.stat().st_size > 1000 and hashlib.sha256(target.read_bytes()).hexdigest() == entry.get('sha256'):
            return
        async with semaphore:
            for attempt in range(3):
                with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temporary:
                    temp = Path(temporary.name)
                try:
                    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(temp))
                    if temp.stat().st_size < 1000:
                        raise RuntimeError('Incomplete audio: ' + filename)
                    target.write_bytes(temp.read_bytes())
                    entries[filename] = {'key': key, 'text': text, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
                    manifest_path.write_text(json.dumps({'version': VERSION, 'voice': VOICE, 'gender': 'Male', 'locale': 'id-ID', 'rate': RATE, 'clips': entries}, ensure_ascii=False, indent=2) + '\n')
                    print('Generated ' + filename, flush=True)
                    return
                except Exception:
                    if attempt == 2:
                        raise
                    await asyncio.sleep(2 ** attempt)
                finally:
                    temp.unlink(missing_ok=True)

    await asyncio.gather(*(build(clip) for clip in clips))
    print(f'Validated {len(clips)} clips: {VOICE}', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
