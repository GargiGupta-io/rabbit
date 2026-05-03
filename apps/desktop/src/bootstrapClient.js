import { createQueryKey, defineMutation, defineQuery } from './apiClient.js';

const ONE_HOUR = 60 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

export const queryKeys = {
  bootstrap: (args = {}) => createQueryKey('bootstrap', args),
  usersRoot: createQueryKey('v2', 'users'),
  me: () => createQueryKey(queryKeys.usersRoot, 'me'),
  mySettings: () => createQueryKey(queryKeys.me(), 'settings'),
  pageViewSettings: () => createQueryKey(queryKeys.me(), 'pageViewSettings'),
  firebaseProviderTypes: () => createQueryKey(queryKeys.me(), 'firebaseProviderTypes'),
  featurePermissions: () => createQueryKey(queryKeys.me(), 'feature-permissions'),
  guestTeams: () => createQueryKey(queryKeys.me(), 'guest-teams')
};

export const fetchBootstrap = defineQuery({
  method: 'POST',
  uri: '/v2/ui/bootstrap',
  body: (args = {}) => args,
  key: (args = {}) => queryKeys.bootstrap(args)
});

export const getMySettings = defineQuery({
  method: 'GET',
  uri: '/v2/users/me/settings',
  key: () => queryKeys.mySettings(),
  queryOptions: {
    gcTime: Infinity,
    staleTime: ONE_HOUR
  }
});

export const getCurrentUser = defineQuery({
  method: 'GET',
  uri: '/v2/users/me',
  key: () => queryKeys.me(),
  queryOptions: {
    staleTime: THIRTY_MINUTES
  }
});

export const getFeaturePermissions = defineQuery({
  method: 'GET',
  uri: '/v2/users/me/feature-permissions',
  key: () => queryKeys.featurePermissions(),
  queryOptions: {
    staleTime: FIVE_MINUTES
  }
});

export const getPageViewSettings = defineQuery({
  method: 'GET',
  uri: '/v2/users/me/settings/page-view',
  key: () => queryKeys.pageViewSettings()
});

export const getFirebaseProviderTypes = defineQuery({
  method: 'GET',
  uri: '/v2/users/me/settings/firebase-provider-types',
  key: () => queryKeys.firebaseProviderTypes(),
  queryOptions: {
    staleTime: THIRTY_MINUTES
  }
});

export const getGuestTeams = defineQuery({
  method: 'GET',
  uri: '/v2/users/me/guest-teams',
  key: () => queryKeys.guestTeams()
});

export const updateTaskDefaults = defineMutation({
  method: 'PATCH',
  uri: '/v2/users/me/settings/task-defaults',
  body: (args = {}) => args,
  invalidate: () => [queryKeys.mySettings()]
});
