# FaithPresenter — Phase 6

Version 0.6.0 · Slide Design & Reusable Themes · Windows x64 portable development build

This is a cumulative desktop release built on Studio 0.5.2. It retains the service database, songs and arrangements, media imports, silent motion backgrounds, live output, section labels, shortcuts, timers and backups.

## 1. Upgrade safely

1. Open your current FaithPresenter. Save the service and any unsaved song edits.
2. Use **Manage services → Back up database**. Keep both the `.sqlite` backup and its matching `.sqlite.media` folder, preferably on another drive.
3. Close FaithPresenter completely.
4. Extract **FaithPresenter-Phase-6-Windows-Portable.zip** into a **new folder**. Do not merge it with an older program folder, and do not move the EXE away from its accompanying files.
5. Run **FaithPresenter.exe** in `FaithPresenter-Phase-6-Windows`. Node.js and a separate browser are not required to run the portable app.
6. Confirm **v0.6.0** in the status bar and check your services and songs.

The app continues using the existing FaithPresenter profile. Database schema 1 or 2 upgrades to schema 3. Before the upgrade, the app makes a `Before-0.6.0-….sqlite` database snapshot in the backups folder. This automatic snapshot does **not** duplicate media files; the existing media folder remains untouched. Make the complete manual backup in step 2 first.

Older app versions cannot open schema 3. Keeping the old program folder alone is not a rollback. Restoring a previous database requires closing the app and matching it with the appropriate media files. There is no automatic restore wizard in this release; ask for help before overwriting any profile files.

This download is an unsigned portable desktop build, not a Setup installer.

## 2. Open the slide editor

1. Select a service item and slide.
2. Click **Edit** in the top toolbar. The slide-text editor appears above the resource dock, and the **Design** dock opens below it.
3. Edit the slide text in the text box. Section labels, colours and jump keys remain available under the section details.
4. Use the larger Design canvas and the **Text**, **Layout** and **Effects** tabs.
5. Check the independent Preview on the right.
6. Press **Take Live** only when you want to publish the new appearance.

You can also open **Design** directly from the resource tabs without opening the text editor. **Show** hides the text editor; it does not discard changes. Use Collapse dock when you want more room for the slide grid. On smaller windows, scroll inside the editor/dock to reach the controls. Audience routing and blackout remain in the separate right-hand panel.

## 3. Text controls

| Control | What it does |
| --- | --- |
| Font family | Arial, Georgia, Verdana or Trebuchet MS; system fallback applies if unavailable |
| Maximum font size | 24–160 design pixels on the 1920 × 1080 canvas |
| Text colour | Choose a colour using the native colour picker |
| Bold / italic / uppercase | Style the entire slide text; uppercase does not rewrite saved lyrics |
| Line spacing | Set spacing from 1.0 to 2.0 |
| Text alignment | Left, centre or right |
| Vertical alignment | Top, centre or bottom within the text box |

Text automatically **shrinks to fit** its box and never grows above the chosen maximum. The Design readout shows the actual rendered font size. A warning appears below 36 design pixels; it is an operator warning, not projected text. If the text becomes too small, split it across more slides or enlarge the box. Test readability from the back of the room.

## 4. Position the text box

Open **Layout** and choose Full slide, Lower third or Upper third. Fine-tune Left, Top, Width and Height as percentages of the slide.

With **Safe guides** enabled, drag the **Move text** handle on the Design canvas. You can focus the handle and use arrow keys to move it by 1% at a time. Position and size controls keep the box inside the slide. Increasing its size may shift its position to keep it within bounds.

The outer dashed line marks a 5% safe-area reference; the purple outline marks the text box. Both are operator-only guides. They never appear in Preview or audience output. The guides are advice, not a guarantee against projector overscan.

## 5. Backgrounds and readability effects

Open **Effects**:

- Choose a plain background or one of the existing violet, ocean and forest gradients.
- **Solid background** applies when Background is **plain**. An assigned image or video remains above it.
- **Background dim** darkens the background without darkening the words.
- **Text backplate** offers none, a full text-block box, or line highlights like the supplied reference.
- Adjust backplate colour, opacity and padding.
- Turn text shadow on/off, or add a coloured outline up to 6 design pixels.

