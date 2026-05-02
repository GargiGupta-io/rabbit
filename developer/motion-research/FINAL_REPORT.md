# Motion App Reverse-Engineering Report

## 1. Overview
This report documents the findings from the reverse-engineering of the Motion desktop application (v0.117.0) on Windows. The goal was to identify its architecture, data storage, network behavior, and security model to inform the development of a high-fidelity macOS clone.

## 2. Technical Architecture
- **Framework:** Electron (v36.9.5)
- **Frontend:** React (19.2.1), TailwindCSS (4.1.11), Vite (6.3.5)
- **Runtime:** Hybrid. The shell is local, but the main UI is hosted at `https://app.usemotion.com/web/calendar`.
- **Native Bridge:** Uses `koffi` for FFI (Foreign Function Interface) and `electron-store` for configuration.
- **Monitoring:** Sentry and Amplitude are integrated for crash reporting and analytics.

## 3. Security Model & Vulnerabilities
- **Sandbox:** The renderer runs with `sandbox: false`, which is a critical security risk as it grants the remote website more access to the host system.
- **Permissions:** The main process automatically grants all permissions (including clipboard access) to the Motion base URL.
- **IPC Exposure:** Over 100 IPC channels are exposed to the renderer via a `contextBridge` in the preload script.
- **Auth Flow:** Authentication tokens are passed via deep links (`motion://login?token=...`) and session cookies (Firebase, 10-day expiry).

## 4. IPC & Shell Capabilities
The desktop app extends the web experience with native features:
- **Windows Management:** Dedicated views for `mainWindow`, `tabBar`, `appBar` (tray-like), and `optionSpace` (quick-add).
- **Global Shortcuts:** 
  - `Alt+Space`: Add Task
  - `Alt+C`: Open Calendar
- **Tray Integration:** Supports a badge count and dynamic tray text (e.g., upcoming event title).
- **Tab Management:** Native implementation of a tabbed interface for navigating the web app.

## 5. Data Storage (Local)
- **Config:** `motion-production.json` stores user metadata, feature flags, and current "agenda" snapshots.
- **Databases:**
  - `IndexedDB`: Used for large-scale local data caching.
  - `Local Storage`: Stores theme preferences and telemetry state.
  - `Cookies`: Stores the primary session credentials.
- **Logs:** `main.log` provides a detailed trace of app startup, navigation, and IPC errors.

## 6. Entity Schema (Inferred)
Based on the `agenda` data in `motion-production.json`:
- **Task:** Includes `id`, `name`, `duration`, `priorityLevel`, `projectId`, `dueDate`, `isAutoScheduled`, `scheduledStart`, and `scheduledEnd`.
- **Project:** Includes `id`, `name`, `color`, and `workspaceId`.
- **Schedule:** Tasks are associated with schedules (e.g., `work`, `custom`) and can be "blocked" by other tasks.

## 7. Next Steps for Clone
1. **Shell Implementation:** Replicate the `tabBar` and `appBar` using Tauri's native windowing.
2. **API Alignment:** Implement the `v2/tasks` and `bootstrap` endpoints as defined in the `@motion/rpc-definitions` module.
3. **Data Sync:** Mirror the schema found in `IndexedDB` for local-first performance.
4. **Hardening:** Implement a proper sandbox and restricted IPC to improve upon the original's security model.
