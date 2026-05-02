# Motion Reverse-Engineering: Master Process Log

## Phase 1: Location & Entry
1. **Target Identification:** Used PowerShell recursion to find the Motion installation hidden in `C:\Program Files\WindowsApps`.
2. **Environment Mapping:** Identified the app as a "Hybrid Electron" model—a local shell hosting `https://app.usemotion.com`.
3. **Profile Extraction:** Located the Chromium data profile in `AppData\Local\Packages\...` to find where the app stores your actual tasks.

## Phase 2: Tech Stack De-compilation
1. **Dependency Audit:** Read the internal `package.json`. Confirmed React 19, Tailwind 4, and Vite 6.
2. **Library Recovery:** Discovered that the production build included unminified TypeScript source for internal `@motion` libraries.
3. **Asset Heist:** Manually copied the internal logic modules (`rpc`, `sync-engine`, `ui-logic`) into the research folder.

## Phase 3: Live Data Capture
1. **Behavioral Analysis:** Monitored `main.log` to see how the shell handles deep links and window creation.
2. **The "RECON_TEST" Payload:** Triggered a task creation and successfully captured the exact JSON schema from `motion-production.json`.
3. **CSS Variable Extraction:** Scraped the production CSS bundle to get the exact `oklch` color palette and Tailwind theme tokens.

## Phase 4: Security Audit (The "Weaknesses")
1. **Sandbox Check:** Confirmed the renderer runs with `sandbox: false` (Critical Risk).
2. **Permission Check:** Identified that the shell automatically grants clipboard and native access to the remote domain.
3. **Token Analysis:** Found that authentication tokens are passed as plaintext in URLs, exposing them to system logs.

## Conclusion
We started with a "black box" and ended with a complete engineering blueprint. The transition to the macOS Tauri build is now a matter of "porting" the captured logic rather than guessing it.
