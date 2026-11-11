# BasaBuddy — Student and Teacher only

10 November 2026 · Asia/Manila

## Result

The application now has exactly two selectable roles: Student and Teacher. The retired third-role dashboard, onboarding card, login branch, report links, profile-management controls, settings links, styles, promotional copy and supporting reference assets have been removed. No remote account linking, notification integration, billing provider or role-specific dependency existed to disconnect. No new dependency, database or backend was added. No push, merge or deployment was performed.

## Preserved behavior and storage

- Student onboarding, local reader switching and additional-reader creation remain available. Additional readers use the existing nickname/grade onboarding form rather than an account-management screen.
- Both language tracks retain all 18 levels, five-question assessment flows, mastery/unlocks, exact-step resume, practice activities, stories/quizzes, dictionary, daily quests, game sessions, rewards and progress.
- Teacher entry remains `/adult/teacher`, now mapped to an explicit teacher-only component rather than a generic role parameter. The existing overview, learners, reports, real learner exports, lesson assignments and assignment removal remain. The empty state links to Student onboarding; no classroom creation or online roster service was invented.
- The teacher gate uses `teacherPinHash`. The repository normalizes the legacy shared `pinHash` to this field, using the unchanged hashing algorithm so an existing PIN continues to work. Learner IDs, profiles, lessons, assignments, quests, games and awards are preserved. The original serialized record is not overwritten merely by loading; subsequent successful saves use the normalized teacher field.
- Actual progress storage was localStorage, not IndexedDB. The user explicitly selected retaining it for this task. `basabuddy:v1` progress and localStorage sound settings are retained. No storage reset or database migration was introduced.
- Bundled audio and service-worker caching are retained. A built-app test verifies offline game reload, saved selection, completion and persisted rewards after the initial online cache install.

## Source changes

| Files | Change |
| --- | --- |
| `src/App.tsx` | Two role choices; exact teacher route; reader form available alongside existing readers |
| `src/app/Teacher.tsx` | Extracted existing teacher behavior into a standalone component |
| `src/app/Adult.tsx` | Removed the obsolete shared role component and its unused management branches |
| `src/app/Student.tsx` | Removed retired-role report/settings links; retained learner progress and settings |
| `src/app/Dashboard.tsx` | Removed retired-role dashboard entry and related preview copy |
| `src/components/Premium.tsx` | Removed account-monitoring preview copy |
| `src/domain/model.ts`, `src/data/repository.ts` | Teacher-only PIN field and backwards-compatible normalization |
| `src/styles.css` | Removed unused role styling and renamed shared dashboard classes for Teacher |
| `src/data/assets.json`, `public/assets/objects/books.webp` | Removed the unused role-card image and its manifest entry |
| `scripts/extract-assets.py` | Removed generation mapping for the unused role-card image |
| `scripts/audit-image-screens.mjs` | Audits teacher entry and existing teacher tabs only |

## Tests and documentation

- Updated `tests/app.spec.ts` and `tests/phase2.spec.ts` for teacher-only entry, exports and navigation.
- Added `tests/roles.spec.ts`: exactly two roles, old URLs rejected with no login form, additional-reader isolation, empty-device teacher entry, assignment removal and lock/re-entry.
- Added `src/data/repository.test.ts`: legacy PIN migration preserves learner data and sound settings.
- Updated README, implementation notes, validation notes, expansion plan, feature report, design blueprints, master prompts, wiring guides and CSV checklists in both `docs/` and `reference/handoff/` to the current scope. Historical verification results remain labeled as historical.
- Removed five obsolete premium account/report/settings boards, two obsolete export boards and one obsolete role screenshot. Removed retired UI records from generated image inventories and archived audit evidence. Archived source snapshots were cleaned of the retired role entries while preserving unrelated source/assets; composite historical sheets containing retired UI were removed rather than altering artwork.
- Browser regression screenshots were refreshed and the role selector and teacher dashboard were visually inspected. Other pre-existing changes were preserved; nothing was reset or committed.

## Verification results

| Command/check | Observed result |
| --- | --- |
| `npm test` | PASS — 5 files, 15 tests |
| `npx tsc -b` | PASS |
| `npm run build` | PASS — 47 logical image assets verified, TypeScript/Vite build, production offline cache generated |
| Audio audit within build | PASS — Filipino 79/79, English 77/77 mapped playable texts |
| `npm run test:e2e -- --workers=2` | PASS — 38 tests, 1.0 minute |
| Complete lesson UI regression | PASS — all 36 language/level combinations completed through actual controls |
| Responsive checks | PASS — 320, 393, 430, 768 and 1440px covered across existing/new suites; no broken images or horizontal overflow |
| Teacher behavior | PASS — PIN setup/re-entry/rejection/locking, real empty reports, student selection, exports, assignment creation/removal |
| Removed route behavior | PASS — old URLs show Page not found, never a credential or dashboard screen |
| Offline behavior | PASS — production cache/audio transport and complete built-app game reload/completion tests |

A source/reference audit covered application code, documentation, scripts, filenames, hidden project-owned files and text entries inside reference ZIPs, excluding dependencies, Git internals and generated builds. No retired-role implementation or role-named asset remains. Deliberate old-URL strings remain in negative regression tests. Python `Path.parent` and `mkdir(parents=True)` are filesystem APIs, not application roles. Shared visual boards and source assets for Student and Teacher remain.

## Remaining limits

No blocking implementation issue remains for this change. The teacher PIN remains a device-local convenience gate, not verified online identity. The app has no cloud roster or synchronization service. Content/audio still need educator and fluent-speaker review, and browser storage can be evicted. These are existing MVP limits. Three pre-existing unmapped audio trial files remain untouched. No IndexedDB implementation is claimed.

## Original home layout restored

Following the user's follow-up, `/student/home` renders the retained original `Home` component again: wordmark/settings, welcome, language switch, owl/progress card, today's lesson, Continue reading, Listen/Play/Quest shortcuts, dictionary and assignments. The original compact desktop/mobile shell and four localized bottom tabs (Home, Learn, Stories, Journey) are restored. The retired role stays removed. Existing newer activity routes and saved records are retained without adding them to the original home layout. This is a local source change; the hosted Netlify site has not been deployed.
