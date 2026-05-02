# Motion Engineering Analysis & Learning Doc

## 1. Executive Summary
This document provides a comprehensive technical breakdown of the Motion application (v0.117.0) based on a deep-dive reverse-engineering session. We successfully mapped the application's architecture, security model, UI component hierarchy, and data schemas within a 7-day research window.

## 2. Technical Stack (The "Skin & Bones")
*   **Shell:** Electron v36.9.5 (Windows Desktop Bridge).
*   **Frontend Core:** React 19.2.1, Vite 6.3.5.
*   **Styling:** TailwindCSS 4.1.11 with extensive custom semantic variables (e.g., `oklch` colors).
*   **Editor:** ProseMirror (customized via Tiptap).
*   **Date Logic:** Luxon and RRule (for complex recurrence).
*   **Native Bridge:** `koffi` (FFI) and `electron-store`.

## 3. UI Component Architecture
We identified a sophisticated hybrid model where local shell UIs (App Bar, Tabs) control a remote hosted web app:
*   **Local Components:** `AppBar`, `QuickMeeting`, `NoteTaker`, `ActionList`, `Popover`, `Toggle`.
*   **Data Flow:** Local shell components communicate via IPC (`contextBridge`) to trigger actions in the main web view or vice versa.
*   **Theme Support:** Full "Dark/Light" mode support via `data-theme` attributes and CSS variables.

## 4. Data & Schema (The "Brain")
Through the `RECON_TEST` task capture, we identified the core `Task` entity structure:
*   **Identifiers:** Prefix-based IDs (e.g., `tk_` for tasks, `ws_` for workspaces).
*   **Scheduling:** Uses `auto-schedule` logic with fields like `deadlineType`, `duration`, `isUnfit`, and `scheduleId`.
*   **State Management:** The app maintains a local "Agenda" snapshot in `motion-production.json`, allowing the shell to display upcoming events even if the web view is loading.

## 5. Security Audit Findings
1.  **Vulnerability:** Renderer runs with `sandbox: false`.
2.  **Vulnerability:** Automatic permission granting for `usemotion.com` (including clipboard).
3.  **Vulnerability:** Auth tokens passed in plaintext deep links (`motion://login?token=...`).
4.  **Risk:** The "Hybrid" nature means a server compromise allows full shell control.

## 6. Research Process (How we did it)
1.  **Recon:** Located the app in `C:\Program Files\WindowsApps` using PowerShell.
2.  **Extraction:** Read the bundled JS/CSS assets to identify the tech stack.
3.  **Mapping:** Analyzed the `preload` script to list all 100+ IPC channels.
4.  **Capture:** Forced a local data sync by creating a named task (`RECON_TEST`) and inspecting the resulting JSON in the AppData profile.
5.  **Validation:** Verified findings against the real application's logs (`main.log`).

## 7. Conclusion
We now have a **pixel-perfect blueprint** for building the macOS clone. The next phase will focus on replicating this logic using **Tauri**, which will allow us to fix the identified security flaws (implementing a proper sandbox and restricted IPC) while maintaining high-fidelity feature parity.
