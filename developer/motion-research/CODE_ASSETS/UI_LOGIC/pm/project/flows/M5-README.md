## Flows M5

### Flows M5a

Variables can now live in three places:

1. Workspace variables
2. Stage variable options
3. Stage variables

#### Workspace variables

Workspace variables are under fields `roles` and `textVariables` (I want to change this to `workspaceRoles`, `workspaceTextVariables`). These are taken from `useWorkspaceFlowVariables` hook, spreading variables from stage definitions, deduplicated by name and type. These are shown in the sidebar.

Because of the deduplication, only one variable of a given name and type is shown in the sidebar. This means these variables cannot be relied upon for their keys or ids. They are used for display purposes only. For any logic that relies on these variables, we find the correct option in the `stageVariableOptions` field.

#### Stage variable options

Stage variable options are under field `stageVariableOptions` in the form. These are sourced from `useStageDefinitionsVariableOptions` hook. This explodes out the workspace variables onto the stages, so that each stage has a complete list ( by name and type) of workspace variables with unique keys.

By keeping a distinction between options and actual variables on the stage definition, we can show the full list of options to the user, but only add the variables to the stage definition when the user has selected an option (or remove when removed). This allows us to restrict the stage variables only to those used, which is needed to present correct options when creating a project from the flow template.

#### Stage variables

Stage variables are under a `StageDefinitionSchema`'s `variables` field. These are added to the stage definition when the user selects an option, and removed by stripping out unused variables on stage save.
