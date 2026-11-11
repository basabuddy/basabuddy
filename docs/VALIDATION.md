# Validation — 2026-11-02

## Executed

- `npm run build`: TypeScript and Vite production build passed. Output: `dist/`.
- `npm test`: 4 domain tests passed. Validates 180 stable question IDs, 18 levels in each language, sequential locks, 4/5 threshold, lower-score retry preservation, learner/language isolation, incomplete-assessment rejection and word order grading.
- `npm run test:e2e`: 9 Chromium browser tests passed (34.4 seconds in the final full run).
- Development server started successfully at http://localhost:5173.

Browser tests cover:
1. Fresh onboarding, profile creation, English selection and locked-level explanation.
2. Five-item assessment, submitted-answer persistence through refresh, 5/5 result, next unlock and independent Filipino locks.
3. Incorrect answers, hint feedback, 0/5 result, no unlock and restart.
4. Tap puzzle, sentence ordering, dictionary selection/empty state, all three daily tasks, story quiz and persisted daily reward.
5. Teacher PIN setup, real empty reports, assignment creation, learner-home assignment, teacher re-entry and wrong PIN rejection.
6. 17 routes at 320, 393, 430 and 1440px widths: visible page heading, no horizontal document overflow and no page exceptions.
7. Microphone denial and successful non-microphone continuation.
8. Corrupt saved-data warning without overwriting the original record.
9. All 18 lessons in both languages completed using actual activity and assessment controls; 36 persisted mastered records verified.

## Visual evidence

The actual rendered screenshots were inspected against the supplied export family:
- `tests/screenshots/welcome-mobile.png`
- `tests/screenshots/home-mobile.png`
- `tests/screenshots/levels-mobile.png`
- `tests/screenshots/home-desktop.png`

All 15 extracted artwork files were visually inspected together for identity and obvious crop errors. Original owl/character artwork is retained. Story artwork’s embedded audio badge is overlaid with a real playback control in story activities. The story-library illustration links to the reading activity.

The responsive check is an automated overflow/navigation check, not proof of full accessibility or pixel-identical design. The longer functional level titles make the level map scroll vertically; content and bottom navigation remain reachable.

## Issues found and resolved during implementation

- Initial TypeScript build: optional lesson closure narrowing and CSS import declarations. Corrected; final build passes.
- Local server startup blocked by sandbox socket restrictions. Restarted with approved permissions.
- Playwright initially rejected a JSON import without the Node import attribute. Corrected; test suite executes.
- Vitest initially discovered the Playwright spec. Scoped unit command to `src`; both runners now work independently.
- Duplicate pending microphone requests could race. Recording control now disables while requesting permission.
- Reduced bundled font assets to the Latin subsets used by both languages.

## Not claimed as verified

- Educational quality/phoneme accuracy or teacher approval of draft questions.
- Prerecorded narration: no recordings were supplied; browser TTS/fallback is implemented.
- Actual microphone capture and playback on physical iPhone/Safari/Android hardware.
- Verified online teacher authentication, remote rosters, cloud sync or conflict handling (not implemented).
- Cold-start offline/PWA caching, two-tab concurrent writes, backup import.
- Full screen-reader audit, 200% text zoom audit, and every pixel of every screen compared to live Figma metadata.
- Netlify live deployment or native Android packaging (outside this local web build).

The copied validation CSV contains per-row status distinctions rather than blanket passes. Reference checklists under `reference/handoff/` have been updated to the current Student/Teacher scope.
