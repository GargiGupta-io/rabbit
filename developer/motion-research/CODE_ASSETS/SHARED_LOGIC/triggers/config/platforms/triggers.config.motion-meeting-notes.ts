import { TriggerActionConfig } from '../triggers.config.models'

/**
 * Configuration for the Motion Meeting Notes events
 */
export const motionMeetingNotesTriggerConfig: TriggerActionConfig = {
  id: 'motion-meeting-note-created',
  label: 'When a Meeting Note is Created',
  payloadAlias: 'Meeting Note',
  hint: 'Type in natural language any filters you want to add for the events. Ex: if the meeting title contains the word sales',
  fields: [
    { id: 'meeting_transcript', label: 'Meeting Transcript' },
    {
      id: 'meeting_data_without_transcript',
      label: 'Meeting Data (Without Transcript)',
    },
    {
      id: 'meeting_note_url',
      label: 'Meeting Note URL',
    },
  ],
  requiredFields: [],
}

export const motionMeetingNotesTriggerActions: TriggerActionConfig[] = [
  motionMeetingNotesTriggerConfig,
]
