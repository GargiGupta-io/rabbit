# Release Readiness Checklist (v1)

## Pre-Release Gate

### Build and CI
- [ ] `npm run lint` succeeds.
- [ ] `npm run build` succeeds.
- [ ] CI pipeline runs on every push and PR.

### Mac Distribution
- [ ] mac artifact build succeeds in mac lane.
- [ ] Code signing applied.
- [ ] Notarization status is valid.
- [ ] App launch and main lifecycle smoke test passes.

### Security Controls
- [ ] Release artifact hash recorded.
- [ ] Update channel points only to official feed.
- [ ] Entitlement check path tested against valid + invalid tokens.
- [ ] No hardcoded production secrets in repo.
- [ ] Desktop shell bridge rejects unsupported channels.
- [ ] No blanket host permission auto-grants remain in release behavior.
- [ ] Shipped defaults use synthetic identity data only.

### Reliability
- [ ] Core boot path tested cleanly from fresh install.
- [ ] Existing update path tested.
- [ ] Crash/error logging baseline is in place.
- [ ] Rollback/disable plan documented.

### Legal and Business
- [ ] Terms/license expectations are updated.
- [ ] Support and abuse reporting path documented.

## Approval Criteria
Release is approved only when all required checks above are complete.
