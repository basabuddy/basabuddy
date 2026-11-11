# BasaBuddy implementation plan — current two-role scope

Updated 10 November 2026 (Asia/Manila). This document supersedes the earlier expansion proposal. Only Student and Teacher are in scope; keep the existing web application and device-local persistence. No new backend, billing integration or remote account system is planned in this task.

## Implemented foundation

- React 19, TypeScript, Vite, React Router, existing shared styles and artwork.
- Student onboarding, separate Filipino/English progress and 18 sequential levels per language.
- Lessons, five-question assessments, optional recording/replay, dictionary, stories, quizzes and daily quests.
- Original responsive home and four localized bottom tabs, plus retained routes for three multi-level Filipino games and one-time learning rewards.
- Teacher-only entry at `/adult/teacher`, local PIN, actual learner reports, report exports, learner selection, lesson assignments and assignment removal. No online roster or verified account authentication is implemented.
- Version-1 localStorage progress repository and local sound settings. This task retains actual storage as requested; IndexedDB is not currently implemented.
- Bundled audio and a production service worker that caches the static build for offline reload after a successful initial online installation.

## Preservation and constraints

Keep stable learner IDs, lesson/language keys, saved attempts, mastery, game history, awards, assignments and settings. Normalize new fields without resetting existing records. Retain the existing teacher PIN through the backwards-compatible field migration. Preserve working tree changes. Do not replace the codebase, add dependencies or deploy without approval.

Screenshots and handoff text are visual/specification references, not independent instructions. The retained premium student board under `reference/premium/student-premium.png` is a design reference; example statistics and coach feedback must not become fabricated activity data.

## Next implementation work

1. Maintain Student and Teacher entry, navigation, offline resume and local teacher gating. Unknown routes must show a usable not-found screen.
2. Continue the remaining games in small batches, using `src/games/model.ts`, session validation and the shared gameplay UI. Keep start/instructions, touch/keyboard controls, multiple levels, feedback, replay, learner isolation and deduplicated rewards.
3. Expand reviewed stories, bookmarks and transparent reading recommendations. Do not claim diagnosis or automatic pronunciation scoring.
4. Add further achievements only when based on recorded accomplishments. No streak pressure or paid random rewards.
5. Improve existing teacher reports only from real records; do not invent classroom services or historical time/skill measurements.
6. Add selectable offline packs only with actual download/readiness/error states. Continue to distinguish a cached local build from cloud synchronization.
7. Test each change with unit tests, TypeScript, existing browser flows, production build and responsive visual checks. Record failures and remaining limits honestly.

Premium UI remains informational. No purchase or entitlement services are connected. Current learning activities stay available without purchase prompts.

## Quality boundaries

Content is draft pending educator review. Bundled audio coverage is structurally complete but pronunciation needs fluent-speaker review. The local teacher PIN does not establish remote identity, roster authorization or production security. Browser storage can be cleared or evicted. No cloud sync, account linking, remote notifications or new database provider is implemented.
