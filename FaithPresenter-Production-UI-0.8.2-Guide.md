# FaithPresenter Production UI 0.8.2

Version 0.8.2 is a cumulative Windows desktop release. It retains all Phase 8 features and introduces a denser control-room workspace inspired by professional church presentation systems, while keeping FaithPresenter's own branding and controls.

## New production workspace

- Professional toolbar with Search, Text, Theme, Show, Edit, Reflow, Bible, Media, Audience and live controls.
- Saved services, playlists and the service schedule remain visible on the left.
- A larger centre slide grid provides clear selected and live-source borders.
- Large Preview and Live Snapshot monitors are stacked on the right.
- Live media transport, audio volume and audience output controls remain beside the Live monitor.
- Slides, Design, Songs, Bible, Media, Themes, Timers and Announcements remain in the bottom resource dock.
- The Stage button is visibly disabled because stage output is planned for a later phase.
- Selecting or editing a slide changes Preview only. Go Live or Take Live remains explicit.

## Safe upgrade from 0.8.1

1. Use **Back up database** in the current app and keep its matching media folder.
2. Close all FaithPresenter windows.
3. Extract `FaithPresenter-Production-UI-0.8.2-Windows-Portable.zip` into a new folder.
4. Run `FaithPresenter.exe` from that folder.
5. Confirm your services, songs, Bible imports, media and themes are present.

Version 0.8.2 uses the same database format as 0.8.1. Keep the previous application folder and backup until testing is complete.

## Windows test checklist

1. Open a saved service and select service items from the left schedule.
2. Confirm the selected slide changes Preview but not Live Snapshot.
3. Open audience output and press **Go Live** or **Take Live**.
4. Test Logo, Black, Clear, Previous/Next and live media controls.
5. Open Media, Songs, Bible, Themes, Timers and Announcements from the toolbar or bottom dock.
6. Resize the window and confirm each region scrolls independently.
7. Save, close and reopen; confirm all content remains.
8. Rehearse fullscreen output on the actual church projector before service use.

## Edit in Visual Studio Code

Open the source folder containing `package.json`, then run:

```powershell
npm ci
npm run build
npm test
npm run test:ui
npm start
```

Build a new Windows portable package with:

```powershell
npm run package -- --platform=win32 --arch=x64
```

The result appears under `out/FaithPresenter-win32-x64`.

## Validation completed

- TypeScript and production build passed.
- 82 automated tests passed.
- Operator/database UI workflow passed.
- Real Chromium media, audio, blackout, seek, announcement and 960/1440 layout checks passed.
- Windows x64 packaging passed.

This is an unsigned portable development build, not a Setup installer. Physical Windows, projector, speaker and codec rehearsal remains required.
