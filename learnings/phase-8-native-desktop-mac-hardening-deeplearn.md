# Phase 8 Native Desktop, Mac Parity, and Hardening Deep Learn

> This phase turned the repo from "a close product clone inside a browser-like shell" into "a desktop-shaped app with a native seam, Mac-specific behavior, and a tighter release posture." That matters because the last gap between a believable clone and a real desktop app is not the planner logic. It is how the shell talks to the app, how the platform feels, and how much unsafe surface is left exposed.

---

## In Plain English

By the time Phase 8 started, the app already looked much closer to Motion than it had at the beginning of the project. It had richer tasks, projects, views, inbox behavior, calendar overlays, scheduling rules, and sync-style state. But it still had one major "almost there" problem: it behaved like a web app dressed up as a desktop app more than a real desktop product with platform rules.

Phase 8 fixed that by building a real desktop seam. The app now has a dedicated shell bridge, a Mac-first platform profile, stricter rules for which bridge messages are allowed, and release-facing docs that explain how permissions, entitlements, signing, and updates should work. In plain terms, the app no longer just looks like Motion. It now behaves more like a desktop product that could actually be packaged and shipped safely.

The deeper lesson from this phase is that desktop fidelity has two layers. The first layer is what the user sees: tabs, menus, traffic lights, shortcuts, quick-add behavior, and app-bar actions. The second layer is what the user does not see: whether the bridge is wide open, whether release defaults leak real user data, whether host permissions are too broad, and whether update assumptions are written down clearly enough to stop future mistakes. Phase 8 handled both layers together.

## What Phase 8 Was Solving

At the end of Phase 7, the app had strong product-behavior parity, but the desktop shell still had four major gaps:

1. It lacked a clean native boundary for tabs, agenda sync, app-bar traffic, and quick actions.
2. It did not yet feel properly Mac-like, even though macOS was still the final target.
3. The bridge surface was broader and looser than it should be for a release-shaped desktop app.
4. Release and hardening assumptions were still only partially captured across the docs.

Those gaps matter because desktop apps carry a different kind of trust than browser apps. Users assume:
- keyboard shortcuts feel native,
- tabs behave predictably,
- shell actions do not break state,
- the app is not casually exposing privileged capabilities,
- shipped defaults do not leak private identity data,
- release/update behavior has a defined trust chain.

If those details are wrong, the product can still look polished in screenshots while feeling fragile in real use.

## The Core Idea of the Phase

The big idea in Phase 8 was simple:

Build one clear seam between the app and the desktop shell, then make that seam both more realistic and more restrictive.

This led to three linked changes:

1. A Motion-shaped shell bridge
2. A platform profile for macOS behavior
3. A hardening pass that reduces the unsafe surface

The important thing is that these were not separate efforts. The bridge defines what the shell can do. The platform profile defines how the shell should feel. The hardening pass defines what the shell must not be allowed to do.

## What We Built

### Step 41: Native Shell Bridge Baseline

This step created the desktop bridge and gave the app one place for shell communication.

The key file was:
- `apps/desktop/src/desktopShellBridge.js`

In plain English, this file acts like a translator between the desktop shell and the app. Instead of `main.tsx` deciding everything directly, the shell can now send and receive named messages for things like:
- selecting tabs,
- sending agenda updates,
- triggering search,
- opening tasks or events,
- creating a quick meeting,
- reporting app-bar state.

This mattered because the Motion research showed that the real app has a distinct desktop communication layer. If the clone kept all of that behavior buried inside page code, it would never really match the shape of the original app.

### Step 42: Desktop Action Surface Alignment

This step made the shell behave more like a real desktop shell instead of just exposing a shell-shaped layout.

The main additions were:
- closable and movable view tabs
- shell-driven search and new-task actions
- quick-meeting creation through the bridge
- desktop shell event routing for app-bar actions

In plain English, the app stopped being "a page with a sidebar" and started acting more like a desktop workspace with its own controls and shortcuts.

