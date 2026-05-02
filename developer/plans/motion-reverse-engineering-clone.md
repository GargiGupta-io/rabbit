PLAN: Motion Reverse-Engineering Clone

Goal: Study the real Motion app deeply enough to reproduce its structure, flows, scheduler behavior, and UI patterns as closely as practical, while still targeting a final macOS clone.

Current state: The local repo already has a custom-built baseline with tasks, planner logic, calendar overlay support, entitlement refresh state, and passing project checks, but it was built from our own contracts instead of first extracting Motion's real behavior. Motion is currently available on this machine through the Microsoft app path on Windows, and the final clone target remains macOS.

Approach: Stop treating the app as an original product design problem and shift to a reverse-engineering workflow. Use the Windows Motion app as the behavior oracle right now because it is available and faster to inspect. Extract product behavior, data flow, storage, and network patterns from the Windows install first. Then convert that into a clone spec and rebuild the repo against it. After parity is close, run a shorter Mac-specific correction pass for platform shell differences.

Key working rule:
- Windows Motion is the source of truth for product behavior now.
- macOS is the source of truth later for platform polish and native-shell fidelity.

STATUS SNAPSHOT (2026-04-22)

What is already confirmed:
- Motion is installed as a Microsoft-packaged Windows desktop app.
- Installed executable:
  `C:\Program Files\WindowsApps\MotionSoftware.Motion-ProjectsTasksandCalendar_0.117.0.0_x64__t9nvwwj1p93w4\Motion - Projects, Tasks, and Calendar.exe`
- User package/runtime data root:
  `C:\Users\Pumba\AppData\Local\Packages\MotionSoftware.Motion-ProjectsTasksandCalendar_t9nvwwj1p93w4`
- The package is not just a sealed binary. It exposes an unpacked app structure under `resources\app` with:
  - `dist`
  - `dist-electron`
  - `node_modules`
  - `resources`
- `resources\app\package.json` confirms the desktop app is a Vite + Electron app using React 19, Tailwind 4, Electron 36, and a separate `dist-electron` shell.
- The app loads the web product from `https://app.usemotion.com/web/calendar`.
- Runtime profile is Chromium-style under:
  `C:\Users\Pumba\AppData\Local\Packages\MotionSoftware.Motion-ProjectsTasksandCalendar_t9nvwwj1p93w4\LocalCache\Roaming\Motion`
- Confirmed local runtime artifacts:
  - `IndexedDB`
  - `Local Storage`
  - `Session Storage`
  - `WebStorage`
  - `Network\Cookies`
  - `logs\main.log`
  - `motion-production.json`
- Current local runtime state suggests the desktop shell is not signed in yet:
  - `userEmail: null`
  - empty `tabs`
  - empty `agenda`
- `main.log` confirms desktop-specific IPC and shell features including:
  - app bar
  - tab handling
  - quick meeting flows
  - inbox badge updates
  - note taker hooks
  - desktop auth/logout hooks
  - navigation and theme update channels

IMMEDIATE WORK QUEUE

1. Static package recon
   - map `dist-electron/main`
   - map `dist-electron/preload`
   - inspect `dist/src` and asset layout
   - identify desktop-only shell code vs shared web app code

2. Local storage recon
   - inventory Local Storage LevelDB keys
   - inventory IndexedDB database names and likely stores
   - inspect cookies and persistent network state metadata
   - identify what survives restart before login and after login

3. Behavioral shell recon
   - map startup windows
   - map app bar behavior
   - map desktop-only menu/protocol/startup behavior
   - map default landing route, tab behavior, and window creation flow

4. Authenticated recon
   - after sign-in, capture real workspace state
   - inspect local file deltas after login
   - map tasks, projects, calendar, inbox, settings, and upgrade flows
   - inspect authenticated network/API behavior

5. Clone-spec translation
   - turn findings into a parity checklist
   - rewrite current repo plan around observed Motion behavior
   - stop preserving existing custom architecture where it diverges

MINIMUM MANUAL WORK LEFT

- Sign in to Motion once.
- Keep the app open while recon is running.
- Optional but useful: connect a real calendar and leave some real tasks/projects visible.

PHASES

Phase 1: Local Motion Recon on Windows (~60-90m)
  1. Locate the installed Microsoft app package, runtime files, app data directories, and process paths.
  2. Inventory the package structure, cached assets, local storage, logs, and any obvious frontend/native boundaries.
  3. Capture a shell map of the live product: onboarding, navigation, task flows, calendar flows, scheduling, shortcuts, settings, and upgrade prompts.

Phase 2: Behavioral Reverse Engineering (~90-150m)
  4. Record exact user flows screen by screen with state transitions, inputs, outputs, UI copy, and empty states.
  5. Observe local data behavior: cache files, IndexedDB/localStorage, config, SQLite if present, tokens/keys location, and offline behavior.
  6. Observe your own authenticated network traffic to identify API shapes, sync cadence, scheduler refresh timing, and response patterns.

