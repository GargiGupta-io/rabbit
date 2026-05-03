import type { GetCustomFieldCategories } from '@motion/zod/client'

export const CUSTOM_FIELD_CATEGORIES_RESPONSE = {
  ids: [
    'text',
    'multiSelect',
    'number',
    'person',
    'multiPerson',
    'select',
    'url',
    'date',
  ],
  meta: {
    model: 'customFieldCategories',
  },
  models: {
    customFieldCategories: {
      text: {
        id: 'text',
        name: 'Text',
      },
      multiSelect: {
        id: 'multiSelect',
        name: 'Multi Select',
      },
      number: {
        id: 'number',
        name: 'Number',
      },
      person: {
        id: 'person',
        name: 'Person',
      },
      multiPerson: {
        id: 'multiPerson',
        name: 'Multi Person',
      },
      select: {
        id: 'select',
        name: 'Select',
      },
      url: {
        id: 'url',
        name: 'URL',
      },
      date: {
        id: 'date',
        name: 'Date',
      },
    },
  },
} satisfies GetCustomFieldCategories
