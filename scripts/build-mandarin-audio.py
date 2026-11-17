import asyncio
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
VOICE = 'zh-CN-XiaoxiaoNeural'
RATE = '-10%'
VERSION = 'zh-words-1'

async def main():
    data = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./alphabet/mandarin.js")))'], cwd=ROOT))
    folder = ROOT / 'alphabet' / 'audio'
    mapping, clips = {}, {}
    for word in data['words']:
        for kind, text in [('word', word['word']), ('sentence', word['sentence'])]:
            filename = 'zh-' + kind + '-' + word['id'] + '.mp3'
            mapping[text] = filename
            clips[filename] = {'text': text}
    manifest_path = folder / 'mandarin-speech.json'
    previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    semaphore = asyncio.Semaphore(3)
    async def render(filename, entry):
        target = folder / filename
        old = previous.get('clips', {}).get(filename, {})
        if target.exists() and old.get('text') == entry['text'] and previous.get('voice') == VOICE and previous.get('rate') == RATE and hashlib.sha256(target.read_bytes()).hexdigest() == old.get('sha256'):
            entry['sha256'] = old['sha256']
            return
        async with semaphore:
            with tempfile.TemporaryDirectory() as temp:
                output = Path(temp) / filename
                for attempt in range(3):
                    try:
                        await edge_tts.Communicate(entry['text'], VOICE, rate=RATE).save(str(output))
                        if output.stat().st_size < 1000:
                            raise RuntimeError('Empty clip: ' + filename)
                        break
                    except Exception:
                        if attempt == 2:
                            raise
                        await asyncio.sleep(2 * (attempt + 1))
                target.write_bytes(output.read_bytes())
                entry['sha256'] = hashlib.sha256(target.read_bytes()).hexdigest()
    await asyncio.gather(*(render(filename, entry) for filename, entry in clips.items()))
    manifest_path.write_text(json.dumps({'locale': 'zh-CN', 'voice': VOICE, 'rate': RATE, 'version': VERSION, 'clips': clips}, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'alphabet' / 'mandarin-audio.js').write_text("'use strict';\nconst MandarinAudio=" + json.dumps(mapping, ensure_ascii=False) + ';\n')
    print('Validated 96 Mandarin word and sentence clips')

if __name__ == '__main__':
    asyncio.run(main())
