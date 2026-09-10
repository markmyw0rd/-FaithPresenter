# FaithPresenter Phase 1 — Windows acceptance checklist

Record Windows version, display connections and any error text. Leave a check unchecked until tested on actual Windows hardware.

- [ ] Node.js 24 LTS installed for development; `npm ci` succeeds.
- [ ] `npm test` passes; `npm run build` succeeds.
- [ ] `npm start` opens the dedicated FaithPresenter window.
- [ ] No blank screen or unexpected browser opens.
- [ ] Church name saves and survives closing/reopening.
- [ ] An empty church name cannot be saved.
- [ ] Open data folder opens the actual settings location.
- [ ] The desktop interface remains usable at 960 × 700 or larger.
- [ ] One-screen test opens as a separate window; Escape closes it.
- [ ] Extended projector is listed and its test opens on the intended screen.
- [ ] Escape and Close output both close the test window.
- [ ] Unplugging a display closes the output and refreshes available displays.
- [ ] Closing the operator closes its output.
- [ ] Launching a second instance focuses the original application.
- [ ] `npm run make:windows` creates the Setup EXE successfully.
- [ ] Setup installs on a separate Windows x64 machine without Node or VS Code.
- [ ] Installed app opens and operates without internet.
- [ ] Shortcuts and Windows uninstall entry are present.
- [ ] A rebuilt development release preserves the existing local settings.
- [ ] Uninstall works; record whether the user-data folder remains.

Phase 1 is accepted only after these checks pass. This does not make the app ready to present songs or run services; those features are later phases.
