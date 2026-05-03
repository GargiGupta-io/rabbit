// Type helper to create dot-notation keys from nested object
type FlattenKeys<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${string & keyof T[K]}`
    : never
  : never

// Type helper to get the flattened object type
type FlattenObject<T> = {
  [K in FlattenKeys<T>]: K extends `${infer P}.${infer S}`
    ? P extends keyof T
      ? S extends keyof T[P]
        ? T[P][S]
        : never
      : never
    : never
}

// The flatten function
export function flattenEvents<T extends Record<string, Record<string, any>>>(
  events: T
): FlattenObject<T> {
  const result = {} as FlattenObject<T>

  for (const [category, categoryEvents] of Object.entries(events)) {
    for (const [eventType, eventClass] of Object.entries(categoryEvents)) {
      const key = `${category}.${eventType}` as keyof FlattenObject<T>
      result[key] = eventClass
    }
  }

  return result
}