### Step 43: macOS Shell Polish

This step built the Mac personality into the shell.

The key files were:
- `apps/desktop/src/desktopPlatform.js`
- `apps/desktop/src/main.tsx`
- `apps/desktop/src-tauri/tauri.conf.json`
- `learnings/phase-8-macos-shell-validation.md`

This added:
- Mac-style traffic-light window chrome
- Mac-native shortcut intent
- option-space behavior for task capture
- overlay-title assumptions for the Tauri window
- a real checklist for later Mac validation

In plain English, the app stopped being a generic desktop shell and started presenting itself like something designed for macOS.

### Step 44: Shell Hardening and Release Assumptions

This step tightened the parts that users usually never see directly.

The key additions were:
- explicit channel allowlists
- reduced sync-channel surface
- blocked unsupported bridge calls
- synthetic default identities
- typed native command validation
- release hardening docs

This mattered because the Motion recon did not just tell us what to copy. It also exposed what to improve on:
- sandbox disabled
- overly broad host permissions
- very large IPC surface

Phase 8 deliberately used that evidence to avoid cloning the original weaknesses.

### Step 45: Verification and Deep Learn Closeout

This final step reran the phase gate:
- `npm run test`
- `npm run typecheck`
- `npm run build`

It also closed the roadmap state and generated this doc so the phase does not end as "tribal knowledge in the chat."

## The Most Important Files

These files are the real heart of Phase 8:

- `apps/desktop/src/desktopShellBridge.js`
- `apps/desktop/src/desktopPlatform.js`
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/identityDefaults.js`
- `apps/desktop/src-tauri/src/main.rs`
- `docs/contracts/desktop-shell-hardening-contract.md`
- `docs/contracts/release-security-contract.md`
- `docs/release-checklist.md`

Everything else in the phase either supports or documents those files.

## How the Desktop Bridge Works

The bridge is the most important technical concept in this phase.

### What the bridge does

Plain English:
The bridge is like a guarded front desk between the desktop shell and the app. Messages come in or go out through one named doorway instead of random parts of the UI talking to the shell however they want.

Technical view:
`apps/desktop/src/desktopShellBridge.js` defines:
- sendable channel catalogs
- receivable channel catalogs
- reduced snapshot sync channels
- message-shaping helpers
- bridge runtime methods: `on`, `send`, `emit`, `syncShellState`

The stricter part of the bridge appears in [desktopShellBridge.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/desktopShellBridge.js:436), where `createDesktopShellBridge()` now builds explicit allowlists and records security events.

Plain English:
This part is the security guard. It checks whether a message is allowed before letting it pass.

```js
const sendableChannelSet = createChannelSet(SENDABLE_CHANNELS);
const receivableChannelSet = createChannelSet(RECEIVABLE_CHANNELS);
const syncChannelSet = createChannelSet(SYNC_SNAPSHOT_CHANNELS);

