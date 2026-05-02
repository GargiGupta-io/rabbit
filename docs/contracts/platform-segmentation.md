# Platform Segmentation Contract

## Goal
Keep development efficient on Windows while reserving macOS-specific tasks for CI or short Mac sessions.

## Decision
- Client stack: Tauri + React + TypeScript + Rust.
- Development model: Windows-first, Mac-on-demand validation.

## Work Allocation Matrix

### Windows-first (daily work)
- Requirements and product planning updates.
- Core app logic and data model implementation.
- Task/project feature coding.
- API clients and business rules implemented above the local app layer.
- Test coverage for non-native behavior.
- Performance profiling of data flow and algorithm logic.

### Mac-only or Mac-privileged
- macOS code signing and notarization.
- Apple entitlements configuration.
- macOS permission checks for calendar/reminders/keychain behavior.
- macOS build smoke checks and final artifact verification.
- App Store or mac release packaging process.
- `.github/workflows/mac-packaging-lane.yml` verification and packaging lane maintenance.

### Shared
- Security policy decisions.
- Release planning and rollout procedures.
- Incident response process and revocation controls.

## Operational Rules
1. No feature is considered complete until:
   - it works in local Windows flow, and
   - macOS-impacting behavior is validated in the Mac build lane.
2. Do not block daily coding on missing local mac hardware.
3. If mac-only behavior is required for a feature, build a simulation path first.
4. All release artifacts must be validated on the Mac lane before public sharing.
5. Placeholder package workflows must fail clearly until signing and notarization are genuinely configured.

## Team Rule
- Every item in the roadmap should have a line marking whether execution is Windows-first or Mac-only.
