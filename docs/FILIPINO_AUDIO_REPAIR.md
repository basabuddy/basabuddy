# Filipino audio repair — 2026-11-03

## Finding and actual status

Filipino narration is **not fully available** on this machine. `src/audio/manifest.json` contains empty Filipino and English maps, `public/audio/` contains no recordings, and the installed macOS speech inventory (`say -v '?'`) exposes no `fil`/`tl` voice. Therefore Filipino has neither of the two supported audio sources. The old generation scripts were preparation only; they never produced the promised narration set. No online generator was run during this repair.

The lesson-to-text bindings already pass the selected dictionary word, practice model, lesson model/passage, or question audio/answer into the player. The audit covers all those references. No lesson content or answers were changed. Missing clips are not a spelling/path mismatch: there are zero manifest entries or files to resolve.

Secondary issues: network-backed browser voices were eligible (incompatible with the no-upload requirement); Slow existed as an unused prop; text changes could retain stale availability messages; audio had no persistent offline cache; media errors did not distinguish browser blocking; and lesson steps with identical audio text could retain playback.

## Changes

- `src/audio/playback.ts`: permits only same-origin `/audio/` files; selects only voices reporting `localService: true`, with `fil`/`tl` aliases for Filipino and `en` for English. A remote or English voice is never used for Filipino.
- `src/components/Audio.tsx`: clearer missing-source/browser-block/file-failure messages; catches media startup errors; clears stale status; preserves pitch for slowed clips; retains gesture-triggered playback, late voice discovery, replay/Stop and one active audio owner. Diagnostic file paths stay in the console rather than the child's interface.
- `src/app/Practice.tsx`, `src/app/Lesson.tsx`, `src/styles.css`: normal and Slow controls share the exact same text and use existing button styling. Advance/finish explicitly stop audio, even if the next step has the same text. Existing shell cleanup still stops audio on route/language changes, page hide and backgrounding. Recorder functionality is retained.
- `scripts/audit-audio.mjs`, `package.json`: build-time local-path, file-existence and audio-header validation, plus narration coverage. No external calls. `npm run audit:audio -- --require-complete` intentionally fails until the full narration set exists.
- `scripts/build-offline.mjs`, `src/main.tsx`: production-only service worker precaches the static build and any bundled audio. Supports cached byte ranges for media playback. First successful online installation is required, along with HTTPS or localhost and browser storage. Development mode remains uncached. Cache eviction/private browsing may remove availability. No learner data or microphone recordings enter this cache.
- `src/audio/playback.test.ts`, `tests/audio.spec.ts`, `tests/offline-audio.spec.ts`: regression coverage for language selection, normal/slow, replay, errors, exclusivity, transitions, mute and offline transport.
- `docs/audio-recording-checklist.json`: exact authored text and suggested local filename for each missing recording (79 Filipino, 77 English).

## What is needed to finish Filipino narration

Supply native-speaker-reviewed recordings for the 79 Filipino entries in `audio-recording-checklist.json`. Put each MP3 (or supported WAV/OGG/M4A) in `public/audio/`; map the **exact** text under `fil` in `src/audio/manifest.json` to `/audio/<filename>`. The suggested filenames are deterministic but not mandatory. Keep syllable pauses and phoneme pronunciation deliberate; a TTS voice alone does not establish correct early-reading pronunciation. Punctuation-only answers also need an appropriate spoken interpretation reviewed by an educator. Do not substitute English output or test tones.

Alternatively, install an offline Filipino/Tagalog system voice that the target browser exposes as `fil-*`/`tl-*` with `localService: true`. Availability varies by device; installing a voice does not guarantee browser exposure. English remains supported through its matching local voice or bundled English files. Devices offering only network voices now require local recordings/voices to honor the no-upload constraint.

After importing recordings, run `npm run audit:audio -- --require-complete`, `npm run build`, and preview the production build. Let the service worker install online before testing airplane mode. For Filipino-only coverage, inspect the `fil` count; the strict complete check intentionally requires both languages.

## Validation and remaining device checks

Unit and browser tests cover exact Filipino `ma`, `mansanas`, and `Ang pusa ay maliit.` text/path selection at normal and slow rates, English regressions, missing sources, delayed voices, blocked media, retry, mute, switching language/steps, and prevention of overlap. Speech and lesson clips in these tests are instrumented mocks—not pronunciation evidence.

A separate browser test runs the actual generated production worker against a temporary one-second silent WAV. It verifies offline reload, real media decoding/playback and byte-range responses. This proves the caching mechanism, not the existence of Filipino recordings; **zero real narration clips are bundled**.

Still test on real iPhone/iPad Safari and Android Chrome: installed local voice exposure, audible output, volume/silent-mode behavior, microphone permission, interruptions/backgrounding, Slow pronunciation and pitch, replay, and cached recordings after airplane-mode reload. A Filipino educator must audition syllables, words, sentences and passages before claiming pronunciation quality.

Validation results: production build passes; 7 unit tests pass; the 19-test full browser run passes. The additional English-clip/language-switch test passes after correcting its test selector (20 distinct browser tests validated across full and focused runs). The strict narration-completeness audit correctly fails with 0/79 Filipino and 0/77 English recordings. This is an expected missing-content failure, not a successful narration release.


## Follow-up: actual browser inventory and exact failure point

An unmocked Chromium 156.0.8078.4 probe waited five seconds, subscribed to `voiceschanged`, and queried the live voice list repeatedly. It returned 180 voices, including 41 English entries and default local English `Samantha` (`en-US`), but **zero `fil`/`tl` entries**. The probe does not represent every browser or the user's phone. The raw result is in `audio-browser-probe.json`; repeat with `node scripts/probe-audio.mjs` while the local development server is running. No text is spoken or uploaded by this probe.

Exact trace: `AudioControls` passes the same authored text to normal and Slow `AudioButton`s. `AudioButton.play()` calls `bundledClip(text, lang)` first. The empty manifest returns `undefined`. For English, `findVoice(readVoices(synth), 'en')` can select local Samantha. For Filipino, the same selection flow finds no `fil`/`tl` voice, so `if (!source && !voice)` reports the missing source and returns before `Audio.play()` or `speechSynthesis.speak()`. Slowing the rate, changing `lang` alone, or copying the English control cannot create a Filipino voice.

Additional code changes: `readVoices()` safely handles an unready/throwing provider; bundled recordings bypass voice lookup entirely. A bounded 10-second polling fallback supplements `voiceschanged`, with cleanup on unmount. It announces readiness and still requires a fresh tap, preserving mobile gesture requirements. No design or curriculum changes were made in this follow-up.

Smallest practical next step: supply three native-speaker-reviewed local recordings for **ma**, **mansanas**, and **Ang pusa ay maliit.**, then map them under `fil` using the exact paths/text in `audio-recording-checklist.json`. These allow real syllable/word/sentence verification of both Listen and Slow. They cover only those examples; complete coverage still requires the 79 Filipino entries. A genuinely installed Filipino/Tagalog local voice exposed by the browser is an alternative, but none is available here.

**Actual Filipino narration has not been audibly verified and is not reported fixed.** Automated player tests prove control behavior only. Physical-speaker/device and native-speaker pronunciation review remain required once a real audio source is supplied.