function requireAllowedChannel(direction, channel, allowedChannels) {
  const normalizedChannel = sanitizeText(channel);
  if (allowUnsafeChannels) {
    return normalizedChannel;
  }

  if (normalizedChannel && allowedChannels.has(normalizedChannel)) {
    return normalizedChannel;
  }

  recordSecurityEvent(direction, channel, 'unsupported-channel');
  if (throwOnSecurityViolation) {
    const error = new Error(`Desktop shell bridge blocked ${direction} on unsupported channel "${channel}"`);
    error.code = 'DESKTOP_BRIDGE_CHANNEL_BLOCKED';
    throw error;
  }

  return null;
}
```

Technical detail:
This keeps the bridge deny-by-default unless explicitly relaxed. The important design choice is that restrictions are enforced at the bridge boundary, not scattered throughout UI code. That makes it much harder for future changes to quietly widen the shell surface by accident.

### Why the reduced sync channel subset matters

Plain English:
Not every message the shell can send should be used during the routine "keep the shell up to date" flow. That regular sync path should stay small and predictable.

Technical view:
`SYNC_SNAPSHOT_CHANNELS` narrows the routine shell sync path to only the messages needed for:
- app version
- distribution
- tab state
- navigation state
- agenda payload
- app-bar settings
- conference settings
- meeting insights
- theme mode

That list lives near the top of [desktopShellBridge.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/desktopShellBridge.js:74).

This prevents a common desktop-app problem: using the "state sync" path as a lazy tunnel for unrelated behavior until the bridge becomes too wide to reason about.

### Why `getSecurityState()` is useful

Plain English:
If the app blocks shell traffic, you need a simple way to see that it happened.

Technical view:
`getSecurityState()` exposes:
- current bridge mode
- whether unsafe channels are allowed
- whether security violations throw
- violation count
- recorded security events

That gives tests and debug tooling one place to inspect bridge safety behavior without opening up the bridge itself.

## How the Mac Platform Profile Works

Phase 8 also needed a clean way to encode platform intent.

### What the platform profile does

Plain English:
The platform profile is a small description of how the shell should behave on a given platform. It answers questions like:
- which shortcuts should be used,
- what window controls should appear,
- whether quick-add should feel like option-space,
- whether the menu belongs in the system bar or the window.

Technical view:
`createDesktopPlatformProfile()` in [desktopPlatform.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/desktopPlatform.js:205) normalizes:
- runtime platform
- target platform
- preferred distribution
- platform-specific shortcut maps
- menu behavior
- window-chrome expectations
- option-space behavior

The key shape is:

```js
return {
  id: platformId,
  runtimeId,
  targetId,
  distribution,
  isMacLike,
  isWindowsLike: !isMacLike && platformId === 'windows',
  shortcuts,
  menuBehavior: {
    label: isMacLike ? 'App Menu' : 'Menu',
    nativeMenuSurface: isMacLike ? 'system-menu-bar' : 'window-menu',
    usesWindowContextMenu: !isMacLike
  },
  windowChrome: {
    showTrafficLights: isMacLike,
    hiddenTitle: isMacLike,
    titleBarStyle: isMacLike ? 'Overlay' : 'Visible'
  },
  optionSpace: {
    label: isMacLike ? 'Option Space' : 'Quick Add',
    shortcutLabel: shortcuts.addTask.label,
    usesDedicatedWindow: isMacLike
  }
};
```

Technical detail:
This is important because it keeps platform rules declarative. Instead of random `if macOS` checks scattered through the UI, the shell reads from one profile object. That makes the platform behavior easier to test and safer to evolve.

## How `main.tsx` Uses the Shell Layer

`main.tsx` is still the orchestration layer, but it no longer owns desktop behavior in an ad hoc way.

### Rendering shell chrome

Plain English:
The app reads the platform profile and updates the visible shell frame so the window actually looks and feels like the target platform.

The relevant function is [main.tsx](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/main.tsx:2071), where `renderDesktopPlatformChrome()`:
- sets platform/distribution dataset flags
- toggles Mac vs Windows shell classes
- shows or hides traffic-light chrome
- updates visible shortcut hints
- updates the menu label

This means the visual shell is driven by platform state, not hard-coded text.

### Syncing the shell state

Plain English:
Whenever the shell needs to know what is happening in the app, one function packages the current snapshot and sends it through the bridge.

That flow lives in [main.tsx](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/main.tsx:2120), where `syncDesktopShell()` collects:
- shell state
- sync state
- inbox state
- distribution
- app version
- tab count
- tray-text decision
- AI-workflow availability

Then it calls `desktopShellBridge.syncShellState(...)`.

This is important because it creates a single shell-refresh story instead of several competing ones.

### Option-space and quick-add

Plain English:
The app now treats "new task" like a platform-level shell action, not just a button inside the page.

The platform-aware entrypoint is [main.tsx](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/main.tsx:2221), where `openNewTaskFromDesktopShell()` checks whether the current profile uses a dedicated option-space flow.

If yes, it sends `openOptionSpace`.
If not, it just focuses the task composer.

This is a good example of how the platform profile and bridge work together:
- profile decides the behavior
- bridge carries the shell event
- UI responds without inventing its own desktop contract

### Quick-meeting creation

Plain English:
The shell can now trigger a quick meeting, and the app treats it as a shell action that becomes a calendar event.

The relevant code is [main.tsx](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/main.tsx:2842), where `handleQuickMeetingCreate()`:
- builds a normalized event
- appends it to the calendar overlay
- sends success or error bridge messages
- updates the UI

This keeps quick-meeting behavior inside the same shell contract story rather than treating it as a special page-only action.

## Why Synthetic Identity Defaults Were Needed

One of the most important hardening lessons in Step 44 was not about IPC. It was about defaults.

### The problem

Plain English:
During reverse engineering, it is easy to let real signed-in data creep into fixtures and fallback defaults. That is useful during recon, but it is wrong for shipped code.

Before the Step 44 scrub, tracked app code still embedded real signed-in values such as:
- a real email address
- a real display name
- a real-looking current-user id
- a provider id tied to that user state

### The fix

The new file [identityDefaults.js](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src/identityDefaults.js:1) now defines synthetic release-safe defaults:

```js
export const DEFAULT_CURRENT_USER_ID = 'user_alex';
export const DEFAULT_CURRENT_USER_NAME = 'Alex Parker';
export const DEFAULT_CURRENT_USER_EMAIL = 'alex@rabbit.invalid';
export const DEFAULT_PRIMARY_CALENDAR_PROVIDER_ID = 'gcal_primary_alex';
```

Plain English:
This file is a "safe placeholder identity kit." The app can still behave like it has a current user, but it no longer ships a real person's account data as the fallback state.

Technical detail:
This single-source default contract is then imported by:
- `fixtures.js`
- `main.tsx`
- `projectService.js`
- `shellService.js`
- `state.js`
- `storage.js`

That matters because data hygiene is weakest when the same private-looking default is duplicated in many places.

## Why the Native Rust Boundary Still Matters

The app is still mostly validated from the JavaScript and TypeScript side in this repo, but Phase 8 also tightened the placeholder Rust boundary.

### What changed

Plain English:
Even the placeholder native command now behaves more like a real guarded command instead of a raw tunnel.

The code in [main.rs](/C:/Users/Pumba/Documents/codex/Motion/apps/desktop/src-tauri/src/main.rs:1) now defines:
- `PingRequest`
- `PingResponse`
- a max payload length
- empty-payload rejection
- oversized-payload rejection

```rust
#[derive(Deserialize)]
struct PingRequest {
  payload: String,
}

