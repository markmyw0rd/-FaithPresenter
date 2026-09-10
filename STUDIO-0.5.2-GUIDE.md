# FaithPresenter Studio 0.5.2

Windows x64 portable development release · an enhancement of 0.5.1.

## Upgrade safely

1. In the working version, save your service and any song edits, then create a database backup. Close FaithPresenter.
2. Keep the previous program folder and backup. Extract the entire new Windows Portable ZIP into a **new folder**; do not merge app folders or move only the EXE.
3. Open FaithPresenter.exe from the new folder. Confirm v0.5.2 in the status bar.
4. Check your existing services and songs before using any new feature.

This release upgrades the database to schema 2. When upgrading schema 1, it automatically creates a `Before-0.5.2-….sqlite` backup before the schema change. Previous app versions will refuse the upgraded database; retaining the old program folder alone is not a rollback. Keep the pre-upgrade database backup as well. Do not overwrite the active database while the app is open. Ask for help before restoring a database manually.

## Colour-coded song sections

Select a slide, choose **Edit**, and set:

| Setting | Behaviour |
| --- | --- |
| Section label | Footer text such as Verse 1 or Chorus |
| Colour | Verse blue, chorus rose, bridge purple, tag red, intro/outro gold, other grey |
| Jump key | Optional A–Z or 0–9 badge |

With the workspace focused, **Alt + the jump key** selects the first matching slide in the current item for Preview. Shortcuts are ignored while typing, while the manager is open, or while the service is loading. They never Take Live. Use unique keys within an item to avoid ambiguity.

New arrangements added from the song library automatically keep each section's label and infer its colour from names beginning Verse, Chorus, Bridge, Tag, Intro or Outro. Existing service slides have no recoverable section metadata; label them manually or add a fresh saved arrangement. No existing slide text is rewritten.

The **Lyrics only** checkbox shows checkerboard thumbnails for easier lyric scanning. The checkerboard is an operator-only editing aid—not projected transparency. Preview and audience output still use the actual background.

## Local image and motion backgrounds

1. Open **Media** in the toolbar or bottom dock.
2. Choose **Import image / video** and select one local file.
3. Select a service slide. Choose whether to **Apply to whole item**, then click the imported media card.
4. Check Preview, then explicitly **Take Live**.

Supported containers: PNG, JPEG, WebP, MP4 and WebM; maximum 250 MB per file. Container recognition is not a guarantee that a particular video codec will decode. Test your files on the actual Windows computer. Videos are **silent motion backgrounds**: no audio playback, mixer or audio meters are supplied. Images and videos fill the slide using a centre crop. There is no crop editor in this release.

Imports create managed local copies and leave originals untouched. Removing a background detaches it from the selected slide/item; it does not delete the media file. There is no permanent media deletion command yet, so imported assets remain available for saved history and other services.

Video thumbnails show a motion-background tile rather than decoding every video in the grid. Preview shows a paused video frame. Taking a new video Live starts it at the beginning and loops it. Taking another lyric slide using the **same media ID** keeps the live video position and play/pause state. This makes one motion background usable across an entire song without restarting on every lyric slide.

## Live video transport

Below Live snapshot, scroll to the **LIVE BACKGROUND · SILENT** controls:

- Play / pause, restart, −15 seconds and +15 seconds.
- Seek bar with elapsed and remaining time.
- Loop on/off.

These controls operate the Live background, not Preview. Clearing text keeps the background playing. Blackout covers the output in true black while the video clock continues. A church card replaces the background temporarily. Close audience output to stop presentation entirely.

The main process distributes playback commands and timestamps to the two renderers. The operator snapshot is not a frame-locked broadcast monitor; timing/decoding can differ slightly from the physical display. An “Applied” state confirms a renderer update, not a physical projector or successful media decode. Media errors are shown separately. If an unsupported video is reported, use another file or convert it to a compatible WebM/MP4 externally.

## Operator countdown

Open **Timers**. Name the timer, set 1–180 minutes, and use Start, Pause and Reset. Switching resource tabs does not reset it. At zero, the timer stops and changes colour.

This is an **operator-only countdown**, with no alarm, stage feed or audience overlay. It resets when the application closes. It is not an automatic slide trigger.

## Backups now contain media

**Manage services → Back up database** creates a `.sqlite` file **and a matching `.sqlite.media` folder**. Keep both together, and copy both to your backup drive. The database contains services, slides, songs and media references; the matching folder contains the imported media bytes. A database-only copy is no longer a complete backup when media is in use.

If media copying fails, the app reports that the backup is incomplete. Do not discard the original profile or treat the database copy as a complete backup. Restore is not automated in this release.

## Acceptance check on your Windows computer

1. Reopen the app and verify existing services, songs and new section labels.
2. Import one image and one short video that you own or are permitted to use.
3. Apply the video to an item, Take Live, then switch lyrics. Confirm the video does not restart.
4. Test pause, play, seek, restart, loop, clear text, church card and blackout.
5. Check that editing labels/text, changing Preview and using Alt shortcuts never changes Live without Take Live.
6. Start the timer, switch tabs, return, pause and reset it.
7. Make a backup and verify both the SQLite file and matching media folder exist.
8. Test a secondary display/projector, disconnect/reconnect handling, and your longest service in rehearsal.

Automated checks cover persistence, upgrade backup, managed imports, range serving, live transport validation and existing service/song/output regressions. Browser checks exercise the actual interface and HTML video playback through the app's media-serving code with synthetic test content. These checks do not replace native Windows and physical projector testing. This is an unsigned portable development build, not a signed installer or a production-certified presentation system.

## Still outside this release

Bible import/search, stage display, audio playlists/meters, text highlight-strip styling, advanced slide composition, video transitions, countdown projection, streaming and ProPresenter proprietary content/integrations. The reference screenshots guide the workflow; this is FaithPresenter, not a full ProPresenter clone. No copyrighted lyrics or reference videos are bundled.

## Build from source

Use Node.js 24 or later. Run `npm ci`, `npm run build`, `npm test`, and `npm run test:ui`. Run `npm start` to launch Electron. `npm run package -- --platform=win32 --arch=x64` packages the Windows runtime; run installer-making on a properly configured Windows build machine. Visual checks use Playwright and FFmpeg (`node scripts/test-visual.mjs`), neither of which is needed by the portable app.

The media protocol follows Electron's documented streaming protocol support: https://www.electronjs.org/docs/latest/api/protocol . Rendering stays sandboxed, and native file selection is restricted to the operator window.
