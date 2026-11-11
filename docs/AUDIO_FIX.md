> Historical notes. The current status and no-external-service repair are documented in [FILIPINO_AUDIO_REPAIR.md](FILIPINO_AUDIO_REPAIR.md). No external narration generation is authorized or pending for this repair.

# Audio repair — 2026-11-03

The original player synchronously required an installed language-matching voice. An empty initial `getVoices()` result was treated as permanent failure. The local macOS voice inventory also has no Filipino/Tagalog voice.

Implemented:
- Subscribe to `voiceschanged`; when a matching voice arrives, offer a fresh user-gesture retry (important for mobile playback restrictions).
- Normalize locale separators and accept `fil` and `tl` language aliases.
- Keep the utterance alive, explicitly set volume, resume paused synthesis, and report playback failures/timeouts.
- Add Stop, retry, and a single playback owner. Unrelated controls no longer cancel each other on unmount.
- Provide a bundled-clip player and generation scripts as a prepared integration. The current manifest is empty: no external narration was generated.

Validation: production build and six unit tests passed. Three browser audio regression tests passed. They use an instrumented speech API to verify delayed voice discovery, locale selection, errors, retry, Stop, and navigation cleanup. These are API behavior tests, not physical speaker or pronunciation verification.

Remaining limitation: a browser without Filipino speech cannot narrate Filipino until suitable audio or a matching system voice is available. The English voice is never substituted silently for Filipino.

Bundled narration generation was blocked by automatic approval review because sending fixed lesson text to Microsoft's Edge TTS service had not been explicitly approved. A user approval question is pending. Only static authored lesson text would be sent; learner profiles, progress and recordings are excluded. The app would play local MP3s afterward without a runtime speech-service dependency.

Optional generation after explicit approval: `node scripts/generate-audio.mjs`, then run `scripts/generate-audio.py` in a Python environment with edge-tts. Generated speech remains draft and requires educational review.

Browser API reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices

## Azure-only authorization update

The user explicitly approved the fixed 156-text snapshot for Azure Speech. The generator now uses the official Azure REST endpoint, not Edge TTS. See `AZURE_NARRATION.md`. No credentials are configured yet; no clips have been generated. This supersedes the earlier pending-approval and Edge generation instructions.
