# Rabbit Rebrand Deep Learn

> This note explains what a product rebrand actually touches in a desktop app, why persistence compatibility mattered in Rabbit, and which Motion references were intentionally kept as research context.

---

## In Plain English

Renaming a product is never just a logo or folder-name change. A real desktop app stores its identity in package manifests, window titles, bundle identifiers, local browser storage keys, seeded demo data, and user-facing copy. If only the visible text changes, the product looks renamed but still behaves like the old app underneath.

Rabbit needed a full brand pass because the repo had already moved from a generic planning shell into a coherent desktop product. That meant the old `Motion Clone` identity was baked into package metadata, storage keys, fixture data, and docs. The rebrand work made Rabbit present itself consistently while still preserving the truth that Motion remains the reverse-engineering source product.

---

## What This Rebrand Actually Covered

The Rabbit rebrand touched four layers:

1. Product metadata
2. Runtime and persistence
3. Seeded app content
4. Repo-facing documentation

The important part is that these layers are connected. Changing only one creates mismatches.

---

## Product Metadata

Rabbit now owns the product identity in the places that define how the app builds and presents itself:

- root package name: `rabbit`
- desktop package name: `@rabbit/desktop`
- Tauri product name: `Rabbit`
- Tauri identifier: `com.rabbit.desktop`
- Rust package name: `rabbit-desktop`
- desktop HTML title: `Rabbit - Desktop Shell`

Why this matters:

- package names affect install/build identity
- Tauri identifiers affect desktop bundle identity
- window titles and HTML titles affect what users see immediately

If these disagree, the app feels unfinished and tooling can behave unpredictably.

---

## Runtime and Persistence

This was the most important technical part of the rebrand.

Rabbit changed its primary local storage keys to:

- `rabbit_phase1_app_data`
- `rabbit_phase2_entitlement_snapshot`

But it also kept backward-compatible reads for the legacy keys:

- `motion_clone_phase1_app_data`
- `motion_clone_phase2_entitlement_snapshot`

That compatibility matters because a rename should not silently strand an existing local profile. If someone already had stored app state or entitlement state under the old key, Rabbit still needs to load it.

### What changed in code

- [storage.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/storage.js)
  - writes new Rabbit keys
  - reads new keys first
  - falls back to legacy Motion-clone keys
  - reuses legacy device IDs instead of generating a new identity unnecessarily
- [entitlement.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/entitlement.js)
  - writes the new Rabbit entitlement key
  - still reads the legacy entitlement key if needed

### Why this is the right pattern

It gives you a clean future-facing identity without breaking existing saved state. That is better than either extreme:

- only keeping old keys forever
- hard-switching to new keys and losing old local state

---

## Seeded Product Content

Rabbit also needed its default in-app content to stop sounding like a Motion-branded internal demo.

The tutorial/workspace domain was renamed in:

- [projectService.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/projectService.js)
- [fixtures.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/fixtures.js)
- [scripts/test.mjs](C:/Users/Pumba/Documents/codex/rabbit/scripts/test.mjs)

Examples of what changed:

- `Motion Team` -> `Rabbit Team`
- `Learn motion` -> `Learn Rabbit`
- `Setup Motion` -> `Setup Rabbit`
- `Motion Basics` -> `Rabbit Basics`
- `Motion Advanced` -> `Rabbit Advanced`
- `Try Motion AI next` -> `Try Rabbit AI next`
- `motion-notifications` -> `rabbit-notifications`

Why this matters:

Seed data is part of the product. If the package says Rabbit but the first tutorial still says Motion everywhere, the app feels like a fork that was not fully claimed.

---

## Internal Naming Choices

Not every `Motion` string was removed.

That was intentional.

### Removed or renamed

- direct product identity strings
- package and bundle identifiers
- runtime storage keys
- seeded user-facing copy
- generic helper names that no longer needed Motion in the name

Example:

- `createMotionKey()` became `createQueryKey()`

That is better than renaming it to another brand-specific helper because the function is conceptually generic.

### Intentionally preserved

- research docs about the real Motion app
- learning docs that explain Motion parity as the source target
- historical descriptions where Motion is the product being studied

This distinction is important:

- Rabbit is the shipped product identity
- Motion is still the reverse-engineering reference

Erasing the second would make the repo less truthful.

---

## Validation Strategy

The rebrand was validated with the standard repo gates:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test`

All three passed after the rename.

The test suite also still exercises the old storage-key path by loading a future-schema payload from the legacy app-data key. That is useful because it proves the compatibility branch still works instead of only existing on paper.

---

## Key Files

The fastest files to read if you want to understand the rebrand are:

- [package.json](C:/Users/Pumba/Documents/codex/rabbit/package.json)
- [apps/desktop/package.json](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/package.json)
- [apps/desktop/src-tauri/tauri.conf.json](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src-tauri/tauri.conf.json)
- [apps/desktop/src/storage.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/storage.js)
- [apps/desktop/src/entitlement.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/entitlement.js)
- [apps/desktop/src/projectService.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/projectService.js)
- [apps/desktop/src/fixtures.js](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/fixtures.js)
- [scripts/test.mjs](C:/Users/Pumba/Documents/codex/rabbit/scripts/test.mjs)

---

## What This Did Not Do

The rebrand did not try to rewrite the historical research record as if Motion never existed.

It also did not change the product roadmap priority.

Rabbit is still:

- locally validated
- package-path ready
- missing live backend integration
- missing real Mac signing/notarization execution

So the rebrand improves product identity and consistency, but it does not by itself make Rabbit more connected or more shippable.

---

## The Main Lesson

The biggest lesson is that branding work on a real app is partly UX work and partly migration work.

If you only change names in visible copy, you get a cosmetic rebrand.
If you also update manifests, storage, fixtures, and tests, you get a real rebrand.

Rabbit now has the second kind.
