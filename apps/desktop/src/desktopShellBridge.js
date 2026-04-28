import {
  DEFAULT_CURRENT_USER_EMAIL,
  DEFAULT_CURRENT_USER_ID,
  DEFAULT_CURRENT_USER_NAME
} from './identityDefaults.js';

export const DEFAULT_DESKTOP_DISTRIBUTION = 'microsoft';
export const DEFAULT_SHELL_APP_VERSION = '0.0.0-dev';
export const DEFAULT_MAX_TABS = 6;
export const DEFAULT_QUICK_MEETING_PROVIDER = 'GOOGLE_MEET';
export const DEFAULT_BRIDGE_SECURITY_MODE = 'restricted';

export const MAIN_SENDABLE_CHANNELS = Object.freeze([
  'appVersion',
  'hasNativeDesktopTabs',
  'desktopDistribution',
  'canNavigate',
  'loadCalendar',
  'loadScheduleSettings',
  'loginDesktop',
  'navigateInApp',
  'zoom-oauth',
  'openTask',
  'logEvent',
  'updateTheme',
  'updater:updateAvailable',
  'main:openTask',
  'main:openEvent',
  'main:openNew',
  'main:search',
  'main:completeTask',
  'main:quickMeeting:create'
]);

export const OPTION_SPACE_SENDABLE_CHANNELS = Object.freeze([
  'appVersion',
  'desktopDistribution',
  'closeOptionSpace',
  'openOptionSpace',
  'updateUserSettings',
  'setCurrentUser'
]);

export const TAB_SENDABLE_CHANNELS = Object.freeze([
  'tabs:set',
  'tabs:setMaxTabs',
  'tabs:didNavigate',
  'tabs:loadFailed'
]);

export const APP_BAR_SENDABLE_CHANNELS = Object.freeze([
  'appBar:setAgenda',
  'appBar:setMeetingInsights',
  'appBar:openEventNote',
  'appBar:setConferenceSettings',
  'appBar:taskCompleted',
  'appBar:quickMeeting:created',
  'appBar:quickMeeting:error',
  'appBar:noteTaker:send',
  'appBar:noteTaker:remove',
  'appBar:noteTaker:joined',
  'appBar:noteTaker:error',
  'appBar:noteTaker:removed',
  'appBar:settings:init'
]);

export const SENDABLE_CHANNELS = Object.freeze([
  ...MAIN_SENDABLE_CHANNELS,
  ...OPTION_SPACE_SENDABLE_CHANNELS,
  ...TAB_SENDABLE_CHANNELS,
  ...APP_BAR_SENDABLE_CHANNELS
]);

export const SYNC_SNAPSHOT_CHANNELS = Object.freeze([
  'appVersion',
  'desktopDistribution',
  'hasNativeDesktopTabs',
  'tabs:set',
  'tabs:setMaxTabs',
  'canNavigate',
  'tabs:didNavigate',
  'appBar:setAgenda',
  'appBar:settings:init',
  'appBar:setConferenceSettings',
  'appBar:setMeetingInsights',
  'updateTheme'
]);

export const MAIN_RECEIVABLE_CHANNELS = Object.freeze([
  'main:showMainWindow',
  'echo',
  'expandWindow',
  'getInitialData',
  'forceReload',
  'auth:logout',
  'navigate',
  'removeShortcuts',
  'showNotification',
  'notification:showInboxNotification',
  'updateSettings',
  'updateTheme',
  'userReady',
  'updater:requestUpdateStatus',
  'updater:updateLater',
  'updater:updateNow',
  'main:updateConferenceSettings',
  'main:quickMeeting:created',
  'main:quickMeeting:error',
  'inbox:setBadgeCount'
]);

export const OPTION_SPACE_RECEIVABLE_CHANNELS = Object.freeze([
  'cancelOptionSpace',
  'loadScheduleSettings',
  'getInitialData',
  'openTask',
  'updateUserSettings',
  'setCurrentUser'
]);

export const TAB_RECEIVABLE_CHANNELS = Object.freeze([
  'tabs:get',
  'tabs:select',
  'tabs:add',
  'tabs:move',
  'tabs:remove',
  'tabs:navigate',
  'tabs:didChangeOnlineStatus',
  'windows:showMainMenu'
]);

