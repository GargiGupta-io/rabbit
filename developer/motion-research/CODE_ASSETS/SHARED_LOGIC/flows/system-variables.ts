import { VariableDefinition } from './definitions'
import { createStableFlowKey, FLOW_KEY_VIRTUAL_PREFIX } from './keys'
import { wrapVariableInDelimiters } from './variables'

export const PROJECT_NAME_FLOW_KEY = createStableFlowKey('project_name')

export const SYSTEM_FLOW_VARIABLES = new Map([
  ['Project name' as const, PROJECT_NAME_FLOW_KEY],
])

export const SYSTEM_FLOW_VARIABLE_KEYS = Array.from(
  SYSTEM_FLOW_VARIABLES.values()
)

export const SYSTEM_FLOW_VARIABLE_OBJECTS: VariableDefinition[] = [
  {
    key: PROJECT_NAME_FLOW_KEY,
    color: 'blue' as const,
    name: 'Project name',
    type: 'text' as const,
    id: PROJECT_NAME_FLOW_KEY,
  },
]

export function isSystemVariableKey(key: string) {
  return SYSTEM_FLOW_VARIABLE_KEYS.includes(
    key as (typeof SYSTEM_FLOW_VARIABLE_KEYS)[number]
  )
}

export function isVirtualVariableKey(key: string) {
  return key.startsWith(FLOW_KEY_VIRTUAL_PREFIX)
}

export type SystemVariableReplacementValues = {
  projectName: string
}

export function replaceSystemVariableKeys(
  textToReplace: string,
  { projectName }: SystemVariableReplacementValues
) {
  let result = textToReplace

  SYSTEM_FLOW_VARIABLES.forEach((key) => {
    const wrappedVariableName = wrapVariableInDelimiters(key)

    switch (key) {
      case PROJECT_NAME_FLOW_KEY:
        result = result.replaceAll(wrappedVariableName, projectName)
    }
  })

  return result
}
