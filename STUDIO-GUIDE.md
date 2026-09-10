# FaithPresenter Studio — presentation workspace

Version 0.5.1 · Windows x64 portable development build

This redesign follows the compact presentation-console layout in your references while retaining FaithPresenter branding and the working Phase 1–5 functionality. It is not ProPresenter, an exact clone, or an implementation of every feature visible in those screenshots. It is not the Phase 6 slide-editor release.

## Upgrade

1. In your working app, save song edits with **Save song**, wait for the service **Saved** status, and create a database backup.
2. Close FaithPresenter completely. Keep the previous app folder and backup.
3. Extract **FaithPresenter-Studio-0.5.1-Windows-Portable.zip** into a NEW folder. Do not merge program folders.
4. Run **FaithPresenter.exe** inside `FaithPresenter-Studio-0.5.1-Windows`. Keep all accompanying files together.
5. Confirm **FaithPresenter Studio · v0.5.1** in the bottom status bar and check your existing services and songs.

The database/profile location and schema are unchanged from Phase 5. Your services, songs, arrangements, history, recycle bins and backups are retained. The portable app does not require Node.js. This download is not a signed Setup installer.

## Where everything is

| Location | Working controls |
| --- | --- |
| Top toolbar | Show, Edit, Search, Themes, Songs, service manager, display setup and church settings |
| Left rail | Saved services, song/theme shortcuts, service-item filter and schedule, add/move/remove item |
| Centre | Service title/save/undo, item slide grid, all-service view, thumbnail-size slider and slide actions |
| Right | Independent Preview and Live snapshot, explicit Take Live, preview navigation, display selection, open/close output, clear/church/blackout |
| Bottom dock | Slides search, song library/editor, four starter themes and clearly labelled planned modules |
| Service manager | Create/open/duplicate services, recoverable removal, history, database backup and Open backups |

The main window uses a fixed-height layout. Slide grids, the schedule, resources and preview area scroll independently. The right output controls remain outside the disabled editor area during service switching/backups. On smaller windows, scroll the preview area to see both Preview and Live; routing and blackout controls are kept in a separate lower section.

## Show and Edit

The app starts in **Show** mode, giving the slide grid more room. Click a thumbnail to select it for Preview; selection never sends it live automatically.

Click **Edit** to reveal the item-title and slide-text editor below the central grid. Editing affects the draft and Preview only. Click **Take Live** to publish the selected slide. Use **Show** to hide the editor again without discarding edits.

**All service slides** groups every service item's slides in the centre. Turn it off to show only the selected item. Use the **Size** slider to change thumbnail size. Selected slides have an amber border; the current live source is identified separately. A live-source marker identifies the source slide, not a guarantee that its latest edits are on air.

## Song/resource dock

Choose **Songs** in the top toolbar, left rail or bottom tabs. The dock expands for song editing. Use **Collapse dock** or **Expand dock** as needed. Unsaved lyrics stay mounted when you change tabs or Show/Edit mode. Save songs explicitly with **Save song**.

The Phase 5 workflow remains: create lyric sections, use blank lines between slides, arrange/repeat sections, Save song, then **Add saved arrangement to service**. The new service item is selected in the centre. Existing service copies remain independent of library edits. Service autosave is separate from song saving.

The **Slides** dock shows actual current-service slide thumbnails. Search filters those slides. Clicking a result selects it for Preview. **Themes** applies one of the four current backgrounds to the selected draft slide; publishing still requires Take Live.

## Services and settings

Use the top **Manage services** button to open the service-management panel over the centre. It retains all prior service/history/backup controls. Click **Close manager ×** when finished. The right audience controls remain accessible while the panel is open.

Select **Displays** or **Settings** in the top toolbar to reach the existing configuration pages. Their sidebar includes **Operator** to return to Studio. Navigating to settings does not close an active audience window or discard song edits.

**Reset layout** restores Show mode, selected-item view, default thumbnail size and a compact dock. It does not delete content or change live output. Workspace layout choices are session-only and reset at next launch.

## Still planned

Bible import/search, media image/video/audio import and playback, stage display, timers, advanced theme editing and transitions are not implemented in this redesign. Bible and Media tabs explain their planned status rather than presenting nonworking playback controls. No commercial lyrics, stock-media packs, ProPresenter assets or third-party service connections are bundled.

## Windows acceptance checklist

- [ ] Saved services, songs and settings are present after upgrade.
- [ ] Window opens with the library/schedule left, slides centre, output right and resources below.
- [ ] Each panel scrolls without forcing a long whole-page scroll.
- [ ] Show/Edit toggles the editor without losing edits.
- [ ] All service slides shows grouped slides; selecting one updates Preview only.
- [ ] Thumbnail sizing works at your screen size and Windows scaling.
- [ ] Songs opens the expanded dock; lyrics survive switching tabs and can be saved.
- [ ] Adding a saved song arrangement produces an independent service item.
- [ ] Manage services supports creation, open, backup and recovery; Close manager returns to the slide grid.
- [ ] Preview/Take Live, clear text, church card and blackout still work with your display.
- [ ] Save, close/reopen and verify persistence.

Audience output still starts black and requires explicit Take Live. **Blackout** keeps the output window black; **Close audience** can reveal the Windows desktop. Renderer acknowledgement does not prove physical projector operation.

## Developer checks and limitations

The existing 50 automated tests and the updated React/SQLite/live workflow integration tests passed for this build. Actual Chromium layout checks also passed at 960×700, 1100×700, 1440×900 and 1920×1080, including panel boundaries, visible output controls, Show/Edit, grouped slides, preview isolation, song-draft preservation and service-manager access. Screenshots were inspected at 960px and 1440px widths and in the expanded song dock.

The supplied preview image uses synthetic demonstration content and a simulated desktop bridge, not the user's database or a real projector. No demo data is added to your application profile. The optional visual test is in `scripts/test-visual.mjs`; normally install the Playwright browser (`npx playwright install chromium`) and run `npm run test:visual`. This build environment used a separately supplied headless Chromium runtime after the standard download failed. Do not infer native Windows/projector verification from browser or DOM tests.

Build with Node.js 24+: `npm ci`, `npm test`, `npm run test:ui`, `npm start`. Native Windows fullscreen, mixed-DPI appearance and hardware projection still require the checklist above. No Setup installation/uninstallation or code signing has been verified.
