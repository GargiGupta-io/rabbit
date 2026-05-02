# Motion Clone Spec

Goal: Define the exact requirements for the high-fidelity Motion clone based on reverse-engineering findings.

## Current Evidence
- [x] Real desktop architecture identified
  - Motion desktop is an Electron app with:
    - `dist-electron/main/index.js`
    - `dist-electron/preload/index.cjs`
    - hosted web UI chunks under `dist/assets`
- [x] Real hosted base URL identified
  - `https://app.usemotion.com`
- [x] Desktop shell responsibilities identified
  - native window management
  - tab strip
  - app bar
  - option-space window
  - tray integration
  - protocol/deep-link handling
  - startup behavior
- [x] Current local runtime profile identified
  - Chromium-style profile with `IndexedDB`, `Local Storage`, `Session Storage`, `Cookies`, logs, and feature/config JSON

## 1. Product Requirements (Fidelity Level)
- [ ] UI/UX Parity (Sidebar, Calendar, Task view, Icons, Spacing)
  - must include desktop tab strip, app bar, and option-space behavior, not just the core web pages.
- [ ] Feature Parity (Scheduling, Tasks, Recurrence, Calendar sync)
  - must match observed task/event grouping, quick meeting flows, and tray/app-bar interactions.
- [ ] Performance Parity (Boot time, Sync speed, Interaction latency)

## 2. Technical Architecture
- [ ] App Shell
  - real Motion uses Electron today.
  - for a high-fidelity clone, we should not assume Tauri unless it can reproduce the same shell behavior cleanly.
- [x] Frontend (React / UI Framework)
  - current evidence points to React + Vite + Tailwind in the packaged desktop build.
- [x] Local Storage (SQLite / IndexedDB / Filesystem)
  - real app uses a Chromium profile with LevelDB-backed Local Storage and IndexedDB plus cookie/network state.
- [ ] API & Sync (Contract matching Motion's internal APIs)
  - hosted base confirmed; authenticated endpoint mapping still pending.

## 3. Security & Hardening (Mirroring Motion)
- [ ] Entitlement Authority (Server-side validation)
- [ ] Code Signing & Notarization
  - Mac-only later pass.
- [ ] Data Encryption & Keychain integration
- [x] Telemetry & Abuse monitoring
  - current evidence shows Sentry and Amplitude are wired into the desktop runtime.

## 4. Implementation Backlog
- [ ] P0: Finish reverse-engineering before new feature implementation
  - authenticated flows
  - route-by-route shell map
  - storage/network/entity mapping
- [ ] P1: Rebuild shell fidelity first
  - tabs
  - app bar
  - option-space
  - tray/menu behavior
- [ ] P2: Rebuild core product fidelity
  - calendar
  - inbox
  - tasks
  - projects
  - scheduling
- [ ] P3: Rebuild premium/AI/supporting surfaces
  - billing
  - meeting notes
  - AI employees / AI actions
  - docs / search / quick meeting

## Current Constraints
- The current local desktop state appears signed out, so the highest-value remaining recon step is login.
- Windows is the current reverse-engineering environment, but the final target remains macOS.
- Mac-specific polish should happen after product/shell parity, not before.
