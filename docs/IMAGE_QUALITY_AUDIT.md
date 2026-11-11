# BasaBuddy image quality audit — 2026-11-05

The investigation and verified engineering fixes are complete. **Ten logical assets still require matching higher-resolution original artwork.** Increasing their dimensions or sharpening again would not recover missing detail.

This audit preserves the exact image bytes present at the start of this request. It does not claim that a new raster enhancement was performed. The student and four animals edited earlier in this conversation are retained as the current design; their metadata and rebuild protection are now fixed.

## Scope and visual method

- Scanned every source image under the project, including public assets, reference artwork/sheets, archived alternates and existing test screenshots. No bitmap files live in `src/`.
- **181 files at the start:** 100 public files, 54 reference files and 27 screenshot files; **126 unique image byte sequences**, all shown in 11 reviewed contact sheets. Identical copies were grouped by SHA-256, not guessed from names.
- **186 files at completion:** 50 public, 109 reference and 27 historical screenshots. The increase is five exact safety copies of the recent edits; 50 unused public copies were moved to reference storage.
- All files decoded. The active inventory comprises **48 logical artwork assets plus two responsive logo variants**. Twenty-two logical assets appear on current routes; 26 are currently unused.
- Visually inspected the active artwork, small native images, background images, and native-detail crops of every Batch 1 candidate. Compared originals, Batch 1 and current files side-by-side at the same preview size and at native detail size.
- Reviewed all 173 phone screen captures as nine contact sheets, plus full-resolution tablet welcome/dictionary, desktop home/roles and native source detail. Automated route/layout/asset checks cover 865 screen states across five viewport/density settings.
- **No standalone SVG files** were found in source folders. Lucide controls remain inline SVG; inspected in rendered screens. CSS gradients are not image assets. Dependencies, `dist/`, tool caches and generated test-result directories are excluded from source inventory.
- Oversized reference boards and historical screenshots were reviewed as overview contact sheets, not exhaustively at every native pixel. They are not used as app assets and are not certified as high-resolution source replacements. Chromium emulation is not physical-device or Safari/Firefox certification.

Full dimensions, byte sizes, alpha/mode, container compression and checksums: [image-inventory.csv](image-inventory.csv) and [image-inventory.json](image-inventory.json). Per-asset findings and route labels: [image-quality-findings.json](image-quality-findings.json).

## Verified root causes and changes

1. **Stale metadata after the five recent edits.** Student was still declared 267×285 although its file was 1214×1296; bird, rabbit, turtle and penguin still declared the older Batch 1 dimensions. Updated actual width, height, byte count and provenance. The old ratios were close, so this was a metadata/intrinsic-sizing defect, not the cause of baked-in source blur.
2. **Rebuild regression.** `extract-assets.py` would restore the old student crop and older upscaled animals. Saved checksum-verified current edits under `reference/asset-edits/approved-current/` and apply them after the Batch 1 overrides. An isolated full rebuild reproduced **all 50 public image files byte-for-byte**.
3. **Stable URLs and worker lifecycle could retain old images.** Added content revisions to image URLs and responsive variants. Production workers activate only after the new cache is fully installed, reject mismatched image revisions from their own cache, and clean obsolete caches. Development unregisters the app's `/sw.js` worker and deletes only `basabuddy-static-*` caches, preserving learner local storage. The production update regression test checks new bytes in an already-open tab, offline availability, and preserved local data. This is a verified code-level stale-cache risk; no claim is made that the user's existing browser session was observed serving stale bytes.
4. **Unreferenced duplicate distribution.** `public/assets/New Folder With Items/` contained 50 unused copies, including obsolete blurry animal versions. Static searches and route measurements found no consumers. Moved the entire folder unchanged to `reference/unused-public-copies-20261105/`; it is no longer shipped or precached. These duplicates did not override canonical URLs automatically, but made manual replacement ambiguous.
5. **Source quality, not CSS.** The supplied Batch 1 files preserve soft/blocky source detail. Five other current images have less than 2× usable source density at their largest placements. Existing `object-fit: scale-down`, natural proportions and `image-rendering: auto` already prevent CSS enlargement. No layout/CSS adjustment was warranted, and none was made in this pass. No image transforms or blur filters were found on inspected image elements.
6. **Future replacements are checked.** Added metadata synchronization and a build-time content-revision check. A changed file cannot silently ship with the old revision. After a deliberate replacement, run `npm run sync:images`, then `npm run audit:images`, then visually verify before building.

