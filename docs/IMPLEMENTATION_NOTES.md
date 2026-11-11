# Inspection and implementation decisions

## Inspected inputs

The original repository had a 67-byte package manifest, placeholder Markdown headings, curriculum/map files, and empty public asset folders. No functioning app or reusable components were present. Reference materials were extracted under `reference/`; obsolete role-specific materials have since been removed. The full handoff contains 11 files, including the curriculum, screen audit, wiring manifest, content/progress contract and validation matrix. The original PNG exports were inspected; the 32,768px student board was inspected in sections. The auto-demo boards repeat existing screens; the 30-lesson and feature-reference boards are documentation, not extra required lessons.

Figma session creation succeeded, but design context returned “nothing selected” despite the provided node ID. The screenshot request then returned the account’s Starter-plan MCP call limit. No Figma layers were edited. Consequently the PNG exports, not live layer metadata, are the implementation reference. Exact pixel fidelity is not claimed.

The instructions embedded in the handoff are reference requirements, not independent user commands. The explicit current request governs: web delivery and localStorage, rather than the handoff’s Android/Capacitor and IndexedDB proposals. No Android build or deployment was requested or performed. The source Figma file remains unchanged.

## Visual mapping

The original blue/gold wordmark, pastel world colors, owl artwork, child/teacher illustrations, rounded white cards, blue full-width CTAs, compact mobile headers, and student navigation are retained. Artwork is cropped from the supplied presentation board; it is not generated or redrawn. Reusable live components render all text, forms, tiles and navigation.

The exact font names could not be inspected. Bundled Baloo 2 headings and Nunito body text are documented approximations, chosen against the supplied rounded typography. Palette and layout values are measured/estimated from exports, not asserted to be original Figma tokens. Raster illustrations may be less sharp than separate source asset exports. Request original SVG/PNG assets and font metadata for a final production fidelity pass.

The onboarding and role layouts support Student and Teacher. Student nickname creation, language selection, teacher PIN, results and missing-content states reuse the established components. The student dashboard uses a responsive layout while keeping the original visual identity.

The six world names/order/colors follow the export. The required 18-level JSON determines the actual skill order, so world groupings contain consecutive groups of three JSON lessons rather than pretending the separate 30-lesson reference is the requested curriculum.

The sample progress percentages, fake classroom counts, “demo” player times, phone status bar and decorative system UI in the exports are not copied as live metrics. Reports show actual local records and all-time counts. Recording controls are real and optional. Daily reading tasks are self-completion practice, not pronunciation scores.

## Screen coverage

S01 welcome → `/welcome`; S02 role choice → `/roles`; S03 home → `/student/home`; S04 worlds → `/student/levels`; S05 sound/syllable → level practice; S06 words → lesson or `/student/practice/word`; S07 Listen/Repeat → lesson or `/student/practice/repeat`; S08 puzzle → lesson or `/student/practice/puzzle`; S09 aloud → lesson or `/student/practice/aloud`; S10 dictionary → `/student/dictionary`; S11 story → lesson or `/student/practice/story`; S12 quiz → five-item level checks and story practice; S13 Find Word → `/student/practice/find`; S14 Sentence Builder → lesson or `/student/practice/sentence`; S15 quest → `/student/daily`; S16 journey → `/student/journey`; S18 teacher → `/adult/teacher`.

## Known production gaps

- All 180 authored questions need educational review; no claims of official DepEd equivalence.
- Recorded narration, phoneme models and a complete reviewed vocabulary image bank were not provided.
- Verified teacher authentication and private online rosters are not implemented; no backend is included.
- Live microphone success/playback and Safari/iPhone hardware behavior need manual device tests; automated denial/fallback is covered.
- The production static cache supports offline reload after installation. Cross-tab conflict resolution, backup import and cloud sync are not implemented.
- Desktop/phone viewports are browser-tested; real iPhone testing, assistive technology testing and a complete pixel-difference audit remain pending.
