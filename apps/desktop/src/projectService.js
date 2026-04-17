const DEFAULT_PROJECTS = [
  { id: 'inbox', name: 'Inbox', color: '#3b82f6', archived: false },
  { id: 'work', name: 'Work', color: '#10b981', archived: false },
  { id: 'personal', name: 'Personal', color: '#f59e0b', archived: false }
];

function sanitizeText(value) {
  return String(value ?? '').trim();
}

function sanitizeColor(value, fallback = '#3b82f6') {
  const candidate = sanitizeText(value);
  if (!candidate || !candidate.startsWith('#') || candidate.length !== 7) {
    return fallback;
  }
  return candidate;
}

export function getDefaultProjects() {
  return DEFAULT_PROJECTS.map((project) => ({ ...project }));
}

export function normalizeProject(input = {}) {
  const id = sanitizeText(input.id);
  const name = sanitizeText(input.name);
  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    color: sanitizeColor(input.color),
    archived: Boolean(input.archived)
  };
}

export function buildProjectSeedData(projects = []) {
  const rawProjects = Array.isArray(projects) ? projects : [];

  const normalizedProjects = rawProjects
    .map((project) => normalizeProject(project))
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

export function getProjectById(projects = [], projectId) {
  const id = sanitizeText(projectId);
  return projects.find((project) => project.id === id) || null;
}

export function decorateTaskWithProject(task, projects = []) {
  const project = getProjectById(projects, task?.projectId);
  return {
    ...task,
    projectName: project?.name || 'Inbox'
  };
}
