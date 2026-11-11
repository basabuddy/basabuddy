# Raina Filipino playback trial

Source: user-supplied BasaBuddy_Filipino_Audio_Samples.zip. Voice identified as Raina by the user; pronunciation awaits user review. WAV bytes preserved unchanged. No Azure generation or credentials used.

| ZIP file | Exact Filipino text | Bundled path | Duration |
|---|---|---|---|
| fil-ma.wav | ma | /audio/fil-3c44c3e1b8b78447.wav | 1.88 s |
| fil-mansanas.wav | mansanas | /audio/fil-df06659ca0aea0ca.wav | 1.88 s |
| fil-sentence-pusa.wav | Ang pusa ay maliit. | /audio/fil-ffe24cde85367f86.wav | 3.28 s |

All are 24 kHz, stereo, 16-bit PCM. Manifest uses exact text keys under `fil`, with the existing SHA-256 text naming scheme and WAV extension. English manifest and playback implementation are unchanged; English requires an installed local English speech voice. No English WAVs are supplied.

## Listening

Open http://localhost:4173, select Student, create/select a learner, and choose Filipino. This is the production preview, separate from port 5173.

- ma: /learn/fil/L01 — Munting tagapakinig; click Simulan ang aralin to reach Mga tunog. If already finished, use Magsanay muli first.
- mansanas: /student/practice/repeat — Listen and Repeat practice.
- Ang pusa ay maliit.: /student/practice/aloud — Read Aloud practice.

On each screen, use Pakinggan (normal speed) and Dahan-dahan (0.75×, pitch preserved). Ihinto stops playback. Make sure sound is unmuted.

Load the production preview online once and allow its service worker to finish caching; then disconnect Wi-Fi and reload these routes. Keep the preview server running. Only the three supplied phrases have bundled Filipino WAVs.

## Verification

- Python wave decoded all three source files.
- npm run build: passed, three audio files in production precache.
- npm test: seven passed.
- npx playwright test tests/audio.spec.ts tests/offline-audio.spec.ts: thirteen passed.
- node scripts/test-raina-offline.mjs: real Chromium media playback test against production, after service-worker activation and browser network disabled. Checks all three clips at both speeds, progress, completion, exact file, duration and pitch preservation. English normal/slow routing uses an explicitly mocked local voice; it does not certify audible English synthesis on a particular Mac.

Automated decoding/playback checks do not approve pronunciation.
