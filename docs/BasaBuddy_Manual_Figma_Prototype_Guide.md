# BasaBuddy — Exact Manual Figma Prototype Playbook

**Status:** This is a wiring proposal based on the previously reported 18 screen types. No live inspection or editing of the Figma file was performed. Exact on-canvas labels and node names are unverified.

## A. Prepare the *existing* file
1. Open the existing design file yourself, not a generated duplicate. Save a version/history checkpoint and export all 18 screens to PNG as a visual backup.
2. In the Layers panel, identify each frame by **what is actually drawn**, then label it `S01 — Onboarding`, `S02 — Choose User` … `S18 — Teacher Dashboard`. If the real frame order differs, use actual contents as authority and update the CSV.
3. Preserve native layers, illustrations, owl mascot, colors, fonts, shadows and icons. Do **not** resize mascot art to force a standardized size. For the 393 × 852 iPhone 16 design reference, use constraints/Auto Layout to protect the safe areas. The Android implementation must still be responsive.
4. Create a separate page or section titled `BasaBuddy — Proposed Support Views` for additional frames so the original designs are undisturbed. Add the *minimum* NEW frames: `P01 Student Profile Chooser`, `L01 Language Selection`, `L02 Lesson Intro`, `R01 Level Results`, `T01 Teacher Sign-in`.
5. Reuse an existing card/button component wherever possible. Make component variants for `default`, `pressed`, `selected`, `disabled`, `loading`, `correct`, `incorrect`, `locked`, `unlocked`, `in_progress`, and `completed` as appropriate. Figma component properties do not supply runtime logic.

## B. Connect the entry and role flow
1. Click `S01 — Onboarding`. In the right sidebar choose **Prototype**, create a Flow starting point and name it `BasaBuddy – Student`.
2. Select the actual Continue button layer, not its whole containing frame. Drag the circular prototype connector to `S02 — Choose User`.
3. In the Interaction details choose `On click` → `Navigate to` → `S02`. Set animation to `Instant` or short `Dissolve` (approximately 150–250 ms is a design proposal).
4. Repeat from the *actual role buttons*: Student → `P01` → `L01` → `S03`; Teacher → `T01` → `S18`. Sign-in frames only simulate sign-in; app logic must authenticate and enforce authorization.
5. Add Back arrows with `On click` → `Back` on normal stack screens. Use `Navigate to` when an explicit reset destination is required (for example, Results → Level Map).

## C. Connect main student navigation
1. From `S03 — Student Home`: Continue Learning and Levels → `S04`; Quest → `S15`; Journey → `S16`; Dictionary → `S10`.
2. On each of `S04`, `S15`, `S16`, and `S10`, connect any visible persistent tabs to matching destinations. Never add interactive tabs just to satisfy a plan if the original layout has no tabs; use a navigation control consistent with the current design.
3. In `S04 — Learning Levels`, each *unlocked* level card points to `L02 Lesson Intro`. Locked cards open an explanation overlay; completed cards reopen the lesson in review mode. In Figma, create representative Level 1 unlocked, Level 2 locked and Level 1 completed variants. The app computes status from saved progress.
4. Every lesson's final activity points to `R01 Level Results`, and that screen's `Next Level` points to the next unlocked lesson; `Back to Levels` points to `S04`.

## D. Connect activity and feedback states
1. Use `BasaBuddy_Level_to_Screen_Map.csv` for which **existing screen template** hosts each level. The first stage of every level is `L02`, next guided practice, next independent practice, then five-item assessment on S12 (or a reused quiz component), then `R01`.
2. Build Figma component variants for selectable answers. Example: default answer → `On click` → `Change to` selected; Check → `Open overlay` correct or try-again. Figma cannot dynamically evaluate unknown content without prebuilt branches.
3. For demos, connect the one known correct answer to Correct overlay and a known wrong answer to Retry overlay. **Document this as prototype simulation only.** Real app decisions come from the answer data and grading engine.
4. Use `Open overlay` for Correct, Incorrect, Locked, Leave Lesson and Microphone explanation dialogs. Set appropriate overlay alignment, and make explicit Continue/Retry/Close actions. Do not rely solely on clicking outside an overlay to dismiss it.
5. Make `S07` and `S09` illustrate Play → Permission request → Recording → Stop → Replay → Continue; also demonstrate the Denied/no-mic route. Do not claim the prototype records sound.
6. Show in-progress screens; when a child taps Back mid-assessment, show a leave confirmation overlay. Save/resume will be real app behavior, not Figma behavior.

## E. Testing the prototype, one interaction at a time
1. Use the top-right **Present** mode from each Flow starting point. Tap every visible item at least once; note links that don't navigate, lack feedback, or point to the wrong role.
2. Validate: Student entry, Teacher sign-in; Main tabs; Level 1 unlocked; Level 2 locked; Correct; Incorrect; Retry; Result; Back; exit/re-enter; no-microphone fallback.
3. On each frame at 100% and 200% zoom, examine safe areas, button labels, card padding, long Filipino/English words, row alignment, touch target sizes, scrolling and keyboard overlap.
4. Record an issue in `BasaBuddy_UI_Review_Worksheet.csv` with screenshot filename and priority. Do not mark a check **Pass** unless visually inspected.
5. Export a prototype recording or manually record pass/fail evidence for the full student and adult paths. Figma cannot validate actual database persistence, secure API permissions or audio scoring.

## F. Connection manifest
`BasaBuddy_Prototype_Wiring.csv` contains the remaining proposed explicit edges. It is a target wiring specification, **not evidence of existing Figma links**. Replace text labels if current frame text differs and update destinations to match actual renamed frames.
