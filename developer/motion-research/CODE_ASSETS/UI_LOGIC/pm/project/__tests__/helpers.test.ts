import { type ProjectSchema } from '@motion/zod/client'

import { projectDefinitionSchemaMock } from '../../../mocks/pm/project-definition-schema'
import {
  isCustomTemplateProject,
  isFlowProject,
  isFlowTemplate,
} from '../flows/type-guards'

describe('isCustomTemplateProject()', () => {
  it('returns true if project has an active stage definition', () => {
    const project = {
      projectDefinitionId: null,
      activeStageDefinitionId: '1',
    } as ProjectSchema

    expect(isCustomTemplateProject(project)).toBe(true)
  })

  it('returns false if project has a stage definition and a project definition', () => {
    const project = {
      activeStageDefinitionId: '1234',
      projectDefinitionId: '123',
    } as ProjectSchema

    expect(isCustomTemplateProject(project)).toBe(false)
  })

  it('returns false if project does not have an active stage definition', () => {
    const project = {
      activeStageDefinitionId: null,
    } as ProjectSchema

    expect(isCustomTemplateProject(project)).toBe(false)
    expect(isCustomTemplateProject(null)).toBe(false)
    expect(isCustomTemplateProject(undefined)).toBe(false)
  })
})

describe('isFlowProject()', () => {
  it('returns true if project has an active stage definition', () => {
    const project = {
      projectDefinitionId: null,
      activeStageDefinitionId: '1',
    } as ProjectSchema

    expect(isFlowProject(project)).toBe(true)
  })

  it('returns false if project does not have a stage definition', () => {
    const project = {
      activeStageDefinitionId: null,
    } as ProjectSchema

    expect(isFlowProject(project)).toBe(false)
    expect(isFlowProject(null)).toBe(false)
    expect(isFlowProject(undefined)).toBe(false)
  })
})

describe('isFlowTemplate', () => {
  it('should return true for a valid ProjectDefinitionSchema', () => {
    const validTemplate = projectDefinitionSchemaMock

    expect(isFlowTemplate(validTemplate)).toBe(true)
  })

  it('should return false for null or undefined', () => {
    expect(isFlowTemplate(null)).toBe(false)
    expect(isFlowTemplate(undefined)).toBe(false)
  })

  it('should return false for non-object values', () => {
    expect(isFlowTemplate('string' as any)).toBe(false)
    expect(isFlowTemplate(123 as any)).toBe(false)
    expect(isFlowTemplate(true as any)).toBe(false)
  })

  it('should return false for objects without stages property', () => {
    const invalidTemplate = {
      someOtherProperty: 'value',
    } as any

    expect(isFlowTemplate(invalidTemplate)).toBe(false)
  })

  it('should return false for objects with non-array stages property', () => {
    const invalidTemplate = {
      stages: 'not an array',
    } as any

    expect(isFlowTemplate(invalidTemplate)).toBe(false)
  })
})
