# Remaining ten assets — replacement verification, 2026-11-05

Five already display the exact Batch 1 enhanced files. Five still display low-resolution sheet/legacy sources. No better matching replacement was found, so no artwork or application code was changed in this follow-up.

| File path | Current resolution | Current version | Enhanced file displayed? | Example verified screen |
|---|---:|---|---|---|
| `public/assets/mascots/welcome-original.webp` | 2048×1902 | Batch 1 enhanced (exact ZIP checksum) | Yes — exact Batch 1 bytes | `en/welcome` |
| `public/assets/mascots/reading.webp` | 331×318 | Low-resolution sheet/legacy source | No — current original is displayed | `en/student/home` |
| `public/assets/characters/teacher.webp` | 244×278 | Low-resolution sheet/legacy source | No — current original is displayed | `teacher-gate` |
| `public/assets/characters/reader.webp` | 273×284 | Low-resolution sheet/legacy source | No — current original is displayed | `en/student/practice/aloud` |
| `public/assets/objects/apple.webp` | 223×247 | Low-resolution sheet/legacy source | No — current original is displayed | `en/student/practice/repeat` |
| `public/assets/illustrations/cat.webp` | 311×363 | Low-resolution sheet/legacy source | No — current original is displayed | `en/student/dictionary` |
| `public/assets/illustrations/dog.webp` | 2048×1969 | Batch 1 enhanced (exact ZIP checksum) | Yes — exact Batch 1 bytes | `en/student/practice/find` |
| `public/assets/illustrations/puzzle.webp` | 2011×2048 | Batch 1 enhanced (exact ZIP checksum) | Yes — exact Batch 1 bytes | `en/student/practice/puzzle` |
| `public/assets/illustrations/sentence.webp` | 1988×1988 | Batch 1 enhanced (exact ZIP checksum) | Yes — exact Batch 1 bytes | `en/student/practice/sentence` |
| `public/assets/illustrations/celebrate.webp` | 2560×1308 | Batch 1 enhanced (exact ZIP checksum) | Yes — exact Batch 1 bytes | `daily-complete` |

## Replacement decision

The five Batch 1 matches are welcome owl, dog, puzzle, sentence and celebration. Their archived enhanced copies and ZIP entries are identical to the active files, so reinstalling them would do nothing. They still have source softness: Batch 1 upscales/smooths existing detail rather than recovering original detail.

Reading owl, teacher, reader, apple and cat have no verified better matching replacement in the checked sources. The first four come from original sheet crops; cat is the legacy asset. The ten current hashes match the exact files visually reviewed in the full quality audit. No redesign, sharpening, resampling, background/color change, or layout/feature change was performed.

For genuinely sharp high-density rendering, **all ten remain in the matching-original-artwork queue**. Five already have Batch 1 installed; the other five have never received a verified matching enhanced replacement.

## Missing Batch 2

Rechecked accessible Downloads, Desktop, Documents and the workspace. Both Batch 1 ZIPs remain available. Only `BasaBuddy_Batch2_Before_After.jpg` was found for Batch 2; `BasaBuddy_Batch2_Enhanced.zip` remains absent.

All ten expected Batch 2 replacements remain unavailable:

- `public/assets/illustrations/cat.webp`
- `public/assets/objects/apple.webp`
- `public/assets/backgrounds/classroom.webp`
- `public/assets/backgrounds/meadow.webp`
- `public/assets/backgrounds/park.webp`
- `public/assets/backgrounds/school.webp`
- `public/assets/backgrounds/sky.webp`
- `public/assets/objects/books.webp`
- `public/assets/icons/star.webp`
- `public/assets/icons/puzzle.webp`

Only cat and apple overlap the ten unresolved assets in this check. Reading owl, teacher and reader are not listed in the known Batch 2 package contents. The missing files are pending verification, not assumed to restore detail. No replacement was extracted from the comparison JPG.

## Verification

- `npm run build`: passed.
- `npm run audit:images`: passed; 186 decoded files, zero metadata/path/revision errors.
- `npx playwright test tests/image-quality.spec.ts tests/offline-audio.spec.ts`: **4 passed**.
- Production image-loading audit: **865 screen states, zero errors** across 320/2×, 393/3×, 412/2.625×, 768/2× and 1440/2×.
- All 50 distinct production asset URLs matched local file checksums. Each of these ten was observed as a visible, successfully decoded image on app routes; its actual served hash matches the checked file.
- These are automated production-browser sessions, not an inspection of a previously open user tab. Cache behavior is covered separately by the worker-update regression test.
- Current screenshots and full runtime results: `/tmp/basabuddy-ten-assets-check/`. Per-asset evidence: [remaining-image-verification.json](remaining-image-verification.json).

See [IMAGE_QUALITY_AUDIT.md](IMAGE_QUALITY_AUDIT.md) for the prior visual comparisons and genuine-source size targets.
