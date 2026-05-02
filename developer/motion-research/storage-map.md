# Motion Local Storage Map

Goal: Locate and identify local storage locations, database files, and configuration artifacts for the Motion desktop app.

## 1. Local AppData / Roaming AppData
- [x] Installation directory
  - `C:\Program Files\WindowsApps\MotionSoftware.Motion-ProjectsTasksandCalendar_0.117.0.0_x64__t9nvwwj1p93w4`
- [x] Cache directories
  - package data root:
    `C:\Users\Pumba\AppData\Local\Packages\MotionSoftware.Motion-ProjectsTasksandCalendar_t9nvwwj1p93w4`
  - active Chromium-style runtime profile:
    `C:\Users\Pumba\AppData\Local\Packages\MotionSoftware.Motion-ProjectsTasksandCalendar_t9nvwwj1p93w4\LocalCache\Roaming\Motion`
- [x] User configuration (JSON/YAML/TOML)
  - `motion-production.json`
  - `Local State`
  - `Preferences`
- [x] Database files (SQLite, LevelDB, IndexedDB)
  - `IndexedDB\https_app.usemotion.com_0.indexeddb.leveldb`
  - `Local Storage\leveldb`
  - `Network\Cookies`
- [x] Log files and crash reports
  - `logs\main.log`
  - `Crashpad`

## 2. Browser Storage (Electron / WebView)
- [ ] LocalStorage keys and values
  - LevelDB path located; keys not yet decoded.
- [x] SessionStorage
  - `Session Storage` directory confirmed.
- [ ] IndexedDB databases and object stores
  - LevelDB backing store located; names/stores still need decoding.
- [ ] Cookies and authentication tokens
  - `Network\Cookies` exists; token mechanism still needs mapping.

## 3. OS Integration
- [ ] Keychain / Credential Manager entries
- [x] Autostart / Startup entries
  - `AppxManifest.xml` declares a Windows startup task.
- [x] Native menu / Tray configuration
  - `motion-production.json` contains `appBarSettings.showTrayText`.
  - `main.log` confirms app bar creation and desktop IPC for app bar behavior.
- [x] Temporary files
  - `TempState` and Chromium cache/temp directories exist.

## 4. Resource Analysis
- [x] Packaged assets (asar, zip, resources)
  - unpacked `resources\app` contains `dist`, `dist-electron`, `node_modules`, and `resources`
  - no immediate reliance on a single sealed `app.asar`
- [x] Executable properties and signatures
  - Windows app manifest confirms package identity `MotionSoftware.Motion-ProjectsTasksandCalendar`
  - app version `0.117.0.0`
- [ ] Loaded DLLs / Modules
- [x] Sub-processes (renderer, utility, GPU, etc.)
  - runtime behaves like a Chromium/Electron multi-process app

## Immediate next storage tasks

- decode Local Storage LevelDB keys
- inspect IndexedDB names and likely object stores
- compare file deltas before vs after Motion login
- determine whether auth lives in cookies, IndexedDB, or both