All **50 canonical public image files are byte-identical to the starting snapshot**, including colors, backgrounds and transparency. No new generation, tracing, resampling, sharpening, recompression, character substitution or layout/animation change was performed in this audit. The ten unresolved assets are not marked fixed.

## Enhanced ZIPs and other candidate sources

Searched accessible Downloads, Desktop, Documents and the workspace for Batch/Enhanced/BasaBuddy candidates.

- Found both `~/Downloads/BasaBuddy_Batch1_Enhanced.zip` and `BasaBuddy_Batch1_Enhanced (1).zip`. Their ten image members have matching checksums. All were compared against the current project and available legacy originals.
- Six current files already exactly match Batch 1: welcome owl, celebration, dog, puzzle, sentence and cloud. The four current animals are the later user-requested imagegen edits, visibly clearer than Batch 1, and were not downgraded.
- Batch 1 notes explicitly describe Lanczos upscaling, edge-preserving smoothing and conservative unsharp masking. The welcome owl, celebration, puzzle, sentence and dog still show softened detail; the older four animal ZIP entries remain visibly pixelated. Lossless export does not reverse earlier losses.
- **No Batch 2 enhanced ZIP was found.** Only `~/Downloads/BasaBuddy_Batch2_Before_After.jpg` exists. A comparison collage is not a full-resolution source; no replacement was cut out of it.
- Also inspected 21 BasaBuddy PNG candidates, the Batch 2 JPG, and the 35 image members of the Asset Library ZIP (both copies have identical corresponding image members). Large library canvases contain small centered artwork, not recovered detail. Other candidates contain different mascot designs, promotional composites or small sheet crops. None was a verified improvement of the exact missing artwork.
- Developer Handoff ZIPs contain no image files. Source-search checksums/dimensions are recorded in [image-source-search.json](image-source-search.json).

**Historical identity limitation:** the previous imagegen edits visibly reconstruct animal contours/features, so they are not proof of pixel-identical recovery from the original tiny artwork. The current task preserved these existing files and made no further design change. If exact pre-generation identity is required, obtain the matching original renders rather than generating again.

## Per-image results

“Original resolution” means the actual file at the start of this audit, not an assertion of genuine original detail. “Displayed” is the largest measured CSS frame and aspect-preserving painted area across the audited screens. All final resolutions equal the starting resolutions because this pass changes delivery/rebuild correctness, not pixels.

“Fixed” below refers to metadata and rebuild defects on already-clear current edits. “Already clear” is scoped to observed native preview/current usage; unused files are not certified for hypothetical fullscreen or Retina layouts.

