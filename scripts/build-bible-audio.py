import asyncio
import json
import subprocess
from pathlib import Path
from indonesian_speech import render_clips

root = Path(__file__).resolve().parents[1]
books = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./bible/episodes.js").books))'], cwd=root))
folder = root / 'bible' / 'audio'
folder.mkdir(parents=True, exist_ok=True)
clips = []
for book in books:
    for i, (title, narration, dialogue) in enumerate(book['scenes']):
        clips.append((f'{book["id"]}-{i+1}.mp3', title + '. ' + narration))
        for j, (speaker, line) in enumerate(dialogue):
            clips.append((f'{book["id"]}-{i+1}-d{j+1}.mp3', speaker + '. ' + line))

asyncio.run(render_clips(clips, folder))
