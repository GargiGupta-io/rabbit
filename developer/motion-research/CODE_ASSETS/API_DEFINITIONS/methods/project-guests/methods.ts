import { defineMutation } from '@motion/rpc'

import { type RouteTypes } from '../types'

type ContactProjectTeam =
  RouteTypes<'ProjectGuestsController_contactProjectTeam'>
export const contactProjectTeam = defineMutation<
  ContactProjectTeam['request'],
  undefined
>().using({
  uri: () => `/v2/project-guests/me/contact-project-team`,
  method: 'POST',
  body: (args) => args,
})
