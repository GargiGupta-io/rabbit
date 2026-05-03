import { type FlowTemplateStage } from './form-fields'
import { isEmptyDropzoneId, parseDropzoneId } from './parse-dropzone'

export const findStageForTask = (stages: FlowTemplateStage[], id: string) => {
  if (isEmptyDropzoneId(id)) {
    return stages[parseDropzoneId(id)]
  }

  const stageIndex = stages.findIndex((stage) =>
    stage.tasks.find((task) => task.id === id)
  )

  // If container is found, return it
  if (stageIndex > -1) {
    return stages[stageIndex]
  }

  return undefined
}