Line highlights follow wrapped text lines. Large padding and tight line spacing can make the strips meet; reduce padding or increase line spacing if needed.

Media assignments remain in the Media dock. This release retains centre-cropped image/video backgrounds and silent video transport; it does not add an audio mixer or media crop editor.

## 6. Copy, reset and apply to an item

**Copy style** stores the selected slide's style and background gradient in the app's temporary style clipboard. Select another slide and choose **Paste style**. It does not use the Windows clipboard and resets when the app closes.

**Apply style to item (N)** copies the current style and gradient to every slide in the selected service item. It leaves text, media assignments, section labels and shortcuts unchanged. Use **Undo** if you apply it to the wrong item.

**Reset style** restores the default text formatting and placement on the selected slide. It keeps the slide's existing background gradient, media and section metadata.

## 7. Reusable themes

Open **Themes**. Five built-in themes are supplied:

1. Classic worship.
2. Cinematic lower third.
3. Warm line highlights.
4. Scripture reading — a visual style, not a Bible text database.
5. Bold announcement.

To create your own theme, style a slide, enter a name in **New theme name**, then click **Save current as theme**. Themes store styling and the gradient choice only, not lyrics, media files or section metadata.

Click a theme card to apply it to the selected slide. Turn on **Apply to whole item** first if you want to restyle the entire item. Existing media remains assigned, so it may cover a theme's solid colour or gradient.

Saved themes survive restarting and are included in database backups. Applied styles are independent copies: removing a theme does not change any slides already using it. **Move theme to bin** is recoverable through **Theme recycle bin → Restore theme**. Built-in themes cannot be removed. The saved library is limited to 200 entries including removed themes; permanent deletion and theme file import/export are not included yet.

## 8. Save and Live behaviour

Service autosave stores style edits along with the service. If autosave is off, use **Save now** before closing. Saving a named reusable theme is a separate, explicit action.

Preview selection, text editing, layout dragging, theme application and Undo do **not** change the Live snapshot. **Take Live** publishes the selected slide with its current style. The audience renderer uses the same layout component as Preview.

**Clear text** removes the words and their backplate but keeps the styled background. **Blackout** covers the audience in true black. **Church card** uses its own default text layout, not a potentially small lower-third style. A video shared by consecutive lyric slides continues at its existing playback position.

“Applied” confirms a renderer update, not the physical projector, font availability or media decoding. Always rehearse on the actual presentation computer and display.

## 9. Phase 6 acceptance checklist

- Reopen an existing service and confirm its slides, songs and media remain available.
- Change font, colour, alignment and line spacing; verify Preview changes but Live does not.
- Move the text box with the mouse and arrow keys. Try upper/lower-third presets.
- Try a long slide and verify automatic shrinking and the small-text warning.
- Add a box or line-highlight background, dim the media, and test outline/shadow.
- Take Live and verify the physical audience display matches the intended layout.
- Copy/paste style, apply to an item and undo the operation.
- Save a theme, restart, apply it, move it to the theme recycle bin and restore it.
- Test clear text, blackout, church card and video continuity between lyrics.
- Back up and verify both the database and matching media folder exist.

Automated tests cover validation, persistence, upgrade snapshots, theme recovery, backups and immutable Live state. Browser checks exercise the actual interface, text fitting, styling, theme workflows and existing media/timer functionality with synthetic demonstration data. Native Windows, display scaling, fonts/codecs and physical projector checks still need to be performed on your equipment.

## 10. Scope and development

Phase 6 supplies **one styled text box per slide**. It is not a full PowerPoint-style multi-object editor. Multiple text layers, per-word formatting, shapes, transitions, rich-text paste, audio playback, stage output and Bible import/search remain outside this release. The next planned phase is the Bible module.

Build from source with Node.js 24+: `npm ci`, `npm run build`, `npm test`, `npm run test:ui`, and `npm start`. Visual checks additionally use Playwright and FFmpeg. Package Windows with `npm run package -- --platform=win32 --arch=x64`. Building a signed installer requires an appropriate Windows build/signing workflow; this release delivers the portable runtime.
