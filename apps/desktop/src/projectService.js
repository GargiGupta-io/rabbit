import { DEFAULT_CURRENT_USER_ID } from './identityDefaults.js';

const COLOR_TOKENS = {
  gray: '#889096',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  sky: '#38bdf8',
  purple: '#8b5cf6'
};

const DEFAULT_USER_ID = DEFAULT_CURRENT_USER_ID;
const DEFAULT_WORKSPACE_ID = 'ws_private_my_tasks';
const DEFAULT_PROJECT_STATUS_ID = 'project_status_active';
const DEFAULT_TASK_STATUS_ID = 'status_todo';

const DEFAULT_WORKSPACES = [
  {
    id: DEFAULT_WORKSPACE_ID,
    uniquenessId: 'uniq_ws_private_my_tasks',
    name: 'My Tasks (Private)',
    teamId: null,
    type: 'INDIVIDUAL',
    systemType: null
  },
  {
    id: 'ws_rabbit_team',
    uniquenessId: 'uniq_ws_rabbit_team',
    name: 'Rabbit Team',
    teamId: 'team_rabbit',
    type: 'TEAM',
    systemType: null
  }
];

const DEFAULT_PROJECT_DEFINITIONS = [
  {
    id: 'pde_learn_rabbit',
    workspaceId: DEFAULT_WORKSPACE_ID,
    name: 'Learn Rabbit',
    color: '#889096',
    description: 'Learn how to use Rabbit for yourself and your team!',
    definitionDescription: 'Tutorial project that teaches the core Rabbit flows.',
    managerId: DEFAULT_USER_ID,
    createdByUserId: DEFAULT_USER_ID,
    priorityLevel: 'MEDIUM',
    labelIds: ['tutorial'],
    stageDefinitionReferences: [
      {
        id: 'stage_ref_setup_rabbit',
        rank: '0|i00007:',
        stageDefinitionId: 'stagedef_setup_rabbit',
        projectDefinitionId: 'pde_learn_rabbit'
      },
      {
        id: 'stage_ref_rabbit_basics',
        rank: '0|i0000f:',
        stageDefinitionId: 'stagedef_rabbit_basics',
        projectDefinitionId: 'pde_learn_rabbit'
      },
      {
        id: 'stage_ref_rabbit_advanced',
        rank: '0|i0000n:',
        stageDefinitionId: 'stagedef_rabbit_advanced',
        projectDefinitionId: 'pde_learn_rabbit'
      }
    ],
    stages: [
      {
        id: 'stagedef_setup_rabbit',
        name: 'Setup Rabbit',
        color: '#3b82f6',
        duration: { unit: 'DAYS', value: 7 },
        workspaceId: DEFAULT_WORKSPACE_ID,
        variables: [],
        tasks: [
          createTaskDefinition('taskdef_connect_calendars', 'Connect your calendars', { deadlineType: 'SOFT' }),
          createTaskDefinition('taskdef_setup_schedule', 'Setup your work schedule', { blockedByTaskIds: ['taskdef_connect_calendars'] }),
          createTaskDefinition('taskdef_create_tasks', 'Learn how to create tasks', { blockedByTaskIds: ['taskdef_setup_schedule'] })
        ]
      },
      {
        id: 'stagedef_rabbit_basics',
        name: 'Rabbit Basics',
        color: '#10b981',
        duration: { unit: 'DAYS', value: 10 },
        workspaceId: DEFAULT_WORKSPACE_ID,
        variables: [],
        tasks: [
          createTaskDefinition('taskdef_pm_philosophy', "Learn about Rabbit's Project Management Philosophy"),
          createTaskDefinition('taskdef_create_projects', 'Create your first 3 projects', { blockedByTaskIds: ['taskdef_pm_philosophy'] }),
          createTaskDefinition('taskdef_templates', 'Learn how to create project templates', { blockedByTaskIds: ['taskdef_create_projects'] })
        ]
      },
      {
        id: 'stagedef_rabbit_advanced',
        name: 'Rabbit Advanced',
        color: '#8b5cf6',
        duration: { unit: 'DAYS', value: 14 },
        workspaceId: DEFAULT_WORKSPACE_ID,
        variables: [],
        tasks: [
          createTaskDefinition('taskdef_team_views', 'Setup Team Views'),
          createTaskDefinition('taskdef_dashboards', 'Setup Dashboards', { blockedByTaskIds: ['taskdef_team_views'] }),
          createTaskDefinition('taskdef_ai_in_rabbit', 'Learn about AI in Rabbit', { blockedByTaskIds: ['taskdef_dashboards'] })
        ]
      }
    ],
    variables: [],
    customFieldValues: {},
    folderId: 'folder_tutorials'
  }
];

