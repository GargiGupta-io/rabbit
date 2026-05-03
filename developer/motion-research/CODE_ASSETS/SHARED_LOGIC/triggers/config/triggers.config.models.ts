/**
 * Defines the configuration for a trigger action like "when an email is received"
 */
export type TriggerActionConfig = {
  /**
   * A unique identifier for the trigger action. This is used to identify the
   * predicate for this config.
   */
  id: string

  /**
   * The display label for the trigger action (also the base prompt)
   */
  label: string

  /**
   * An alias for the payload instead of `@Trigger`.  For example: "Inbound email"
   */
  payloadAlias: string

  /**
   * The hint to provide to the user as a placeholder text in the UI
   */
  hint: string

  /**
   * An array of variables that are available for use in the trigger action.  These
   * should match the payloads for the integration type.
   */
  fields: TriggerField[]

  /**
   * Variables that are system-defined and must always be included.
   */
  requiredFields: TriggerField[]
}

/**
 * Models a field on the trigger.
 */
export type TriggerField = {
  /**
   * The internal ID of the field
   */
  id: string
  /**
   * The display label for the field
   */
  label: string
}
