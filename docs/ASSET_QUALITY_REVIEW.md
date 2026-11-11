# BasaBuddy asset quality and UI review — 2026-11-03

## Implemented

Extracted 36 individual assets from the five supplied sheets, found as matching local PNGs in Downloads. The source copies are in `reference/asset-sheets/`. Extraction is deterministic, lossless WebP at native resolution: no generation, upscaling, sharpening, recoloring, or changes to facial features. Reproduce with `python3 scripts/extract-assets.py` (Pillow required).

The running app now uses the supplied book-and-star logo, reading owl, boy student, girl reader, apple, open book, headphones, puzzle and star artwork. Existing blue/yellow branding, rounded typography, lesson content, navigation, audio, data storage and progress logic remain intact. The previous generated storybook substitutions are no longer used; preserved originals are used where no matching sharper replacement was supplied.

`src/data/assets.json` records all 47 shipped assets, their dimensions, source and crop coordinates (where extracted). Assets are grouped into logos, mascots, characters, icons, objects, backgrounds and illustrations. Backgrounds and unused character variants are available for reuse without adding decoration to existing screens. Legacy files are preserved in `reference/legacy-assets/`; previous generated artwork is archived in `reference/previous-generated/`, outside the shipped public folder.

The shared image component provides intrinsic dimensions, async decoding and lazy loading; the brand and welcome illustration load eagerly. Illustrations retain their natural aspect ratios. Shared spacing, header centering, image frames, white illustration surfaces, rounded cards, profile thumbnails and small-screen controls were refined. Matching supplied raster icons are retained as raster: tracing shaded 3D art into SVG would alter its appearance. Existing navigation SVG icons remain unchanged.

## Remaining original-file needs

These originals remain deliberately unchanged rather than inventing replacements:

| Asset | Available pixels | Limitation |
| --- | --- | --- |
| Cat | 311 × 363 | Soft legacy crop; original higher-resolution character needed |
| Dog | 544 × 523 | Legacy crop; higher-resolution original needed |
| Bird | 196 × 163 | Insufficient detail for high-density screens |
| Rabbit | 196 × 160 | Insufficient detail for high-density screens |
| Turtle | 200 × 167 | Insufficient detail for high-density screens |
| Penguin | 200 × 160 | Insufficient detail for high-density screens |
| Teacher | 424 × 423 | Soft legacy character crop; exact pose needed |
| Story | 703 × 464 | Visibly pixelated; baked-in speaker symbol needs a clean original |
| Sentence | 497 × 497 | Soft legacy girl/cat illustration |
| Puzzle | 550 × 560 | Soft legacy boy illustration |
| Celebration | 640 × 327 | Soft group illustration |

The 331 × 318 reading owl is much clearer than the enlarged legacy screen crop, but a larger original is still preferable for large, high-density hero rendering. Source-sheet cuts cannot recover detail absent from their originals.

White mattes and soft ground shadows are retained. Automatic white removal would risk damaging white eyes, feathers, pages and anti-aliased edges. The interface places these on white surfaces; genuinely transparent source PNGs are still needed for clean use over colored backgrounds. No transparent cutout quality is claimed.

## Verification

- Production build and TypeScript check pass.
- Six unit tests pass.
- Twelve browser tests pass, covering onboarding, both language tracks, all 36 lesson activities and assessments, persistence, mastery/unlocking, daily quests, dictionary, microphone denial, audio recovery and adult PIN/assignments.
- Expanded screen test checks 17 routes at widths 320, 393, 430, 768 and 1440 pixels, including decoded image availability and page overflow.
- Mobile screen captures are in `tests/screenshots/polish/`; home desktop capture is in `tests/screenshots/home-desktop.png`.
- The existing app has nickname profiles and an adult PIN flow, not separate account login/registration or a standalone splash route. Those existing flows were preserved.

This is a quality pass, not a claim that every legacy asset now has a high-resolution replacement.

## Requested logo simplification

The user subsequently requested removal of the star and book/person decoration above the wordmark. `reference/asset-edits/wordmark-simple.png` stores that image-tool edit, with blue/yellow BasaBuddy lettering and tagline retained. The extraction script now exports this override to `public/assets/logos/wordmark.webp` and records its actual dimensions. Unlike the original sheet crops, this explicitly requested logo edit is not a pixel-identical extraction. All other artwork remains unchanged.

## Owl and teacher clarity update

At the user's request, the restored pixelated introductory owl and teacher crop have now been replaced at their existing public URLs with the clearer supplied `characters.png` crops: reading owl (331 × 318) and glasses-wearing green-shirt reader (244 × 278). These are existing supplied character variants, with white backgrounds and different poses from the legacy crops—not reconstructed copies of the old scenes. Both are lossless copies, with no sharpening or generated detail. Welcome artwork is capped at its native width; teacher remains in its existing smaller layout. The original onboarding text, CTA and navigation are retained. Larger true source files would still help high-density hero displays.
