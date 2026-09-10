# FaithPresenter Phase 12 — Production Control Center

Version 0.12.0 builds on Phase 11 and keeps the same database format.

## Added

- One dashboard for Audience, Stage and Stream health.
- Independent display of each output's current source and state.
- **Take to Audience + Stream** with explicit per-destination results.
- Deterministic linked Clear, Blackout and Restore controls.
- Partial-failure reporting: one failed destination cannot hide or cancel another destination's result.
- A session-only operator action report for the latest 20 linked actions.
- NDI and SDI remain visibly planned rather than incorrectly reported as operational.

Stage is monitored but deliberately excluded from linked visual commands because its current/next lyrics and private team layout are different from the Audience and Stream frames.

## Safe upgrade

1. Back up Phase 11 and its matching media folder.
2. Close FaithPresenter and all output windows.
3. Extract Phase 12 into a new folder.
4. Run `FaithPresenter.exe` and confirm version 0.12.0.
5. Keep Phase 11 until the checklist passes.

## Windows production checklist

1. Open Audience output and the OBS clean feed.
2. Open Stage on a different display when available.
3. Open **Control** from the top toolbar or **Production** in the resource dock.
4. Confirm the status cards accurately show which outputs are ready.
5. Select a slide and press **Take to Audience + Stream**.
6. Confirm Audience and Stream update, while Stage retains its team layout.
7. Close only Stream and take again. Confirm Audience succeeds and Stream reports `not ready`.
8. Reopen Stream and test Clear Audience + Stream.
9. Test Blackout Audience + Stream, then Restore Audience + Stream.
10. Confirm the session report lists each destination separately.
11. Close and reopen FaithPresenter and confirm saved services and media remain.

## Development

```bash
npm ci
npm run build
npm test
npm run test:ui
npm start
```

Build a Windows portable package:

```bash
npm run package -- --platform=win32 --arch=x64
```

This remains an unsigned portable development build. Test the packaged application on the actual Windows, OBS, projector and stage setup before church use.
