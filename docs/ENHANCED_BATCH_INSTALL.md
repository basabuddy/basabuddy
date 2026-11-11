# Enhanced asset installation — 2026-11-04

**10 of 20 requested replacements installed. Batch 2 is blocked by the missing ZIP.**

## Source selection

Used `Downloads/BasaBuddy_Batch1_Enhanced (1).zip`, the explicitly attached copy. Both available Batch 1 archives contain the same ten expected paths. Matched exact category and filename, translating only the category suffix ` copy`: e.g. `illustrations copy/puzzle.webp` → `public/assets/illustrations/puzzle.webp`. `icons/puzzle.webp` was not replaced.

`BasaBuddy_Batch2_Before_After.jpg` is available, but `BasaBuddy_Batch2_Enhanced.zip` was not found in accessible local folders. No images were cut out of the comparison sheet. All Batch 2 files remain unchanged.

## Before and after

Dimensions below describe the actual files present at the start of this task, including earlier user changes—not the older audit dimensions.

| App path under public/assets | Before | Installed | Status |
|---|---:|---:|---|
| `illustrations/bird.webp` | 784 × 652 | 2048 × 1703 | replaced |
| `illustrations/celebrate.webp` | 1280 × 654 | 2560 × 1308 | replaced |
| `illustrations/penguin.webp` | 800 × 640 | 2048 × 1638 | replaced |
| `illustrations/rabbit.webp` | 784 × 640 | 2048 × 1672 | replaced |
| `illustrations/turtle.webp` | 800 × 668 | 2048 × 1710 | replaced |
| `illustrations/sentence.webp` | 497 × 497 | 1988 × 1988 | replaced |
| `illustrations/puzzle.webp` | 550 × 560 | 2011 × 2048 | replaced |
| `illustrations/dog.webp` | 544 × 523 | 2048 × 1969 | replaced |
| `mascots/welcome-original.webp` | 703 × 653 | 2048 × 1902 | replaced |
| `objects/cloud.webp` | 651 × 366 | 2048 × 1151 | replaced |
| `illustrations/cat.webp` | 311 × 363 | — | missing Batch 2 ZIP |
| `backgrounds/classroom.webp` | 530 × 258 | — | missing Batch 2 ZIP |
| `backgrounds/meadow.webp` | 489 × 258 | — | missing Batch 2 ZIP |
| `backgrounds/park.webp` | 664 × 425 | — | missing Batch 2 ZIP |
| `backgrounds/school.webp` | 676 × 425 | — | missing Batch 2 ZIP |
| `backgrounds/sky.webp` | 485 × 258 | — | missing Batch 2 ZIP |
| `objects/apple.webp` | 223 × 247 | — | missing Batch 2 ZIP |
| `objects/books.webp` | 301 × 189 | — | missing Batch 2 ZIP |
| `icons/star.webp` | 153 × 140 | — | missing Batch 2 ZIP |
| `icons/puzzle.webp` | 114 × 100 | — | missing Batch 2 ZIP |

## Preservation and rendering

- Backed up all 20 original files plus asset metadata, the extraction script, and the existing app test before changes: `reference/asset-backups/2026-11-04-enhanced-batches/originals.zip`.
- Installed each supplied WebP byte-for-byte; all ten SHA-256 values match their ZIP members. No extra sharpening, filtering, recoloring, generation or enlargement was performed.
- Original RGB backgrounds remain. These source files have no alpha channel; none was added or removed. Aspect-ratio differences are limited to rounding in the supplied ZIP.
- Updated intrinsic width, height, byte count and provenance in `src/data/assets.json`. Existing shared Art components already use aspect-preserving scale-down rendering; no CSS or layout changes were needed.
- Added explicit approved-batch overrides to the asset rebuild script so future extraction retains these versions. Sources are archived in `reference/asset-edits/enhanced-batches/`.
- Unrelated public files, including every Batch 2 and Batch 3 file, logos, characters, story artwork and all audio, were verified byte-identical against pre-install hashes. Lessons, navigation and playback code were not changed.
- Existing lazy loading, async decoding, priority loading of welcome art and offline caching remain. Exact supplied lossless files total 8,148,120 bytes versus 418,282 bytes before installation. This increases first-download/cache cost; no lossy re-encoding was applied to disguise that tradeoff.

## Remaining quality limits

The ZIP notes explicitly describe Lanczos upscaling, edge-preserving smoothing and conservative unsharp masking. It does not contain recovered high-frequency original detail. The larger dimensions must not be interpreted as genuine 2K source detail.

- **Bird, penguin, rabbit and turtle:** residual blocky contours and low-detail faces remain visible. Genuine higher-resolution versions of the same artwork are needed for a truly sharp result.
- **Celebration and welcome owl:** softness remains most apparent in wider displays. Higher-quality original renders are needed to eliminate it.
- **Puzzle, sentence and dog:** smoother at ordinary app sizes, but still limited by the soft supplied source when inspected closely. Exact high-resolution originals would improve these further.
- **Cloud:** clean at ordinary sizes in the asset comparison; currently not displayed on an app route. Its supplied pixels are still computationally enlarged.
- **Batch 2:** all ten requested replacements remain pending the ZIP; the cat and apple retain their previously documented source-quality limits.
- **Batch 3:** deliberately untouched; this pass does not certify or improve those assets.

## Verification

- All 20 original application paths exist and decode. All ten installed versions match ZIP checksums.
- Production build and seven unit tests pass.
- All 24 existing browser tests pass, including the audio coverage test and completion of all 36 lessons. Updated the welcome-image test to expect the supplied 2048 × 1902 file instead of the replaced 703 × 653 file.
- Production rendering audit: 865 screen states at 320/2×, 393/3×, 412/2.625×, 768/2× and 1440/2×; zero broken images, JavaScript page errors or horizontal overflow. Browser emulation, not physical-device certification.
- Visually reviewed the full ten-asset before/after atlas and affected welcome, dictionary, puzzle, sentence, dog activity, result/celebration screens. Source softness is recorded above rather than treated as a rendering error.
- Cloud and the unused Batch 2 background assets were decoded and inspected as files; they were not inserted into new screens.
- Screen captures: `/tmp/basabuddy-batch1-screens/`. Detailed before/after dimensions and checksums: `docs/ENHANCED_BATCH_INSTALL.json`.

## Pending input

Provide `BasaBuddy_Batch2_Enhanced.zip` to finish the remaining ten replacements. The comparison JPG cannot supply the separate full-resolution assets.