const DEFAULT_PROJECTS = [
  createBaseProject({
    id: 'inbox',
    name: 'Inbox',
    color: '#3b82f6'
  }),
  createBaseProject({
    id: 'work',
    name: 'Work',
    color: '#10b981',
    workspaceId: 'ws_rabbit_team',
    managerId: 'user_manager_rabbit'
  }),
  createBaseProject({
    id: 'personal',
    name: 'Personal',
    color: '#f59e0b'
  }),
  createBaseProject({
    id: 'pr_learn_rabbit',
    name: 'Learn Rabbit',
    color: '#889096',
    projectDefinitionId: 'pde_learn_rabbit',
    activeStageDefinitionId: 'stagedef_rabbit_basics',
    startDate: '2026-04-15',
    dueDate: '2026-05-15',
    stages: [
      createStageInstance({
        id: 'stage_setup_rabbit_instance',
        name: 'Setup Rabbit',
        rank: '0|i00007:',
        color: '#3b82f6',
        stageDefinitionId: 'stagedef_setup_rabbit',
        dueDate: '2026-04-20',
        visited: true,
        completedTime: '2026-04-18T10:00:00.000Z',
        completedDuration: 180,
        completedTaskCount: 3,
        duration: 180,
        taskCount: 3,
        scheduledStatus: 'ON_TRACK'
      }),
      createStageInstance({
        id: 'stage_rabbit_basics_instance',
        name: 'Rabbit Basics',
        rank: '0|i0000f:',
        color: '#10b981',
        stageDefinitionId: 'stagedef_rabbit_basics',
        dueDate: '2026-04-30',
        visited: true,
        completedDuration: 60,
        completedTaskCount: 1,
        duration: 240,
        taskCount: 3,
        scheduledStatus: 'ON_TRACK',
        estimatedCompletionTime: '2026-04-29T12:00:00.000Z'
      }),
      createStageInstance({
        id: 'stage_rabbit_advanced_instance',
        name: 'Rabbit Advanced',
        rank: '0|i0000n:',
        color: '#8b5cf6',
        stageDefinitionId: 'stagedef_rabbit_advanced',
        dueDate: '2026-05-15',
        duration: 300,
        taskCount: 3,
        scheduledStatus: null
      })
    ],
    duration: 720,
    taskCount: 9
  })
];

function createTaskDefinition(id, name, overrides = {}) {
  return {
    id,
    name,
    statusId: DEFAULT_TASK_STATUS_ID,
    assigneeUserId: DEFAULT_USER_ID,
    assigneeVariableKey: null,
    duration: 30,
    minimumDuration: 15,
    priorityLevel: 'MEDIUM',
    isAutoScheduled: true,
    blockedByTaskIds: [],
    description: '',
    labelIds: [],
    customFieldValues: {},
    scheduleMeetingWithinDays: null,
    deadlineType: 'SOFT',
    startRelativeInterval: {
      referenceType: 'STAGE_START',
      referenceId: null,
      duration: { unit: 'DAYS', value: 0 }
    },
    dueRelativeInterval: {
      referenceType: 'STAGE_DUE',
      referenceId: null,
      duration: { unit: 'DAYS', value: 0 }
    },
    ...overrides
  };
}

function createStageInstance(input = {}) {
  return {
    id: sanitizeText(input.id),
    name: sanitizeText(input.name),
    color: normalizeColor(input.color, '#889096'),
    rank: sanitizeText(input.rank) || '0',
    dueDate: normalizeDate(input.dueDate),
    visited: Boolean(input.visited),
    canceledTime: normalizeDateTime(input.canceledTime),
    completedTime: normalizeDateTime(input.completedTime),
    stageDefinitionId: sanitizeText(input.stageDefinitionId),
    completedDuration: normalizeNumber(input.completedDuration),
    completedTaskCount: normalizeNumber(input.completedTaskCount),
    canceledDuration: normalizeNumber(input.canceledDuration),
    canceledTaskCount: normalizeNumber(input.canceledTaskCount),
    duration: normalizeNumber(input.duration),
    taskCount: normalizeNumber(input.taskCount),
    scheduledStatus: normalizeNullableEnum(input.scheduledStatus, ['ON_TRACK', 'PAST_DUE', 'UNFIT_SCHEDULABLE', 'UNFIT_PAST_DUE']),
    estimatedCompletionTime: normalizeDateTime(input.estimatedCompletionTime)
  };
}