#[derive(Serialize)]
struct PingResponse {
  echoed: String,
}

#[tauri::command]
fn ping(request: PingRequest) -> Result<PingResponse, String> {
  let payload = request.payload.trim();
  if payload.is_empty() {
    return Err("payload is required".into());
  }

  if payload.chars().count() > MAX_PING_PAYLOAD_LEN {
    return Err("payload exceeds max length".into());
  }

  Ok(PingResponse {
    echoed: format!("pong:{}", payload),
  })
}
```

Technical detail:
This is still only a placeholder command, but it sets the right rule: native boundaries should be typed and validated, not generic string tunnels. That rule is more important than the `ping` command itself.

## The Role of the Hardening Docs

Phase 8 did not stop at code changes. It also codified the release assumptions so later work does not quietly undo them.

### Desktop hardening contract

[desktop-shell-hardening-contract.md](/C:/Users/Pumba/Documents/codex/Motion/docs/contracts/desktop-shell-hardening-contract.md:1) is the phase-specific policy note.

It records:
- allowlisted bridge surface
- deny-by-default permission posture
- minimal native command surface
- no real user data in shipped defaults
- entitlement authority assumptions
- signed release/update expectations

Plain English:
This file is the "what we promise not to screw up later" document.

### Release security contract

[release-security-contract.md](/C:/Users/Pumba/Documents/codex/Motion/docs/contracts/release-security-contract.md:1) was updated to absorb:
- bridge allowlists
- reduced sync surface
- permission-deny-by-default expectations
- release data hygiene

This is important because Phase 8 is where shell hardening stopped being just an implementation detail and became a release rule.

### Release checklist

[release-checklist.md](/C:/Users/Pumba/Documents/codex/Motion/docs/release-checklist.md:1) now explicitly checks:
- bridge rejection of unsupported channels
- absence of blanket permission auto-grants
- synthetic shipped defaults

That is a small change with a big effect. Teams often "agree" on hardening goals, but if those goals are not on the release checklist, they get skipped when shipping pressure rises.

## How the Pieces Connect

Plain English:
The native shell system in this repo now works like a chain of responsibility.

1. The platform profile decides what kind of desktop behavior the app should have.
2. `main.tsx` reads that profile and updates the visible shell.
3. The shell bridge packages the app state and routes shell actions.
4. The hardening layer blocks unsupported shell traffic.
5. The docs define what release behavior must stay true later.

```text
[desktopPlatform.js]
        |
        v