| Image filename | Folder path | Original resolution | Displayed dimensions (CSS px) | Detected quality problem | Root cause | Fix applied | Final resolution | Status |
|---|---|---:|---|---|---|---|---:|---|
| classroom.webp | `public/assets/backgrounds` | 530×258 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 530×258 | Already clear |
| meadow.webp | `public/assets/backgrounds` | 489×258 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 489×258 | Already clear |
| park.webp | `public/assets/backgrounds` | 664×425 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 664×425 | Already clear |
| school.webp | `public/assets/backgrounds` | 676×425 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 676×425 | Already clear |
| sky.webp | `public/assets/backgrounds` | 485×258 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 485×258 | Already clear |
| reader-glasses.webp | `public/assets/characters` | 244×278 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 244×278 | Already clear |
| reader.webp | `public/assets/characters` | 273×284 | 480×291 frame; 273×284 painted | Insufficient high-density passage/hero detail | 273×284 sheet crop; scale-down prevents CSS enlargement but largest passage paints at 1× | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 273×284 | Needs original artwork |
| schoolboy.webp | `public/assets/characters` | 219×283 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 219×283 | Already clear |
| schoolgirl.webp | `public/assets/characters` | 248×277 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 248×277 | Already clear |
| student.webp | `public/assets/characters` | 1214×1296 | 160×160 frame; 150×160 painted | Clear current artwork; stale intrinsic dimensions/provenance and rebuild regression | Earlier imagegen replacement bypassed manifest and rebuild overrides | Synchronized dimensions/bytes/hash; archived exact current edit; override applied after Batch 1; revision URL | 1214×1296 | Fixed |
| teacher.webp | `public/assets/characters` | 244×278 | 210×239 frame; 210×239 painted | Clean native crop, insufficient Retina detail | 244×278 sheet crop; 1.16 pixels per CSS pixel in adult gate | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 244×278 | Needs original artwork |
| crown.webp | `public/assets/icons` | 163×140 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 163×140 | Already clear |
| dictionary.webp | `public/assets/icons` | 122×97 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 122×97 | Already clear |
| games.webp | `public/assets/icons` | 127×91 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 127×91 | Already clear |
| listen.webp | `public/assets/icons` | 121×100 | 26×26 frame; 26×21 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 121×100 | Already clear |
| medal.webp | `public/assets/icons` | 124×140 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 124×140 | Already clear |
| microphone.webp | `public/assets/icons` | 115×133 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 115×133 | Already clear |
| puzzle.webp | `public/assets/icons` | 114×100 | 26×26 frame; 26×23 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 114×100 | Already clear |
| read.webp | `public/assets/icons` | 124×96 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 124×96 | Already clear |
| speaker.webp | `public/assets/icons` | 143×135 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 143×135 | Already clear |
| star.webp | `public/assets/icons` | 153×140 | 26×26 frame; 26×24 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 153×140 | Already clear |
| target.webp | `public/assets/icons` | 166×140 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 166×140 | Already clear |
| trophy.webp | `public/assets/icons` | 159×140 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 159×140 | Already clear |
| bird.webp | `public/assets/illustrations` | 1376×1143 | 210×174 frame; 210×174 painted | Clear current artwork; stale intrinsic dimensions/provenance and rebuild regression | Earlier imagegen replacement bypassed manifest and rebuild overrides | Synchronized dimensions/bytes/hash; archived exact current edit; override applied after Batch 1; revision URL | 1376×1143 | Fixed |
| cat.webp | `public/assets/illustrations` | 311×363 | 210×245 frame; 210×245 painted | Soft edges and face; limited high-density detail | 311×363 lossy WebP legacy crop; source softness plus 1.48× maximum-use density | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 311×363 | Needs original artwork |
| celebrate.webp | `public/assets/illustrations` | 2560×1308 | 480×291 frame; 480×245 painted | Blurred faces and contours at wide sizes | Batch 1 enlargement of soft 640×327 legacy source to 2560×1308 | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 2560×1308 | Needs original artwork |
| dog.webp | `public/assets/illustrations` | 2048×1969 | 210×202 frame; 210×202 painted | Soft fine detail despite 2K file | Batch 1 interpolation of soft 544×523 legacy source; not genuine 2K detail | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 2048×1969 | Needs original artwork |
| penguin.webp | `public/assets/illustrations` | 1403×1121 | 120×120 frame; 120×96 painted | Clear current artwork; stale intrinsic dimensions/provenance and rebuild regression | Earlier imagegen replacement bypassed manifest and rebuild overrides | Synchronized dimensions/bytes/hash; archived exact current edit; override applied after Batch 1; revision URL | 1403×1121 | Fixed |
| puzzle.webp | `public/assets/illustrations` | 2011×2048 | 210×214 frame; 210×214 painted | Soft hair, mouth and small features | Batch 1 interpolation of soft 550×560 legacy source | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 2011×2048 | Needs original artwork |
| rabbit.webp | `public/assets/illustrations` | 1388×1133 | 210×171 frame; 210×171 painted | Clear current artwork; stale intrinsic dimensions/provenance and rebuild regression | Earlier imagegen replacement bypassed manifest and rebuild overrides | Synchronized dimensions/bytes/hash; archived exact current edit; override applied after Batch 1; revision URL | 1388×1133 | Fixed |
| sentence.webp | `public/assets/illustrations` | 1988×1988 | 210×210 frame; 210×210 painted | Soft facial contours, halos inherited from source | Batch 1 interpolation of soft 497×497 legacy source | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 1988×1988 | Needs original artwork |
| story.webp | `public/assets/illustrations` | 1544×1018 | 480×291 frame; 441×291 painted | Clear current story illustration at displayed size | Earlier approved edit; lossy container without obvious blocking at current size | Preserved unchanged | 1544×1018 | Already clear |
| turtle.webp | `public/assets/illustrations` | 1372×1146 | 210×175 frame; 210×175 painted | Clear current artwork; stale intrinsic dimensions/provenance and rebuild regression | Earlier imagegen replacement bypassed manifest and rebuild overrides | Synchronized dimensions/bytes/hash; archived exact current edit; override applied after Batch 1; revision URL | 1372×1146 | Fixed |
| app-icon.webp | `public/assets/logos` | 315×297 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 315×297 | Already clear |
| wordmark-280.webp | `public/assets/logos` | 280×94 | 280×94 frame; 280×94 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 280×94 | Already clear |
| wordmark-560.webp | `public/assets/logos` | 560×188 | 280×94 frame; 280×94 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 560×188 | Already clear |
| wordmark.webp | `public/assets/logos` | 840×282 | 280×94 frame; 280×94 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 840×282 | Already clear |
| backpack.webp | `public/assets/mascots` | 329×445 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 329×445 | Already clear |
| celebrating.webp | `public/assets/mascots` | 390×385 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 390×385 | Already clear |
| encouraging.webp | `public/assets/mascots` | 308×307 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 308×307 | Already clear |
| reading-full.webp | `public/assets/mascots` | 349×390 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 349×390 | Already clear |
| reading.webp | `public/assets/mascots` | 331×318 | 215×207 frame; 210×202 painted | Clean native crop, soft at high-density hero sizes | 331×318 sheet crop; only 1.58 source pixels per painted CSS pixel at largest use | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 331×318 | Needs original artwork |
| thumbs-up.webp | `public/assets/mascots` | 319×385 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 319×385 | Already clear |
| welcome-original.webp | `public/assets/mascots` | 2048×1902 | 480×446 frame; 480×446 painted | Blurred contours and facial detail at wide display sizes | Batch 1 enlarged a soft 703×653 legacy image to 2048×1902; missing detail is baked into pixels | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 2048×1902 | Needs original artwork |
| apple.webp | `public/assets/objects` | 223×247 | 210×233 frame; 210×233 painted | Clean native crop, insufficient high-density hero detail | 223×247 sheet crop; 1.06 pixels per CSS pixel in practice | Preserved pixels; verified correct file and aspect-preserving rendering; needs matching high-resolution original | 223×247 | Needs original artwork |
| blocks.webp | `public/assets/objects` | 240×191 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 240×191 | Already clear |
| books.webp | `public/assets/objects` | 301×189 | 70×65 frame; 70×44 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 301×189 | Already clear |
| cloud.webp | `public/assets/objects` | 2048×1151 | Not used on current routes | Clear at ordinary preview sizes; not certified as genuine 2K detail | Batch 1 upscaled clean 651×366 artwork; currently unused | Preserved unchanged | 2048×1151 | Already clear |
| open-book.webp | `public/assets/objects` | 304×177 | 50×50 frame; 50×29 painted | No visible defect at native preview/current use | None found at current use | Preserved unchanged | 304×177 | Already clear |
| pencil.webp | `public/assets/objects` | 113×181 | Not used on current routes | No visible defect at native preview/current use | None found; unused assets require density review before larger use | Preserved unchanged | 113×181 | Already clear |

