# Motion Feature Map

Goal: Map the user-visible features, flows, and UI patterns of the Motion application.

## Current Recon Snapshot
- [x] Desktop shell exists beyond the hosted web app
  - Windows package includes dedicated desktop `tabs`, `appBar`, and Electron main/preload bundles.
- [x] Default signed-out landing route
  - main window loads `https://app.usemotion.com/web/calendar`.
- [x] Desktop-only shell surfaces found
  - app bar
  - tab strip
  - option-space window
  - tray integration
  - desktop protocol handling
  - startup task
- [x] Visible service/integration hints found
  - Stripe
  - Intercom
  - Sentry
  - Amplitude
  - internal Motion hosts

## 1. Onboarding & Account
- [ ] Signup/Login flow
- [x] Onboarding questionnaire/steps
  - bundle strings expose onboarding steps such as:
    - `choose_theme`
    - `connect_calendar`
    - `select_main_calendar`
    - `select_my_calendars`
    - `choose_work_hours`
    - `create_first_tasks`
    - `create_recurring_tasks`
    - `show_tasks_in_calendar`
    - `create_team`
    - `setup_ai_employees`
- [ ] Account settings (profile, password, security)
- [ ] Workspace creation/joining

## 2. Navigation & Layout
- [ ] Sidebar structure
- [x] Main views (Today, Calendar, Projects, Tasks)
  - route/icon mapping found for:
    - `calendar`
    - `inbox`
    - `pm`
    - `crm`
    - `marketing`
    - `ai-employees`
    - `settings`
- [x] Modal/Drawer patterns
  - dedicated `optionSpace` desktop window exists for quick-add / focused actions.
- [x] Command palette or global search
  - desktop app bar exposes `search`.

## 3. Task Management
- [x] Task creation (quick add vs. full form)
  - app bar exposes `New Task`.
  - option-space/add-task recovery behavior appears in desktop logs.
- [ ] Task fields (title, notes, project, due, duration, priority, recurrence)
- [ ] Task list organization (today, upcoming, overdue, done)
- [x] Task actions (complete, delete, reschedule, snooze)
  - app bar supports `openTask` and `completeTask`.
  - app bar UI distinguishes current vs upcoming items and shows task completion state.

## 4. Calendar & Scheduling
- [x] Calendar view (day, week, month)
  - desktop opens calendar by default.
- [ ] Event creation and editing
- [x] Calendar sync (Google, Outlook, etc.)
  - bundle and logs expose conference/calendar provider handling and `zoom-oauth`.
- [x] Automatic scheduling (busy blocks, task placement)
  - app bar agenda classifies entities into `ongoingEvents`, `upcomingEvents`, and `timelessEvents`.
- [x] Meeting booking/links
  - app bar supports:
    - quick meeting creation
    - join event
    - open event
    - open meeting note
    - note taker controls

## 5. Projects & Workspaces
- [x] Project organization and colors
  - app bar exposes `New Project`.
- [ ] Workspace switching
- [ ] Collaboration features (assigning tasks, comments)

## 6. Shortcuts & Utilities
- [ ] Global keyboard shortcuts
- [x] Menu bar app / tray icon behavior
  - tray exists and can show upcoming event/task text.
  - `showTrayText` setting is present.
  - app bar can be toggled from tray.
- [x] Notification styles and settings
  - desktop logs expose inbox badge notifications and toast activation plumbing.

## 7. Premium & Entitlements
- [ ] Plan types and feature gates
- [x] Upgrade prompts and billing flows
  - runtime touches Stripe hosts and bundle strings expose billing/subscription surfaces.
- [x] AI-assisted features (scheduling, task breakdown)
  - bundle strings expose AI agenda/project endpoints and AI employee setup flows.

## Immediate Gaps
- Need authenticated screen-by-screen mapping after login.
- Need real field shapes for tasks, projects, calendars, inbox, and settings.
- Need live upgrade/paywall behavior rather than bundle-string inference.