[main.tsx shell orchestration]
        |
        v
[desktopShellBridge.js]
   |               |
   |               +--> blocked unsupported channels
   |
   +--> tabs / agenda / app-bar / quick actions
        |
        v
[runtime app state + calendar/task surfaces]
        |
        v
[release contracts + checklist]
```

Technical detail:
This is exactly what a good desktop phase should do. It should not replace product logic. It should wrap product logic in a more accurate and safer shell.

## Common Patterns That Emerged

### Pattern 1: Declarative platform profile

What it is for:
Put platform differences in data instead of scattering them across UI code.

Why it matters:
This makes platform behavior testable and predictable. It also makes Mac-target work possible on Windows because the profile can simulate Mac expectations before a real Mac run happens.

### Pattern 2: Guarded bridge boundary

What it is for:
Treat shell traffic as a boundary that must be validated, not as a convenience bus.

Why it matters:
This prevents the common "just send one more message through the bridge" drift that eventually makes a desktop app impossible to audit.

### Pattern 3: Synthetic defaults for release-safe fixtures

What it is for:
Keep reverse-engineering data useful during development without letting it leak into shipped defaults.

Why it matters:
Research data is valuable. Shipping research identity state as defaults is not.

### Pattern 4: Platform-facing docs plus code

What it is for:
Capture release assumptions in a document and in a checklist, not only in code comments.

Why it matters:
Code can drift silently. Checklists and contracts make the team re-assert the rule at release time.

## Edge Cases and Gotchas

1. **Mac behavior can look correct on Windows while still being wrong on a real Mac**

   In plain English:
   A simulated Mac shell is still only a simulation. Shortcut hints and shell chrome can be "close enough" locally but still behave differently under the real window manager.

   Technical cause:
   The phase uses a Mac-first platform profile and Tauri config assumptions, but the repo still lacks a live Mac build verification lane in this environment.

   How to avoid:
   Keep `learnings/phase-8-macos-shell-validation.md` as a required follow-up checklist, not an optional note.

2. **Hardening can accidentally break developer convenience**

   In plain English:
   The same restrictions that make a bridge safer can make quick debugging harder.

   Technical cause:
   Deny-by-default channel logic blocks undocumented shell traffic.

   How to avoid:
   Keep an explicit compatibility mode if needed, but do not make it the release default.

3. **Reverse-engineering data is sticky**

   In plain English:
   Once real signed-in values enter fixtures or defaults, they tend to spread into tests, storage helpers, and UI fallbacks.

   Technical cause:
   Fallback identity data gets reused everywhere because it is convenient.

   How to avoid:
   Centralize defaults in one file and make those values synthetic from the start.

4. **Native verification is still incomplete without Rust tooling**

   In plain English:
   Passing browser-side tests is not the same as proving the native shell compiles and runs.

   Technical cause:
   The current machine does not have the Rust toolchain, so `cargo check` could not be run during Step 44 or Step 45.

   How to avoid:
   Treat the JS verification gate and the native build gate as separate requirements.

## How Phase 8 Connects to the Earlier Phases

Phase 8 only works because the earlier phases already reshaped the product.

- Phase 4 created the shell-first layout that the desktop bridge now drives.
- Phase 5 created the richer task/project/view/inbox state that makes shell tabs and views meaningful.
- Phase 6 created realistic calendar and scheduler behavior, which makes quick meetings and agenda sync credible.
- Phase 7 created the client/cache/sync model, which makes the desktop shell feel like a real structured client instead of a static wrapper.

Plain English:
Phase 8 is the casing, wiring, and lock on a machine that earlier phases already assembled.

## What Phase 8 Did Not Finish

This phase closed the roadmap target, but it did not magically finish every shipping concern.

Still outside the current repo lane:
- real Mac build verification
- real code signing and notarization run
- real Tauri permission configuration beyond the current placeholder structure
- full native update pipeline
- live backend entitlement verification against production services

That is fine. The point of Phase 8 was to establish the correct structure and guardrails so those final shipping tasks have a sane base.

## Going Deeper

### Real Tauri permission policies
Next depth: define concrete permission manifests and native capabilities instead of only documenting the deny-by-default posture.

### Native update verification
Next depth: implement actual signed update metadata and install verification paths.

### Mac window-behavior validation
Next depth: run the app in a real Mac session and compare shell behavior against Motion directly.

### Native secure storage
Next depth: move sensitive token/device state into OS-backed secure storage where appropriate.

## Quick Reference

### Key terms

| Term | Plain English meaning | Technical meaning |
|------|-----------------------|-------------------|
| Desktop bridge | The shell message desk | The send/receive contract between shell and app runtime |
| Platform profile | The app's platform personality | A structured object describing shortcuts, menus, window chrome, and option-space behavior |
| Sync snapshot channels | The small safe refresh lane | The reduced set of shell messages used during routine shell-state sync |
| Synthetic defaults | Fake but safe placeholder identity data | Shared fallback values that avoid leaking real signed-in recon data |
| Hardening contract | A promise about safe release behavior | A written policy for bridge scope, permissions, entitlement assumptions, and update trust |

### Essential patterns

```js
// 1. Decide platform behavior from one profile object.
const platformProfile = createDesktopPlatformProfile({
  preferredDistribution: 'apple',
  targetPlatform: 'macos'
});

