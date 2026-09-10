# FaithPresenter Phase 8 — Media playback and announcements

Version 0.8.0 · cumulative Windows x64 portable development release.

## Upgrade first

1. In Phase 7, back up the database. Keep its `.sqlite` file AND matching `.media` folder. Close every FaithPresenter window.
2. Keep the Phase 7 program/source folder as a recovery copy. Extract Phase 8 into a NEW folder; do not mix application files between releases.
3. For the Source download: open the folder containing `package.json` in VS Code, run `npm ci`, then `npm start`. Node.js 24 or newer is required. Start rebuilds before opening the desktop app.
4. For the Windows Portable download: extract everything, then double-click `FaithPresenter.exe`. Keep its accompanying runtime files together; no Node.js installation is needed for this portable build.
5. Confirm v0.8.0 in the status bar and verify your songs, services, Bible translations, themes and media.

**This release upgrades the database from schema 3 to 4. Older releases cannot open the upgraded database.** A pre-upgrade SQLite snapshot is created in the backups folder, but it is not a full media backup. Keep the complete manual backup from step 1. Do not run two versions against the same data folder. A rollback requires restoring the old database with its matching media, not simply reopening an older EXE.

The source is based on the saved Phase 7 release. Unshared edits on your Windows computer are not included. The dependency lock has been regenerated and verified with a clean `npm ci`.

## Media library

Open **Media**. The dock expands to show import, filter, refresh and media cards.

- Images: PNG, JPEG and WebP.
- Videos: MP4 and WebM.
- Audio: MP3, WAV, OGG and M4A.
- Maximum 250 MiB per file; one file per import.
- Files are copied into the application's managed media folder. The original source is untouched and is no longer needed for playback after import.
- Cards show name, type, extension and file size. Images show dimensions, videos show a first-frame thumbnail, duration and dimensions, and audio shows duration and a music icon. Metadata is read when the card loads; it is not a separate permanent thumbnail database.
- **Refresh media** checks the library again, including missing managed files. An unreadable or unsupported preview is labelled on its card.

Select a service slide, then click a media card to assign it. With **Apply to whole item** enabled, the same media is assigned to every slide in that item. **Remove media** clears the assignment on the slide or whole item according to the checkbox.

There is one media assignment per slide. An audio track can accompany text over a built-in colour/gradient, but independent audio plus a separate image/video layer is not supported yet. Media cards and operator Preview are always silent and do not automatically send content live.

## Video sound and audio playback

1. Select a slide with video or audio assigned.
2. Open the audience output and **Take Live**.
3. The media starts playing **muted**. Review the image and use **Unmute audio** when ready.
4. Adjust **Volume**, **Play media / Pause media**, the position slider, ±15 seconds, **Restart** and **Loop media** in the Live media panel.

New media starts muted at 100% volume. Video defaults to looping; audio defaults to playing once. Unmuting does not restart playback. Use Restart and then Play if you want to hear it from the beginning. Restart moves to zero but preserves the play/pause state.

Only the audience renderer produces sound. The operator's Preview, Live snapshot, slide thumbnails and media cards remain muted, avoiding duplicate audio. Sound follows the Windows default output device; configure your speakers, mixer or HDMI audio in Windows. This release does not provide an in-app audio-device selector.

Moving between slides that use the SAME media ID preserves play position, volume, mute and looping. Taking a DIFFERENT media file resets transport and starts that new media muted. Taking a slide with no media stops the previous file.

- **Blackout** stops automatic announcements, pauses media, and covers the audience in black. Restoring the image keeps playback paused; press Play when ready.
- **Church card** stops announcements and pauses media.
- **Clear text** stops announcements and removes the words; media and sound continue.
- **Close audience**, display disconnection and audience-window failure stop playback by closing the audience window. Reopening starts black and does not replay old content.
- At the end of a non-looping file, the transport changes to stopped/paused. Use Restart to return to its beginning.

