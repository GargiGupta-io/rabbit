# Manual Steps Needed Later

Everything else is being handled in research and planning. These are the only manual steps currently expected from the user.

## 1. Sign in once

Needed so:
- real workspace data exists locally
- task/calendar flows can be observed
- authenticated app behavior can be mapped

## 2. Keep the app available during recon

Needed for:
- live UI mapping
- task/calendar flow observation
- local file and storage delta checks
- your own authenticated network observation

## 3. Optional but helpful

- connect at least one real calendar provider
- create or open a real workspace with some sample tasks and projects
- leave Inbox, Projects, Calendar, and Settings reachable

## Current status

- Motion desktop is already installed.
- Local package and runtime profile have already been located.
- The current desktop runtime appears unsigned in locally cached state (`userEmail: null`), so sign-in is the next real manual dependency.

## What I will do after that

- locate install paths
- inventory packaged assets
- map storage
- map network behavior
- write a parity spec
- diff the repo against the observed Motion behavior
