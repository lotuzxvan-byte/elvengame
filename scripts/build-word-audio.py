import asyncio
import json
import subprocess
from pathlib import Path
from indonesian_speech import render_clips
import importlib.util

root = Path(__file__).resolve().parents[1]
data = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./alphabet/words.js")))'], cwd=root))
folder = root / 'alphabet' / 'audio'
folder.mkdir(parents=True, exist_ok=True)
mapping = {}
for entry in data['words']:
    mapping[entry['word']] = f'word-{entry["word"]}.mp3'
    mapping[entry['sentence']] = f'sentence-{entry["word"]}.mp3'

clips = [(filename, text) for text, filename in mapping.items()]
asyncio.run(render_clips(clips, folder))
spec = importlib.util.spec_from_file_location('letter_audio', root / 'scripts' / 'build-letter-audio.py')
letters = importlib.util.module_from_spec(spec)
spec.loader.exec_module(letters)
asyncio.run(letters.render_letters())