The wordmark uses one logical asset with 280/560/840-pixel variants. The browser selected the 560-pixel version in the tested density/slot combinations, including 280 CSS pixels at 2× and 174 CSS pixels at 3×. The other variants were independently fetched and hash-verified.

## Exact originals still required

Supply the same pose, face, proportions, colors, framing and existing matte/alpha. These minimum targets use three times the largest measured painted area; they must be genuine source detail, not another enlarged export.

| Asset | Largest painted area | Suggested genuine source minimum | Why |
|---|---:|---:|---|
| `mascots/welcome-original.webp` | 480×446 | 1440×1338 | Blurred contours and facial detail at wide display sizes |
| `mascots/reading.webp` | 210×202 | 630×606 | Clean native crop, soft at high-density hero sizes |
| `characters/teacher.webp` | 210×239 | 630×718 | Clean native crop, insufficient Retina detail |
| `characters/reader.webp` | 273×284 | 819×852 | Insufficient high-density passage/hero detail |
| `objects/apple.webp` | 210×233 | 630×698 | Clean native crop, insufficient high-density hero detail |
| `illustrations/cat.webp` | 210×245 | 630×736 | Soft edges and face; limited high-density detail |
| `illustrations/dog.webp` | 210×202 | 630×606 | Soft fine detail despite 2K file |
| `illustrations/puzzle.webp` | 210×214 | 630×642 | Soft hair, mouth and small features |
| `illustrations/sentence.webp` | 210×210 | 630×630 | Soft facial contours, halos inherited from source |
| `illustrations/celebrate.webp` | 480×245 | 1440×736 | Blurred faces and contours at wide sizes |

