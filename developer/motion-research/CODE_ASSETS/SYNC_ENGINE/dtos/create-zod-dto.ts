import z from 'zod/v4'

export interface ZodDto<
  TSchema extends z.ZodType<any, any> = z.ZodType<any, any>,
> {
  new (): z.output<TSchema>
  isZodDto: true
  schema: TSchema
  create(input: unknown): z.output<TSchema>
}

export function createZodDto<TSchema extends z.ZodType>(schema: TSchema) {
  class AugmentedZodDto {
    static create(input: unknown) {
      return this.schema.parse(input)
    }
    static _OPENAPI_METADATA_FACTORY = () => {
      const meta = z.toJSONSchema(schema, {
        cycles: 'ref',
        unrepresentable: 'any',
      })

      delete meta.$schema
      if (meta.type === 'object' && meta.properties) {
        Object.keys(meta.properties).forEach((key) => {
          // @ts-expect-error - will be ther
          meta.properties[key].required = meta.required?.includes(key) ?? false
        })

        return meta.properties
      }

      return meta
    }

    static isZodDto = true
    static schema = schema
  }

  return AugmentedZodDto as unknown as ZodDto<TSchema>
}
