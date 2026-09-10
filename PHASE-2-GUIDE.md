# FaithPresenter Phase 2 — Operator workspace

Version 0.2.0 · Windows x64 portable development build

## Upgrade safely

1. Close Phase 1. Do not run both versions together; the app allows one instance.
2. Keep your Phase 1 folder as a fallback.
3. Download and Extract All from `FaithPresenter-Phase-2-Windows-Portable.zip` into a new folder.
4. Open `FaithPresenter.exe` inside the extracted folder. Keep all DLLs, resources and locales together.
5. Check the version is 0.2.0 and open Church settings to verify your existing church name.

No Node.js or browser is required for the portable build. Your Phase 1 settings remain in the same application data location. The new draft uses a separate `workspace.json`, so it does not overwrite `settings.json`. For an extra precaution, use Church settings → Open data folder in Phase 1 and copy that folder somewhere safe before upgrading.

This is still a portable build, not a Setup installer. Windows installation, signing and public-release validation remain pending.

## What Phase 2 adds

- Operator workspace opens by default.
- Service schedule with add, rename, move up/down, remove and undo.
- Editable text slides, thumbnails, duplicate and remove.
- Preview plus an independent Live rehearsal snapshot.
- Take Live, clear text, blackout, church card, and previous/next preview navigation.
- Four starter backgrounds in the Themes tab.
- Searchable Slides tab for the current draft.
- Songs, Bible and Media tabs explicitly marked as planned.
- Resizable service/preview panels, library height control and Reset layout.
- One manually saved local service draft, a previous-save backup, and an unsaved-close warning.
- Existing Phase 1 settings and projector test remain available.

## Important: Live is a rehearsal panel

**Take Live updates only the Live panel inside the operator interface. It does not send your slide to the projector.** This phase intentionally does not implement Phase 4 output routing. The Display setup page continues to show the fixed Phase 1 projector test pattern only.

No commercial songs, Bible translations or media are included. The optional sample contains generic welcome/announcement text and is labelled as sample. Sample content loads only when you choose it in an empty workspace.

## First practice session

1. Open Operator and click **Load sample service**, or **Add service item** to begin empty.
2. Rename the service in the top field.
3. Select a schedule item; edit its title above the thumbnails.
4. Select a slide and edit its text beneath the thumbnails.
5. Select Themes and choose Violet, Ocean, Forest or Plain.
6. Click **Take Live → Rehearsal**. The Live panel takes a copy.
7. Edit the same slide again. Preview should change while Live stays unchanged.
8. Click Take Live again to update the rehearsal copy.
9. Test Blackout twice, Clear text and Church card. Take Live restores the selected slide.
10. Previous/Next selects the neighbouring slide for preview, including across service items; it never automatically changes Live.
11. Reorder schedule items with Up/Down. Remove and Undo restore draft content; these actions do not alter the existing Live snapshot.
12. Click **Save draft**, then close and reopen. Your draft should return. The Live panel deliberately starts empty after restart.

## Saving and recovery

Saving is manual in Phase 2. Watch the Unsaved changes indicator and click Save draft. If you close with unsaved draft changes, choose Keep editing to return and save, or Discard unsaved changes to close without keeping those changes.

Switching to Church settings or Display setup preserves the in-memory draft. Church profile settings still have their own Save settings action.

The draft is stored in `workspace.json`; `workspace.backup.json` holds its previous successful save. A damaged draft is preserved and a read error is shown; the app will not silently replace it. To recover, open the data folder, close the app, keep a copy of the damaged file, and restore a known-good backup to `workspace.json`. Ask for help before changing data files if unsure.

## Limits in this phase

- One local draft, not a multi-service library or SQLite content database.
- Up to 100 service items, 100 slides per item and 2,000 text characters per slide.
- Slide text uses a fixed preview style; long text can clip. Full layout editing and overflow controls are later work.
- Undo holds up to 30 recent draft edits for the current session. Layout changes and Live controls are not part of draft undo.
- The church card uses your church name and a built-in symbol, not an uploaded logo.
- Panel sizes are session-only. At narrow window widths the layout uses constrained column widths; maximise the app for full horizontal resizing. Library height remains adjustable.
- No song/Bible/media import, video playback, stage output, slide projection, or cloud account integration.

## Windows acceptance checks

- [ ] Launches as 0.2.0 and retains the Phase 1 church/display settings.
- [ ] Create, rename, reorder and remove items; Undo restores a removed item.
- [ ] Edit, duplicate and remove slides.
- [ ] Preview edits do not change Live until Take Live.
- [ ] Blackout, clear and church card affect only rehearsal.
- [ ] Save draft; reopen and confirm it survives.
- [ ] Closing an unsaved draft offers Keep editing / Discard.
- [ ] Search and all four starter themes work.
- [ ] Dividers resize when maximised; Reset layout restores defaults.
- [ ] Phase 1 projector test still works on the selected monitor.

## Developer setup

Extract the Source archive. Install Node.js 24 LTS, then run the numbered scripts in order:

1. `01-Install-Dependencies.cmd`
2. `02-Run-FaithPresenter.cmd`
3. `03-Build-Windows-Installer.cmd` when ready to attempt a Windows Setup build.

Or use `npm ci`, `npm test`, `npm start`, and `npm run make:windows` from the project folder. The expected Setup filename is `FaithPresenter-0.2.0-Setup.exe`. The Setup build is configured but has not been produced or tested for this delivery.

## Verification for this delivery

TypeScript and production build passed. Eleven data tests passed, covering both Phase 1 settings and workspace validation, persistence, backup, corruption protection and isolated snapshots. A DOM-based UI test with a mocked desktop bridge passed editing, Preview/Live isolation, controls, duplicate/remove/undo, reordering, themes, save, library tabs, search and page-navigation retention. These are not native Windows or visual-rendering tests. The packaged Windows executable and app entry points were inspected. Actual Phase 2 execution, resize behaviour and close dialogs need your Windows checks above.

Phase 3 will introduce the structured local content database and broader storage workflow. Phase 4 will connect presentation content to the audience output.
