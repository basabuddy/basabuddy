# Child-friendly refresh — 2026-11-03

## Inspection
React 19 / TypeScript / Vite; existing bilingual onboarding, learner home, worlds, 36 lessons, practice, dictionary, stories, journey, daily quest, settings and adult tools preserved. Read README, handoff README, implementation notes and existing audio repair notes. No AGENTS.md was found in the project or containing instruction directories.

Audio uses browser speech synthesis with delayed voice discovery, locale matching and optional bundled clips. The manifest contains no clips and public has no narration files. Existing narration already had ownership and start-timeout handling, but recorder playback was independent, there was no global mute, and background playback could continue. Full-volume speech was unnecessarily loud.

## Changes
- `src/audio/preferences.ts`: persistent mute with a session fallback when storage is unavailable.
- `src/audio/playback.ts`: shared stop function.
- `src/components/Audio.tsx`: narration/recording/replay ownership, 65% playback volume, explicit mute/unmute, safe media cleanup, completion watchdog, permission-return cleanup when hidden, full-size story Listen control. Unmuting never starts audio. No background music or surprise effects added.
- `src/App.tsx`: persistent sound bar; stop on route/language change, page hide and tab hiding.
- `src/components/UI.tsx`: generated asset mapping and descriptive default alternative text; empty alt remains available for decorative uses.
- `src/styles.css`: cream/sage/blue palette, darker text and primary buttons, larger labels and controls, uncropped illustrations. Keyboard focus and reduced-motion rules preserved.
- `src/app/Student.tsx`: child-facing dictionary empty-state copy.
- Nine original generated illustrations: `public/assets/{owl,apple,bird,rabbit,turtle,penguin,cat,dog,story}-storybook.webp`. Built-in imagegen; prompts in IMAGE_PROMPTS.md. Full-resolution WebP conversion, no real child photographs. Replaced tiny 196–200px animal crops, pixelated mascot and story crop with baked-in speaker icon; original assets retained. The cat and dog now match the vocabulary set; other supplied artwork remains in use.

## Verification
- `npm test`: 6 existing tests passed.
- `npm run test:e2e`: 12 existing tests passed, including all 36 lessons, audio API regressions, adult gates, progress persistence and widths 320/393/430/1440.
- `npm run build`: passed after final asset integration.
- One-off browser smoke check (no new test file): mute stops speech, persists after refresh, unmute does not play, speech volume is 0.65, tab hiding stops speech.
- Synthetic-microphone smoke check: recording, blob playback and mute stop passed; no real microphone accessed.
- Reviewed generated images and refreshed home screenshot. Final browser asset-load check and dictionary/story previews performed after integration.

## Limits and preview
No recorded English/Filipino narration or phoneme library was supplied. Installed matching voices remain the fallback; an absent Filipino voice cannot be replaced correctly with English or a generic sound effect. Ask an adult/read the text when unavailable. A reviewed, licensed Filipino/English recording bank is still needed for consistent pronunciation across devices. No third-party audio service was invoked.

Browser media uses normal system output; there is no device-volume override. Browser/OS behavior for hardware silent switches, actual speaker comfort, microphone success, and Filipino pronunciation requires physical-device checks. Automated speech tests use mocks, not audible pronunciation validation.

Run `npm run dev` and open the printed local URL. The review server was started at http://127.0.0.1:5174/. This refresh supersedes the older visual mapping description in IMPLEMENTATION_NOTES.md. The earlier AUDIO_FIX.md approval note is historical; no approval question is pending from this refresh.

## Identity restoration — 2026-11-03

At the user's request, restored the supplied original blue owl (`public/assets/owl.webp`) throughout the app, the bright blue/gold wordmark, navy headings, pale-blue surfaces and blue progress/navigation accents. Primary action blue remains slightly darker for readable white labels. Kept the sound fixes, larger controls, focus/reduced-motion support, uncropped artwork and clearer vocabulary/story illustrations. The generated owl remains on disk but is no longer used. Changes: `src/components/UI.tsx`, `src/styles.css`. The newly attached ZIP contains Woni housing-app boards and was not used as BasaBuddy branding.
