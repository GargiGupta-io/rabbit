import {
  type EndRelativeDateOption,
  type StartRelativeDateOption,
} from '@motion/shared/common'

import { type TaskFormFields } from './form'

export type TaskDefaults = TaskFormFields & {
  relativeStartOn: StartRelativeDateOption
  relativeDueDate: EndRelativeDateOption
}
