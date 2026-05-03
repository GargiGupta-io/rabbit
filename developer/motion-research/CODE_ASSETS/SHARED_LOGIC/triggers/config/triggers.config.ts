import { gmailTriggerConfig } from './platforms/triggers.config.gmail'
import { hubspotTriggersConfig } from './platforms/triggers.config.hubspot'
import { motionPlatformTriggersConfig } from './platforms/triggers.config.motion'
import { motionMeetingNotesTriggerConfig } from './platforms/triggers.config.motion-meeting-notes'
import { outlookTriggerConfig } from './platforms/triggers.config.outlook'
import { salesforceTriggersConfig } from './platforms/triggers.config.salesforce'
import { webhookIngestionTriggerConfig } from './platforms/triggers.config.webhook-ingestion'
import { TriggerActionConfig } from './triggers.config.models'

import { type EventTriggerPlatform } from '../../event-triggers'

/**
 * Shared configuration for known triggers.  This provides the setup for the
 * trigger UI and is used to help the trigger construction process by providing a
 * set of fixed values.
 */
export const triggersConfig: Partial<
  Record<EventTriggerPlatform, TriggerActionConfig[]>
> = {
  /**
   * The trigger configuration for the Gmail integration
   */
  'google-mail': [gmailTriggerConfig],

  /**
   * The trigger configuration for the Outlook integration
   */
  outlook: [outlookTriggerConfig],

  /**
   * The trigger configuration for the Salesforce integration
   */
  salesforce: salesforceTriggersConfig,

  /**
   * The trigger configuration for the HubSpot integration
   */
  hubspot: hubspotTriggersConfig,

  /**
   * The trigger configuration for the Motion Meeting Notes integration
   */
  'motion-meeting-notes': [motionMeetingNotesTriggerConfig],

  /**
   * The trigger configuration for Motion platform integration.
   */
  motion: motionPlatformTriggersConfig,

  /**
   * The trigger configuration for webhook ingestion.
   */
  'webhook-ingestion': [webhookIngestionTriggerConfig],
}
