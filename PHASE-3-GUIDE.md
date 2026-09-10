# FaithPresenter Phase 3 — Local service database

Version 0.3.0 · Cumulative Windows x64 portable development build

## Upgrade from Phase 2

1. Open Phase 2 and save your latest draft. Open Church settings → Open data folder, and note its location.
2. Close FaithPresenter completely. Copy that data folder somewhere safe before upgrading.
3. Keep the old program folder as a fallback. Extract `FaithPresenter-Phase-3-Windows-Portable.zip` into a **new folder**.
4. Open `FaithPresenter.exe` in the new folder; keep all the accompanying DLLs, resources and locales together.
5. Confirm the app shows **v0.3.0**. Your church and display settings use the same profile location.
6. Your saved Phase 2 draft is imported automatically once. You should see the migration message and your existing items/slides.

This is a complete cumulative application package, not an add-on. You do not need to run Phase 1 or 2 alongside it. The portable app requires no installed Node.js, SQL server or browser. It is not a Setup installer; signing and public-release installation checks are still pending.

**Do not alternate between Phase 2 and Phase 3 for ongoing editing.** Phase 3 writes to SQLite; Phase 2 writes to its old JSON file. Changes made later in Phase 2 are not imported a second time, and Phase 2 cannot show services saved in Phase 3. Keep old data as a fallback, not a second active workspace.

## What is new

| Feature | Behaviour |
| --- | --- |
| Local SQLite database | Stores services, ordered items and slides on your computer |
| Multiple services | Create, open, rename through the title field, and duplicate |
| Autosave | Saves about 0.9 seconds after you stop editing; defaults on each launch |
| Save now | Explicitly saves the current service |
| Safe switching | Saves pending edits before switching, creating, duplicating or moving a service |
| Last opened service | Reopens the last available active service after restart |
| Recycle bin | Recover removed services; there is no permanent-delete button |
| Saved versions | Restore up to 20 previous changed saves per service |
| Database backup | Creates a consistent SQLite snapshot in the profile's backups folder |
| Phase 2 migration | Imports once, preserves the old JSON, and creates a separate original copy |

Phase 1 settings/test output and Phase 2 editing/rehearsal remain included. Live is still an **in-app rehearsal**. Projector slide routing remains Phase 4. Songs, Bible, media and stage-display features remain scheduled for later phases.

## Create and switch services

1. In Operator, click **Manage services**.
2. Enter a name beside **New service**, then click **New service**.
3. Add service items and slides as before, or load the optional sample into an empty service.
4. Change the service title in the operator toolbar whenever you need to rename it.
5. Watch for **Saved**. With autosave off, click **Save now**.
6. Return to Manage services and click **Open** beside another service.
7. Use **Duplicate current** to create an independent copy. Editing the copy does not change the original.
8. Use the search field to find saved services by title.

Opening a different service clears the in-app Live rehearsal panel, selection and session undo history. Stored services are unchanged. When every service is moved to the recycle bin, the app creates an empty service so the editor remains usable.

## Autosave and closing

Autosave is enabled at startup. The checkbox toggles it for the current session. It saves after a short idle interval, not on every keystroke. **Wait for Saved before closing or shutting down.** A crash or power loss before the pending save completes may lose those latest edits.

Edits made during an existing save remain pending and are saved afterwards. The UI does not mark those newer edits as saved prematurely. Service operations first finish pending saves; if a save fails, switching is stopped and your unsaved content remains in the editor.

If you see an error, keep the app open, resolve available disk space/permissions if relevant, and use Save now to retry. Do not discard edits unless you intend to lose changes not yet saved. The close warning offers Keep editing or Discard unsaved changes.

## Recover a removed service

1. Manage services → **Recycle bin**.
2. Locate the service and choose **Restore & open**.
3. Its items and slides return. Moving a service to the bin never permanently deletes it in this version.

## Recover an earlier saved version

1. Open the service you want to recover.
2. Manage services → **Saved versions**.
3. Review the version numbers and save timestamps.
4. Choose **Restore**, then confirm **Restore version**.

The current content is retained in history when a different historical document is restored. History keeps only the most recent 20 changed saves; autosaves count towards this limit. It is short-term recovery, **not** a substitute for a separate backup. An unchanged save does not create another revision.

## Make a database backup

1. Click **Back up database**. Pending service edits are saved first.
2. Wait for the backup filename confirmation.
3. Click **Open backups** to find the `.sqlite` snapshot.
4. Copy a snapshot to a separate device or trusted storage if you want protection against computer/disk loss.

Backups are created on request, not on an automatic schedule. They contain the service database, including recycle-bin entries, saved versions and the active-service record. They do **not** include the separate church/display settings JSON, and they are not encrypted. Copy the full profile folder while FaithPresenter is closed if you need both database and profile settings.

A full database-restore interface is not included yet. For whole-database recovery, keep the app closed and preserve the complete existing profile and backup before requesting guided recovery. Do not overwrite a live SQLite file or delete its companion files while the app is running.

## Data files

Use Church settings → Open data folder to locate your actual profile.

| File | Purpose |
| --- | --- |
| `settings.json` | Existing church/display settings; unchanged by migration |
| `workspace.json` | Original Phase 2 draft; retained but no longer updated by Phase 3 |
| `workspace.phase2-original.json` | Preserved copy made before the initial import |
| `faithpresenter.sqlite` | Current service database |
| `faithpresenter.sqlite-wal`, `faithpresenter.sqlite-shm` | SQLite runtime companion files, when present; do not remove while running |
| `backups/*.sqlite` | User-requested consistent database snapshots |

If the old draft is unreadable, migration stops and reports an error without silently replacing it with an empty draft. Keep the original file and its backup. If a database has a newer schema version than this app supports, this version refuses to reset or downgrade it.

## Please test on Windows

- [ ] Launches as v0.3.0; existing church and display settings remain.
- [ ] Phase 2 draft migrates with the same item order, slide text and themes.
- [ ] Restart does not duplicate the imported service.
- [ ] Edit text, wait for Saved, close/reopen: text remains.
- [ ] Create a second service and switch between both; each retains its own content.
- [ ] Duplicate a service, change the copy, and confirm the original stays unchanged.
- [ ] Autosave off requires Save now; switching still saves pending edits.
- [ ] Move a service to the recycle bin and restore it.
- [ ] Restore an earlier saved version.
- [ ] Create a database backup and locate the file.
- [ ] Preview/Live rehearsal and the Phase 1 projector test still work.

## Development and verification

The Source archive includes the cumulative application and tests. Use Node.js 24 LTS, then run the included numbered scripts, or:

```powershell
npm ci
npm test
npm start
```

`npm run make:windows` is the configured Windows Setup build. Expected Setup filename: `FaithPresenter-0.3.0-Setup.exe`. This delivery provides the portable Windows package; Setup creation, installation/uninstallation and code signing have not been verified.

Verification here: TypeScript/production compilation; 25 data tests; SQLite tests under Electron's bundled Node runtime; SQLite-backed DOM integration tests with a simulated desktop bridge for autosave, editing during save, flush-before-switch, save failures, creation/duplication, recycle/restore, history and backup. Windows package contents were inspected. These tests do not replace native Windows execution or visual/layout testing of Phase 3.

The database uses the runtime's built-in SQLite API; see [Node.js SQLite documentation](https://nodejs.org/api/sqlite.html). No separate native SQLite package or database server installation is required for the packaged app.

## Next phase

Phase 4 connects actual service slides to the audience display while preserving independent Preview and Live control. Phase 3 is still a development build, not a complete production worship-presentation product.
