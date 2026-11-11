# BasaBuddy

A local, mobile-first Filipino–English reading MVP built with React, TypeScript, Vite and Tailwind CSS. Original generated storybook artwork and retained illustration regions from the supplied Figma exports are used as assets; screens, controls, text, feedback and navigation are editable React components.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:5173. Start → Student → create a nickname → choose Filipino or English. Teacher entry uses a separate local teacher PIN. The first teacher visit creates the PIN; later visits require it. This is a device-local gate, **not production authentication**.

```sh
npm run build
npm run preview
npm test
npx playwright install chromium
npm run test:e2e
```

## Implemented

- Onboarding, role choice, learner profiles, language choice, home, six learning worlds and 18 sequential levels per language.
- 180 independently identified draft assessment items (five per level per language), guided practice, answer feedback, results, 4/5 mastery, next-level unlock, replay, persistent best scores and rewards.
- Syllable/phoneme tile practice, word reading, Listen and Repeat, optional record/replay, Read Aloud, picture dictionary, Find the Word, Sentence Builder, Story Reading and comprehension checks.
- Daily three-step reading quest; per-learner, per-language, per-local-date completion; reading journey and earned world milestones.
- localStorage repository with versioned data, save-error and corrupt-data recovery, persisted lesson step, selected answer, submitted answers and result. Refresh resumes the exact saved step. Every selection is saved, so leaving does not discard an answer.
- Separate Student and Teacher roles. Student onboarding can create additional local readers. Teacher: local learner overview, actual reports, assign/remove reading work. Assignment cards appear on the learner home screen and do not bypass prerequisites.
- Browser speech synthesis with locale checking and readable fallback; optional microphone recording with permission errors, 30-second limit, playback and cleanup. Recordings are only in tab memory and are never uploaded.
- Responsive layouts, keyboard focus styling, labeled controls, reduced motion, empty/loading/success/error/locked/offline states.

## Important MVP boundaries

The supplied curriculum JSON is explicitly an **outline**, not a reviewed content/audio library. All authored questions in `src/content/lessons.ts` are marked `draft`; do not describe this build as a reviewed school curriculum. A Filipino/English reading teacher must review each item, syllabification, difficulty, phoneme model, distractor and assessment before a child-facing production launch. The 4/5 threshold comes from the handoff and is provisional.

No prerecorded narration was supplied. Browser TTS is a functional fallback, not a validated phonics model. Some devices have no Filipino voice. In that case the app offers reading/adult support instead of using an incorrect-language voice. Single-letter TTS can say letter names rather than phonemes; recorded sound models are still required for production. Microphone input is never automatically graded.

Cloud authentication, verified teacher rosters and multi-device sync are **not implemented**. The teacher PIN is a device-local gate and does not protect data from browser developer tools. Do not use this MVP for real school records.

The production service worker caches the static build, including bundled audio, after a successful online installation. Cached routes can reload offline; a first-ever visit still needs a connection. Selectable offline packs and cloud synchronization are not implemented. Browser storage can be cleared or evicted. Export learner data before clearing it. Imports/backups restoration and PIN recovery are not implemented.

The dictionary has the six animal images and apple supplied in the exports. The Things category has an explicit empty state rather than invented illustrations. Reward badges are calculated from mastery and cannot be farmed by retrying completed lessons.

## Netlify

`netlify.toml` contains the build (`npm run build`), publish directory (`dist`), Node.js 22.12.0 runtime and SPA route fallback. To publish, create a Netlify site connected to this repository; Netlify will use this configuration automatically. No secrets or app-specific environment variables are required for this local MVP. This task did not publish a live website.

## Structure

- `src/app/` — Student and Teacher screens, learning flow and state provider
- `src/components/` — shared design, audio and recorder components
- `src/content/lessons.ts` — bilingual draft question bank, titles, dictionary, validation
- `src/data/BasaBuddy_18_Level_Curriculum.json` — original supplied 18-level outline
- `src/data/repository.ts` — persistence adapter boundary
- `src/domain/model.ts` — scoring, attempts and unlocking
- `public/assets/` — original illustration crops, no screenshot screens
- `reference/` — untouched extracted handoff and all nine supplied PNG boards
- `tests/` — Playwright flows and screenshots
- `docs/IMPLEMENTATION_NOTES.md` — design decisions and scope assumptions
- `docs/VALIDATION.md` — executed checks and outstanding verification

The repository keeps progress keys as `studentId:language:levelId`. Preserve best-score monotonicity and atomic mastery/attempt updates. No backend or remote data service is connected. Existing local PINs migrate to the teacher-only gate without resetting learner records.

## Child-friendly refresh

See `docs/CHILD_FRIENDLY_REFRESH.md` for the sound controls, visual refresh, verification and remaining voice limitations, and `docs/IMAGE_PROMPTS.md` for generated asset provenance and prompts.


## Phase 2 dashboard and games

The student home uses the original layout and four localized bottom tabs: Home, Learn, Stories and Journey. Additional activity routes remain implemented. Word Builder, Syllable Puzzle and Picture & Word Match each have three Filipino difficulty levels, saved sessions and one-time level rewards. New game sessions, completion history and awards are additive to the existing version-1 local store; legacy lesson data is preserved. Teacher learner exports include the new game history and awards.

Premium previews are informational. No browser flag grants a subscription, and no checkout or payment verification is implemented. See `docs/PHASE2_COMPLETION.md` for changed files, verification and remaining work.


## Current roles and storage

Only Student and Teacher are selectable. Teacher entry remains `/adult/teacher`; the local PIN must be entered again after leaving. Student profiles, lessons, rewards and assignments retain the existing `basabuddy:v1` localStorage record. Sound settings remain in localStorage. No IndexedDB migration is included in this task, as explicitly selected by the user. See `docs/TWO_ROLE_UPDATE.md` for verification and the removal report.


## Complete picture dictionary

`/student/dictionary` retains the existing cartoon cards and contains 25 animals, 25 foods and 40 things, with 90 matching local WebP illustrations and bilingual sentences. It supports bilingual search, favorites, detail navigation, flashcards and gentle word practice. The existing teacher area includes vocabulary review collections and printable cards/worksheets. Dictionary history is additive to each learner's existing local progress.

Pronunciation reuses bundled clips and language-matching local browser voices; All 90 Filipino dictionary words have bundled recordings; 84 English words still use a matching local voice. The 81 added Filipino clips use Microsoft Blessica synthetic narration and await fluent-speaker pronunciation review. Missing voices are reported visibly; English is never substituted for Filipino. See `docs/DICTIONARY_IMPLEMENTATION.md` and `docs/DICTIONARY_ASSET_AUDIO_REPORT.json` for verification, prompts, assets and audio gaps.
