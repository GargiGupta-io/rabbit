export const NOTE_ROLE = ['full-access', 'edit', 'comment', 'view'] as const

export type NOTE_ROLE = (typeof NOTE_ROLE)[number]

export function isNoteRole(value: string): value is NOTE_ROLE {
  // Use .some(...) to avoid casting
  return NOTE_ROLE.some((validRole) => validRole === value)
}

export const NOTE_ROLE_LABELS: Record<NOTE_ROLE, string> = {
  'full-access': 'Full Access',
  edit: 'Editor',
  comment: 'Collaborator',
  view: 'Viewer',
}

export const NOTE_ROLE_DESCRIPTIONS: Record<NOTE_ROLE, string> = {
  'full-access': 'Can edit, comment and share with others',
  edit: 'Can edit and comment',
  comment: 'Can only comment',
  view: 'Can only view',
} as const

export const NOTE_ROLE_FULL_ACCESS = 'full-access'
