import asyncio
import json
import subprocess
from pathlib import Path
from indonesian_speech import letter_text, render_clips

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

clips = [(filename, letter_text(text) if filename.startswith('letter-') else text) for text, filename in mapping.items()]
asyncio.run(render_clips(clips, folder))
