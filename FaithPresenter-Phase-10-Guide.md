# FaithPresenter Phase 10 — Shared Rendering Pipeline

Version 0.10.0 builds on the tested Phase 9 application and preserves its database format.

## What is included

- A documented 1920 × 1080 output-frame model.
- Ordered Theme, Media and Slide Object layers.
- Immutable frame identities for inspecting Preview and the taken Live snapshot.
- Chromium graphics diagnostics, including honest software-fallback reporting.
- Active adapter boundaries for Preview, Audience and the independent Stage display.
- Defined—but not falsely activated—adapter boundaries for Livestream, NDI and SDI.

## Important limitations

This release does **not** transmit NDI or SDI and does not encode a livestream. NDI needs its licensed native SDK. SDI needs supported output hardware plus its vendor SDK and drivers. Livestream output still needs an encoder and destination configuration. The new panel establishes the frame contract these integrations will use later.

Chromium composites the existing slide surface and uses GPU acceleration when available. FaithPresenter reads Electron's actual feature status. It continues through Chromium's software fallback if GPU compositing is unavailable.

## Safe upgrade

1. In Phase 9, create a database backup and keep its matching media folder.
2. Close FaithPresenter.
3. Extract Phase 10 into a new folder; do not mix versions.
4. Run `FaithPresenter.exe` and confirm your services, songs, Bible translations and media remain available.
5. Keep Phase 9 and your backup until this checklist passes.

## Windows acceptance checklist

1. Open a service and select a slide.
2. Open **Outputs** from the top toolbar or resource dock.
3. Confirm the Preview frame lists Theme, Media and Slide Objects in the expected state.
4. Open Audience output black, then press **Take Live**.
5. Confirm Live Snapshot receives a different stable frame identity.
6. Edit the selected slide and confirm the Live frame does not change until another Take Live.
7. Open Stage and confirm it remains independent from Audience.
8. Expand Graphics diagnostics and note whether the compositor says GPU enabled or software fallback.
9. Confirm Livestream, NDI and SDI say Foundation/Planned rather than Active.
10. Close and reopen the app and confirm saved content remains.

## Development

From the folder containing `package.json`:

```bash
npm ci
npm run build
npm test
npm run test:ui
npm start
```

Build a Windows portable package with:

```bash
npm run package -- --platform=win32 --arch=x64
```

This remains an unsigned portable development build. Rehearse the packaged Windows application with your actual displays before church use.
