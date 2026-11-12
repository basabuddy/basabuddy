# Device-only parent accounts

The user selected accounts stored only on this device. The login and sign-up
screens follow the supplied BasaBuddy reference and work on static GitHub Pages.

- `/signup`: parent name, email, Grade 1–3, password confirmation, optional profile photo.
- `/login` and `/signin`: email/password login; guest reading stays available.
- `/account`: edit name, email and grade, change password, change/remove the photo, choose a reader, log out, or delete the account.
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

Verification: ten account browser scenarios cover session restoration, salted
password verification, profile-photo persistence and validation, account data
isolation, deletion confirmation and preservation of other users, plus layouts
at 320, 393, 768 and 1440 pixels. Existing unit and reader-role tests also pass.

Account details have an explicit Save button. Email and password changes require the current password; duplicate emails are rejected without changing the account. Existing accounts without a grade default to Grade 1. The first reader inherits the account name and grade; editing those account details updates that reader only while its name still matches the previous account name. IDs and progress are preserved. Customized readers retain their own details. Student settings also provide an independent reader-name and reader-grade form.

Sign-up now automatically creates and selects the first reader using the account name and grade, then opens language selection. Login opens the active reader’s home directly. Session restoration and login also initialize older accounts with no reader; repeated visits preserve existing readers, active selection, and progress. Additional readers remain optional through Choose a reader. Guest onboarding remains available.
