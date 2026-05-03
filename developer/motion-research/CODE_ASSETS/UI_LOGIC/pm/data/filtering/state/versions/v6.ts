import { type EntityFilterState } from '../types'

export function toV6(obj: any): EntityFilterState {
  obj.$version = 6
  ;['tasks', 'projects'].forEach((entity) => {
    // Add custom field keys to the filter schema
    ;[
      'text',
      'multiSelect',
      'select',
      'number',
      'date',
      'url',
      'person',
      'multiPerson',
    ].forEach((cf) => {
      if (!(cf in obj)) {
        obj[entity].filters[cf] = {}
      }
    })
  })

  return obj
}
