# Filipino dictionary audio repair

The dictionary had bundled recordings for only 9 of 90 Filipino words. Devices without a local Filipino voice could play English but could not pronounce the other 81 Filipino words.

Added 81 fixed-word Microsoft Edge TTS recordings with the fil-PH-BlessicaNeural voice at -15% rate. Existing recordings remain intact. Exact lowercase dictionary words map to local MP3 files in the existing manifest. No runtime speech service or learner data is involved. The production build includes the files in its offline cache.

All 90 Filipino dictionary entries now have bundled audio. New clip provenance and SHA-256 hashes are in DICTIONARY_FILIPINO_AUDIO.json. Synthetic pronunciation still needs fluent-speaker listening review.

Verification: production build passed; all 90 Filipino files decoded with non-silent audio in Chromium; native Isda playback passed with speech synthesis disabled; 23 existing dictionary and audio checks passed. Offline production playback was not confirmed in this pass.
