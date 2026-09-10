# Contributing to FaithPresenter

Thank you for helping improve FaithPresenter.

## Before starting

1. Search existing issues and pull requests.
2. Open an issue before a large feature or database-schema change.
3. Keep Audience, Stage and Stream output explicit and independent from Preview.
4. Never include church data, licensed Bible text, copyrighted song lyrics, private media or credentials.

## Development workflow

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd test
npm.cmd run test:ui
```

Create a branch such as `fix/clear-output` or `feature/service-notes`. Keep commits focused and explain user-visible behaviour in the pull request.

## Pull-request checklist

- Existing services and database migrations remain safe.
- Preview changes never publish without an explicit operator action.
- Output errors are visible and do not silently replay old content.
- Keyboard shortcuts do not trigger while typing.
- Empty, loading, disabled and failure states are handled.
- Build and automated tests pass.
- Windows and physical-output limitations are stated honestly.

Contributors retain responsibility for ensuring submitted code and assets may legally be distributed.