The remaining unused backgrounds, alternate mascots, characters and objects are usable at native/small sizes. Recheck their native dimensions before adding larger placements.

## Compression and rendering findings

Of the 50 shipped files, **48 use lossless WebP VP8L**; cat and story use lossy VP8. The story looks clear at its current display size and was not touched. Cat is visibly soft, but the exact encoder quality and how much blur predates WebP cannot be recovered from the container alone. File size or a numeric sharpness score is not used as a substitute for visual inspection.

No active asset is stretched to fill an incompatible ratio. Every observed image uses aspect-preserving scale-down. The low-density flags are teacher (minimum 1.16×), reading owl (1.58×), reader (1.00×), apple (1.06×), and cat (1.48×). Upscaled Batch 1 files can exceed the numerical density requirement while still looking blurry; the report deliberately flags their source quality separately.

## Browser and test evidence

- Production build: **passed**, including TypeScript, Vite, image-content validation, audio audit and offline generation.
- Unit tests: **7 passed**.
- Browser suite: **26 passed on the full run; the new cache test initially asserted before asynchronous cache cleanup completed.** After correcting that timing assertion, all four image/cache tests passed, including the previously failing test. All 24 pre-existing browser tests passed, including all 36 lesson completions and audio behavior; all three added tests passed on their final runs.
- Production audit: **865 states, zero errors**, at viewport/DPR pairs **320/2×, 393/3×, 412/2.625×, 768/2× and 1440/2×**. No broken images, horizontal overflow, JavaScript page errors or CSS enlargement.
- All **50 distinct served asset URLs** returned bytes matching the intended local SHA-256, including unused files and responsive variants.
- Captured **341 screenshots**. All 173 phone states were visually reviewed in contact sheets; selected tablet and desktop screens were also reviewed at full screenshot resolution. The other captures remain available for inspection; automated checks do not certify their visual sharpness.
- Routes include welcome, roles, profiles, language selection, every student route/practice mode, dictionary animals and food, all English/Filipino lesson intros/practice/image-bearing questions/results, adult gates and tabs, completed daily quest, and not-found. The Things dictionary contains no artwork.
- Inline SVG icons remained crisp in reviewed screens. Physical devices and other browser engines were not tested.
- Isolated asset rebuild: **50/50 files unchanged**. Source inventory: **zero invalid files, broken manifest paths, stale metadata or stale revisions**.
- The build reports existing missing audio recordings (Filipino 3/79, English 0/77 recorded coverage). Audio content was not changed by this task.

Machine-readable route measurements and served checksums: [image-rendering-audit.json](image-rendering-audit.json). Full captures: `/tmp/basabuddy-quality-20261105/screens/`. Reviewed atlases, source comparisons and selected full-resolution screens are retained in [visual-evidence.zip](../reference/asset-backups/2026-11-05-quality-audit/visual-evidence.zip).

## Non-shipped images and preservation

All 136 non-shipped image files remain unchanged (except adding five byte-identical approved-edit safety copies). Their individual paths, dimensions, sizes, compression and checksums are listed in the inventory; the table below records their role and visual-review scope. They are not silently promoted to app assets.

