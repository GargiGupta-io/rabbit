# Phase 11 - Motion UI Refinement Deep Learn

> This pass moved Rabbit closer to the real Motion product structure by making Calendar a first-class surface, collapsing the always-open composer, and reducing visible clutter in the shell and work rails.

---

## In Plain English

Rabbit already had a usable shell and a polished-enough Windows product pass after Phase 10, but it still felt too much like a stacked planner page. The biggest mismatch against the real Motion app was structural, not just visual. Motion gives the active route most of the screen, especially in Calendar. Rabbit was still treating Calendar like just another label above task panels.

This pass fixed that by changing the shape of the app instead of only recoloring it. Calendar now owns the center surface, the right rail becomes contextual for that route, and task creation stops sitting open like a permanent wall. On top of that structural work, the shell header and the task, agenda, and inbox cards were tightened so the product reads faster and feels less cluttered.

## What Changed

### 1. Calendar became a primary route

The largest shift in this pass was moving Rabbit away from a generic stacked task surface and toward a route-specific layout.

What changed:

- the old metrics slab was removed
- Calendar now renders as a week-style timeline surface
- imported calendar events and scheduled tasks share the same primary space
- the right rail becomes a mini month plus linked calendars on the Calendar route
- the regular sync card is hidden on Calendar in normal mode to avoid unnecessary competition

Main file:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)

Commit:

- `b69718b` `feat: add calendar-first workspace route`

### 2. The header and controls became calmer

Once Calendar had a real route surface, the shell itself still needed to stop shouting.

What changed:

- the top title now follows the active route instead of always reading like a static product label
- `New task` became `New`
- `Menu` became `App Menu`
- the header spacing tightened
- the toolbar was compressed so it feels more like a control strip than a big card block
- the Calendar route header was made lighter so the timeline stays dominant

Main file:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)

Commit:

- `2e65538` `style: simplify shell header and controls`

### 3. Task, inbox, and agenda density improved

After the structure and shell were under better control, the remaining clutter was inside the cards themselves.

What changed:

- task cards lost some badge noise and repeated metadata
- task footer metadata became a simpler single line
- agenda items dropped the extra source badge
- inbox cards replaced the pill row with lighter metadata text
- spacing and radii were tightened across work cards and right-rail items

Main file:

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)

Commit:

- `2967581` `style: reduce task and rail clutter`

## What This Pass Did Not Try To Solve

This was not a full Motion parity finish.

It did not add:

- the complete real Motion calendar control set
- booking links
- display options
- event authoring depth
- AI chat surfaces
- full collaboration or workspace-management flows
- native macOS desktop validation

That restraint was intentional. The right move here was to first make Rabbit feel less like a prototype shell and more like a focused product surface.

## Why This Matters

The important lesson from this pass is that clutter was not mainly a color or spacing issue. It came from giving too many surfaces equal importance at once.

Motion feels calmer because:

- one route dominates the page
- creation is compact until requested
- secondary information stays at the edges
- there is less explanatory copy
- contextual rails replace generic always-on rails

Rabbit improved specifically when it adopted those rules rather than trying to look more polished inside the same old layout.

## Verification

The UI refinement work was verified with:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test`
- `npm.cmd run desktop:build`

All passed after the final pass.

## Files That Matter Most

- [main.tsx](C:/Users/Pumba/Documents/codex/rabbit/apps/desktop/src/main.tsx)
- [planning.md](C:/Users/Pumba/Documents/codex/rabbit/learnings/planning.md)

## Current Meaning Of "Done"

This pass is done as a refinement pass, but not as final product design.

What is now true:

- Rabbit has a much closer Motion-style Calendar structure
- the top shell is calmer
- creation is less intrusive
- the right rail is more contextual
- work cards are less noisy

What can still happen later:

- another screenshot-driven visual pass
- deeper route-specific layouts beyond Calendar
- more exact Motion control parity
- final macOS-native validation in the real desktop wrapper
