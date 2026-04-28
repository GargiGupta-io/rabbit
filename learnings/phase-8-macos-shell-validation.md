# Phase 8 MacOS Shell Validation

## Purpose

This note captures the macOS-facing shell assumptions added in Step 43 so they can be verified on a real Mac session later.

## What changed in Step 43

- The desktop shell now prefers an `apple` distribution profile for the final macOS clone target.
- Shortcut behavior is modeled with macOS-first labels and intent:
  - `Cmd+K` -> search
  - `Option+Space` -> new task / option-space capture
  - `Option+C` -> calendar surface
  - `Option+P` -> project timelines / project manager surface
  - `Option+A` -> scheduler surface
  - `Cmd+W` -> close active closable tab
  - `Cmd+Shift+[` / `Cmd+Shift+]` -> move active tab left/right
- The shell header now exposes macOS traffic-light window chrome styling.
- Tauri window config now requests hidden title plus overlay title bar treatment for the primary window.
- New-task capture now sends `openOptionSpace` / `closeOptionSpace` bridge events when the shell is running in the macOS target profile.

## Manual validation checklist for a real Mac run

1. Launch the Tauri shell on macOS and confirm the main window uses overlay-style title bar behavior.
2. Confirm the traffic-light controls appear in the expected top-left area and do not overlap the shell title.
3. Press `Cmd+K` and verify the search field receives focus.
4. Press `Option+Space` and verify the task composer opens through the option-space flow.
5. Press `Option+C` and verify the shell opens the calendar tab.
6. Press `Option+P` and verify the shell opens the project timeline surface.
7. Press `Option+A` and verify the shell opens the scheduler/team schedule surface.
8. Open multiple view tabs and verify `Cmd+W` closes only closable tabs.
9. Verify `Cmd+Shift+[` and `Cmd+Shift+]` reorder the active tab without breaking active-view state.
10. Trigger a theme change and confirm the window-level shell styling still looks correct.

## Known limits from this Windows session

- These changes were validated through unit-style regression coverage and code-path verification, not through a live macOS window manager.
- `tauri.conf.json` was updated for the macOS target, but the placeholder build in this repo does not execute a real `tauri build` yet.
- Option-space behavior is currently modeled through shell events and the existing task composer, not a fully separate native window.