| File | Resolution | Role / visual finding | Action |
|---|---:|---|---|
| `reference/asset-edits/approved-current/characters/student.webp` | 1214×1296 | Exact current-edit safety copy; same visual findings as canonical file | Preserved; not shipped |
| `reference/asset-edits/approved-current/illustrations/bird.webp` | 1376×1143 | Exact current-edit safety copy; same visual findings as canonical file | Preserved; not shipped |
| `reference/asset-edits/approved-current/illustrations/penguin.webp` | 1403×1121 | Exact current-edit safety copy; same visual findings as canonical file | Preserved; not shipped |
| `reference/asset-edits/approved-current/illustrations/rabbit.webp` | 1388×1133 | Exact current-edit safety copy; same visual findings as canonical file | Preserved; not shipped |
| `reference/asset-edits/approved-current/illustrations/turtle.webp` | 1372×1146 | Exact current-edit safety copy; same visual findings as canonical file | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/bird.webp` | 2048×1703 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/celebrate.webp` | 2560×1308 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/dog.webp` | 2048×1969 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/penguin.webp` | 2048×1638 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/puzzle.webp` | 2011×2048 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/rabbit.webp` | 2048×1672 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/sentence.webp` | 1988×1988 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/illustrations/turtle.webp` | 2048×1710 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/mascots/welcome-original.webp` | 2048×1902 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/enhanced-batches/objects/cloud.webp` | 2048×1151 | Batch 1 candidate; inspected side-by-side and native crops; upscaling is not recovered detail | Preserved; not shipped |
| `reference/asset-edits/story-approved.webp` | 1544×1018 | Approved wordmark/story source; preserved; visually checked | Preserved; not shipped |
| `reference/asset-edits/wordmark-simple.png` | 2164×727 | Approved wordmark/story source; preserved; visually checked | Preserved; not shipped |
| `reference/asset-sheets/backgrounds.png` | 2172×724 | Source sheet overview; individual native crops constrain usable detail | Preserved; not shipped |
| `reference/asset-sheets/characters.png` | 1672×941 | Source sheet overview; individual native crops constrain usable detail | Preserved; not shipped |
| `reference/asset-sheets/features.png` | 2172×724 | Source sheet overview; individual native crops constrain usable detail | Preserved; not shipped |
| `reference/asset-sheets/learning.png` | 1402×1122 | Source sheet overview; individual native crops constrain usable detail | Preserved; not shipped |
| `reference/asset-sheets/mascots.png` | 1122×1402 | Source sheet overview; individual native crops constrain usable detail | Preserved; not shipped |
| `reference/exports/01 · START HERE — Onboarding → Choose role.png` | 5868×1960 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/exports/AUTO DEMO — Student sequence · presentation copies, not additional required lessons.png` | 5868×5624 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/exports/AUTO DEMO — Teacher area.png` | 5868×1960 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/exports/CURRICULUM REFERENCE — Existing 30-lesson Filipino/English plans · separate from the 18-lesson screen flow.png` | 5868×1960 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/exports/FEATURE REFERENCE — Worlds/games/stories/review overview boards · documentation, not app steps.png` | 5868×1960 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/exports/STUDENT — Read sections 02–10 top to bottom; screens left to right. Supporting states are optional branches..png` | 4681×32768 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/exports/TEACHER — Dashboard → Students → Reports → Choose assignment → Confirmation.png` | 5868×1960 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/identity/Components.png` | 1712×2904 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/identity/Foundations.png` | 1712×2210 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/identity/Prototype.png` | 2000×3004 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/identity/Screens.png` | 4780×13580 | Large reference board overview only; no exhaustive native-pixel quality certification | Preserved; not shipped |
| `reference/legacy-assets/apple.webp` | 470×360 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/bird.webp` | 196×163 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/cat.webp` | 311×363 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/celebrate.webp` | 640×327 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/child.webp` | 440×397 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/dog.webp` | 544×523 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/owl.webp` | 703×653 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/penguin.webp` | 200×160 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/puzzle.webp` | 550×560 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/rabbit.webp` | 196×160 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/sentence.webp` | 497×497 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/story.webp` | 703×464 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/student.webp` | 513×417 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/teacher.webp` | 424×423 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/legacy-assets/turtle.webp` | 200×167 | Historical crop; several have visible softness/pixelation; not a higher-quality replacement | Preserved; not shipped |
| `reference/previous-generated/apple-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/bird-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/cat-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/dog-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/owl-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/penguin-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/rabbit-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/story-storybook.webp` | 1536×1024 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/previous-generated/turtle-storybook.webp` | 1254×1254 | Different storybook designs; visually clear previews but incompatible identity | Preserved; not shipped |
| `reference/unused-public-copies-20261105/backgrounds copy/classroom.webp` | 530×258 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/backgrounds copy/meadow.webp` | 489×258 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/backgrounds copy/park.webp` | 664×425 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/backgrounds copy/school.webp` | 676×425 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/backgrounds copy/sky.webp` | 485×258 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/characters copy/reader-glasses.webp` | 244×278 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/characters copy/reader.webp` | 273×284 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/characters copy/schoolboy.webp` | 219×283 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/characters copy/schoolgirl.webp` | 248×277 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/characters copy/student.webp` | 267×285 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/characters copy/teacher.webp` | 244×278 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/crown.webp` | 163×140 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/dictionary.webp` | 122×97 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/games.webp` | 127×91 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/listen.webp` | 121×100 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/medal.webp` | 124×140 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/microphone.webp` | 115×133 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/puzzle.webp` | 114×100 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/read.webp` | 124×96 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/speaker.webp` | 143×135 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/star.webp` | 153×140 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/target.webp` | 166×140 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/icons copy/trophy.webp` | 159×140 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/bird.webp` | 784×652 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/cat.webp` | 311×363 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/celebrate.webp` | 1280×654 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/dog.webp` | 544×523 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/penguin.webp` | 800×640 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/puzzle.webp` | 550×560 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/rabbit.webp` | 784×640 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/sentence.webp` | 497×497 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/story.webp` | 1544×1018 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/illustrations copy/turtle.webp` | 800×668 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/logos copy/app-icon.webp` | 315×297 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/logos copy/wordmark-280.webp` | 280×94 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/logos copy/wordmark-560.webp` | 560×188 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/logos copy/wordmark.webp` | 840×282 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/mascots copy/backpack.webp` | 329×445 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/mascots copy/celebrating.webp` | 390×385 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/mascots copy/encouraging.webp` | 308×307 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/mascots copy/reading-full.webp` | 349×390 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/mascots copy/reading.webp` | 331×318 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/mascots copy/thumbs-up.webp` | 319×385 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/mascots copy/welcome-original.webp` | 703×653 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/objects copy/apple.webp` | 223×247 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/objects copy/blocks.webp` | 240×191 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/objects copy/books.webp` | 301×189 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/objects copy/cloud.webp` | 651×366 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/objects copy/open-book.webp` | 304×177 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `reference/unused-public-copies-20261105/objects copy/pencil.webp` | 113×181 | Unused duplicate/older crop; visually reviewed in source atlas; may retain source blur | Preserved; not shipped |
| `tests/screenshots/dictionary-mobile.png` | 393×1042 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/home-desktop.png` | 1440×1009 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/home-mobile.png` | 393×921 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/levels-mobile.png` | 393×1428 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_learn_en_L01.png` | 393×904 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_roles.png` | 393×852 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_daily.png` | 393×852 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_dictionary.png` | 393×1042 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_home.png` | 393×921 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_journey.png` | 393×1091 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_levels.png` | 393×1428 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_practice_aloud.png` | 393×994 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_practice_find.png` | 393×1079 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_practice_puzzle.png` | 393×1073 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_practice_repeat.png` | 393×1009 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_practice_sentence.png` | 393×1069 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_practice_story.png` | 393×1320 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_settings.png` | 393×852 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_student_stories.png` | 393×1034 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/_welcome.png` | 393×854 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/language.png` | 1280×939 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/profiles.png` | 1280×939 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/teacher-assignment.png` | 1280×939 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/polish/teacher-dashboard.png` | 1280×1387 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/story-mobile.png` | 393×1320 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |
| `tests/screenshots/welcome-mobile.png` | 393×854 | Historical UI capture reviewed as overview; not current artwork/source evidence | Preserved; not shipped |

## Reproduction and rollback

Starting files and previous audit: [before.zip](../reference/asset-backups/2026-11-05-quality-audit/before.zip). The relocated duplicate folder is available intact under `reference/unused-public-copies-20261105/`. Existing unrelated workspace changes were preserved; browser-test-written historical screenshot changes were restored after testing.

```sh
npm run audit:images
npm run build
npm test
npx playwright test
npm run preview -- --host 127.0.0.1 --port 4173
# In another terminal:
IMAGE_AUDIT_OUT=/tmp/basabuddy-image-audit node scripts/audit-image-screens.mjs
```

After a deliberate image replacement, run `npm run sync:images` before auditing/building. This requires Python and Pillow, as do the existing extraction scripts. Approve a rebuild override only after visual and identity review.

Production cache changes take effect when the updated build/worker is served. Already-painted pixels are not forcibly reloaded mid-lesson; navigation/reload after worker activation uses the new bytes. A tab still running an older production bundle may need one reopen, especially if that old worker prevents development JavaScript from loading at all. No learner profiles, progress, recordings or unrelated caches were cleared.
