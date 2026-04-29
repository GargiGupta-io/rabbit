# Desktop Shell Hardening Contract

## Goal
Improve on the original Motion desktop shell risks while keeping feature parity.

## Risks Observed In Recon
- renderer sandboxing was disabled in the original shell
- host permissions were granted too broadly
- the preload bridge exposed a very large IPC surface

## Hardening Rules

### 1) Allowlisted bridge surface
- Renderer-to-native traffic may use only the explicit sendable desktop shell channels.
- Native-to-renderer events may use only the explicit receivable desktop shell channels.
- Shell snapshot sync may use only the reduced sync channel set required for tabs, navigation, agenda, theme, and app-bar state.
- Unsupported channels are treated as security violations, not convenience fallbacks.

### 2) Deny-by-default permissions
- Do not auto-grant clipboard, calendar, open-external, or other host permissions for a whole origin.
- Permission requests must be tied to explicit user actions or native capabilities.
- Development shortcuts must not become release defaults.

### 3) Minimal native command surface
- Keep the Rust/Tauri command set narrow and typed.
- Validate payloads at the command boundary.
- Do not add generic eval, proxy, or wildcard forwarder commands.

### 4) No real user data in shipped defaults
- Fixture and fallback identity values must be synthetic.
- Signed-in recon data is reference material, not release data.
- Calendar/account defaults in the shipped app should use placeholder identities until real user state is loaded.

### 5) Entitlement authority assumptions
- Premium mutations depend on server-authoritative entitlement state.
- Offline fallback may preserve last known safe state, but revoked or invalid authority state must fail safe.
- Release assumptions must treat local entitlement storage as cache, not truth.

### 6) Signed release and update chain
- macOS release artifacts must be signed and notarized in the Mac lane.
- Update metadata must carry trusted source, version, hash, and signature expectations.
- Unsigned or unverifiable updates are rejected.

## Validation
- Tests assert the bridge rejects unsupported channels.
- Release docs include shell bridge, permissions, entitlement, and signing checks.
- Native command additions require explicit review.
