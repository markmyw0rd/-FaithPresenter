# FaithPresenter

FaithPresenter is an offline-first Windows desktop application for preparing and presenting church services. It keeps the operator workspace separate from Audience, Stage and Stream output so selecting or editing a slide does not change what is live.

> Development release: Phase 16 / v0.16.0. Rehearse every release on the actual Windows computer, projector, displays and sound system before service use.

## Current capabilities

- Multiple saved services with autosave, recovery history, recycle bin and backups
- Song library with lyric sections and arrangements
- Offline Bible JSON import, search and passage-to-slide generation
- Images, silent preview, live audio/video playback and announcement slideshows
- Slide styling, themes, text fitting and transitions
- Independent Audience, Stage and OBS-friendly Stream windows
- Run-of-show cue queue with guarded GO controls
- Service preflight, rehearsal checklist and downloadable report
- Live service dashboard with clock, completion percentage and remaining cues

NDI, SDI, code signing and production hardware certification are not included.

## Development setup

Requirements: Windows 10/11, Node.js 24+ and Git.

```powershell
git clone https://github.com/markmyw0rd/-FaithPresenter.git
cd FaithPresenter
npm.cmd ci
npm.cmd start
```

Build and test:

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:ui
npm.cmd run make:windows
```

The Windows Setup output is created under `out\make\squirrel.windows\x64`.

## Data safety

Never commit a church database, imported Bible file, media library, backup or generated installer. These are excluded by `.gitignore`. Development and installed builds can use the same local profile, so back it up before testing database-affecting changes.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use GitHub Issues for reproducible bugs and focused feature proposals. Security concerns should follow [SECURITY.md](SECURITY.md).

## License status

No open-source licence has been selected yet. Source is visible for review and contribution, but redistribution rights remain reserved until the project owner adds a licence.
