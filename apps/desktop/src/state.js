import { normalizeTask } from './taskService.js';
import { buildProjectSeedData } from './projectService.js';

export * from './taskService.js';
export * from './projectService.js';
export { buildPlanWindow, generatePlanSlice, rankConflicts } from './scheduler.js';

export function buildSeedData({ projects, tasks }) {
  const normalizedProjects = buildProjectSeedData(projects);
  const normalizedTasks = Array.isArray(tasks)
    ? tasks.map((task) => normalizeTask(task, { projectIds: new Set(normalizedProjects.map((project) => project.id) ) })).filter(Boolean)
    : [];

  return {
    projects: normalizedProjects,
    tasks: normalizedTasks
  };
}
