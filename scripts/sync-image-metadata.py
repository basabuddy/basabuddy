"""Synchronize intrinsic dimensions and content revisions; never edit artwork pixels."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

def synchronize(manifest):
    for asset in manifest.values():
        for entry in [asset, *asset.get('variants', [])]:
            path = ROOT / ('public' + entry['src'])
            data = path.read_bytes()
            with Image.open(path) as image:
                entry.update(width=image.width, height=image.height)
            entry.update(bytes=len(data), revision=hashlib.sha256(data).hexdigest()[:16])
    return manifest

if __name__ == '__main__':
    path = ROOT / 'src/data/assets.json'
    manifest = synchronize(json.loads(path.read_text()))
    path.write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Synchronized {len(manifest)} image records without modifying artwork.')
