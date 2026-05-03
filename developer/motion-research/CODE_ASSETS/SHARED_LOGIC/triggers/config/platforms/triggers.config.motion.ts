import { TriggerActionConfig } from '../triggers.config.models'

/**
 * Configuration for the Motion platform events
 */

/**
 * When a task is created
 */
const motionTaskCreatedTriggerConfig: TriggerActionConfig = {
  id: 'motion-task-created',
  label: 'When a Task is Created',
  payloadAlias: 'Task',
  hint: 'Type in natural language any additional filters you want to add ex: "If the task is assigned to me"',
  fields: [
    { id: 'task_name', label: 'Task Name' },
    { id: 'task_description', label: 'Task Description' },
    { id: 'task_deadline', label: 'Task Deadline' },
    { id: 'task_assignee', label: 'Task Assignee' },
    { id: 'task_project', label: 'Project' },
  ],
  requiredFields: [],
}

/**
 * when a task is updated
 */
const motionTaskUpdatedTriggerConfig: TriggerActionConfig = {
  ...motionTaskCreatedTriggerConfig,
  id: 'motion-task-updated',
  label: 'When a Task is Updated',
}

/**
 * When a project is created
 */
const motionProjectCreatedTriggerConfig: TriggerActionConfig = {
  id: 'motion-project-created',
  label: 'When a Project is Created',
  payloadAlias: 'Project',
  hint: 'Type in natural language any additional filters you want to add ex: If the status is "In progress"',
  fields: [
    { id: 'project_name', label: 'Project Name' },
    { id: 'project_description', label: 'Project Description' },
    { id: 'project_deadline', label: 'Project Deadline' },
    { id: 'project_status', label: 'Project Status' },
    // Project ETA isn't fully supported yet
    // https://usemotion.slack.com/archives/C08QSAKKK62/p1755120736615809
    // { id: 'project_eta', label: 'Project ETA' },
  ],
  requiredFields: [],
}

/**
 * when a project is updated
 */
const motionProjectUpdatedTriggerConfig: TriggerActionConfig = {
  ...motionProjectCreatedTriggerConfig,
  id: 'motion-project-updated',
  label: 'When a Project is Updated',
}

/**
 * When a document is created
 */
const motionDocumentCreatedTriggerConfig: TriggerActionConfig = {
  id: 'motion-document-created',
  label: 'When a Document is Created',
  payloadAlias: 'Document',
  hint: 'Type in natural language any additional filters you want to add ex: if the title contains "Spec"',
  fields: [
    { id: 'document_title', label: 'Document Title' },
    { id: 'document_id', label: 'Document ID' },
    { id: 'document_creator', label: 'Document Creator' },
    { id: 'document_created_date', label: 'Created Date' },
    { id: 'document_parent_id', label: 'Parent Document ID' },
    { id: 'document_is_published', label: 'Is Published' },
    { id: 'document_url', label: 'Document URL' },
  ],
  requiredFields: [],
}

/**
 * when a document is updated
 */
const motionDocumentUpdatedTriggerConfig: TriggerActionConfig = {
  ...motionDocumentCreatedTriggerConfig,
  id: 'motion-document-updated',
  label: 'When a Document is Updated',
  fields: [
    { id: 'document_title', label: 'Document Title' },
    { id: 'document_id', label: 'Document ID' },
    { id: 'document_creator', label: 'Document Creator' },
    { id: 'document_updated_date', label: 'Updated Date' },
    { id: 'document_parent_id', label: 'Parent Document ID' },
    { id: 'document_is_published', label: 'Is Published' },
    { id: 'document_url', label: 'Document URL' },
  ],
}

/**
 * All Motion platform trigger configurations
 */
export const motionPlatformTriggersConfig = [
  motionTaskCreatedTriggerConfig,
  motionTaskUpdatedTriggerConfig,
  motionProjectCreatedTriggerConfig,
  motionProjectUpdatedTriggerConfig,
  motionDocumentCreatedTriggerConfig,
  motionDocumentUpdatedTriggerConfig,
]
