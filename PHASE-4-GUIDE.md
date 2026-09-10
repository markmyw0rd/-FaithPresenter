# FaithPresenter Phase 4 — Live projection

Version 0.4.0 · Windows x64 portable development build

Phase 4 includes Phases 1, 2 and 3 and connects service slides to a real audience window. Your Phase 3 SQLite database and profile location are unchanged.

## 1. Upgrade without deleting your working copy

1. In Phase 3, wait for **Saved**, click **Back up database**, and check the backup exists.
2. Keep that backup. For settings too, open Church settings → Open data folder, close FaithPresenter, then copy the entire profile folder to a separate safe location.
3. Close Phase 3 completely.
4. Download **FaithPresenter-Phase-4-Windows-Portable.zip** and use Windows **Extract All** into a NEW folder. Do not merge it into the Phase 3 folder.
5. Open `FaithPresenter-Phase-4-Windows` and run **FaithPresenter.exe**. Keep all accompanying DLLs, resources and locales together.
6. Confirm **v0.4.0 / Phase 04**, your church name and your saved services.

Keep Phase 3 until Phase 4 passes. Both builds use the same profile: retaining the old program folder is not itself a data backup. Avoid alternating versions during testing. The source ZIP is only for development; the portable app does not require Node.js.

## 2. First test without a projector

1. Open **Operator** and locate **Audience output** at the top.
2. Choose the **Primary (windowed test)** display.
3. Click **Open audience · black**. A separate black window opens; primary-display tests deliberately do not hide the operator fullscreen.
4. Return focus to the operator. Wait for the output renderer to be ready/BLACKOUT.
5. Select a service item and slide; click **Take Live → Audience**.
6. Confirm the separate audience window shows the selected text and background.
7. Edit the text without clicking Take Live. Only Preview should change. Take Live again to publish the edit.

If there are no slides, add a service item or open a saved service. Preview navigation does not automatically advance the audience: select a slide, then Take Live.

## 3. Use a projector or second display

1. Connect it and configure Windows to **Extend these displays**, not Duplicate.
2. Close any existing audience output before changing its destination.
3. In Operator, choose the secondary display marked **Fullscreen**.
4. Click **Open audience · black** and wait for readiness.
5. Click Take Live and check the physical screen. The operator must remain on your computer screen.

For alignment, the old fixed test pattern remains in Display setup. Close live audience output first: the app refuses to replace active live output with that test. **Close test** affects the fixed pattern; **Close audience** affects real slides.

The Operator dropdown is a session choice. To remember a preferred display at next launch, select it in Display setup and click **Save selection**. Hardware/driver changes may change display IDs, so verify the destination each time.

## 4. Controls and live isolation

| Control | Effect |
| --- | --- |
| Take Live | Copies the selected draft slide to audience output and removes blackout |
| Preview previous / next | Changes only the preview selection; Take Live publishes it |
| Clear text | Hides text, retains the background and does not remove an active blackout |
| Church card | Shows the current church name and explicitly removes blackout |
| Blackout | Makes the whole audience window black, including letterbox margins |
| Restore image | Restores the previous slide/clear/church-card state beneath blackout |
| Close audience | Closes the window and forgets its live snapshot |
| Escape in audience window | Closes that output window |

The top controls remain available during database backups and service switching. Editing, autosaving, undo, theme changes, opening another service or deleting a service do not change its previously published slide. The Live snapshot identifies content from another service.

**Closing output may reveal the Windows desktop on the projector. Use Blackout to keep that screen blank.** Display changes or failures close the window; they cannot guarantee that the physical projector remains black.

## 5. Status, rendering and recovery

- Opening/reopening output starts black, with no previous slide. Reconnection and restart never automatically replay content.
- **SENDING** means an update awaits the audience renderer's acknowledgement.
- **APPLIED / ready** confirms the renderer processed the snapshot, not that the projector is connected, powered on or showing it correctly.
- If the renderer fails to respond within eight seconds, output closes with an error. Check the display and reopen manually.
- Disconnecting or changing resolution/scaling on the selected display closes output; reopening is explicit.
- An audience renderer failure or operator renderer crash closes output. A total app/OS crash or power loss cannot be handled by app code.

Slides use a fixed 16:9 layout, letterboxing on other shapes and safe margins. Text shrinks to fit. Very long text or excessive blank lines can become unreadably small: split it across slides and check from the congregation's viewing distance. No animation, transitions, video or audio playback is included yet.

## 6. Windows acceptance checklist

- [ ] Existing Phase 3 services, settings and backups remain present.
- [ ] Save an edit, close/reopen the app, and confirm persistence.
- [ ] Primary-screen output opens windowed and black.
- [ ] Secondary-screen output opens fullscreen on the intended display only.
- [ ] Take Live shows the selected text and theme on that physical screen.
- [ ] Editing, theme changes, preview navigation and autosave do not change live output.
- [ ] Taking the next slide updates the audience and Live snapshot.
- [ ] Clear text retains the background; church card shows the church name.
- [ ] Blackout is fully black; Restore image restores the previous state.
- [ ] Switching services leaves the published slide unchanged.
- [ ] Close audience and Escape close output; reopening starts black.
- [ ] Disconnect stops output; reconnect does not automatically replay anything.
- [ ] Resolution/scaling changes require reopening; the intended screen is still used.
- [ ] Long/multiline text and every theme look correct at your screen resolution.
- [ ] Back up database still creates a file after upgrading.

Report any failed check and, if possible, send operator/audience screenshots. Do not mark physical projection passed from the operator preview alone.

## Development verification and limits

Forty automated tests pass: existing settings/database/workspace tests plus new live state, lifecycle and IPC-isolation tests. Two-renderer DOM integration uses real SQLite and the real live controller with simulated Electron windows/IPC. It checks private edits, autosave, preview navigation, live commands, cross-service isolation, controls during backup, save races/failures, reopening and disconnect.

TypeScript/production compilation and Windows package contents are checked. Native Windows fullscreen/graphics, physical projection, visual text fit and mixed-DPI behaviour remain for your checklist. The package is unsigned and portable: no Setup installer is delivered, and installation/uninstallation is unverified. Songs, Bible, media, stage display, advanced themes and production integrations remain later phases.

Developers: use Node.js 24+, then `npm ci`, `npm test`, `npm run test:ui`, `npm start`. `npm run make:windows` is the configured Windows installer build; when successful on Windows its expected filename is `FaithPresenter-0.4.0-Setup.exe`.

Next: **Phase 5 — Songs and services**, after Phase 4 projector checks pass.