export const APP_BAR_RECEIVABLE_CHANNELS = Object.freeze([
  'appBar:taskCompleted',
  'appBar:sendTodayScheduledEntities',
  'appBar:sendMeetingInsights',
  'appBar:getInitialData',
  'appBar:openEvent',
  'appBar:openTask',
  'appBar:openNew',
  'appBar:search',
  'appBar:completeTask',
  'appBar:joinEvent',
  'appBar:quickMeeting:create',
  'appBar:noteTaker:send',
  'appBar:noteTaker:remove',
  'appBar:noteTaker:joined',
  'appBar:noteTaker:error',
  'appBar:noteTaker:removed',
  'appBar:openEventNote',
  'appBar:settings:requestSettings',
  'appBar:settings:update'
]);

export const RECEIVABLE_CHANNELS = Object.freeze([
  ...MAIN_RECEIVABLE_CHANNELS,
  ...OPTION_SPACE_RECEIVABLE_CHANNELS,
  ...TAB_RECEIVABLE_CHANNELS,
  ...APP_BAR_RECEIVABLE_CHANNELS
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

function toIsoString(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }

  return parsed.toISOString();
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)])
    );
  }

  return value;
}

function createChannelSet(channels = []) {
  return new Set(
    channels
      .map((channel) => sanitizeText(channel))
      .filter(Boolean)
  );
}

function getActiveTab(shellState = {}) {
  const tabs = Array.isArray(shellState.tabs) ? shellState.tabs : [];
  const activeTabId = sanitizeText(shellState.activeTabId);
  return shellState.activeTab
    || tabs.find((tab) => sanitizeText(tab.id) === activeTabId)
    || tabs.find((tab) => Boolean(tab.active))
    || tabs[0]
    || null;
}

function getActiveTabIndex(shellState = {}) {
  const tabs = Array.isArray(shellState.tabs) ? shellState.tabs : [];
  const activeTab = getActiveTab(shellState);
  return tabs.findIndex((tab) => sanitizeText(tab?.id) === sanitizeText(activeTab?.id));
}

function getAgendaBuckets(shellState = {}) {
  const agenda = isPlainObject(shellState.agenda) ? shellState.agenda : {};
  return [
    ['ongoing', Array.isArray(agenda.ongoing) ? agenda.ongoing : []],
    ['upcoming', Array.isArray(agenda.upcoming) ? agenda.upcoming : []],
    ['timeless', Array.isArray(agenda.timeless) ? agenda.timeless : []]
  ];
}

export function createDesktopTabPayload(shellState = {}) {
  const tabs = Array.isArray(shellState.tabs) ? shellState.tabs : [];
  const activeTabId = sanitizeText(shellState.activeTabId, sanitizeText(getActiveTab(shellState)?.id));

  return tabs
    .map((tab) => {
      const id = sanitizeText(tab?.id);
      const title = sanitizeText(tab?.title);
      if (!id || !title) {
        return null;
      }

      return {
        id,
        title,
        active: id === activeTabId || (!activeTabId && Boolean(tab.active))
      };
    })
    .filter(Boolean);
}

export function createDesktopAgendaPayload(shellState = {}) {
  return getAgendaBuckets(shellState).flatMap(([bucket, entries]) => entries.map((entry, index) => {
    const sourceType = sanitizeText(entry?.sourceType, 'task');
    const entityId = sanitizeText(entry?.entityId, sanitizeText(entry?.id, `${sourceType}:${bucket}:${index}`));
    const title = sanitizeText(entry?.title, sourceType === 'calendar' ? 'Calendar event' : 'Task');
    const status = sanitizeText(entry?.status, sourceType === 'calendar' ? 'busy' : 'todo');
    const subtitle = sanitizeText(entry?.subtitle);
    const agendaEntry = {
      id: sanitizeText(entry?.id, `${sourceType}:${entityId}`),
      entityId,
      bucket,
      type: sourceType === 'calendar' ? 'scheduled-event' : 'scheduled-task',
      sourceType,
      title,
      subtitle,
      status,
      startAt: toIsoString(entry?.startAt || entry?.sortAt),
      endAt: toIsoString(entry?.endAt),
      dueAt: toIsoString(entry?.dueAt),
      sortAt: toIsoString(entry?.sortAt || entry?.startAt || entry?.dueAt),
      projectId: sanitizeText(entry?.projectId) || null
    };

    if (sourceType === 'calendar') {
      return {
        ...agendaEntry,
        event: {
          id: entityId,
          title,
          status,
          calendarId: subtitle || null
        }
      };
    }

    return {
      ...agendaEntry,
      task: {
        id: entityId,
        title,
        status,
        projectId: sanitizeText(entry?.projectId) || null
      }
    };
  }));
}