function createBaseProject(input = {}) {
  return {
    id: sanitizeText(input.id),
    name: sanitizeText(input.name),
    color: normalizeColor(input.color),
    archived: Boolean(input.archived),
    workspaceId: sanitizeText(input.workspaceId) || DEFAULT_WORKSPACE_ID,
    description: sanitizeText(input.description),
    priorityLevel: normalizeEnum(input.priorityLevel, ['ASAP', 'HIGH', 'MEDIUM', 'LOW'], 'MEDIUM'),
    statusId: sanitizeText(input.statusId) || DEFAULT_PROJECT_STATUS_ID,
    type: sanitizeText(input.type) || 'NORMAL',
    startDate: normalizeDate(input.startDate),
    dueDate: normalizeDate(input.dueDate),
    createdByUserId: sanitizeText(input.createdByUserId) || DEFAULT_USER_ID,
    managerId: sanitizeNullableText(input.managerId) || DEFAULT_USER_ID,
    projectDefinitionId: sanitizeNullableText(input.projectDefinitionId),
    activeStageDefinitionId: sanitizeNullableText(input.activeStageDefinitionId),
    stages: Array.isArray(input.stages) ? input.stages.map((stage) => createStageInstance(stage)).filter(isValidStageInstance) : [],
    completedDuration: normalizeNumber(input.completedDuration),
    completedTaskCount: normalizeNumber(input.completedTaskCount),
    canceledDuration: normalizeNumber(input.canceledDuration),
    canceledTaskCount: normalizeNumber(input.canceledTaskCount),
    duration: normalizeNumber(input.duration),
    taskCount: normalizeNumber(input.taskCount),
    labelIds: normalizeStringArray(input.labelIds),
    customFieldValues: isPlainObject(input.customFieldValues) ? { ...input.customFieldValues } : {},
    variableInstances: Array.isArray(input.variableInstances) ? input.variableInstances.map((entry) => ({ ...entry })) : [],
    folderId: sanitizeNullableText(input.folderId),
    scheduledStatus: normalizeNullableEnum(input.scheduledStatus, ['ON_TRACK', 'PAST_DUE', 'UNFIT_SCHEDULABLE', 'UNFIT_PAST_DUE']),
    estimatedCompletionTime: normalizeDateTime(input.estimatedCompletionTime)
  };
}

function sanitizeText(value) {
  return String(value ?? '').trim();
}

function sanitizeNullableText(value) {
  const normalized = sanitizeText(value);
  return normalized || null;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeDateTime(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  return parsed.toISOString();
}

function normalizeColor(value, fallback = '#3b82f6') {
  const candidate = sanitizeText(value);
  if (!candidate) {
    return fallback;
  }
  if (candidate.startsWith('#') && candidate.length === 7) {
    return candidate;
  }
  return COLOR_TOKENS[candidate] || fallback;
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = sanitizeText(value).toUpperCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

function normalizeNullableEnum(value, allowed) {
  const normalized = sanitizeText(value).toUpperCase();
  return allowed.includes(normalized) ? normalized : null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  return value
    .map((entry) => sanitizeText(entry))
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry)) {
        return false;
      }
      seen.add(entry);
      return true;
    });
}

function normalizeWorkspace(input = {}) {
  const id = sanitizeText(input.id);
  const name = sanitizeText(input.name);
  if (!id || !name) {
    return null;
  }

  const type = sanitizeText(input.type).toUpperCase();
  return {
    id,
    uniquenessId: sanitizeText(input.uniquenessId) || `uniq_${id}`,
    name,
    teamId: sanitizeNullableText(input.teamId),
    type: type === 'TEAM' ? 'TEAM' : 'INDIVIDUAL',
    systemType: sanitizeNullableText(input.systemType)
  };
}

