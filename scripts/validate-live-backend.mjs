import process from 'node:process';

import {
  createBackendEntitlementTransport,
  executeBackendDefinition,
  executeBackendPowerSyncUpload,
  hasBackendConfiguration,
  normalizeBackendState
} from '../apps/desktop/src/backendClient.js';
import {
  fetchBootstrap,
  getCurrentUser,
  getFeaturePermissions
} from '../apps/desktop/src/bootstrapClient.js';
import {
  getCalendarEvents,
  getCalendars
} from '../apps/desktop/src/calendarClient.js';
import { getInboxItems } from '../apps/desktop/src/inboxClient.js';
import { createTaskSyncEvent } from '../apps/desktop/src/syncContract.js';
import { normalizeTask } from '../apps/desktop/src/taskService.js';
import { queryTasks } from '../apps/desktop/src/tasksClient.js';
import { getViews } from '../apps/desktop/src/viewsClient.js';

function readTextEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function readBooleanEnv(name) {
  const value = readTextEnv(name).toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

function readListEnv(name) {
  return readTextEnv(name)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function printUsage() {
  console.error('Rabbit live backend validation requires RABBIT_BACKEND_URL.');
  console.error('Optional env vars:');
  console.error('  RABBIT_BACKEND_TOKEN or RABBIT_BACKEND_AUTH_TOKEN');
  console.error('  RABBIT_VALIDATE_WORKSPACE_ID');
  console.error('  RABBIT_VALIDATE_VIEW_ID');
  console.error('  RABBIT_VALIDATE_PROVIDER_IDS');
  console.error('  RABBIT_VALIDATE_ALLOW_UPLOAD=1');
}

function deriveProviderIds(value) {
  const candidates = [];

  const collect = (entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }
    for (const key of ['providerId', 'id', 'calendarId']) {
      const candidate = typeof entry[key] === 'string' ? entry[key].trim() : '';
      if (candidate) {
        candidates.push(candidate);
        return;
      }
    }
  };

  if (Array.isArray(value)) {
    value.forEach(collect);
  } else if (value && typeof value === 'object') {
    if (Array.isArray(value.calendars)) {
      value.calendars.forEach(collect);
    }
    if (value.models && value.models.calendars && typeof value.models.calendars === 'object') {
      Object.values(value.models.calendars).forEach(collect);
    }
  }

  return [...new Set(candidates)];
}

function summarizeData(value) {
  if (Array.isArray(value)) {
    return `${value.length} item(s)`;
  }

  if (!value || typeof value !== 'object') {
    return value == null ? 'null' : String(value);
  }

  if (Array.isArray(value.items)) {
    return `${value.items.length} item(s)`;
  }

  if (Array.isArray(value.tasks)) {
    return `${value.tasks.length} task(s)`;
  }

  if (Array.isArray(value.views)) {
    return `${value.views.length} view(s)`;
  }

  if (Array.isArray(value.calendars)) {
    return `${value.calendars.length} calendar(s)`;
  }

  if (Array.isArray(value.ids)) {
    return `${value.ids.length} id(s)`;
  }

  return `${Object.keys(value).length} key(s)`;
}

function summarizeError(error) {
  const details = [];

  if (error && typeof error === 'object') {
    if (error.code) {
      details.push(`code=${error.code}`);
    }
    if (error.status) {
      details.push(`status=${error.status}`);
    }
    if (error.method) {
      details.push(`method=${error.method}`);
    }
    if (error.url) {
      details.push(`url=${error.url}`);
    }
    if (error.responseBody != null) {
      const body = typeof error.responseBody === 'string'
        ? error.responseBody
        : JSON.stringify(error.responseBody);
      details.push(`body=${body.slice(0, 300)}`);
    }
  }

  return details.length ? details.join(' | ') : 'no extra details';
}

async function runCheck(name, handler, state) {
  try {
    const result = await handler();
    state.passes += 1;
    console.log(`PASS ${name}: ${summarizeData(result?.data ?? result)}`);
    return result;
  } catch (error) {
    state.failures += 1;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`  ${summarizeError(error)}`);
    return null;
  }
}

function createUploadProbeEvent() {
  const occurredAt = new Date().toISOString();
  const task = normalizeTask({
    id: `rabbit_validate_${Date.now()}`,
    title: `Rabbit backend validation ${occurredAt}`,
    projectId: 'inbox',
    projectName: 'Inbox',
    workspaceId: 'ws_private_my_tasks',
    durationMinutes: 30,
    dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: occurredAt,
    updatedAt: occurredAt
  });

  if (!task) {
    throw new Error('Could not build an upload probe task.');
  }

  return createTaskSyncEvent({
    action: 'create',
    task,
    deviceId: 'rabbit-live-backend-validator',
    occurredAt,
    revision: `rabbit_live_backend_validation_${Date.now()}`
  });
}

