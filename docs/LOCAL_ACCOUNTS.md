# Device-only parent accounts

The user selected accounts stored only on this device. The login and sign-up
screens follow the supplied BasaBuddy reference and work on static GitHub Pages.

- `/signup`: parent name, email, password confirmation, optional profile photo.
- `/login` and `/signin`: email/password login; guest reading stays available.
- `/account`: change/remove the photo, choose a reader, log out, or delete the account.
- Account links are available on welcome, reader selection, and student settings.

Account records and photos live in IndexedDB (`basabuddy-accounts`). Passwords
are verified using PBKDF2-SHA-256 with 310,000 iterations and a unique random
16-byte salt. Plaintext passwords are never persisted. The current tab's account
ID is stored in sessionStorage, so reload keeps the session and closing the tab
ends it. A fresh tab starts as a guest.

Each account has a distinct `basabuddy:v1:account:<id>` reader store. Existing
guest data remains at `basabuddy:v1`. Switching accounts remounts the progress
provider with the correct store, stopping audio and preserving the previous
account's progress. Each account has its own device-local teacher PIN as well.

JPG, PNG, and WebP photos up to 5 MB are accepted, decoded and center-cropped
to 256×256 JPEG in the browser. SVGs and unreadable images are rejected.

Deletion requires the current password and typing `DELETE`. It removes only that
account's record, photo, readers and reading data. Other accounts and guest data
are retained. Other open tabs are notified when an account is deleted.

These accounts do not provide email verification, email password recovery,
cross-device sync, or a secure boundary against someone with access to browser
data. Clearing site storage removes the accounts. The interface states these
device-only limits; no email is sent and no cloud authentication is implied.

Verification: six account browser scenarios cover session restoration, salted
password verification, profile-photo persistence and validation, account data
isolation, deletion confirmation and preservation of other users, plus layouts
at 320, 393, 768 and 1440 pixels. Existing unit and reader-role tests also pass.