// 2. Sync shell state through the guarded bridge.
desktopShellBridge.syncShellState({
  shellState,
  syncState,
  inboxState,
  distribution: platformProfile.distribution
});

// 3. Reject unsupported bridge traffic by default.
bridge.send('unsafe:eval', { payload: 'x' }); // throws in restricted mode
```

## Final Takeaway

The most important lesson from Phase 8 is that desktop fidelity is not only visual polish. It is structure plus restraint.

Structure means:
- a real shell bridge,
- platform-aware behavior,
- native-feeling shortcuts,
- desktop-shaped workflows.

Restraint means:
- narrower bridge scope,
- explicit permission posture,
- typed native boundaries,
- release-safe defaults,
- documented signing and update assumptions.

If you only copy the surface, the clone looks right but is fragile. If you only harden the internals, the clone is safe but does not feel like Motion. Phase 8 mattered because it combined both.

---

*Generated: 2026-04-27 | Project: Rabbit | Files: apps/desktop/src/desktopShellBridge.js, apps/desktop/src/desktopPlatform.js, apps/desktop/src/main.tsx, apps/desktop/src/identityDefaults.js, apps/desktop/src-tauri/src/main.rs, docs/contracts/desktop-shell-hardening-contract.md, docs/contracts/release-security-contract.md, docs/release-checklist.md*