Volume and playback controls are session controls, not saved mix settings. They reset when the app/output restarts or a different media file is taken live. Rehearse every cue on the presentation computer and check physical sound levels before the service.

## Announcement slideshows

1. Create a service item, name it (for example, Weekly announcements), and add slides.
2. Edit their text and assign image backgrounds in Media. With different images per slide, turn OFF **Apply to whole item** before assigning each one.
3. Use **← Slide** and **Slide →** to order the selected slide. Service item Up/Down controls still reorder entire items.
4. Select the item and open **Announcements** in the resource tabs.
5. Set 2–300 seconds per slide and choose whether to repeat the item.
6. Open the audience output, then click **Start announcements live**. This immediately takes the first slide live.
7. Use **Stop announcements** in the dock or above the audience controls to stop automatic changes. The current slide remains visible.

Announcements support text and image slides only, up to 100 slides. Items containing audio or video are rejected. Every slide uses the same interval. This release has cut transitions; it does not include crossfades or per-slide timings.

The running slideshow is an independent snapshot. Editing the item, selecting another slide or switching services does not change the running copy. Stop and start again to publish changes. A manual Take Live, Blackout, Clear text, Church card, output close or disconnection cancels automatic changes. Playback does not restart automatically afterward.

With repeat off, the final slide remains visible when its interval finishes. With repeat on, playback wraps to the first slide. The interval/repeat controls are session-only; service slide content and order use normal autosave.

## Missing files and codecs

Import checks file type, size and basic container headers; it cannot guarantee that every codec inside a supported container will decode. A damaged file can have a valid header. Use the live output to test actual playback.

A missing library file is marked after Refresh. A missing file is rejected when taking it live. Unsupported decoding produces an operator error from the audience window. Re-import a working file and reassign it; do not rename an extension to disguise its format. Media cannot be relinked automatically, and removal from the library itself is not included yet.

If audio is silent: check Unmute, volume, Play state, Windows output selection and the physical mixer/speakers. The operator preview is intentionally silent. If a video fails, try a correctly encoded WebM or MP4. Exact codec availability needs testing on Windows.

## Windows acceptance checklist

- Existing Phase 7 services, Bible, songs, themes and media remain intact after upgrade and restart.
- Import a video containing sound. Take Live; verify it initially plays muted.
- Unmute and adjust volume. Confirm sound comes through the intended Windows device, without doubled audio.
- Pause, seek, restart and loop. Blackout must pause and silence; restoring must not automatically resume.
- Import an audio file; assign it, Take Live, unmute, pause and seek. Test non-looping completion.
- Advance between lyric slides using the same media: playback should continue. A different media file starts muted.
- Build an image/text announcement item, reorder slides, run it, and verify repeat on/off.
- Edit a slide while announcements run: the live copy must stay unchanged. Stop and restart to show the change.
- Test Stop announcements, manual Take Live, Blackout and audience close.
- Restart the app; check media assignments and slide order persisted.
- Back up the database and confirm the matching media folder contains the imported files.
- Rehearse on the real projector and sound system, including Windows display scaling and sound-device selection.

## Verification and release status

82 automated tests passed. Tests cover migration snapshots, existing features, audio import/backup/range serving, missing media, transport validation and completion, slideshow snapshots/looping and cancellation. The service/song/Bible integration suite uses real SQLite and simulated Electron windows. New media/controller tests also run under Electron's bundled Node runtime.

The browser test uses production renderer assets, actual generated image/video/audio fixtures, the real local media-serving code and live controller. It checks decoding, playback timing, audience-only unmute, volume, seeking, blackout, audio and announcements, with layout checks at 960 and 1440 pixels. Screenshots use synthetic demonstration content. Browser checks verify media element state, not physical speaker output.

TypeScript, production build and Windows package inspection are checked before delivery. Native Windows execution, physical projector/speakers, device routing and codec support still require your checklist. The Windows download is an unsigned portable development build, not a Setup installer or a security-reviewed public release. Legacy dependency warnings remain. Stage display is the next planned phase.
