# Plan: Phase 8 - Native Desktop, Mac Parity, and Hardening

## Goal
Bring the clone from strong product-behavior parity to high-fidelity desktop delivery with native shell contracts, macOS fit, and improved hardening over Motion's original shell.

## Current state at Phase 8 start
By this point, the repo should be much closer to Motion in shell, entities, views, forms, calendar behavior, and sync/cache structure.

The remaining gap should be desktop-native and platform-specific:
- true shell bridge behavior,
- macOS polish,
- release hardening,
- permission and update-chain control.

Research now available:
- `developer/motion-research/FINAL_REPORT.md`
- `developer/motion-research/ENGINEERING_LEARNINGS.md`
- `developer/motion-research/CODE_ASSETS/SHELL_LOGIC/`

## Execution mode

Use `/steps` for one numbered step at a time.

## Approach
This phase is the product-to-platform pass.

Keep product behavior stable and improve:
- the desktop bridge,
- macOS shell feel,
- security posture,
- release readiness.

## Phase 1 - Native Shell Contract (~55m)

41. Abstract shell IPC contracts from extracted shell logic.
   - Define a clean local bridge for tabs, agenda updates, quick actions, and shell events.
   - Touch: desktop shell modules, `apps/desktop/src/main.tsx`, tests.

42. Align desktop actions with real shell surfaces.
   - Bring tab, app-bar, search, quick meeting, and shortcut behavior closer to the extracted shell direction.
   - Touch: shell modules, `apps/desktop/src/main.tsx`, tests.

## Phase 2 - Mac and Hardening Pass (~70m)

43. Apply macOS-specific shell polish.
   - Align shortcuts, menus, and window behavior with macOS expectations without changing product behavior.
   - Touch: desktop shell modules, platform config, tests or validation docs.

44. Implement hardening improvements over the original shell.
   - Reduce bridge surface,
   - tighten permissions,
   - align entitlement authority and release assumptions,
   - prepare signing/update-chain documentation.
   - Touch: desktop shell modules, contracts/docs, tests.

## Phase 3 - Verification (~25m)

45. Run the Phase 8 verification gate.
   - Run `npm run test`.
   - Run `npm run typecheck`.
   - Run `npm run build`.
   - Verify macOS-facing and security-facing assumptions are documented and testable.

## Files

Modify:
- desktop shell modules
- `apps/desktop/src/main.tsx`
- release/security docs and related runtime contracts
- `scripts/test.mjs`

## Edge cases

- macOS polish conflicts with Windows recon behavior:
  preserve product behavior and change only platform-specific shell affordances.

- Security hardening breaks development ergonomics:
  keep development and release modes explicit instead of mixing them.

- Native shell changes reveal hidden assumptions in the UI:
  fix those through bridge contracts, not ad hoc UI exceptions.

## Risks

- Native polish can turn into an open-ended platform rewrite.
  Mitigation: keep the scope limited to shell fit and hardening.

- Hardening work can become abstract if not tied to the extracted Motion risks.
  Mitigation: prioritize sandbox, permissions, bridge surface, entitlements, and release integrity.

## Done when

- The clone has a defined native shell contract.
- macOS-specific polish work is captured and applied without changing product behavior.
- Hardening work improves on the original Motion shell's known risks.
- `npm run test`, `npm run typecheck`, and `npm run build` pass.
