# Filipino offline audio coverage — 2026-11-04

**79 unique playable Filipino texts across 134 playback locations: 3 covered, 76 missing.** Normal and Slow reuse the same file, so a separate slow recording is not required. Full passages count as one clip when the UI passes the whole passage to the player.

## Existing recordings

| Exact text | Bundled recording | Supplied ZIP member | Duration |
|---|---|---|---|
| ma | /audio/fil-3c44c3e1b8b78447.wav | fil-ma.wav | 1.88 s |
| mansanas | /audio/fil-df06659ca0aea0ca.wav | fil-mansanas.wav | 1.88 s |
| Ang pusa ay maliit. | /audio/fil-ffe24cde85367f86.wav | fil-sentence-pusa.wav | 3.28 s |

All three are valid 24 kHz, stereo, 16-bit PCM WAVs and match the corresponding members of the supplied BasaBuddy_Filipino_Audio_Samples.zip byte-for-byte by SHA-256. They retain their exact Filipino text mappings. No incorrect live mappings or additional matching recordings were found, so no manifest or recording changes were necessary. The workspace audio search and audio-member inspection of BasaBuddy ZIPs in Downloads found only these three recordings; the bilingual voice kit contains a generator, not additional recorded samples.

The **old checklist was stale**: it listed nonexistent MP3 paths and marked all three working WAV samples as absent. The regenerated checklist now records the correct WAV paths, validates actual files rather than relying on manifest membership, and provides exact locations for every repeated use.

## Deliverables

- [Readable exact-text checklist](FILIPINO_RECORDING_CHECKLIST.md): all 79 texts, covered/missing status, lesson titles, question numbers and practice routes.
- [Machine-readable checklist](audio-recording-checklist.json): exact text and language, path, validated file details, route, source component, stage, question prompt, buttons and pronunciation-review state.
- `node scripts/audit-audio.mjs --write-checklist` rebuilds both checklists locally without speech generation or network requests.

All syllable/word/sentence/passage controls, seven dictionary items, all seven practice types, daily-quest destinations, all 18 Filipino lesson practice screens, assessment prompts, and incorrect-answer feedback controls were traced. Non-speaking choice/tile text is excluded except when exposed through the feedback Listen button. Normal/Slow duplicates and repeated identical text are deduplicated. Segmented `ba ta` is not merged with an ordinary word, and case/punctuation are preserved for exact lookup.

## Verification and limits

- Python wave validation read the complete PCM data in every existing WAV.
- Runtime UI coverage test traversed the Filipino controls and confirmed that the set of emitted text equals the 79 checklist entries. This test uses media/speech fixtures to inspect exact text and routing; it is not a pronunciation assessment.
- 14 browser audio tests passed, including the new coverage test and existing English/offline regression tests.
- Seven unit tests and the production build passed. All three recordings remain included in the offline cache.
- English playback, audio-player behavior and the manifest are unchanged. English retains its existing local browser-voice fallback.

**No audio was generated.** The remaining 76 texts cannot have guaranteed bundled offline playback until matching recordings are supplied. Existing local Filipino/Tagalog browser voices may work on some devices but do not count as bundled coverage. Await the user's pronunciation review of the three Raina samples before generating anything else.
