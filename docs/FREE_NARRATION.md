> Historical notes. The current status and no-external-service repair are documented in [FILIPINO_AUDIO_REPAIR.md](FILIPINO_AUDIO_REPAIR.md). No external narration generation is authorized or pending for this repair.

# Free narration preparation

The requested no-Azure path is prepared in `scripts/generate-free-audio.py`. It uses Microsoft Edge's online TTS at build time and saves MP3s in `public/audio`; the browser would play local files using the existing player. Requires the developer-only `edge-tts` Python package, no Azure account or API key. The Azure script remains optional for later.

Only the frozen 156-text snapshot is accepted. Text digests, voice IDs and audio digests are stored locally for safe resumption. Partial files are excluded, and the manifest is replaced only when every clip succeeds. No learner information, microphone recording, progress, or extra lesson text is included.

Coverage inspection confirmed all 258 lesson/dictionary narration references occur in the 156 distinct texts. Practice phrases are included too. No installed local Filipino voice was found on this computer.

## Offline engine evaluation — 2026-11-03

Tested the locally installed eSpeak-NG 1.52.0 with four lesson samples (`apple`, `The cat is little.`, `mansanas`, and `Ang pusa ay maliit.`). All rendered as valid mono 16-bit, 22.05 kHz WAV files. The English samples used the `en-us` voice. Filipino samples were also forced through `en-us`: eSpeak-NG's installed voice catalog has no `fil`/`tl` voice, so these do not establish accurate Filipino pronunciation and fail the bilingual-quality requirement. macOS `say` also exposes no Filipino voice.

License check: eSpeak-NG is GPL-3.0-or-later. GPL permits commercial distribution of the covered software subject to its copyleft and notice/source obligations; that alone does not verify commercial rights for generated narration. The offline Piper voice catalog was also checked and does not list Filipino; Piper itself is GPL-3.0-or-later and its documentation requires checking each voice model's license.

Decision: not acceptable for BasaBuddy audio. No 156-clip batch was generated and no online TTS was used. Re-evaluate only when a Filipino-capable local voice with verified commercial/output rights is available; then audition Filipino and English samples before generating the full set.

References:
- eSpeak-NG license: https://github.com/espeak-ng/espeak-ng/blob/master/COPYING
- Piper supported voice languages and per-model licensing note: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md

## Historical online-service review — not authorized for this request

An earlier request approved evaluating Edge TTS subject to terms review. This request instead requires offline generation and no online text uploads, so that earlier approval does not authorize Edge or Azure generation now. Generation has NOT run: no published Microsoft terms clearly granting permission to generate and bundle Edge Read Aloud output in this app were found. This is an unresolved permission question, not a claim that the use is definitively prohibited. The edge-tts library's software license does not establish service/output rights.

Sources reviewed:
- Microsoft Read Aloud documentation: https://support.microsoft.com/en-us/edge/use-immersive-reader-in-microsoft-edge
- Microsoft Services Agreement: https://www.microsoft.com/en-us/servicesagreement
- Related Microsoft-hosted Q&A (volunteer moderator, not a binding Microsoft license): https://learn.microsoft.com/en-us/answers/questions/6007729/commercial-use-of-microsoft-edge-text-to-speech-vi

No lesson texts were sent to an online service and no MP3s were generated. Offline playback of a full narration set has not been validated; merely placing files in `public/audio` does not guarantee offline browser reloads.

Do not run either online generation script for this request. A future local candidate must support Filipino and English, with its license and voice quality reviewed before integration.