async function main() {
  const backend = normalizeBackendState({
    baseUrl: readTextEnv('RABBIT_BACKEND_URL'),
    authToken: readTextEnv('RABBIT_BACKEND_TOKEN', 'RABBIT_BACKEND_AUTH_TOKEN')
  });

  if (!hasBackendConfiguration(backend)) {
    printUsage();
    process.exit(1);
  }

  const allowUpload = readBooleanEnv('RABBIT_VALIDATE_ALLOW_UPLOAD');
  const bootstrapArgs = {
    workspaceId: readTextEnv('RABBIT_VALIDATE_WORKSPACE_ID') || undefined,
    viewId: readTextEnv('RABBIT_VALIDATE_VIEW_ID') || undefined
  };
  const requestedProviderIds = readListEnv('RABBIT_VALIDATE_PROVIDER_IDS');
  const state = { passes: 0, failures: 0 };

  console.log(`Backend: ${backend.baseUrl}`);
  console.log(`Auth token: ${backend.authToken ? 'present' : 'absent'}`);
  console.log(`Upload probe: ${allowUpload ? 'enabled' : 'disabled'}`);

  const bootstrap = await runCheck(
    'bootstrap',
    () => executeBackendDefinition(fetchBootstrap, bootstrapArgs, { backend }),
    state
  );
  const currentUser = await runCheck(
    'current user',
    () => executeBackendDefinition(getCurrentUser, {}, { backend }),
    state
  );
  const featurePermissions = await runCheck(
    'feature permissions',
    () => executeBackendDefinition(getFeaturePermissions, {}, { backend }),
    state
  );
  const views = await runCheck(
    'views',
    () => executeBackendDefinition(getViews, {}, { backend }),
    state
  );
  const inboxItems = await runCheck(
    'inbox items',
    () => executeBackendDefinition(getInboxItems, {}, { backend }),
    state
  );
  const tasks = await runCheck(
    'tasks query',
    () => executeBackendDefinition(queryTasks, {}, { backend }),
    state
  );
  const calendars = await runCheck(
    'calendars',
    () => executeBackendDefinition(getCalendars, {}, { backend }),
    state
  );

  const providerIds = requestedProviderIds.length
    ? requestedProviderIds
    : deriveProviderIds(calendars?.data);

  if (providerIds.length) {
    await runCheck(
      'calendar events',
      () => executeBackendDefinition(getCalendarEvents, { providerIds }, { backend }),
      state
    );
  } else {
    console.log('SKIP calendar events: no provider ids were supplied or discovered from the calendar response.');
  }

  await runCheck(
    'backend entitlement transport',
    async () => {
      const transport = createBackendEntitlementTransport(backend);
      const response = await transport({
        now: Date.now(),
        previousSnapshot: {}
      });
      return { data: response };
    },
    state
  );

  if (allowUpload) {
    await runCheck(
      'powersync upload',
      async () => {
        const event = createUploadProbeEvent();
        if (!event) {
          throw new Error('Could not create an upload probe sync event.');
        }
        return executeBackendPowerSyncUpload([event], backend, {
          deviceId: 'rabbit-live-backend-validator'
        });
      },
      state
    );
  } else {
    console.log('SKIP powersync upload: set RABBIT_VALIDATE_ALLOW_UPLOAD=1 to allow a real write probe.');
  }

  console.log(`Checks complete: ${state.passes} passed, ${state.failures} failed.`);

  if (bootstrap?.url) {
    console.log(`Bootstrap URL: ${bootstrap.url}`);
  }
  if (currentUser?.url) {
    console.log(`Current user URL: ${currentUser.url}`);
  }
  if (featurePermissions?.url) {
    console.log(`Permissions URL: ${featurePermissions.url}`);
  }
  if (views?.url) {
    console.log(`Views URL: ${views.url}`);
  }
  if (inboxItems?.url) {
    console.log(`Inbox URL: ${inboxItems.url}`);
  }
  if (tasks?.url) {
    console.log(`Tasks URL: ${tasks.url}`);
  }
  if (calendars?.url) {
    console.log(`Calendars URL: ${calendars.url}`);
  }

  process.exit(state.failures ? 1 : 0);
}

main().catch((error) => {
  console.error(`FATAL: ${error instanceof Error ? error.message : String(error)}`);
  if (error && typeof error === 'object') {
    console.error(summarizeError(error));
  }
  process.exit(1);
});
