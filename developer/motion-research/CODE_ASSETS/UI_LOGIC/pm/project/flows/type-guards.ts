import { type TemplateProjectType } from '@motion/rpc-types/legacy'
import {
  type ProjectDefinitionSchema,
  type ProjectSchema,
} from '@motion/zod/client'

export type FlowProject = ProjectSchema & {
  activeStageDefinitionId: NonNullable<ProjectSchema['activeStageDefinitionId']>
}

export function isFlowProject(
  project: ProjectSchema | null | undefined
): project is FlowProject {
  return project != null && project.activeStageDefinitionId != null
}

export function isCustomTemplateProject(
  project:
    | Pick<ProjectSchema, 'projectDefinitionId' | 'activeStageDefinitionId'>
    | null
    | undefined
): project is FlowProject {
  return (
    project != null &&
    project.projectDefinitionId == null &&
    project.activeStageDefinitionId != null
  )
}

export function isFlowTemplate(
  template: TemplateProjectType | ProjectDefinitionSchema | null | undefined
): template is ProjectDefinitionSchema {
  return (
    template != null &&
    typeof template === 'object' &&
    'stages' in template &&
    Array.isArray(template.stages)
  )
}
