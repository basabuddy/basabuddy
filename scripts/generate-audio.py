"""Generate only the approved fixed narration list using Azure Speech REST.
Credentials: AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (environment only).
No third-party Python dependencies. --dry-run performs no network requests.
"""
import argparse
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, HTTPRedirectHandler, build_opener
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
APPROVED_SHA256 = 'de291fbc1f9b13fae4201006e64c2b3d89238736a8ce6c9d78ca33304f7e5e30'
VOICES = {'fil': ('fil-PH', 'fil-PH-BlessicaNeural'), 'en': ('en-US', 'en-US-JennyNeural')}
FORMAT = 'audio-24khz-48kbitrate-mono-mp3'

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Never forward credentials/text to another destination.

def digest(data):
    return hashlib.sha256(data).hexdigest()

def atomic_json(path, data):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    raw = (ROOT / 'scripts/audio-texts.json').read_bytes()
    if digest(raw) != APPROVED_SHA256:
        sys.exit('Text list differs from the approved snapshot. Review and obtain approval before sending new text.')
    texts = json.loads(raw)
    if set(texts) != {'fil', 'en'} or [len(texts[k]) for k in ('fil', 'en')] != [79, 77]:
        sys.exit('Unexpected narration list.')
    if any(not isinstance(t, str) or not t.strip() for entries in texts.values() for t in entries):
        sys.exit('Invalid narration text.')
    print('Approved snapshot: 79 Filipino + 77 English phrases; no learner data.', flush=True)
    if args.dry_run:
        print('Dry run passed. No network requests or audio files created.')
        return
    key = os.environ.get('AZURE_SPEECH_KEY', '').strip()
    region = os.environ.get('AZURE_SPEECH_REGION', '').strip()
    if not key or not region:
        sys.exit('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION securely in your environment. Do not paste secrets into chat.')
    if not re.fullmatch(r'[a-z][a-z0-9-]{1,39}', region):
        sys.exit('Invalid Azure region identifier.')
    endpoint = f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1'
    output = ROOT / 'public/audio'
    output.mkdir(exist_ok=True)
    metadata_path = ROOT / 'scripts/audio-generated.json'
    metadata = json.loads(metadata_path.read_text()) if metadata_path.exists() else {}
    manifest = {'fil': {}, 'en': {}}
    opener = build_opener(NoRedirect())
    count = 0
    for lang, entries in texts.items():
        locale, voice = VOICES[lang]
        for text in entries:
            filename = lang + '-' + digest(text.encode())[:16] + '.mp3'
            path = output / filename
            identity = {'text_sha256': digest(text.encode()), 'voice': voice, 'format': FORMAT, 'rate': '-15%', 'provider': 'Azure Speech'}
            previous = metadata.get(filename, {})
            reusable = path.exists() and path.stat().st_size > 500 and all(previous.get(k) == v for k, v in identity.items()) and previous.get('audio_sha256') == digest(path.read_bytes())
            if not reusable:
                ssml = f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{locale}"><voice name="{voice}"><prosody rate="-15%">{escape(text)}</prosody></voice></speak>'
                request = Request(endpoint, data=ssml.encode(), headers={
                    'Ocp-Apim-Subscription-Key': key,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': FORMAT,
                }, method='POST')
                for attempt in range(3):
                    try:
                        with opener.open(request, timeout=45) as response:
                            data = response.read()
                        if len(data) < 500 or not (data.startswith(b'ID3') or (data[0] == 255 and data[1] & 224 == 224)):
                            sys.exit(f'Invalid MP3 received for {filename}; manifest unchanged.')
                        temporary = path.with_suffix('.partial.mp3')
                        temporary.write_bytes(data)
                        temporary.replace(path)
                        metadata[filename] = {**identity, 'audio_sha256': digest(data)}
                        atomic_json(metadata_path, metadata)
                        break
                    except HTTPError as error:
                        if error.code in (429, 500, 502, 503, 504) and attempt < 2:
                            time.sleep(2 ** (attempt + 1))
                            continue
                        sys.exit(f'Azure returned HTTP {error.code} for {filename}. Check resource access/quota. Credentials and response body withheld.')
                    except (URLError, TimeoutError):
                        # Unknown outcome: do not retry and potentially charge twice.
                        sys.exit(f'Network failure for {filename}. Earlier files are saved. No automatic retry after an unknown outcome.')
            manifest[lang][text] = '/audio/' + filename
            count += 1
            print(f'{count}/156 ready ({lang})', flush=True)
    atomic_json(ROOT / 'src/audio/manifest.json', manifest)
    print('156 local MP3s linked. Run browser decoding/playback checks and pronunciation review before release.')

if __name__ == '__main__':
    main()
