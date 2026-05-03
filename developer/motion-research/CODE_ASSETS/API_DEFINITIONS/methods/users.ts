import { createKey, defineMutation } from '@motion/rpc'

import { type RouteTypes } from './types'

export const queryKeys = {
  profilePic: createKey(['user', 'settings', 'profilePic']),
}

type OnLogin = RouteTypes<'UsersController_onLogin'>
type OnLogout = RouteTypes<'UsersController_onLogout'>

export const postLoginApi = defineMutation<
  OnLogin['request'],
  OnLogin['response']
>().using({
  method: 'POST',
  uri: '/users/on-login',
  key: ['users-login'],
})

export const postLogoutApi = defineMutation<
  OnLogout['request'],
  OnLogout['response']
>().using({
  method: 'POST',
  uri: '/users/on-logout',
  key: ['users-logout'],
})

type ChangePassword = RouteTypes<'UsersController_updatePassword'>

export const changePasswordApi = defineMutation<
  ChangePassword['request'],
  void
>().using({
  method: 'PUT',
  uri: '/users/password',
  key: ['users-change-password'],
})

type UpdateName = RouteTypes<'UsersController_updateName'>
export const updateName = defineMutation<UpdateName['request'], void>().using({
  method: 'PUT',
  uri: '/users/name',
  key: ['users-update-name'],
})

// This method triggers Firebase's email verification flow
type SendEmailVerification = RouteTypes<'UsersController_sendVerificationEmail'>
export const sendEmailVerification = defineMutation<
  SendEmailVerification['request'],
  void
>().using({
  method: 'POST',
  uri: '/users/email/verification',
  key: ['users-send-email-verification'],
})

type UpdateEmail = RouteTypes<'UsersController_updateEmail'>
export const updateEmail = defineMutation<UpdateEmail['request'], void>().using(
  {
    method: 'PATCH',
    uri: '/users/email',
    key: ['users-update-email'],
  }
)

export const deleteProfilePic = defineMutation<{ id: string }, void>().using({
  method: 'DELETE',
  invalidate: queryKeys.profilePic,
  uri: (args) => `/users/${args.id}/profile/picture`,
  key: ['users-delete-profile-pic'],
})

type DisconnectCalendars = RouteTypes<'DetachCalendarsController_detach'>
export const disconnectCalendars = defineMutation<
  DisconnectCalendars['request'],
  void
>().using({
  method: 'DELETE',
  uri: '/detach_calendars',
  key: ['users-disconnect-calendars'],
})

type DeleteAccount = RouteTypes<'DetachCalendarsController_detachAndDeleteData'>
export const deleteAccount = defineMutation<
  DeleteAccount['request'],
  void
>().using({
  method: 'POST',
  uri: '/detach_calendars/delete_data',
  key: ['users-delete-account'],
})

type CheckPendingInvite = RouteTypes<'UsersController_checkPendingInvite'>
export const checkPendingInvite = defineMutation<
  CheckPendingInvite['request'],
  CheckPendingInvite['response']
>().using({
  method: 'GET',
  uri: (args) => `/users/checkPendingInvite?email=${args.email}`,
  key: ['users-check-pending-invite'],
})

type AttemptGuestLoginUnauthenticated =
  RouteTypes<'ProjectGuestsController_attemptLoginUnauthenticated'>
export const attemptGuestLogin = defineMutation<
  AttemptGuestLoginUnauthenticated['request'],
  AttemptGuestLoginUnauthenticated['response']
>().using({
  method: 'POST',
  uri: '/v2/project-guests/attempt-login/unauthenticated',
  key: ['project-guests-attempt-login'],
})

type CreateUserController = RouteTypes<'UsersController_create'>
export const create = defineMutation<
  CreateUserController['request'],
  void
>().using({
  uri: '/users/create',
  method: 'POST',
})
