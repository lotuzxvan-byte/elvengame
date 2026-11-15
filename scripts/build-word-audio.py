import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from gtts import gTTS

root = Path(__file__).resolve().parents[1]
data = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./alphabet/words.js")))'], cwd=root))
folder = root / 'alphabet' / 'audio'
folder.mkdir(parents=True, exist_ok=True)
mapping = {}
for index, name in enumerate(data['letterNames']):
    mapping[name] = f'letter-{data["alphabet"][index].lower()}.mp3'
for entry in data['words']:
    mapping[entry['word']] = f'word-{entry["word"]}.mp3'
    mapping[entry['sentence']] = f'sentence-{entry["word"]}.mp3'

def generate(item):
    text, filename = item
    target = folder / filename
    if not target.exists():
        gTTS(text, lang='id').save(str(target))
    if target.stat().st_size < 1000:
        raise RuntimeError(f'Invalid audio: {filename}')

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(generate, mapping.items()))
(root / 'alphabet' / 'audio-map.js').write_text("'use strict';\nconst WordAudio=" + json.dumps(mapping, ensure_ascii=False) + ';\n')
print(f'Generated {len(mapping)} Indonesian MP3 clips')
