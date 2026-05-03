/* c8 ignore start */
import { type COLOR } from '@motion/shared/common'

import { type DefaultAssigneeDropdownOption } from '../../members'

export type FlowTemplateRoleAssignee = {
  name: string
  type: 'person'
  color: COLOR
  key: string
} & Omit<DefaultAssigneeDropdownOption, 'type'>
