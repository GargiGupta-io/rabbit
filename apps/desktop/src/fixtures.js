export const FIXTURE_NOW = '2026-04-17T12:00:00.000Z';

export const FIXTURE_PROJECTS = [
  { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false },
  { id: 'work', name: 'Work', color: '#10b981', archived: false },
  { id: 'personal', name: 'Personal', color: '#f59e0b', archived: false }
];

export const FIXTURE_TASKS_RAW = [
  {
    id: 'f1',
    title: 'Draft weekly plan',
    projectId: 'work',
    projectName: 'Work',
    description: 'Prepare agenda for sprint planning.',
    status: 'todo',
    dueAt: '2026-04-17T14:00:00.000Z',
    startAt: '2026-04-17T13:30:00.000Z',
    durationMinutes: 120,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f2',
    title: 'Reply to team',
    projectId: 'inbox',
    projectName: 'Inbox',
    description: 'Clear follow-ups from yesterday.',
    status: 'done',
    dueAt: '2026-04-17T09:00:00.000Z',
    startAt: null,
    durationMinutes: 15,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f3',
    title: 'Design review',
    projectId: 'personal',
    projectName: 'Personal',
    status: 'todo',
    dueAt: '2026-04-16T17:00:00.000Z',
    durationMinutes: 30,
    recurrence: { pattern: 'weekly', interval: 1 }
  },
  {
    id: 'f4',
    title: 'Overlapping call',
    projectId: 'work',
    projectName: 'Work',
    status: 'todo',
    startAt: '2026-04-17T13:00:00.000Z',
    dueAt: '2026-04-17T13:45:00.000Z',
    durationMinutes: 45,
    recurrence: { pattern: 'none', interval: 1 }
  },
  {
    id: 'f5',
    title: 'No-date notes',
    projectId: 'inbox',
    projectName: 'Inbox',
    status: 'todo',
    durationMinutes: 30,
    recurrence: { pattern: 'none', interval: 1 }
  }
];

export const FIXTURE_PAYLOAD = {
  version: '1.0.0',
  schemaVersion: 1,
  projects: FIXTURE_PROJECTS,
  tasks: FIXTURE_TASKS_RAW
};

export function getFixtureState() {
  return {
    ...FIXTURE_PAYLOAD,
    projects: FIXTURE_PROJECTS.map((project) => ({ ...project })),
    tasks: FIXTURE_TASKS_RAW.map((task) => ({ ...task }))
  };
}