Phase 3: Clone Specification (~60-90m)
  7. Convert findings into a clone spec: screens, components, shell layout, state model, entity schema, scheduler rules, calendar semantics, entitlement flows, inbox behavior, booking links, and edge cases.
  8. Diff the current repo against the reverse-engineered spec and mark what stays, what must be rewritten, and what is missing.
  9. Break the clone build into implementation waves ordered by user-visible fidelity rather than internal convenience.

Phase 4: Guided Rebuild (~ongoing)
  10. Rework the repo screen by screen and system by system against the reverse-engineered spec.
  11. Test each slice against the live Motion app, not just against our own assumptions.
  12. Keep a running Motion parity checklist instead of generic feature-complete status.

Phase 5: Mac Parity Pass (~later)
  13. Validate the rebuilt clone against macOS-specific expectations: shell layout, menu placement, keyboard feel, native dialogs, and desktop conventions.
  14. Adjust platform-specific details without changing the reverse-engineered product behavior.
  15. Reserve final Mac-only work for packaging, signing, notarization, and native-shell polish.

MAC TARGET NOTES

The final product target is still macOS, but the fastest way to get close to an exact Motion clone is:
- reverse engineer Windows Motion now
- clone product behavior first
- treat Mac differences as a later shell/platform pass

What will transfer directly from Windows recon to the Mac clone:
- screen hierarchy
- routes and shell layout
- entity model
- task and calendar flows
- inbox/project/workspace behavior
- scheduler semantics
- entitlement and feature gating behavior
- most API and sync behavior

What still needs a Mac-specific pass later:
- menu bar and native menu layout
- traffic-light window controls and titlebar feel
- native permission prompts
- Mac keyboard conventions and shortcut polish
- Mac packaging, signing, notarization, and updater behavior

Mac workaround rule:
- do not block reverse engineering on getting the macOS app immediately
- use the Windows app to learn the product
- use a later Mac pass to learn platform polish

FILES

Likely create outside repo first:
- `C:\Users\Pumba\developer\plans\motion-reverse-engineering-clone.md`
- `C:\Users\Pumba\developer\motion-research\feature-map.md`
- `C:\Users\Pumba\developer\motion-research\storage-map.md`
- `C:\Users\Pumba\developer\motion-research\network-map.md`
- `C:\Users\Pumba\developer\motion-research\clone-spec.md`
- `C:\Users\Pumba\developer\motion-research\repo-gap-analysis.md`
- `C:\Users\Pumba\developer\motion-research\manual-next-steps.md`

Likely modify inside repo later:
- `learnings/planning.md`
- `learnings/steps.md`
- `learnings/plans/phase-4-plan.md` or replace it with a reverse-engineering phase plan

WINDOWS VS MAC RULES

Use Windows Motion now for:
- exact product flows
- visible UI structure
- task/calendar/inbox/project behavior
- local storage behavior
- your own authenticated network behavior
- shell and feature inventory

Do not trust Windows Motion for final Mac fidelity in:
- menu bar behavior
- native permissions dialogs
- exact macOS keyboard feel
- window chrome and traffic-light controls
- signing, notarization, packaging, and native distribution details

Practical workaround:
- reverse engineer product behavior on Windows now
- build parity against those findings
- do a shorter Mac-specific correction pass later instead of blocking current progress

EDGE CASES

- Motion is packaged as a protected Microsoft app: prefer runtime behavior, user-level storage, and authenticated traffic over static package extraction if package access is limited.
- Motion package is partially readable and exposes unpacked `resources\app`: use that to map shell/frontend boundaries before falling back to black-box inference.
- Motion app is obfuscated or packaged oddly: fall back to behavioral and storage/network analysis instead of static code assumptions.
- Some API responses are encrypted, compressed, or hard to map: capture shapes from multiple flows and infer stable contracts carefully.
- Motion behavior depends on remote flags or account state: test with multiple states and note what changes.
- Current repo diverges from Motion in foundational ways: stop layering patches and rewrite the mismatched slice cleanly.

RISKS

- Chasing exact internals can waste time if the cloned result only needs product parity.
  Mitigation: prioritize behavior and UX parity first, internals second.

- Reverse engineering can produce lots of raw notes but no build momentum.
  Mitigation: convert every discovery into a concrete clone-spec artifact.

- The existing repo may bias decisions toward our current architecture.
  Mitigation: treat the repo as disposable where it diverges from Motion.

- Windows and macOS shells may differ more than expected.
  Mitigation: separate product-behavior parity from platform-polish parity and handle Mac-specific work as its own pass.

DONE WHEN

- We have a clear map of Motion's real Windows screens, flows, storage, and sync behavior.
- We can explain how key Motion systems behave before writing more feature code.
- The next implementation work is driven by a reverse-engineered parity spec instead of our own guesses.
- We have a defined later pass for macOS-specific fidelity instead of pretending Windows and macOS are identical.