export function createCanNavigatePayload(input = {}) {
  if (typeof input?.canGoBack === 'boolean' || typeof input?.canGoForward === 'boolean') {
    return {
      canGoBack: Boolean(input?.canGoBack),
      canGoForward: Boolean(input?.canGoForward)
    };
  }

  const tabs = Array.isArray(input?.tabs) ? input.tabs : [];
  const activeIndex = Number.isInteger(input?.activeIndex) ? input.activeIndex : getActiveTabIndex({ tabs, activeTabId: input?.activeTabId });
  return {
    canGoBack: activeIndex > 0,
    canGoForward: activeIndex >= 0 && activeIndex < tabs.length - 1
  };
}

export function createDidNavigatePayload(shellState = {}, navigation = {}) {
  const activeTab = getActiveTab(shellState);
  return {
    tabId: sanitizeText(activeTab?.id),
    isActive: Boolean(activeTab),
    title: sanitizeText(activeTab?.title, 'Calendar'),
    url: sanitizeText(activeTab?.route, '/web/calendar'),
    canGoBack: Boolean(navigation?.canGoBack),
    canGoForward: Boolean(navigation?.canGoForward)
  };
}

export function createAppBarSettingsPayload(input = {}) {
  return {
    showTrayText: Boolean(input?.showTrayText)
  };
}

export function createConferenceSettingsPayload(input = {}) {
  const defaultConferenceType = sanitizeText(input?.defaultConferenceType, DEFAULT_QUICK_MEETING_PROVIDER).toUpperCase();
  const email = sanitizeText(input?.email, DEFAULT_CURRENT_USER_EMAIL);

  return {
    defaultConferenceType,
    hasZoomAccount: Boolean(input?.hasZoomAccount),
    hasPhoneNumber: Boolean(input?.hasPhoneNumber),
    hasCustomLocation: input?.hasCustomLocation == null ? true : Boolean(input.hasCustomLocation),
    hostEmailAccount: {
      id: sanitizeText(input?.accountId, `acct_${email.split('@')[0] || 'host'}`),
      userId: sanitizeText(input?.userId, DEFAULT_CURRENT_USER_ID),
      email,
      name: sanitizeText(input?.name, DEFAULT_CURRENT_USER_NAME),
      providerType: sanitizeText(input?.providerType, 'GOOGLE').toUpperCase(),
      profilePictureUrl: sanitizeText(input?.profilePictureUrl) || undefined
    },
    canEnableNotetaker: input?.canEnableNotetaker == null ? true : Boolean(input.canEnableNotetaker),
    defaultNotetakerEnabled: Boolean(input?.defaultNotetakerEnabled),
    hasAIWorkflows: Boolean(input?.hasAIWorkflows)
  };
}

export function createQuickMeetingPayload(input = {}) {
  const provider = sanitizeText(input?.conferenceProvider, DEFAULT_QUICK_MEETING_PROVIDER).toUpperCase();
  return {
    conferenceProvider: provider,
    addNotetaker: Boolean(input?.addNotetaker)
  };
}

export function createShellBridgeSnapshot({
  shellState = {},
  syncState = {},
  inboxState = {},
  distribution = DEFAULT_DESKTOP_DISTRIBUTION,
  appVersion = DEFAULT_SHELL_APP_VERSION,
  maxTabs = DEFAULT_MAX_TABS,
  canNavigate = {},
  appBarSettings = {}
} = {}) {
  const tabs = createDesktopTabPayload(shellState);
  const normalizedDistribution = sanitizeText(distribution, DEFAULT_DESKTOP_DISTRIBUTION);
  const themeMode = sanitizeText(shellState?.theme?.dataTheme || shellState?.theme?.mode, 'dark') === 'light'
    ? 'light'
    : 'dark';
  const activeIndex = getActiveTabIndex(shellState);
  const showTrayText = appBarSettings.showTrayText == null
    ? Boolean((inboxState?.unreadCount || 0) > 0 || (syncState?.pendingCount || 0) > 0 || (shellState?.agenda?.counts?.ongoing || 0) > 0)
    : Boolean(appBarSettings.showTrayText);

  return {
    appVersion: sanitizeText(appVersion, DEFAULT_SHELL_APP_VERSION),
    distribution: ['microsoft', 'github', 'apple'].includes(normalizedDistribution)
      ? normalizedDistribution
      : DEFAULT_DESKTOP_DISTRIBUTION,
    themeMode,
    tabs,
    maxTabs: Number.isInteger(maxTabs) && maxTabs > 0 ? maxTabs : Math.max(DEFAULT_MAX_TABS, tabs.length || 1),
    navigation: createCanNavigatePayload({
      ...canNavigate,
      tabs,
      activeIndex,
      activeTabId: shellState?.activeTabId
    }),
    activeNavigation: createDidNavigatePayload(shellState, canNavigate),
    agenda: createDesktopAgendaPayload(shellState),
    appBarSettings: createAppBarSettingsPayload({ showTrayText }),
    conferenceSettings: createConferenceSettingsPayload(appBarSettings),
    meetingInsights: isPlainObject(appBarSettings?.meetingInsights) ? cloneValue(appBarSettings.meetingInsights) : {}
  };
}

