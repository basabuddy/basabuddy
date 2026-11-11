# BasaBuddy picture dictionary expansion

10 November 2026 · Current Student/Teacher application

## Scope and visual preservation

The latest request supersedes the earlier photographic direction. The original cartoon dictionary, two-column `.dictionary-grid` / `.dictionary-card` styles, blue shared controls, language switch, typography, bottom navigation and original student home remain. No realistic photographs are used. The abandoned generated photos were removed from the project before connecting dictionary assets.

The inspected existing animals use large expressive eyes, rounded silhouettes, soft glossy shading and pale pastel backgrounds. Existing food/objects use simple colorful, softly shaded forms. Eight matching existing illustrations are reused: dog, cat, bird, turtle, rabbit, apple, pencil and open book. The other 82 illustrations use the built-in imagegen tool with the existing animal or object artwork as explicit style references, one distinct image per word. The 90 optimized illustrations total 2,076,620 bytes (about 2 MB). Existing lower-resolution artwork is reused without inventing detail or upscaling it. Optimized local WebP copies live in `public/assets/dictionary/{animals,food,things}/`; originals remain unchanged.

All generation/reuse prompts, source paths, hashes, sizes and review status are stored per ID under `reference/dictionary-generation/`. No imagegen CLI/API fallback or new dependencies were used.

## Content and interactions

`src/dictionary/content.ts` contains exactly A01–A25 (animals), F01–F25 (food), T01–T40 (things): 90 Filipino/English pairs, 90 corresponding illustration paths and 90 short bilingual sentence pairs. These are authored learning examples, not a claim of educational or official curriculum approval. Suggested introduction levels are author-selected classroom filters, not a placement test.

The dictionary retains category browsing and picture-card selection, and adds:

- Case-insensitive search in both languages, common spelling aliases, All browsing and friendly empty states.
- A detail card with the matching larger cartoon, both translations, Filipino and English pronunciation, sentences, favorite toggle, previous/next and close controls.
- Learner-specific favorites, explored/recent words, practice counts, actual correct/incorrect answers and completed practice sessions.
- Flashcards with reveal/hide, bilingual pronunciation and navigation; cards record exploration only when words are revealed.
- Picture matching, listen-and-choose, both translation directions and spelling. Practice is untimed and retry-friendly. If listening audio is unavailable, learners can reveal the word and continue with reading support.
- Keyboard-operable practice dialogs with focus trapping, Escape to close and return focus.
- A real teacher Vocabulary tab behind the existing teacher PIN, category and suggested-level filtering, learner-specific review collections and classroom practice. Printable picture flashcards and worksheets are previewed from the current filters; the browser print dialog can print or save PDF. No account or classroom backend was invented.

## Storage and audio

The version-1 localStorage record remains in place. An optional `dictionaryProgress` field holds per-learner favorites, viewed timestamps, practice results, review sets and completed practice sets. Legacy lesson/game/assignment records and sound settings are preserved. Malformed new data triggers existing recovery handling without silently overwriting the stored original.

The existing `AudioButton` and shared playback-owner utility are reused. Switching words, closing practice or starting the other language stops prior playback. Existing bundled recordings are preferred. Otherwise the browser must provide a matching local Filipino/Tagalog or English voice. English is never substituted for missing Filipino. Loading, playing, blocked-playback and unavailable-voice states remain visible. Microphone recording is not needed for dictionary use.

The expanded dictionary has **81 Filipino and 84 English word recordings not bundled**. On devices with suitable local voices those buttons use speech synthesis; on devices without those voices they show the existing unavailable-audio message. Do not describe all 180 pronunciations as verified offline recordings. The previous seven-entry-only penguin mappings are retired from the active dictionary inventory; existing audio files remain untouched. The exact missing-recording list is generated in `docs/DICTIONARY_ASSET_AUDIO_REPORT.json`.

## Main files

- `src/dictionary/content.ts`: structured content, local paths, spelling aliases and filters.
- `src/dictionary/Dictionary.tsx`: original card-style browser/detail UI, flashcards, practice and classroom print views.
- `src/dictionary/progress.ts`, `src/dictionary/practice.ts`: additive persistence validation and pure practice helpers.
- `src/app/Student.tsx`: routes the existing dictionary export to the expanded implementation.
- `src/app/Teacher.tsx`: dictionary classroom support through the existing local teacher entry.
- `src/domain/model.ts`, `src/data/repository.ts`: optional dictionary field and validation.
- `src/content/lessons.ts`: compatibility projection for existing content/audio tooling; original lessons are unchanged.
- `src/styles.css`: scoped dictionary-only additions and print rules.
- `scripts/install-dictionary-art.py`, `scripts/audit-dictionary.mjs`: local optimization/provenance and actual-file validation.
- `src/dictionary/content.test.ts`, `tests/dictionary.spec.ts`: content, persistence, search, favorites, practice, audio coordination, images, classroom and responsive checks.
- Existing audio coverage and dictionary assertions are updated for the expanded word set; generated recording checklists reflect current coverage.

## Verification

- `npm test`: PASS — 6 files, 20 unit tests.
- `npx tsc -b`: PASS.
- `npm run build`: PASS — existing image guard, new dictionary asset audit, expanded audio audit, TypeScript, Vite and production service-worker generation (313 static files).
- `npm run audit:dictionary`: PASS — exactly 90 entries and 90 distinct local WebP illustrations; zero missing, repeated or stale-file errors. Both missing-recording inventories are written to the JSON report.
- `npm run test:e2e -- --workers=2`: PASS — 49 browser tests, 1.2 minutes. Covers all 90 decoded dictionary images, both-language search, aliases, category counts, detail navigation, favorites across reloads/learners, flashcard reveal/focus behavior, picture/translation/spelling/listen-choice practice, completed-set history, both-language playback coordination and refusal to substitute English for missing Filipino.
- Production offline browser test: PASS — all 90 dictionary cartoons decode offline after first installation, and favorites persist through offline reload. Existing game offline completion also remains covered.
- Existing regression coverage: PASS — all 36 lesson/language combinations, original home/four tabs, teacher gate/assignments/reports and Student/Teacher role boundaries.
- Responsive checks: PASS — dictionary details at 320, 393, 768 and 1440 pixels, plus existing 430px coverage. No horizontal overflow or broken images. Mobile detail screenshots and labeled contact sheets for all 90 cartoons were visually inspected.
- The first full run had 47 passes and one legacy test timeout caused by a lowercase selector (`aso dog`) against the capitalized vocabulary label. Updated that selector to be case-insensitive; the final full 49-test run passed.
- Changed tracked source/configuration files passed `git diff --check`; unrelated pre-existing whitespace in `Student.tsx` was preserved.

Audio tests establish source/language selection, state handling and playback coordination; they do not certify human pronunciation for all words. Content/sentences and generated illustrations still merit educator review before a formal classroom release. On a device without matching local voices, the 81 Filipino and 84 English unbundled words cannot provide pronunciation audio; their buttons show the existing honest unavailable state rather than an unrelated voice.

No push, merge or deployment was performed.
