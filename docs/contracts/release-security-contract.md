# Release Security and Anti-Cloning Contract (v1)

## Scope
Defines practical protections for v1. This is a hardening baseline, not absolute unbreakable security.

## Principles
1. Security by design: keep sensitive logic server-side.
2. Signed trust chain: release artifacts are validated before use.
3. Operational control: ability to revoke abuse fast.

## Mandatory Controls

### 1) Signed Release Builds
- Build jobs produce one canonical artifact.
- Mac artifacts are signed before distribution.
- Distribution metadata records build hash and version.

### 2) Signed Update Chain + Hash Verification
- Updates are delivered from one official channel.
- Each update bundle includes hash + signature metadata.
- App verifies integrity before update install.

### 3) Server-Authoritative Licensing and Entitlements
- Premium status and feature flags are resolved from backend responses.
- Local client flags are treated as hints only.
- Every sensitive action checks entitlement state.

### 4) No Secret-in-Client Rule
- No API keys or signing secrets in frontend bundle.
- Long-lived credentials stored using OS secure storage (Keychain on macOS).
- Placeholder keys only in local development; rotate before release.

### 5) Minimal Native Surface
- Only expose narrowly scoped Rust bridge commands needed by the app shell.
- Validate input/output for every command boundary.
- Desktop shell traffic uses explicit allowlisted sendable and receivable channel catalogs only.
- Shell snapshot sync uses a reduced channel subset rather than the whole bridge catalog.

### 6) Permission Deny by Default
- Release builds must not auto-grant clipboard, calendar, or open-external access for a whole origin.
- Permission requests must be tied to explicit user actions and native review paths.

### 7) Tamper and Abuse Signals
- Log unexpected signature/update/auth anomalies.
- Track abnormal offline/online entitlement behavior.
- Flag unusual device/token churn for manual review.

### 8) Incident Revocation and Recovery
- Backend supports token/device revocation.
- Emergency disable path for compromised credentials.
- Recovery flow documented in operations notes.

### 9) Release Data Hygiene
- Fixture and fallback identities in shipped builds must be synthetic.
- Signed-in research data is reference material only and must not ship as defaults.

## Acceptance Criteria (v1)
- Release pipeline cannot publish unsigned artifacts.
- Update install flow verifies trusted source + hash.
- License checks fail-safe (critical actions blocked when entitlement checks fail).
- A basic revocation test is runnable.

## Out of Scope for v1
- Full DRM.
- Obfuscation level beyond practical production baseline.
