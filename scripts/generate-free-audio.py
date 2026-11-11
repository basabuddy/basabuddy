"""Generate the fixed narration snapshot using free Microsoft Edge TTS.
No Azure credentials. Build-time only; no learner data or runtime service calls.
Requires edge-tts. Azure integration remains in generate-audio.py.
"""
import asyncio
import hashlib
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
APPROVED_SHA256 = 'de291fbc1f9b13fae4201006e64c2b3d89238736a8ce6c9d78ca33304f7e5e30'
VOICES = {'fil': 'fil-PH-BlessicaNeural', 'en': 'en-US-JennyNeural'}

def digest(data):
    return hashlib.sha256(data).hexdigest()

async def main():
    raw = (ROOT / 'scripts/audio-texts.json').read_bytes()
    if digest(raw) != APPROVED_SHA256:
        raise SystemExit('Narration list changed; review and obtain approval before sending additional text.')
    texts = json.loads(raw)
    output = ROOT / 'public/audio'
    output.mkdir(exist_ok=True)
    metadata_path = ROOT / 'scripts/free-audio-generated.json'
    metadata = json.loads(metadata_path.read_text()) if metadata_path.exists() else {}
    manifest = {'fil': {}, 'en': {}}
    semaphore = asyncio.Semaphore(3)
    async def generate(lang, text):
        filename = lang + '-' + digest(text.encode())[:16] + '.mp3'
        path = output / filename
        async with semaphore:
            identity = {'voice': VOICES[lang], 'text_sha256': digest(text.encode()), 'rate': '-15%', 'provider': 'Microsoft Edge TTS'}
            prior = metadata.get(filename, {})
            reusable = path.exists() and path.stat().st_size > 500 and all(prior.get(k) == v for k,v in identity.items()) and prior.get('audio_sha256') == digest(path.read_bytes())
            if not reusable:
                for attempt in range(3):
                    try:
                        temporary = path.with_suffix('.partial.mp3')
                        await asyncio.wait_for(edge_tts.Communicate(text, VOICES[lang], rate='-15%').save(str(temporary)), timeout=40)
                        data = temporary.read_bytes()
                        if len(data) < 500 or not (data.startswith(b'ID3') or (data[0] == 255 and data[1] & 224 == 224)):
                            raise ValueError('Invalid MP3')
                        temporary.replace(path)
                        metadata[filename] = {**identity, 'audio_sha256': digest(data)}
                        metadata_path.write_text(json.dumps(metadata, indent=2)+'\n')
                        break
                    except Exception as error:
                        if attempt == 2:
                            raise RuntimeError(f'Generation failed for {filename}: {type(error).__name__}') from None
                        await asyncio.sleep(2 ** (attempt + 1))
            manifest[lang][text] = '/audio/' + filename
            print(f'{sum(map(len,manifest.values()))}/156 clips ready', flush=True)
    await asyncio.gather(*(generate(lang,text) for lang,entries in texts.items() for text in entries))
    path = ROOT / 'src/audio/manifest.json'
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    temporary.replace(path)
    print('All 156 clips linked locally.', flush=True)

asyncio.run(main())
