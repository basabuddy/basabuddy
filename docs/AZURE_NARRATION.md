# Azure narration generation

The user approved sending the exact 156 fixed narration texts to Azure Speech solely to create local MP3s. No learner profiles, progress, recordings, or other project files are included. The generator checks the SHA-256 of `scripts/audio-texts.json` before making any request. The approved text snapshot remains draft educational content; authorization to synthesize it is not pronunciation or curriculum validation.

## Setup

Use the key and region from your Azure Speech resource's **Keys and Endpoint** page. Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in the process environment. Do not use `VITE_` prefixes, commit secrets, or paste keys into chat. `.env*` files are ignored by Git; the Python generator intentionally reads environment variables only, not dotenv files.

Run from a terminal that has those variables configured:

```sh
python3 scripts/generate-audio.py --dry-run
python3 scripts/generate-audio.py
```

No extra Python package is needed. Azure usage charges may apply. Authentication uses a key header over HTTPS to the regional Azure endpoint; redirects are refused. The tool does not print credentials or service response bodies.

## Output and verification

- 79 Filipino phrases: `fil-PH-BlessicaNeural`.
- 77 English phrases: `en-US-JennyNeural`.
- Moderately slower speech (-15%); existing app playback remains at 65% volume.
- Files: `public/audio/<language>-<text-hash>.mp3`.
- Local provenance/integrity: `scripts/audio-generated.json`.
- `src/audio/manifest.json` is replaced only after every file succeeds.
- Completed clips can be reused only when their provenance and file digest match. Partial files are never published.
- The existing app prefers bundled clips; installed device voices remain a fallback for text outside the manifest. No Azure key or runtime service call is added to the browser.

After generation, check all 156 files decode, cover every narration string, play without browser voices, stop/mute properly, and survive navigation. Listen to samples from both languages and review every isolated letter, syllable, joined sound and story with a fluent reading teacher. TTS may pronounce letters as names rather than phonemes; file matching alone does not validate pronunciation. Do not claim audio quality is reviewed before listening.

## Current status

The approved snapshot passed a network-free dry run. No Azure credentials were present, so no lesson text was transmitted and no MP3s were generated. The app's missing-Filipino-voice issue is not yet resolved. Awaiting Azure credentials before generation and playback/pronunciation validation.

Reference: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech
