# FaithPresenter Phase 14 — Run of Show and Cue Queue

Version 0.14.0 builds on the Windows-tested Phase 13 release and keeps the same database format.

## What is new

- A service-wide cue queue in exact item and slide order.
- Current and next cue indicators.
- A large **GO** control for Audience + Stream.
- GO publishes the current cue before advancing Preview to the next cue.
- Previous/Next preview navigation without publishing.
- Session-only rehearsal completion markers and reset.
- Per-destination Applied, Failed and Not Ready results.
- Optional Spacebar GO, disabled until armed each session and blocked while typing.
- Stage remains independent from Run of Show visual commands.

NDI and SDI remain planned because they require supported SDKs, drivers and physical hardware.

## Build the genuine Windows installer

1. Extract the Phase 14 Source ZIP into a new folder.
2. Open that folder in Visual Studio Code.
3. Open **Terminal → New Terminal**.
4. Run these commands one at a time:

```powershell
npm.cmd ci
npm.cmd run make:windows
```

The installer will be created at:

```text
out\make\squirrel.windows\x64\FaithPresenter-0.14.0-Setup.exe
```

## Upgrade safely

1. Back up the Phase 13 database and matching media folder.
2. Close all FaithPresenter windows.
3. Build and run the Phase 14 Setup EXE.
4. Confirm **v0.14.0** at the bottom right.
5. Confirm existing services, songs, Bible translations, media and themes remain available.
6. Keep the Phase 13 installer and backup until this checklist passes.

## Windows rehearsal checklist

1. Open Audience output and optionally the OBS Stream feed. Both should start black.
2. Open **Run show** from the toolbar or resource tabs.
3. Confirm every slide appears in the same order as the service schedule.
4. Select a cue and confirm this changes Preview only.
5. Press **GO**. Confirm the selected cue publishes, is marked Done, and Preview advances.
6. Close Stream and press GO. Confirm Audience applies and Stream reports Not Ready.
7. Confirm Previous/Next cue changes Preview without changing Live.
8. Confirm Spacebar does nothing while **Arm Spacebar GO** is off.
9. Arm Spacebar GO and test it outside an editor.
10. Focus a text field and press Spacebar. It must type normally and must not publish.
11. Reset rehearsal progress and confirm the Done markers clear without altering the saved service.
12. Confirm Stage current/next lyrics and private messages remain independent.

Rehearse with your real projector and OBS setup before service use. The generated installer is unsigned, so Windows may display a SmartScreen warning.
