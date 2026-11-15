import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from gtts import gTTS

root = Path(__file__).resolve().parents[1]
data = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./alphabet/english.js")))'], cwd=root))
folder = root / 'alphabet' / 'audio'
mapping = {}
for index, name in enumerate(data['letterNames']):
    mapping[name] = f'en-letter-{data["alphabet"][index].lower()}.mp3'
for entry in data['words']:
    mapping[entry['word']] = f'en-word-{entry["word"]}.mp3'
    mapping[entry['sentence']] = f'en-sentence-{entry["word"]}.mp3'

def generate(item):
    text, filename = item
    target = folder / filename
    if not target.exists():
        gTTS(text, lang='en', tld='com').save(str(target))
    if target.stat().st_size < 1000:
        raise RuntimeError(filename)

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(generate, mapping.items()))
(root / 'alphabet' / 'english-audio.js').write_text("'use strict';\nconst EnglishAudio=" + json.dumps(mapping) + ';\n')
print(f'Generated {len(mapping)} English MP3 clips')
