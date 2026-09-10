# FaithPresenter Phase 5 — Songs and services

Version 0.5.0 · Windows x64 portable development build · Includes Phases 1–4

## Upgrade

1. In your working Phase 4 app, wait for Saved and click **Back up database**. Keep the backup. For church/display settings too, copy the full profile folder while the app is closed.
2. Close FaithPresenter completely.
3. Extract **FaithPresenter-Phase-5-Windows-Portable.zip** into a new folder. Do not merge it into Phase 4.
4. Run **FaithPresenter.exe** inside `FaithPresenter-Phase-5-Windows`. Keep its DLLs and resource folders together.
5. Confirm v0.5.0, your church name and existing services. Keep the Phase 4 folder and backup until testing passes.

The application remains offline and uses the same profile and service database. An additional songs table is created; existing service records are not converted or reset. The portable app requires no Node.js installation. This is not a Setup installer or a finished public release.

## Create your first song

1. In Operator click **Open song library ↓**, or scroll to the resource tabs and select **Songs**.
2. Click **＋ New song** and enter a title. Author and copyright/licence notes are optional.
3. Choose one of the four existing backgrounds.
4. In **Verse 1**, paste or type lyrics you own or have permission to reproduce.
5. Use a single line break for another line on the same slide. Use a **blank line** to start another slide.
6. Click **＋ Add section**. Rename it **Chorus**, **Verse 2**, **Bridge**, etc., and enter its lyrics.
7. Under Arrangement, click a section to append another occurrence. Use Up/Down to reorder occurrences or Remove to remove only that occurrence.
8. Click **Save song**. Wait for **Song saved**.

Example arrangement: Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus. Repeated sections reuse the same lyrics but generate independent slide instances in the service. Section labels and author/copyright notes are not projected; only lyrics and the selected background are copied. Add any required displayed attribution yourself as a service slide.

No licensed song catalogue, SongSelect/CCLI connection, downloads, automatic licensing verification or lyrics scraping is included. This phase is for your own authorised lyric entry.

## Add it to a service

1. Open the service you want in the existing service library.
2. Open the song in Songs. Finish edits and click **Save song** first.
3. Click **Add saved arrangement to service**. A new service item is appended and selected.
4. Return to the Slides tab or scroll up to inspect the generated slides. Wait for the service **Saved** status, or click **Save now** if autosave is off.
5. Open audience output, select a slide and click **Take Live** as in Phase 4.

Adding the same song again creates another independent item. Later library edits, library deletion or arrangement changes do **not** rewrite existing service copies or live output. To use revised lyrics, add the saved arrangement again, review it and remove the obsolete service item yourself. There is no automatic sync or replace-existing-song action in this phase.

## Saving and recovery

- **Save song** saves the song library record. **Save now / service autosave** saves the service schedule. These are separate operations.
- Unsaved song edits remain when switching resource tabs or navigation pages. Save or explicitly confirm discard before opening another song.
- Closing with unsaved lyrics shows a warning. Choose Keep editing and Save song; do not rely on service autosave for lyrics.
- Failed saves retain the draft in the editor. Fix the problem and retry; do not close/discard if you need those edits.
- **Duplicate song** creates an independent library copy.
- **Move song to bin** asks for confirmation and is recoverable. Open **Song recycle bin** and select **Restore song**.
- **Discard song edits** asks for confirmation. It returns to the last saved song or removes an unsaved new-song draft.
- There is no song revision-history browser yet. Service saved-version history remains unchanged.
- Save all song edits before **Back up database**. That backup includes saved songs, arrangements, song recycle-bin entries and existing services. It does not include unsaved editor drafts or separate profile settings. Copy backups off the computer for protection from disk failure.

## Limits and projection

A song supports 40 sections, 8,000 characters per section, 40,000 total lyric characters and 100 arrangement entries. Generated service items support at most 100 slides, each at most 2,000 characters. Empty arranged sections and oversized expansions are rejected with an explanation. Split long blocks with blank lines and shorten overly long arrangements.

The audience renderer still uses 16:9 slides and automatic text fitting. Split lengthy lyrics for readability. Preview and editing remain independent from Live. Output opens black; no slide automatically replays after reopening. Use **Blackout**, not Close audience, to keep the projector blank—closing can expose the Windows desktop.

## Please test on Windows

- [ ] Existing services/settings remain after upgrade.
- [ ] Create a song with Verse 1, Chorus and Verse 2; save it.
- [ ] Repeat the chorus in the arrangement and confirm the order.
- [ ] Blank lines generate the expected separate slides.
- [ ] Close/reopen: the song, lyrics and arrangement remain.
- [ ] Search by title, author and a lyric phrase.
- [ ] Add a saved arrangement to a service and confirm slide order.
- [ ] Edit the library song: the existing service copy stays unchanged.
- [ ] Project generated slides using Take Live; preview edits stay private.
- [ ] Duplicate a song; remove and restore the copy using Song recycle bin.
- [ ] Test discard confirmation and the unsaved-song close warning.
- [ ] Save the song and service, then create a database backup.

## Build verification

Automated tests cover persistence, database upgrade preservation, lyric search, arrangement splitting/repetition, unique slide IDs, validation, stale save/build conflicts, duplication/recycle/restore, backup inclusion and snapshot isolation, plus previous-phase regressions. A real-React/SQLite integration test uses simulated Electron windows and IPC to exercise the song editor, failed saves, unsaved-close warning, tab persistence, service insertion and live output.

These checks do not substitute for native Windows, visual layout, mixed-DPI or physical projector testing. No Setup installer or code signing is included. Bible, media playback, stage display and advanced themes remain later phases.

Developers: Node.js 24+, `npm ci`, `npm test`, `npm run test:ui`, `npm start`. Windows installer build configuration remains available through `npm run make:windows`, but no Setup executable is delivered or installation/uninstallation verified here.

Next: Phase 6 — Slide editor and themes, after your Phase 5 checks pass.
