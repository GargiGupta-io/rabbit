import z from 'zod/v4'

export function ensureOutputType<T>() {
  return <U extends z.ZodType<T>>(arg: U) => arg
}

export type ToPrimitive<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T
type NullParts<T> = Extract<T, null | undefined>

// mapped types which will preserve keys with more wide value types
export type Widen<O> = {
  [K in keyof O]: NonNullable<O[K]> extends Date
    ? Date | NullParts<O[K]>
    : NonNullable<O[K]> extends object
      ? Widen<O[K]> | NullParts<O[K]>
      : NonNullable<O[K]> extends (infer A)[]
        ? Widen<A>[] | NullParts<O[K]>
        : ToPrimitive<NonNullable<O[K]>> | NullParts<O[K]>
}

export function zodParse<T extends z.ZodType>(
  schema: T,
  data: Widen<z.input<T>>
): z.output<T> {
  return schema.parse(data, { reportInput: true })
}
