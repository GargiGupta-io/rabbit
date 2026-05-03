export const wrapVariableInDelimiters = (
  key: string,
  type: 'name' | 'description' = 'name'
) => {
  if (type === 'description') {
    return `"${key}"`
  }

  return `{{${key}}}`
}

export const VariableTypes = ['text', 'person'] as const
export type VariableType = (typeof VariableTypes)[number]

export function isVariableType(type: string): type is VariableType {
  return VariableTypes.includes(type as VariableType)
}

export function castVariableType(type: string): VariableType {
  if (!isVariableType(type)) {
    throw new Error(`Invalid variable type: ${type}`)
  }
  return type
}
