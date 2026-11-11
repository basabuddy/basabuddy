# Codex Master Prompt — BasaBuddy

Copy this prompt into Codex together with the implementation pack and your Figma exports / current source repository. **Do not infer unseen design properties or claim original visuals were verified.**

---

Act as a senior React + TypeScript mobile engineer, accessibility-focused UI implementer, QA lead and child literacy product architect.

## Project
Implement **BasaBuddy**, a Filipino-English reading practice app for Grades 1–3. Preserve the *existing* blue owl mascot, pastel-blue UI, source typography and 393 × 852 iPhone 16 design reference wherever evidenced by supplied assets and screenshots. Implement responsiveness for multiple Android sizes. The original 18 screen inventory is **previously reported** and must be mapped against actual screenshots / repo before treating frame names or dimensions as verified. **Never use flat screenshots as entire screen implementations.**

## Inputs
- `BasaBuddy_Complete_UIUX_Developer_Blueprint.md`: product requirements.
- `BasaBuddy_18_Screen_Audit.csv`: 18 screen types and visual inspection checklist, not verified defects.
- `BasaBuddy_Prototype_Wiring.csv`: proposed screen links.
- `BasaBuddy_Level_to_Screen_Map.csv`: level-to-template assignments.
- `BasaBuddy_18_Level_Curriculum.json`: curriculum outline (sample prompts, NOT production question bank).
- `BasaBuddy_Validation_Test_Matrix.csv`: required QA test identifiers.
- Existing project source and Figma PNG/SVG exports to be attached; if unavailable, avoid inventing the owl mascot or treating an invented style as an exact match.

## Non-negotiable implementation rules
1. Audit the existing repo before modifying it. Preserve working assets, code, names and project structure. Report actual findings separately from suggested changes.
2. Use React + TypeScript + Vite + Tailwind, React Router; preserve the current web architecture. Prefer additive architecture over rewriting the repo. Use a token file populated from actual screenshots/assets when present.
3. Implement all 18 existing UI *screen types* as real responsive interfaces, not static image files. Use `ActivityRenderer` and typed data to reuse the screens across 18 independent level contents in both Filipino and English.
4. Build role-separated student and teacher routes. Child profile and preferred language must persist. Public role buttons are *navigation only*; teacher screens use the existing device-local PIN gate. Do not implement fake auth as production-ready.
5. All independent learning questions must be actual authored data, with stable IDs, language, skill, accessible label, hints, audio reference, 4-choice or reorder configuration, correct answer and version. Require at least five independent assessment items per level per language, plus practice; mark non-reviewed examples as `draft` and exclude from release mode.
6. Keep Filipino `fil` and English `en` language content separately authored, and track progress using `(studentId, language, levelId)` keys. Do not auto-translate English phonics patterns into Filipino syllables.
7. Implement pure functions `gradeAnswer`, `canUnlockLevel`, `completeAssessment`, `resumeLesson`, and tests. Apply 4/5 independent items threshold as a provisional configurable rule; revisit after teacher review. Never downgrade completed status on retry.
8. Preserve existing device-local progress and LocalStorage settings. Do not add a backend or new database dependency. Keep offline resume and interrupted-attempt recovery.
9. Optional voice exercise: model audio play → explicit opt-in record → stop → replay → self-check/adult check, plus no-mic fallback. Never claim automatic pronunciation grading without validated algorithm and child-language testing. Do not upload raw recordings by default.
10. Implement correct, incorrect, retry, loading, selected, locked, unlocked, in-progress, completed, offline, missing-asset and permission-denied states. All must render child-appropriate messaging and accessible controls.
11. Use consistent app Back behavior including Android hardware Back. Every visible button must act or be visibly disabled with a reason. No dead ends or unhandled blank screen.
12. Treat privacy and age-appropriateness as critical: minimum learner data, teacher-only controls, no public child profile discovery, no covert microphone recording.

## Development in testable increments
Phase 1: Inventory screenshot exports and code, map existing screen templates to routes, capture and fix measurable alignment issues, establish tokens.
Phase 2: Complete route navigation and role entry, lesson intro/results, overlays; verify all 48 proposed edges against actual UI. Add only needed support screens.
Phase 3: Implement schema, item rendering, bilingual content loading, answer validator, level progression and offline progress. Provide fixtures and unit tests before expanding all lessons.
Phase 4: Implement pre-recorded audio and optional recording controls with permission fallback, including Android behavior.
Phase 5: Preserve existing teacher entry, dashboard, learner selection, reports, exports and assignment/removal controls. Do not represent unimplemented classroom services as complete.
Phase 6: Run integration, E2E, Android device, accessibility and privacy tests. Document incomplete media, localization and teacher review blockers.

## Required output after each phase
- Exact files changed, routes added, assumptions made and unverified visual details.
- Working build/test commands and result logs, including failed tests.
- Screenshots or reproducible checks showing 393 × 852 layout fidelity and at least one other phone size.
- Checklist against `BasaBuddy_Validation_Test_Matrix.csv`.
- Remaining blocked items and data required for release, not promises of hidden background work.

## Definition of done
All current student and teacher screens are implemented with recognizable original visual design; both curricula load and are independently scored; successful and unsuccessful answers have meaningful states; level mastery and offline resume persist after restarting; optional microphone fallback works; teacher-only controls require the local PIN; device limits are documented; all release-required lesson media has educational review; and no missing feature is represented as complete.
