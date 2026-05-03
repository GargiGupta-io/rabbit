import { createLookupByKey } from '@motion/utils/object'

import { EventTrigger, EventTriggerScopeTypeSchema } from './event-triggers'

import { TriggerActionConfig } from '../triggers'
import { gmailTriggerActions } from '../triggers/config/platforms/triggers.config.gmail'
import { hubspotTriggersConfig } from '../triggers/config/platforms/triggers.config.hubspot'
import { motionPlatformTriggersConfig } from '../triggers/config/platforms/triggers.config.motion'
import { motionMeetingNotesTriggerActions } from '../triggers/config/platforms/triggers.config.motion-meeting-notes'
import { outlookTriggerActions } from '../triggers/config/platforms/triggers.config.outlook'
import { salesforceTriggersConfig } from '../triggers/config/platforms/triggers.config.salesforce'

export type TriggerConfigListing = {
  /**
   * Note: The 'manual' platform does not exist in the BE, it is used to represent the manual trigger in FE.
   */
  platform: EventTrigger['platform'] | 'manual'
  name: string
  description: string
  iconUrl?: string
  /**
   * Additional instructions for the "Create Skill with AI" tool to guide the
   * LLM when generating a trigger.
   */
  llmInstructions?: string

  triggerActions: TriggerActionConfig[]
}

/**
 * A list of pre-configured integrations that are available to the user.
 *
 * NOTE: Move these out if we ever want to manage these directly on BE, but that
 * is not likely the case since these are purely for display in the FE.
 */
export const preConfiguredTriggers: TriggerConfigListing[] = [
  {
    platform: 'schedule',
    name: 'Run on a schedule',
    description: `Set up a recurring date or time, and kick off a workflow automatically.`,
    triggerActions: [],
  },
  {
    platform: 'motion',
    name: 'Motion',
    description: `
Create triggers based on objects in Motion.
- Project changes (creation, edits, activity, etc.)
- Task changes (creation, edits, activity, etc.)`,
    triggerActions: motionPlatformTriggersConfig,
  },
  {
    platform: 'motion-meeting-notes',
    name: 'AI Meeting notes',
    description: `
Create triggers when AI meeting notes are created. The trigger will include:
- The full meeting transcript
- Information about the calendar event for the meeting`,
    triggerActions: motionMeetingNotesTriggerActions,
    llmInstructions: `When the user asks for participants, attendees, or meeting metadata without the transcript, use the "Meeting Data (Without Transcript)" field instead of "Meeting Transcript". This field contains pre-formatted meeting information including participants list, which avoids CEL's limitations with complex operations like array iteration. Examples:
- "@Participants" → Use "Meeting Data (Without Transcript)"
- "List of attendees" → Use "Meeting Data (Without Transcript)"
- "Meeting details without transcript" → Use "Meeting Data (Without Transcript)"
- "Who attended the meeting" → Use "Meeting Data (Without Transcript)"
Only use "Meeting Transcript" when the user specifically needs the transcript content.`,
  },
  {
    platform: 'google-mail',
    name: 'Gmail',
    triggerActions: gmailTriggerActions,
    description: `Your agent can start working whenever you receive a new email.`,
    llmInstructions: `The user prompt generated should describe (based on the selected trigger action) specific filters that should be applied to the trigger. For example, the user may want to trigger on emails from a specific sender, or emails with a specific subject.`,
  },
  {
    platform: 'outlook',
    name: 'Outlook',
    triggerActions: outlookTriggerActions,
    description: `Your agent can start working whenever you receive a new email.`,
    llmInstructions: `The user prompt generated should describe (based on the selected trigger action) specific filters that should be applied to the trigger. For example, the user may want to trigger on emails from a specific sender, or emails with a specific subject.`,
  },
  {
    platform: 'hubspot',
    name: 'HubSpot',
    triggerActions: hubspotTriggersConfig,
    description: `Create triggers based on newly created objects or updates to existing objects in your HubSpot CRM.
- Contacts
- Companies
- Deals

Note: The previous field contains values before the update for UPDATED events.`,
    llmInstructions: `The user prompt generated should describe (based on the selected trigger action) specific filters that should be applied to the trigger. For example, the user may want to trigger on deals above a certain amount, contacts from specific companies, or lifecycle stage changes.`,
  },
  // TODO: Add back microsoft teams after it has been implemented (post-launch).
  // {
  //   platform: 'microsoft-teams',
  //   name: 'Microsoft Teams',
  //   description: ``,
  // },
  {
    platform: 'salesforce',
    name: 'Salesforce',
    description: `Create triggers based on newly created objects or updates to existing objects in your Salesforce database.
- Leads
- Opportunities
- Accounts
- Contacts

Note: Previous field values in update events require field history tracking to be enabled in your Salesforce org.
`,
    triggerActions: salesforceTriggersConfig,
  },
  // TODO: Disable for now until we fix the rate limiting issue on slack
  //   {
  //     platform: 'slack',
  //     name: 'Slack',
  //     description: `Create triggers based on Slack messages and events.
  // - New messages in channels
  // - Message reactions and threads
  // - Channel updates and events
  // - Workspace membership changes
  // - Direct message notifications`,
  //   },
]

export const triggerPlatformLookup = createLookupByKey(
  preConfiguredTriggers,
  'platform'
)

export function getEventTriggerScopeTypeFromPlatform(
  platform: EventTrigger['platform']
): Exclude<EventTriggerScopeTypeSchema, 'SHEET'> {
  if (platform === 'motion') return 'WORKSPACE'
  if (platform === 'schedule') return 'WORKSPACE'
  // TODO: Replace with CALENDAR once it's supported
  // https://usemotion.slack.com/archives/C08QSAKKK62/p1748622371512449?thread_ts=1748622059.380589&cid=C08QSAKKK62
  if (platform === 'motion-meeting-notes') return 'USER'
  if (platform === 'webhook-ingestion') return 'AGENT_WORKFLOW'

  return 'INTEGRATION'
}
