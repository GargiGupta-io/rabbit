# Motion Network Map

Goal: Analyze the network traffic of the Motion desktop app to identify APIs, endpoints, and data exchange patterns.

## 1. Primary APIs
- [x] API Host(s) and base URL(s)
  - `main.log` confirms the desktop app loads `https://app.usemotion.com/web/calendar`
- [ ] Authentication mechanism (Bearer tokens, cookies, custom headers)
- [ ] Primary endpoints (tasks, projects, calendar, scheduling, entitlements)

## 2. Sync Mechanism
- [ ] Pull / Sync frequency
- [ ] Delta-based updates (pull cursor, revision IDs)
- [ ] Conflict resolution behavior (optimistic vs. server-side)
- [ ] Real-time updates (WebSockets, SSE, long polling)

## 3. Scheduling & AI
- [ ] Scheduler requests (re-planning, conflict detection)
- [ ] AI prompt / Suggestion payloads
- [ ] Bulk update behavior

## 4. Third-Party Integrations
- [ ] Calendar provider direct vs. proxy requests
- [ ] Meeting provider API calls
- [x] Analytics and tracking (Mixpanel, Sentry, Segment, etc.)
  - `main.log` confirms Amplitude initialization and startup/open-app events
  - runtime profile contains a `sentry` directory

## 5. Metadata & Entitlements
- [ ] Feature gate checks
- [ ] Subscription status updates
- [ ] Telemetry and health reports

## Current local findings

- App starts against the hosted web product, not an offline-only desktop bundle route.
- Desktop shell fetches feature flags even before login.
- Current local logs show flag fetches for `user null`, which suggests feature evaluation can happen in a pre-auth state.
- `motion-production.json` currently holds local feature flag state such as `desktop-app-bar-m1`.
- Desktop IPC and shell behavior imply several product-adjacent networked features later worth tracing:
  - login
  - quick meeting creation
  - inbox badge updates
  - meeting insights
  - note taker flows

## Immediate next network tasks

- sign in and capture authenticated hosts, headers, and cookies
- identify tasks/projects/calendar endpoints from live traffic
- determine sync cadence and whether the app uses polling, push, or hybrid refresh
- map feature-gate and entitlement refresh endpoints
