# FaithPresenter UI Redesign 0.8.1

This cumulative release keeps every Phase 8 feature and reorganises the operator workspace into a compact production layout inspired by the supplied references.

## What changed

- A compact top toolbar for New, Open, Save, Show, Edit, resources, live output, blackout, clear, displays and settings.
- Saved services and the service schedule stay on the left.
- The active service's slide grid fills the upper workspace.
- Preview and Live Snapshot are displayed side-by-side.
- Songs, Bible, Media, Themes, Timers and Announcements remain in a tabbed resource dock along the bottom.
- Panels scroll independently so the application itself does not require page scrolling.
- The existing explicit Take Live safety model is unchanged: selecting or editing a slide changes Preview only.

## Safe upgrade

1. In your current FaithPresenter, select **Back up database** and retain its matching media folder.
2. Close every FaithPresenter window.
3. Extract `FaithPresenter-UI-Redesign-0.8.1-Windows-Portable.zip` into a new folder. Do not mix files with an older version.
4. Run `FaithPresenter.exe` from the new folder.
5. Confirm your services, songs, Bibles, media and themes are present before removing the old application folder.

Version 0.8.1 uses the same Phase 8 database format. The backup is still recommended before every upgrade.

## Windows acceptance check

1. Open a saved service and select several schedule items.
2. Confirm the slide grid, Preview, Live Snapshot and bottom resource dock are all visible.
3. Edit a slide and confirm Live does not change until **Take Live** or **Go Live** is pressed.
4. Open audience output and test **Logo**, **Black**, **Clear**, and display selection.
5. Open Songs, Scriptures, Media and Themes from the top toolbar.
6. Resize the app window and confirm each panel scrolls without covering live controls.
7. Close and reopen the app and confirm saved content remains.

## Open the editable source in VS Code

Open the extracted source folder—the folder containing `package.json`—and run:

```powershell
npm ci
npm run build
npm test
npm run test:ui
npm start
```

To create another Windows portable package:

```powershell
npm run package -- --platform=win32 --arch=x64
```

The output appears under `out/FaithPresenter-win32-x64`.

## Validation completed

- TypeScript and production build passed.
- 82 automated data, database, media, Bible, song, theme and live-output tests passed.
- Simulated operator workflow passed.
- Real Chromium playback, Preview/Live, blackout, timed announcements and 960/1440 layout checks passed.
- Windows x64 packaging passed.

Physical Windows/projector rehearsal remains required before service use. This is an unsigned portable development build, not a Setup installer.
