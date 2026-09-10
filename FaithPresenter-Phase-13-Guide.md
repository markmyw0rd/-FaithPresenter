# FaithPresenter Phase 13 — Cues, Transitions and Operator Shortcuts

Version 0.13.0 builds on the Windows-tested Phase 12 release and uses the same database format.

## What is new

- Per-slide **Cut** or **Fade** transitions for Audience and Stream output.
- Fade duration from 100–2000 ms.
- A production cue strip for Take, Clear, Church card, Emergency Blackout and Restore.
- Linked Audience + Stream cues with a separate result for every destination.
- Production keyboard shortcuts that are off by default and must be armed each session.
- Shortcut protection while typing in inputs, text editors, selectors or editable content.
- Stage remains independent from linked visual cues.

NDI and SDI are still planned adapters. They require supported SDKs, drivers and physical hardware and are not operational in this build.

## Upgrade safely

1. In Phase 12, create a database backup and keep its matching media folder together.
2. Close every FaithPresenter window.
3. Extract the Phase 13 ZIP into a new folder. Do not mix files with Phase 12.
4. Run `FaithPresenter.exe` and confirm **v0.13.0** at the bottom right.
5. Confirm your saved services, songs, Bible translations, themes and media are present.
6. Keep Phase 12 and the backup until this checklist passes.

## Windows rehearsal checklist

1. Open Audience output and the OBS Stream feed; both must begin black.
2. Edit a slide, expand its text editor and set **Live transition → Fade**, then choose 350 ms.
3. Save, close and reopen. Confirm the transition setting remains.
4. Open **Production** and press **Take to Audience + Stream**. Confirm both outputs fade to the selected slide while Preview remains independent.
5. Stop the Stream feed and Take again. Confirm Audience succeeds and Stream is reported as not ready.
6. Press **Emergency · Blackout Audience + Stream**, then Restore. Confirm each output reports its own result.
7. Confirm shortcuts do nothing while the arm checkbox is off.
8. Arm shortcuts and test:
   - `Ctrl + Alt + Enter` — Take
   - `Ctrl + Alt + C` — Clear
   - `Ctrl + Alt + L` — Church card
   - `Ctrl + Alt + B` — Emergency blackout
   - `Ctrl + Alt + R` — Restore
9. Focus the slide text editor and repeat a shortcut. It must not publish anything.
10. Confirm Stage current/next lyrics and private message remain unchanged by linked cues.

Use a full rehearsal with your real projector and OBS computer before using this build during a service. This is an unsigned portable development build, not a Setup installer.
