function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
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

function normalizePath(path) {
  if (typeof path !== 'string') {
    return path;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function resolveValue(value, args) {
  return typeof value === 'function' ? value(args) : value;
}

export const KEEP_PREVIOUS_DATA = 'keep-previous-data';

export function createQueryKey(...segments) {
  const key = [];

  segments.forEach((segment) => {
    const resolved = cloneValue(segment);
    if (Array.isArray(resolved)) {
      key.push(...resolved);
      return;
    }
    key.push(resolved);
  });

  return key;
}

export function sortStringList(values = []) {
  return values
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim())
    .sort((left, right) => left.localeCompare(right));
}

export function defineQuery(config = {}) {
  return Object.freeze({
    kind: 'query',
    method: 'GET',
    queryOptions: {},
    ...config
  });
}

export function defineMutation(config = {}) {
  return Object.freeze({
    kind: 'mutation',
    method: 'POST',
    ...config
  });
}

export function resolveClientRequest(definition, args = {}) {
  const uri = resolveValue(definition.uri, args);
  const bodyResolver = definition.body;
  const keyResolver = definition.key;
  const invalidateResolver = definition.invalidate;

  return {
    kind: definition.kind,
    method: definition.method,
    uri: isPlainObject(uri)
      ? {
          ...cloneValue(uri),
          pathname: normalizePath(uri.pathname || '')
        }
      : normalizePath(uri || ''),
    body: bodyResolver ? cloneValue(bodyResolver(args)) : undefined,
    key: keyResolver ? cloneValue(keyResolver(args)) : undefined,
    invalidate: invalidateResolver
      ? cloneValue(resolveValue(invalidateResolver, args))
      : undefined,
    queryOptions: definition.queryOptions
      ? cloneValue(definition.queryOptions)
      : undefined
  };
}

export function applyClientTransform(definition, data, args = {}) {
  const cloned = cloneValue(data);
  if (typeof definition.transform !== 'function') {
    return cloned;
  }
  return definition.transform(cloned, args);
}