function normalizeRelativeInterval(input = {}) {
  const duration = isPlainObject(input.duration) ? input.duration : {};
  const unit = sanitizeText(duration.unit).toUpperCase();
  return {
    referenceType: sanitizeText(input.referenceType) || 'STAGE_START',
    referenceId: sanitizeNullableText(input.referenceId),
    duration: {
      unit: ['MINUTES', 'HOURS', 'DAYS', 'WEEKS'].includes(unit) ? unit : 'DAYS',
      value: Number.isFinite(Number(duration.value)) ? Math.max(0, Math.floor(Number(duration.value))) : 0
    }
  };
}

function normalizeTaskDefinition(input = {}, stageDefinitionId) {
  const id = sanitizeText(input.id);
  const name = sanitizeText(input.name);
  if (!id || !name) {
    return null;
  }

  return {
    id,
    stageDefinitionId: sanitizeText(stageDefinitionId) || null,
    name,
    statusId: sanitizeText(input.statusId) || DEFAULT_TASK_STATUS_ID,
    assigneeUserId: sanitizeNullableText(input.assigneeUserId),
    assigneeVariableKey: sanitizeNullableText(input.assigneeVariableKey),
    duration: isFiniteNumber(input.duration) ? Number(input.duration) : null,
    minimumDuration: isFiniteNumber(input.minimumDuration) ? Number(input.minimumDuration) : null,
    priorityLevel: normalizeEnum(input.priorityLevel, ['ASAP', 'HIGH', 'MEDIUM', 'LOW'], 'MEDIUM'),
    isAutoScheduled: Boolean(input.isAutoScheduled),
    blockedByTaskIds: normalizeStringArray(input.blockedByTaskIds),
    description: sanitizeText(input.description),
    labelIds: normalizeStringArray(input.labelIds),
    customFieldValues: isPlainObject(input.customFieldValues) ? { ...input.customFieldValues } : {},
    scheduleMeetingWithinDays: isFiniteNumber(input.scheduleMeetingWithinDays) ? Number(input.scheduleMeetingWithinDays) : null,
    deadlineType: normalizeEnum(input.deadlineType, ['ASAP', 'HARD', 'SOFT', 'NONE'], 'SOFT'),
    startRelativeInterval: normalizeRelativeInterval(input.startRelativeInterval),
    dueRelativeInterval: normalizeRelativeInterval(input.dueRelativeInterval)
  };
}

function normalizeStageDefinition(input = {}, workspaceId) {
  const id = sanitizeText(input.id);
  const name = sanitizeText(input.name);
  if (!id || !name) {
    return null;
  }

  const tasks = Array.isArray(input.tasks)
    ? input.tasks.map((task) => normalizeTaskDefinition(task, id)).filter(Boolean)
    : [];

  return {
    id,
    name,
    color: normalizeColor(input.color, '#889096'),
    duration: normalizeRelativeIntervalDuration(input.duration),
    workspaceId: sanitizeText(input.workspaceId) || sanitizeText(workspaceId) || DEFAULT_WORKSPACE_ID,
    variables: Array.isArray(input.variables) ? input.variables.map((entry) => ({ ...entry })) : [],
    tasks
  };
}

function normalizeRelativeIntervalDuration(input = {}) {
  const unit = sanitizeText(input.unit).toUpperCase();
  return {
    unit: ['MINUTES', 'HOURS', 'DAYS', 'WEEKS'].includes(unit) ? unit : 'DAYS',
    value: Number.isFinite(Number(input.value)) ? Math.max(0, Math.floor(Number(input.value))) : 0
  };
}

