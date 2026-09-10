# FaithPresenter Phase 11 — OBS Clean Feed

Version 0.11.0 builds on Phase 10 and keeps the same database format.

## Added

- A dedicated 16:9 `FaithPresenter Stream Feed` window.
- Independent **Take to Stream**, Clear, Church Card and Blackout controls.
- A detached stream snapshot that cannot be changed by Preview edits.
- A separate renderer acknowledgement and failure timeout.
- Silent-by-default video playback to prevent duplicated audio routing.
- The Phase 10 output pipeline now identifies Livestream clean feed as active.

This is a clean video feed for capture in OBS Studio or similar software. It is not an encoder and does not upload video to YouTube, Facebook or another service by itself.

NDI and SDI remain planned. They require native SDKs, licensing, drivers and compatible hardware.

## Safe upgrade

1. Back up Phase 10 and its matching media folder.
2. Close every FaithPresenter output window and the operator app.
3. Extract Phase 11 into a new folder.
4. Run `FaithPresenter.exe` and confirm version 0.11.0.
5. Keep Phase 10 until the Windows checklist passes.

## Windows and OBS checklist

1. Open **Stream** from the top toolbar or resource dock.
2. Click **Open OBS clean feed · black**.
3. Confirm a separate `FaithPresenter Stream Feed` window opens black.
4. Select a slide and click **Take to Stream**.
5. Edit the Preview slide; confirm the Stream Feed stays unchanged.
6. Click Take to Stream again; confirm it updates.
7. Test Clear stream text, Stream church card, Stream blackout and restore.
8. Confirm Audience and Stage do not change when operating Stream.
9. In OBS, add **Window Capture** and choose `FaithPresenter Stream Feed`.
10. Keep the captured feed muted and route service audio separately unless you have rehearsed the full audio path.

## Development

```bash
npm ci
npm run build
npm test
npm run test:ui
npm start
```

Build a Windows portable package:

```bash
npm run package -- --platform=win32 --arch=x64
```

This is an unsigned portable development build. Test it with your actual Windows computer, OBS setup, projector and stage monitor before church use.
