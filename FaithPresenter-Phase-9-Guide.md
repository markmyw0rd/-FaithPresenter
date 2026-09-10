# FaithPresenter Phase 9 — Stage Display and Timers

FaithPresenter 0.9.0 is cumulative. It contains the Phase 8 media release, the v0.8.2 production interface, and a new independent stage-output system.

## Added in Phase 9

- A separate stage window with its own monitor assignment.
- Current lyrics and next lyrics displayed simultaneously.
- Large live clock.
- Stage countdown from 1 to 180 minutes.
- Private messages for the worship team or speaker.
- Automatic stage lyric updates when the operator selects another slide.
- Windowed primary-display testing and fullscreen secondary-display output.
- Safe stage shutdown if its assigned monitor disconnects or its renderer fails.
- Audience and stage state are isolated: stage messages and timers cannot be sent to the audience window.

## Upgrade safely

1. In v0.8.2, create a database backup and retain the matching media folder.
2. Close all FaithPresenter windows.
3. Extract `FaithPresenter-Phase-9-Windows-Portable.zip` into a new folder.
4. Run `FaithPresenter.exe` from the new folder.
5. Confirm your existing services, songs, Bible imports, media and themes.

Phase 9 does not change the Phase 8 database format. Keep v0.8.2 and your backup until the new version passes your Windows test.

## Test the stage output

1. Open a service and select a lyric slide.
2. Click **Stage** in the top toolbar or **Stage display** in the bottom status bar.
3. Choose a stage monitor. Do not choose the monitor already used for Audience output.
4. Click **Open stage · black**.
5. Confirm the stage monitor shows current and next lyrics.
6. Change slides and confirm the stage updates while the Audience screen remains unchanged until Take Live.
7. Send a private message and confirm it appears only on Stage.
8. Start a countdown and check the clock.
9. Press Esc on the Stage screen and confirm Audience remains open.
10. Rehearse with the actual operator, projector and stage monitors before service use.

On one monitor, select the primary display to open Stage in a movable windowed test.

## Edit the source in VS Code

Open the folder containing `package.json`, then run:

```powershell
npm ci
npm run build
npm test
npm run test:ui
npm start
```

Build another Windows portable package using:

```powershell
npm run package -- --platform=win32 --arch=x64
```

## Validation completed

- TypeScript and production builds passed.
- 86 automated tests passed, including four Stage controller tests.
- Existing operator/database workflow passed.
- Existing media and responsive interface browser checks passed.
- Stage output rendered correctly at 1280×720 with current/next lyrics, clock, countdown and private message.
- Windows x64 packaging passed.

This is an unsigned portable development build, not a Setup installer. Physical Windows multi-monitor testing remains required.
