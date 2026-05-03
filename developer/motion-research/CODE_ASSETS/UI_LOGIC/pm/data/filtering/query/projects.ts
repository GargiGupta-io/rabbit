/* c8 ignore start */
import { cloneDeep } from '@motion/utils/core'
import { keys } from '@motion/utils/object'
import {
  type CustomFieldValueFilterSchema,
  type IdNullableFilterSchema,
  type ProjectSchema,
} from '@motion/zod/client'

import { excludeProjectsByCustomField } from './custom-fields'
import {
  exclude,
  excludeDate,
  excludeInclusion,
  excludeLabels,
  formatIdNullableFilter,
  isComplete,
} from './helpers'
import { type DataFilters } from './types'
import { getCompletedFilter, normalizeToDataFilter } from './utils'

import { createNoneProject } from '../../none-entities'
import { type AppDataContext } from '../../types'
import { type EntityFilterState, type ProjectFilter } from '../state/types'

export function getMatchingProjects(
  ctx: AppDataContext,
  stateOrFilter: DataFilters | EntityFilterState,
  overrides?: Partial<ProjectFilter>,
  userId?: string
) {
  const filter = normalizeToDataFilter(stateOrFilter)
  const predicate = buildProjectFilterFrom(ctx, filter, overrides, userId)

  const allProjects = [
    ...ctx.projects.all(),
    ...ctx.workspaces.all().map((w) => createNoneProject(w.id)),
  ]

  return allProjects.filter((project) => {
    return predicate(project)
  })
}

const SELECT_ALL = () => true

export function buildProjectFilterFrom(
  ctx: AppDataContext,
  stateOrFilter: DataFilters | EntityFilterState,
  overrides?: Partial<ProjectFilter>,
  userId?: string
) {
  const filters = normalizeToDataFilter(stateOrFilter)
  const projectFilters = filters.projects
  if (projectFilters == null) return SELECT_ALL
  const cloned = preprocessFilter(filters, userId)
  return buildProjectFilter(ctx, applyOptions(cloned, overrides))
}

function applyOptions(filter: DataFilters, overrides?: Partial<ProjectFilter>) {
  if (overrides == null || keys(overrides).length === 0) return filter

  return cloneDeep({
    ...filter,
    projects: { ...filter.projects, ...overrides },
  })
}

function buildProjectFilter(ctx: AppDataContext, filters: DataFilters) {
  return (project: ProjectSchema) => {
    return matchesProject(ctx, filters, project)
  }
}

function matchesProject(
  ctx: AppDataContext,
  filters: DataFilters,
  project: ProjectSchema
) {
  const projectFilters = filters.projects

  const completedFilter = getCompletedFilter(filters.projects, 'exclude')

  if (completedFilter === 'exclude' && isComplete(ctx, project)) {
    return false
  }
  if (exclude(filters.workspaces.ids, project, 'workspaceId')) return false

  if (exclude(projectFilters.ids, project, 'id')) return false

  if (
    exclude(
      formatIdNullableFilter(projectFilters.stageDefinitionIds),
      project,
      'activeStageDefinitionId'
    )
  ) {
    return false
  }
  if (
    exclude(
      formatIdNullableFilter(projectFilters.projectDefinitionIds),
      project,
      'projectDefinitionId'
    )
  ) {
    return false
  }

  if (exclude(projectFilters.statusIds, project, 'statusId')) return false
  if (
    exclude(
      formatIdNullableFilter(projectFilters.managerIds),
      project,
      'managerId'
    )
  )
    return false
  if (exclude(projectFilters.priorities, project, 'priorityLevel')) return false
  if (exclude(projectFilters.deadlineStatuses, project, 'deadlineStatus'))
    return false
  if (exclude(projectFilters.color, project, 'color')) return false
  if (exclude(projectFilters.createdByUserIds, project, 'createdByUserId'))
    return false
  if (exclude(projectFilters.folderIds, project, 'folderId')) return false

  if (excludeDate(projectFilters.dueDate, project.dueDate)) return false
  if (excludeLabels(projectFilters.labelIds, project)) return false
  if (excludeDate(projectFilters.createdTime, project.createdTime)) return false
  if (excludeDate(projectFilters.updatedTime, project.updatedTime)) return false
  if (excludeDate(projectFilters.startDate, project.startDate)) return false

  if (excludeProjectsByCustomField(projectFilters, project)) return false

  if (
    excludeInclusion(
      projectFilters.hasAttachments,
      !!project.uploadedFileIds?.length
    )
  ) {
    return false
  }

  return true
}

type FilterContext = {
  user: { id: string }
}

function preprocessFilter(filter: DataFilters, userId?: string) {
  if (userId == null) return filter
  const cloned = cloneDeep(filter)
  preprocessQueryFilter({ user: { id: userId } }, cloned.projects)
  return cloned
}

function preprocessQueryFilter(
  ctx: FilterContext,
  filter: DataFilters['projects']
) {
  preprocessAtMe(ctx, filter.managerIds)
  preprocessAtMe(ctx, filter.createdByUserIds)
  if (filter.multiPerson) {
    preprocessCustomFieldsAtMe(ctx, filter.multiPerson)
  }
  if (filter.person) {
    preprocessCustomFieldsAtMe(ctx, filter.person)
  }

  return filter
}

function preprocessAtMe(
  ctx: FilterContext,
  filter: IdNullableFilterSchema | undefined | null
) {
  if (filter == null) return
  filter.value = filter.value.map((x) => (x === '@me' ? ctx.user.id : x))
}

function preprocessCustomFieldsAtMe(
  ctx: FilterContext,
  fields: Record<string, Record<string, CustomFieldValueFilterSchema>>
) {
  if (fields == null) return
  Object.keys(fields).forEach((key) => {
    Object.keys(fields[key]).forEach((subKey) => {
      const filter = fields[key][subKey]
      if (filter.operator === 'in') {
        preprocessAtMe(ctx, filter)
      }
    })
  })
}