function getDefaultSendTransport() {
  if (typeof window === 'undefined' || !window.ipcRender || typeof window.ipcRender.send !== 'function') {
    return null;
  }

  return (channel, ...args) => {
    window.ipcRender.send(channel, ...args);
  };
}

function getDefaultReceiveTransport() {
  if (typeof window === 'undefined' || !window.ipcRender || typeof window.ipcRender.receive !== 'function') {
    return null;
  }

  return (channel, cb) => {
    window.ipcRender.receive(channel, (...args) => cb(...args));
  };
}

function dispatchHandlers(handlers, channel, args) {
  const registered = handlers.get(channel) || [];
  registered.forEach((handler) => {
    handler(...args);
  });
}

export function createDesktopShellBridge(options = {}) {
  const handlers = new Map();
  const subscribedChannels = new Set();
  const sentMessages = [];
  const securityEvents = [];
  const sendTransport = typeof options.send === 'function' ? options.send : getDefaultSendTransport();
  const receiveTransport = typeof options.receive === 'function' ? options.receive : getDefaultReceiveTransport();
  const defaultDistribution = sanitizeText(options.distribution, DEFAULT_DESKTOP_DISTRIBUTION) || DEFAULT_DESKTOP_DISTRIBUTION;
  const defaultAppVersion = sanitizeText(options.appVersion, DEFAULT_SHELL_APP_VERSION) || DEFAULT_SHELL_APP_VERSION;
  const defaultMaxTabs = Number.isInteger(options.maxTabs) && options.maxTabs > 0 ? options.maxTabs : DEFAULT_MAX_TABS;
  const securityMode = sanitizeText(
    options.securityMode,
    options.allowUnsafeChannels === true ? 'compatibility' : DEFAULT_BRIDGE_SECURITY_MODE
  );
  const allowUnsafeChannels = Boolean(options.allowUnsafeChannels);
  const throwOnSecurityViolation = options.throwOnSecurityViolation !== false;
  const sendableChannelSet = createChannelSet(SENDABLE_CHANNELS);
  const receivableChannelSet = createChannelSet(RECEIVABLE_CHANNELS);
  const syncChannelSet = createChannelSet(SYNC_SNAPSHOT_CHANNELS);

  function recordSecurityEvent(direction, channel, reason) {
    const event = {
      direction,
      channel: sanitizeText(channel) || String(channel || ''),
      reason,
      mode: securityMode,
      blockedAt: new Date().toISOString()
    };
    securityEvents.push(event);
    return event;
  }

  function requireAllowedChannel(direction, channel, allowedChannels) {
    const normalizedChannel = sanitizeText(channel);
    if (allowUnsafeChannels) {
      return normalizedChannel;
    }

    if (normalizedChannel && allowedChannels.has(normalizedChannel)) {
      return normalizedChannel;
    }

    recordSecurityEvent(direction, channel, 'unsupported-channel');
    if (throwOnSecurityViolation) {
      const error = new Error(`Desktop shell bridge blocked ${direction} on unsupported channel "${channel}"`);
      error.code = 'DESKTOP_BRIDGE_CHANNEL_BLOCKED';
      error.direction = direction;
      error.channel = channel;
      throw error;
    }

    return null;
  }

  function requireSyncChannel(channel) {
    const normalizedChannel = sanitizeText(channel);
    if (allowUnsafeChannels || syncChannelSet.has(normalizedChannel)) {
      return normalizedChannel;
    }

    recordSecurityEvent('sync', channel, 'unsupported-sync-channel');
    if (throwOnSecurityViolation) {
      const error = new Error(`Desktop shell bridge blocked sync on unsupported channel "${channel}"`);
      error.code = 'DESKTOP_BRIDGE_SYNC_CHANNEL_BLOCKED';
      error.direction = 'sync';
      error.channel = channel;
      throw error;
    }

    return null;
  }

  function ensureChannelSubscription(channel) {
    if (typeof receiveTransport !== 'function' || subscribedChannels.has(channel)) {
      return;
    }

    subscribedChannels.add(channel);
    receiveTransport(channel, (...args) => {
      dispatchHandlers(handlers, channel, args);
    });
  }

  function on(channel, cb) {
    const normalizedChannel = requireAllowedChannel('receive', channel, receivableChannelSet);
    if (!normalizedChannel) {
      return () => {};
    }

    const callbacks = handlers.get(normalizedChannel) || [];
    handlers.set(normalizedChannel, callbacks.concat(cb));
    ensureChannelSubscription(normalizedChannel);

    return () => {
      const nextCallbacks = (handlers.get(normalizedChannel) || []).filter((entry) => entry !== cb);
      handlers.set(normalizedChannel, nextCallbacks);
    };
  }

  function send(channel, ...args) {
    const normalizedChannel = requireAllowedChannel('send', channel, sendableChannelSet);
    if (!normalizedChannel) {
      return null;
    }

    const entry = {
      channel: normalizedChannel,
      args: cloneValue(args),
      sentAt: new Date().toISOString()
    };
    sentMessages.push(entry);

    if (typeof sendTransport === 'function') {
      sendTransport(normalizedChannel, ...args);
    }

    return entry;
  }

  function emit(channel, ...args) {
    const normalizedChannel = requireAllowedChannel('emit', channel, receivableChannelSet);
    if (!normalizedChannel) {
      return 0;
    }

    dispatchHandlers(handlers, normalizedChannel, args);
    return (handlers.get(normalizedChannel) || []).length;
  }

  function syncShellState(input = {}, overrides = {}) {
    const snapshot = Array.isArray(input?.tabs) && Array.isArray(input?.agenda)
      ? {
          ...input,
          ...overrides
        }
      : createShellBridgeSnapshot({
          ...input,
          ...overrides,
          distribution: overrides.distribution || input.distribution || defaultDistribution,
          appVersion: overrides.appVersion || input.appVersion || defaultAppVersion,
          maxTabs: overrides.maxTabs || input.maxTabs || defaultMaxTabs
        });

    [
      ['appVersion', snapshot.appVersion],
      ['desktopDistribution', snapshot.distribution],
      ['hasNativeDesktopTabs', true, snapshot.maxTabs, snapshot.tabs.length],
      ['tabs:set', snapshot.tabs],
      ['tabs:setMaxTabs', snapshot.maxTabs],
      ['canNavigate', snapshot.navigation]
    ].forEach(([channel, ...args]) => {
      const normalizedChannel = requireSyncChannel(channel);
      if (normalizedChannel) {
        send(normalizedChannel, ...args);
      }
    });

    if (snapshot.activeNavigation?.tabId) {
      const normalizedChannel = requireSyncChannel('tabs:didNavigate');
      if (normalizedChannel) {
        send(normalizedChannel, snapshot.activeNavigation);
      }
    }
    [
      ['appBar:setAgenda', snapshot.agenda],
      ['appBar:settings:init', snapshot.appBarSettings],
      ['appBar:setConferenceSettings', snapshot.conferenceSettings],
      ['appBar:setMeetingInsights', snapshot.meetingInsights],
      ['updateTheme', snapshot.themeMode]
    ].forEach(([channel, ...args]) => {
      const normalizedChannel = requireSyncChannel(channel);
      if (normalizedChannel) {
        send(normalizedChannel, ...args);
      }
    });

    return snapshot;
  }

  return {
    on,
    send,
    emit,
    syncShellState,
    getSentMessages() {
      return sentMessages.map((entry) => cloneValue(entry));
    },
    clearSentMessages() {
      sentMessages.length = 0;
    },
    getSecurityState() {
      return {
        mode: securityMode,
        allowUnsafeChannels,
        throwOnSecurityViolation,
        violationCount: securityEvents.length,
        events: securityEvents.map((event) => cloneValue(event))
      };
    },
    channelCatalog: {
      sendable: SENDABLE_CHANNELS,
      receivable: RECEIVABLE_CHANNELS,
      syncSendable: SYNC_SNAPSHOT_CHANNELS
    }
  };
}
