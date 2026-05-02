# Build Command Notes
- Run project bootstrap in one pass
- Use CI mac validation only for release-related checks
- Desktop packaging smoke check:
  - `npm run desktop:build`
  - `npm run desktop:native:preflight -- --target=macos`
  - `npm run desktop:native:build -- --dry-run --target=macos`
- Packaging proof contract:
  - `ops/phase-9-packaging-smoke-check.json`
  - `ops/packaging-smoke-check.md`
