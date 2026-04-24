const VALID_DISTRIBUTIONS = new Set(['apple', 'microsoft', 'github']);

function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

function normalizeKey(value) {
  const key = sanitizeText(value).toLowerCase();
  if (!key) {
    return '';
  }

  return key === 'space' ? ' ' : key;
}

export function normalizeDesktopPlatform(value = '') {
  const normalized = sanitizeText(value).toLowerCase();
  if (!normalized) {
    return 'unknown';
  }

  if (normalized === 'darwin' || normalized.includes('mac')) {
    return 'macos';
  }

  if (normalized.includes('win')) {
    return 'windows';
  }

  if (normalized.includes('linux')) {
    return 'linux';
  }

  return normalized;
}

export function normalizeDesktopDistribution(value = '', platform = 'unknown') {
  const distribution = sanitizeText(value).toLowerCase();
  if (VALID_DISTRIBUTIONS.has(distribution)) {
    return distribution;
  }

  const platformId = normalizeDesktopPlatform(platform);
  if (platformId === 'macos') {
    return 'apple';
  }

  if (platformId === 'windows') {
    return 'microsoft';
  }

  return 'github';
}

function createShortcut(label, command, matcher) {
  return {
    label,
    command,
    matcher
  };
}

function createMacShortcuts() {
  return {
    search: createShortcut('⌘K', 'search', {
      key: 'k',
      metaKey: true
    }),
    addTask: createShortcut('⌥Space', 'new-task', {
      key: ' ',
      altKey: true
    }),
    openCalendar: createShortcut('⌥C', 'open-calendar', {
      key: 'c',
      altKey: true
    }),
    openProjectManager: createShortcut('⌥P', 'open-project-manager', {
      key: 'p',
      altKey: true
    }),
    openScheduler: createShortcut('⌥A', 'open-scheduler', {
      key: 'a',
      altKey: true
    }),
    quickMeeting: createShortcut('⌘⇧M', 'quick-meeting', {
      key: 'm',
      metaKey: true,
      shiftKey: true
    }),
    closeTab: createShortcut('⌘W', 'close-tab', {
      key: 'w',
      metaKey: true
    }),
    moveTabLeft: createShortcut('⌘⇧[', 'move-tab-left', {
      key: '[',
      metaKey: true,
      shiftKey: true
    }),
    moveTabRight: createShortcut('⌘⇧]', 'move-tab-right', {
      key: ']',
      metaKey: true,
      shiftKey: true
    }),
    navigateBackward: createShortcut('⌥←', 'navigate-backward', {
      key: 'arrowleft',
      altKey: true
    }),
    navigateForward: createShortcut('⌥→', 'navigate-forward', {
      key: 'arrowright',
      altKey: true
    }),
    appMenu: createShortcut('⌃M', 'menu', {
      key: 'm',
      ctrlKey: true
    })
  };
}

function createWindowsShortcuts() {
  return {
    search: createShortcut('Ctrl K', 'search', {
      key: 'k',
      ctrlKey: true
    }),
    addTask: createShortcut('Alt Space', 'new-task', {
      key: ' ',
      altKey: true
    }),
    openCalendar: createShortcut('Alt C', 'open-calendar', {
      key: 'c',
      altKey: true
    }),
    openProjectManager: createShortcut('Alt P', 'open-project-manager', {
      key: 'p',
      altKey: true
    }),
    openScheduler: createShortcut('Alt A', 'open-scheduler', {
      key: 'a',
      altKey: true
    }),
    quickMeeting: createShortcut('Ctrl Shift M', 'quick-meeting', {
      key: 'm',
      ctrlKey: true,
      shiftKey: true
    }),
    closeTab: createShortcut('Ctrl W', 'close-tab', {
      key: 'w',
      ctrlKey: true
    }),
    moveTabLeft: createShortcut('Ctrl Shift [', 'move-tab-left', {
      key: '[',
      ctrlKey: true,
      shiftKey: true
    }),
    moveTabRight: createShortcut('Ctrl Shift ]', 'move-tab-right', {
      key: ']',
      ctrlKey: true,
      shiftKey: true
    }),
    navigateBackward: createShortcut('Alt Left', 'navigate-backward', {
      key: 'arrowleft',
      altKey: true
    }),
    navigateForward: createShortcut('Alt Right', 'navigate-forward', {
      key: 'arrowright',
      altKey: true
    }),
    appMenu: createShortcut('Alt M', 'menu', {
      key: 'm',
      altKey: true
    })
  };
}

export function matchesDesktopShortcut(eventLike = {}, shortcut = null) {
  if (!shortcut || !shortcut.matcher) {
    return false;
  }

  const matcher = shortcut.matcher;
  const key = normalizeKey(eventLike.key);
  if (normalizeKey(matcher.key) !== key) {
    return false;
  }

  const modifierKeys = ['metaKey', 'ctrlKey', 'altKey', 'shiftKey'];
  return modifierKeys.every((modifier) => {
    if (typeof matcher[modifier] !== 'boolean') {
      return true;
    }
    return Boolean(eventLike[modifier]) === matcher[modifier];
  });
}

export function getShellCommandForKeyboardEvent(profile = {}, eventLike = {}) {
  const shortcuts = profile.shortcuts || {};
  return Object.values(shortcuts).find((shortcut) => matchesDesktopShortcut(eventLike, shortcut))?.command || null;
}

export function createDesktopPlatformProfile({
  runtimePlatform = '',
  preferredDistribution = '',
  targetPlatform = 'macos'
} = {}) {
  const runtimeId = normalizeDesktopPlatform(runtimePlatform);
  const targetId = normalizeDesktopPlatform(targetPlatform);
  const distribution = normalizeDesktopDistribution(preferredDistribution, targetId || runtimeId);
  const isMacLike = distribution === 'apple' || targetId === 'macos';
  const platformId = isMacLike ? 'macos' : runtimeId;
  const shortcuts = isMacLike ? createMacShortcuts() : createWindowsShortcuts();

  return {
    id: platformId,
    runtimeId,
    targetId,
    distribution,
    isMacLike,
    isWindowsLike: !isMacLike && platformId === 'windows',
    shortcuts,
    menuBehavior: {
      label: isMacLike ? 'App Menu' : 'Menu',
      nativeMenuSurface: isMacLike ? 'system-menu-bar' : 'window-menu',
      usesWindowContextMenu: !isMacLike
    },
    windowChrome: {
      showTrafficLights: isMacLike,
      hiddenTitle: isMacLike,
      titleBarStyle: isMacLike ? 'Overlay' : 'Visible',
      toolbarStyle: isMacLike ? 'unified' : 'standard',
      controlOrder: isMacLike ? ['close', 'minimize', 'zoom'] : ['minimize', 'maximize', 'close']
    },
    optionSpace: {
      label: isMacLike ? 'Option Space' : 'Quick Add',
      shortcutLabel: shortcuts.addTask.label,
      usesDedicatedWindow: isMacLike
    }
  };
}