function normalizeProjectDefinition(input = {}) {
  const id = sanitizeText(input.id);
  const name = sanitizeText(input.name);
  if (!id || !name) {
    return null;
  }

  const workspaceId = sanitizeText(input.workspaceId) || DEFAULT_WORKSPACE_ID;
  const stages = Array.isArray(input.stages)
    ? input.stages.map((stage) => normalizeStageDefinition(stage, workspaceId)).filter(Boolean)
    : [];
  const stageIds = new Set(stages.map((stage) => stage.id));
  const stageDefinitionReferences = Array.isArray(input.stageDefinitionReferences)
    ? input.stageDefinitionReferences
        .map((reference) => normalizeProjectDefinitionStageReference(reference, id, stageIds))
        .filter(Boolean)
    : stages.map((stage, index) => ({
        id: `${id}_stage_ref_${index + 1}`,
        rank: `0|i0000${index}:`,
        stageDefinitionId: stage.id,
        projectDefinitionId: id
      }));

  return {
    id,
    workspaceId,
    name,
    color: normalizeColor(input.color, '#889096'),
    description: sanitizeText(input.description),
    definitionDescription: sanitizeText(input.definitionDescription),
    managerId: sanitizeNullableText(input.managerId),
    createdByUserId: sanitizeText(input.createdByUserId) || DEFAULT_USER_ID,
    priorityLevel: normalizeEnum(input.priorityLevel, ['ASAP', 'HIGH', 'MEDIUM', 'LOW'], 'MEDIUM'),
    labelIds: normalizeStringArray(input.labelIds),
    stageDefinitionReferences,
    stages,
    variables: Array.isArray(input.variables) ? input.variables.map((entry) => ({ ...entry })) : [],
    customFieldValues: isPlainObject(input.customFieldValues) ? { ...input.customFieldValues } : {},
    folderId: sanitizeNullableText(input.folderId)
  };
}

function normalizeProjectDefinitionStageReference(input = {}, projectDefinitionId, validStageIds) {
  const stageDefinitionId = sanitizeText(input.stageDefinitionId);
  if (!stageDefinitionId || (validStageIds instanceof Set && validStageIds.size > 0 && !validStageIds.has(stageDefinitionId))) {
    return null;
  }

  return {
    id: sanitizeText(input.id) || `${projectDefinitionId}_${stageDefinitionId}`,
    rank: sanitizeText(input.rank) || '0',
    stageDefinitionId,
    projectDefinitionId: sanitizeText(input.projectDefinitionId) || projectDefinitionId
  };
}

function normalizeProject(input = {}, context = {}) {
  const id = sanitizeText(input.id);
  const name = sanitizeText(input.name);
  if (!id || !name) {
    return null;
  }

  const workspaceIds = context.workspaceIds instanceof Set ? context.workspaceIds : new Set();
  const projectDefinitionIds = context.projectDefinitionIds instanceof Set ? context.projectDefinitionIds : new Set();
  const workspaceIdCandidate = sanitizeText(input.workspaceId) || DEFAULT_WORKSPACE_ID;
  const projectDefinitionId = sanitizeNullableText(input.projectDefinitionId);
  const resolvedWorkspaceId = workspaceIds.size > 0
    ? (workspaceIds.has(workspaceIdCandidate) ? workspaceIdCandidate : DEFAULT_WORKSPACE_ID)
    : workspaceIdCandidate;
  const resolvedProjectDefinitionId = projectDefinitionId
    ? (projectDefinitionIds.size > 0
        ? (projectDefinitionIds.has(projectDefinitionId) ? projectDefinitionId : null)
        : projectDefinitionId)
    : null;

  return createBaseProject({
    ...input,
    id,
    name,
    workspaceId: resolvedWorkspaceId,
    projectDefinitionId: resolvedProjectDefinitionId
  });
}

