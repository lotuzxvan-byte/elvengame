import json
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from gtts import gTTS

root = Path(__file__).resolve().parents[1]
books = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./bible/books.js").books))'], cwd=root))
folder = root / 'bible' / 'audio'
folder.mkdir(parents=True, exist_ok=True)
clips = [(folder / f'{book["id"]}-{i+1}.mp3', title + '. ' + narration) for book in books for i, (title, narration) in enumerate(book['scenes'])]

def build(clip):
    target, text = clip
    if not target.exists():
        gTTS(text, lang='id').save(str(target))
    if target.stat().st_size < 1000:
        raise RuntimeError(str(target))

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(build, clips))
print(f'Generated {len(clips)} Indonesian story narration clips')