function isValidStageInstance(stage) {
  return Boolean(stage && stage.id && stage.name && stage.stageDefinitionId);
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

export function getDefaultProjects() {
  return DEFAULT_PROJECTS.map((project) => ({
    ...project,
    stages: project.stages.map((stage) => ({ ...stage }))
  }));
}

export function getDefaultWorkspaces() {
  return DEFAULT_WORKSPACES.map((workspace) => ({ ...workspace }));
}

export function getDefaultProjectDefinitions() {
  return DEFAULT_PROJECT_DEFINITIONS.map((definition) => ({
    ...definition,
    stageDefinitionReferences: definition.stageDefinitionReferences.map((reference) => ({ ...reference })),
    stages: definition.stages.map((stage) => ({
      ...stage,
      duration: { ...stage.duration },
      variables: stage.variables.map((entry) => ({ ...entry })),
      tasks: stage.tasks.map((task) => ({
        ...task,
        blockedByTaskIds: task.blockedByTaskIds.slice(),
        labelIds: task.labelIds.slice(),
        customFieldValues: { ...task.customFieldValues },
        startRelativeInterval: {
          ...task.startRelativeInterval,
          duration: { ...task.startRelativeInterval.duration }
        },
        dueRelativeInterval: {
          ...task.dueRelativeInterval,
          duration: { ...task.dueRelativeInterval.duration }
        }
      }))
    })),
    variables: definition.variables.map((entry) => ({ ...entry })),
    customFieldValues: { ...definition.customFieldValues }
  }));
}

export function buildProjectSeedData(projects = []) {
  const rawProjects = Array.isArray(projects) ? projects : [];
  const normalizedProjects = rawProjects
    .map((project) => normalizeProject(project, {}))
    .filter(Boolean);

  if (!normalizedProjects.length) {
    return getDefaultProjects();
  }

  const byId = new Map();
  normalizedProjects.forEach((project) => {
    byId.set(project.id, { ...project });
  });
  return [...byId.values()];
}

export function buildProjectDomainSeedData({
  workspaces,
  projectDefinitions,
  projects
} = {}) {
  const normalizedWorkspaces = (Array.isArray(workspaces) && workspaces.length ? workspaces : getDefaultWorkspaces())
    .map((workspace) => normalizeWorkspace(workspace))
    .filter(Boolean);
  const workspaceIds = new Set(normalizedWorkspaces.map((workspace) => workspace.id));

  const normalizedProjectDefinitions = (Array.isArray(projectDefinitions) && projectDefinitions.length ? projectDefinitions : getDefaultProjectDefinitions())
    .map((definition) => normalizeProjectDefinition(definition))
    .filter(Boolean)
    .filter((definition) => workspaceIds.has(definition.workspaceId));
  const projectDefinitionIds = new Set(normalizedProjectDefinitions.map((definition) => definition.id));

  const normalizedProjects = (Array.isArray(projects) && projects.length ? projects : getDefaultProjects())
    .map((project) => normalizeProject(project, { workspaceIds, projectDefinitionIds }))
    .filter(Boolean);

  return {
    workspaces: dedupeById(normalizedWorkspaces),
    projectDefinitions: dedupeById(normalizedProjectDefinitions),
    projects: dedupeById(normalizedProjects)
  };
}

function dedupeById(items = []) {
  const byId = new Map();
  items.forEach((item) => {
    if (item?.id) {
      byId.set(item.id, item);
    }
  });
  return [...byId.values()];
}

export function getWorkspaceById(workspaces = [], workspaceId) {
  const id = sanitizeText(workspaceId);
  return workspaces.find((workspace) => workspace.id === id) || null;
}

export function getProjectById(projects = [], projectId) {
  const id = sanitizeText(projectId);
  return projects.find((project) => project.id === id) || null;
}

export function getProjectDefinitionById(projectDefinitions = [], projectDefinitionId) {
  const id = sanitizeText(projectDefinitionId);
  return projectDefinitions.find((definition) => definition.id === id) || null;
}

export function getStageDefinitionById(projectDefinitions = [], stageDefinitionId) {
  const id = sanitizeText(stageDefinitionId);
  for (const definition of projectDefinitions) {
    const stage = Array.isArray(definition?.stages)
      ? definition.stages.find((candidate) => candidate.id === id)
      : null;
    if (stage) {
      return stage;
    }
  }
  return null;
}

export function getTaskDefinitionById(projectDefinitions = [], taskDefinitionId) {
  const id = sanitizeText(taskDefinitionId);
  for (const definition of projectDefinitions) {
    for (const stage of definition?.stages || []) {
      const task = Array.isArray(stage?.tasks)
        ? stage.tasks.find((candidate) => candidate.id === id)
        : null;
      if (task) {
        return task;
      }
    }
  }
  return null;
}

export function getStageInstanceByDefinitionId(project = {}, stageDefinitionId) {
  const id = sanitizeText(stageDefinitionId);
  return Array.isArray(project?.stages)
    ? project.stages.find((stage) => stage.stageDefinitionId === id) || null
    : null;
}

function parseDateOnly(value) {
  const normalized = normalizeDate(value);
  if (!normalized) {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function toIsoAtHour(dateOnly, hour = 9) {
  const parsed = parseDateOnly(dateOnly);
  if (!parsed) {
    return null;
  }

  const next = new Date(parsed.valueOf());
  next.setUTCHours(hour, 0, 0, 0);
  return next.toISOString();
}

function getOrderedStageDefinitions(project = {}, projectDefinitions = []) {
  const projectDefinition = getProjectDefinitionById(projectDefinitions, project?.projectDefinitionId);
  if (!projectDefinition) {
    return [];
  }

  const explicitOrder = Array.isArray(projectDefinition.stageDefinitionReferences)
    ? projectDefinition.stageDefinitionReferences
        .map((reference) => getStageDefinitionById(projectDefinitions, reference.stageDefinitionId))
        .filter(Boolean)
    : [];

  if (explicitOrder.length) {
    return explicitOrder;
  }

  return Array.isArray(projectDefinition.stages) ? projectDefinition.stages.slice() : [];
}

export function getProjectStageOptions(project = {}, projectDefinitions = []) {
  return getOrderedStageDefinitions(project, projectDefinitions).map((stageDefinition) => {
    const stageInstance = getStageInstanceByDefinitionId(project, stageDefinition.id);
    return {
      id: stageDefinition.id,
      label: stageDefinition.name,
      color: stageDefinition.color || '#889096',
      dueDate: stageInstance?.dueDate || null,
      scheduledStatus: stageInstance?.scheduledStatus || null
    };
  });
}

export function getProjectTaskFormDefaults({
  projects = [],
  projectDefinitions = [],
  projectId,
  stageDefinitionId = null,
  now = new Date().toISOString()
} = {}) {
  const project = getProjectById(projects, projectId);
  const stageOptions = getProjectStageOptions(project, projectDefinitions);
  const selectedStageId = stageOptions.some((stage) => stage.id === sanitizeText(stageDefinitionId))
    ? sanitizeText(stageDefinitionId)
    : sanitizeNullableText(project?.activeStageDefinitionId) || stageOptions[0]?.id || null;
  const selectedStageIndex = stageOptions.findIndex((stage) => stage.id === selectedStageId);
  const selectedStage = selectedStageIndex >= 0 ? stageOptions[selectedStageIndex] : null;
  const previousStage = selectedStageIndex > 0 ? stageOptions[selectedStageIndex - 1] : null;
  const todayDate = normalizeDate(now) || normalizeDate(new Date().toISOString());

  let startDate = selectedStageIndex > 0
    ? previousStage?.dueDate || project?.startDate || todayDate
    : project?.startDate || todayDate;
  let dueDate = selectedStage?.dueDate || project?.dueDate || todayDate;

  if (startDate && todayDate && parseDateOnly(startDate)?.valueOf() < parseDateOnly(todayDate)?.valueOf()) {
    startDate = todayDate;
  }

  if (dueDate && todayDate && parseDateOnly(dueDate)?.valueOf() < parseDateOnly(todayDate)?.valueOf()) {
    dueDate = todayDate;
  }

  return {
    projectDefinitionId: sanitizeNullableText(project?.projectDefinitionId),
    selectedStageId,
    selectedStage,
    stageOptions,
    defaultStartAt: toIsoAtHour(startDate, 9),
    defaultDueAt: toIsoAtHour(dueDate, 17)
  };
}

export function decorateTaskWithProject(task, projectSource = [], options = {}) {
  const domain = Array.isArray(projectSource)
    ? { projects: projectSource, workspaces: [], projectDefinitions: [] }
    : projectSource || {};
  const project = getProjectById(domain.projects, task?.projectId);
  const workspace = getWorkspaceById(domain.workspaces, task?.workspaceId || project?.workspaceId);
  const stageDefinition = getStageDefinitionById(domain.projectDefinitions, task?.stageDefinitionId || project?.activeStageDefinitionId);
  const taskDefinition = getTaskDefinitionById(domain.projectDefinitions, task?.taskDefinitionId);
  const stageInstance = getStageInstanceByDefinitionId(project, task?.stageDefinitionId || project?.activeStageDefinitionId);

  return {
    ...task,
    projectName: project?.name || 'Inbox',
    projectColor: project?.color || '#3b82f6',
    workspaceId: task?.workspaceId || project?.workspaceId || DEFAULT_WORKSPACE_ID,
    workspaceName: workspace?.name || 'My Tasks (Private)',
    projectDefinitionId: task?.projectDefinitionId || project?.projectDefinitionId || null,
    stageName: stageDefinition?.name || stageInstance?.name || null,
    taskDefinitionName: taskDefinition?.name || null,
    activeStageDefinitionId: project?.activeStageDefinitionId || null,
    managerId: project?.managerId || null,
    isTutorialProject: Boolean(project?.projectDefinitionId)
  };
}
