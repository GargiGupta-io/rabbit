import { cloneDeep } from '@motion/utils/core'
import {
  addBusinessDays,
  Bias,
  DateLike,
  diffBusinessDays,
  getStartOfDayUtc,
  parseDate,
} from '@motion/utils/dates'

import { DateTime } from 'luxon'

import {
  InternalError,
  InvalidInputError,
  NotFoundError,
  StageAdjusterError,
} from './exceptions'
import {
  AdjustProjectStrategy,
  AdjustStageStrategy,
  loadStrategy,
  ResolveStageStrategy,
} from './strategies/strategies'
import {
  Feature,
  StrategyResult,
  StrategyStage,
} from './strategies/strategy.types'

import { RelativeIntervalDuration } from '../definitions'

type LogFunction = (context: object, message: string) => void

export type Params = {
  startDate: DateLike | null
  dueDate: DateLike | null
  stages: {
    stageDefinitionId: string
    dueDate: DateLike
    canceled?: boolean
    completed?: boolean
  }[]
  activeStageDefinitionId?: string | null
}

export type FromDefinitionParams = {
  startDate: DateLike
  stages: { stageDefinitionId: string; duration: RelativeIntervalDuration }[]
}

export type Options = {
  timezone?: string
  dayMode?: DayMode
  lockConfig?: LockConfig
  debug?: LogFunction
  info?: LogFunction
  warn?: LogFunction
}

type LockConfig = {
  mode: LockMode
  canceled: boolean
  completed: boolean
}

type LockParams = {
  from: number // inclusive
  to: number // exclusive
  canceled: boolean
  completed: boolean
} | null

export enum LockMode {
  FIXED = 'FIXED', // Stages that are treated as locked will not be able to expand or shrink.
  SHRINK_ONLY = 'SHRINK_ONLY', // Stages that are treated as locked are only allowed to shrink.
  FREE = 'FREE', // This essentially just disables locking.
}

export enum DayMode {
  BUSINESS = 'BUSINESS',
  CALENDAR = 'CALENDAR',
}

/**
 * An adjusted stage as part of the `AdjustmentResults`
 */
export type AdjustedStage =
  | {
      stageDefinitionId: string

      startDate: Date
      startDateModified: boolean
      startShift: number

      dueDate: Date
      dueDateModified: boolean
      dueShift: number

      duration: number

      modified: boolean

      active: boolean
      canceled: boolean
      completed: boolean

      status: 'create'
    }
  | {
      stageDefinitionId: string

      startDate: Date
      startDateModified: boolean
      startShift: number

      dueDate: Date
      dueDateModified: boolean
      dueShift: number

      duration: number

      modified: boolean

      active: boolean
      canceled: boolean
      completed: boolean

      status: 'update'
    }
  | {
      stageDefinitionId: string
      status: 'delete'
    }

export type AdjustmentResults = {
  startDate: Date
  startDateModified: boolean
  startShift: number

  dueDate: Date
  dueDateModified: boolean
  dueShift: number

  stages: AdjustedStage[]
}

type StateStage = {
  stageDefinitionId: string
  duration: number
  active: boolean
  canceled?: boolean
  completed?: boolean
}

// For internal state, we convert to a representation on a number line.
// Where the start date is considered zero. We keep track of the actual start
// and due dates to make calculating requested adjustments easier.
// This removes the need for internal strategies to work with dates.
// Note that start and due are both inclusive on stages, which means that
// stage duration = stage due - stage start + 1
type State = {
  start: DateTime
  today: number
  stageOrder: string[]
  stages: Map<string, StateStage>
}

export class StageAdjuster {
  private readonly logger: {
    debug?: LogFunction
    info?: LogFunction
    warn?: LogFunction
  }
  private readonly dayMode: DayMode
  private readonly lockConfig: LockConfig

  protected readonly state: State

  private readonly todaysDate: DateTime

  public static fromDefinition(
    params: FromDefinitionParams,
    options?: Options
  ) {
    const inputStages: Params['stages'] = []

    let cursor = this.parseAndValidateDateOnly(params.startDate)
    for (const stage of params.stages) {
      if (stage.duration.value <= 0) {
        throw new InvalidInputError('Stage duration must be greater than 0', {
          duration: stage.duration.value,
        })
      }
      switch (stage.duration.unit) {
        case 'DAYS':
          cursor = cursor.plus({ days: stage.duration.value })
          break
        case 'BUSINESS_DAYS':
          cursor = addBusinessDays(cursor, stage.duration.value, Bias.AFTER)
          break
        case 'WEEKS':
          cursor = cursor.plus({ weeks: stage.duration.value })
          break
        case 'MONTHS':
          cursor = cursor.plus({ months: stage.duration.value })
          break
        default:
          throw new InvalidInputError('Unknown duration unit', {
            unit: stage.duration.unit,
          })
      }
      inputStages.push({
        stageDefinitionId: stage.stageDefinitionId,
        dueDate: cursor,
      })
    }

    return new StageAdjuster(
      {
        startDate: params.startDate,
        stages: inputStages,
        dueDate: null,
        // Leave due date null, the constructor will
        // default it to last stage due date.
      },
      options
    )
  }

  constructor(
    private readonly params: Params,
    options?: Options
  ) {
    this.logger = {
      debug: options?.debug,
      info: options?.info,
      warn: options?.warn,
    }

    if (!this.params.startDate || !this.params.dueDate) {
      this.warn(
        'Flow project start or due date is null. Falling back to stage dates.'
      )
    }

    this.dayMode = options?.dayMode ?? DayMode.BUSINESS

    this.lockConfig = options?.lockConfig ?? {
      mode: LockMode.SHRINK_ONLY,
      canceled: true,
      completed: true,
    }

    this.todaysDate = DateTime.fromISO(
      DateTime.fromJSDate(getStartOfDayUtc(options?.timezone)).toISODate()
    )

    this.info('Initializing stage adjuster', {
      timezone: options?.timezone,
      dayMode: this.dayMode,
      todaysDate: this.todaysDate,
    })

    if (this.params.stages.length === 0 && !this.params.startDate) {
      throw new InvalidInputError('Start date is required.')
    }

    const start = DateTime.min(
      ...[
        StageAdjuster.parseAndValidateDateOnly(this.params.stages[0]?.dueDate),
        StageAdjuster.parseAndValidateDateOnly(
          this.params.startDate ?? this.params.stages[0]?.dueDate
        ),
      ].filter(Boolean)
    )

    if (start == null) {
      throw new InvalidInputError('Start date is required', {
        start,
        startDateParam: this.params.startDate,
        stageLength: this.params.stages.length,
        firstStageDueDate: this.params.stages[0]?.dueDate,
      })
    }

    // If our project somehow has no active stage definition id, treat
    // all stages as active.
    let active = !this.params.activeStageDefinitionId
    let cursor = start

    const stages: State['stages'] = new Map()
    for (const stage of this.params.stages) {
      const dueDate = StageAdjuster.parseAndValidateDateOnly(stage.dueDate)
      active =
        active ||
        stage.stageDefinitionId === this.params.activeStageDefinitionId

      stages.set(stage.stageDefinitionId, {
        stageDefinitionId: stage.stageDefinitionId,
        active,
        duration: this.diffAndValidateDays(cursor, dueDate, Bias.AFTER) + 1,
        canceled: stage.canceled,
        completed: stage.completed,
      })

      cursor = dueDate
    }

    const due = cursor

    if (this.params.dueDate && due !== this.params.dueDate) {
      this.warn(
        'Project due date does not match last stage due date. Falling back to last stage date.'
      )
    }

    this.validateStageDates(start, due, params.stages)

    // If no stages were active, log a warning and treat them all as active.
    if (!active) {
      this.warn('No matching active stage found. Defaulting to all active.')
      stages.forEach((stage) => (stage.active = true))
    }

    this.state = {
      start,
      today: this.diffAndValidateDays(start, this.todaysDate),
      stageOrder: this.params.stages.map((s) => s.stageDefinitionId),
      stages,
    }
  }

  private debug(message: string, context?: object) {
    this.logger.debug?.({ params: this.params, context }, message)
  }

  private info(message: string, context?: object) {
    this.logger.info?.({ params: this.params, context }, message)
  }

  private warn(message: string, context?: object) {
    this.logger.warn?.({ params: this.params, context }, message)
  }

  // INTERNAL DATE UTILITIES //////////////////////////////////////////////////////////////////////

  private getStageIndex(stageDefinitionId: string) {
    const index = this.state.stageOrder.findIndex(
      (s) => s === stageDefinitionId
    )
    if (index < 0) {
      throw new NotFoundError('Unknown stageDefinitionId', {
        stageDefinitionId,
      })
    }
    return index
  }

  // Attach start and due dates to stages
  private computeStageStartDue(stages: StateStage[]): StrategyStage[] {
    let cursor = 0
    return stages.map((stage) => {
      const due = cursor + stage.duration - 1
      const result = {
        ...stage,
        start: cursor,
        due,
      }
      cursor = due
      return result
    })
  }

  private computeEffectiveDueDate(): DateTime {
    const usedStageIds = new Set(this.state.stageOrder)
    const usedStages = Array.from(this.state.stages.values()).filter((s) =>
      usedStageIds.has(s.stageDefinitionId)
    )
    return this.addDays(
      this.state.start,
      usedStages.reduce((acc, s) => acc + s.duration, 0) - usedStages.length,
      Bias.AFTER
    )
  }
  private getStateStagesInOrder(): StateStage[] {
    return this.state.stageOrder.map((id) => {
      const stage = this.state.stages.get(id)
      if (!stage) {
        throw new NotFoundError('Unknown stage definition id', { id })
      }
      return stage
    })
  }

  private validateStageDates(
    startDate: DateLike | null,
    dueDate: DateLike | null,
    stageDueDates: { dueDate: DateLike }[]
  ) {
    const start = StageAdjuster.parseAndValidateDateOnly(startDate)
    const due = StageAdjuster.parseAndValidateDateOnly(dueDate)

    if (start && due && start > due) {
      throw new InvalidInputError('Start date cannot be after due date.')
    }

    let cursor = start
    for (const { dueDate } of stageDueDates) {
      const stageDue = StageAdjuster.parseAndValidateDateOnly(dueDate)
      if (cursor && stageDue < cursor) {
        throw new InvalidInputError('Stage is out of order.')
      }
      cursor = stageDue
    }

    if (!cursor) {
      throw new NotFoundError('Could not find last stage due date.')
    }

    if (due && !due.equals(cursor)) {
      throw new InvalidInputError('Last stage does not match due date.')
    }
  }

  private static parseAndValidateDateOnly(d: DateLike): DateTime
  private static parseAndValidateDateOnly(d?: DateLike | null): DateTime | null
  private static parseAndValidateDateOnly(
    d?: DateLike | null
  ): DateTime | null {
    if (d) {
      const date = parseDate(d)
      if (date.hour || date.minute || date.second || date.millisecond) {
        throw new InvalidInputError(
          'Attempted to parse date that was not date-only.',
          {
            date: d,
          }
        )
      }
      return date
    }
    return null
  }

  // This finds the difference in days (calendar or business days depending on supplied options)
  // and validates that the difference is an integer.
  private diffAndValidateDays(
    a: DateTime | null | undefined,
    b: DateTime | null | undefined,
    bias?: Bias
  ): number {
    if (a == null || b == null) return Infinity
    const days =
      this.dayMode === DayMode.BUSINESS
        ? diffBusinessDays(a, b, bias)
        : b.diff(a, 'days').toObject().days
    if (!Number.isInteger(days) || days == null) {
      throw new InvalidInputError('Non integer number of days', {
        from: a,
        to: b,
        days,
      })
    }
    return days
  }

  private addDays(date: DateTime, days: number, bias?: Bias): DateTime
  private addDays(
    date: DateTime | null,
    days: number,
    bias?: Bias
  ): DateTime | null
  private addDays(
    date: DateTime | null,
    days: number,
    bias?: Bias
  ): DateTime | null {
    if (!Number.isInteger(days)) {
      throw new InvalidInputError(
        'Attempted to add non-integer number of days.',
        {
          date,
          days,
          bias,
        }
      )
    }

    if (!date) return date

    return this.dayMode === DayMode.BUSINESS
      ? addBusinessDays(date, days, bias)
      : date.plus({ days })
  }

  /**
   * This internal utility helps us lock and unlock stages before passing them to the strategy.
   * Locked stages are basically hidden from the strategy entirely, and then added back in after
   * the strategy is applied.
   *
   * Because locking and unlock requires a lot of context, i.e. knowing which stages are hidden
   * and where they were originally positioned, we pass back two lambdas to help with applying and
   * unlocking the strategy.
   *
   * getLockedIndex() is a helper to get the target index (without hidden stages) given a stage definitionID
   *
   * unlock() is used to re-insert the hidden stages back into the list of stages, effectively converting
   * locked stages back to its original set.
   *
   * @param params LockParams - settings to control which stages are locked
   */
  private lock(params: LockParams) {
    const input: StateStage[] = []
    const locked = new Map<string | null, StateStage[]>()
    const indexLookup = new Map<string | null, number>()

    let parent: string | null = null

    for (const [index, stageDefinitionId] of this.state.stageOrder.entries()) {
      const stage = this.state.stages.get(stageDefinitionId)
      if (!stage) {
        throw new NotFoundError('Unknown stage definition id', {
          stageDefinitionId,
        })
      }
      const candidate =
        (params?.canceled && stage.canceled) ||
        (params?.completed && stage.completed)

      if (params && params.from <= index && index < params.to && candidate) {
        indexLookup.set(stageDefinitionId, indexLookup.get(parent) ?? -1)

        // If the stage is locked, then add it to our locked map instead of adding it to input.
        const existing = locked.get(parent) ?? []
        existing.push(stage)
        locked.set(parent, existing)
      } else {
        indexLookup.set(stageDefinitionId, input.length)

        input.push(stage)
        parent = stageDefinitionId
      }
    }

    if (input.length === 0) {
      this.debug('All stages are locked. Unlocking...')
      input.push(...this.getStateStagesInOrder())
      locked.clear()
    }

    this.debug('Split input and locked stages', {
      input,
      locked: [...locked.entries()],
      indexLookup: [...indexLookup.entries()],
    })

    return {
      input: cloneDeep(input),
      getLockedIndex: (id: string) => {
        const index = indexLookup.get(id)
        if (index == null) {
          throw new NotFoundError('Unknown stage definition id', { id })
        }
        if (index < 0) {
          throw new InvalidInputError(
            'Modifying leading locked stages is not supported.',
            { id }
          )
        }
        return index
      },
      unlock: (result: StrategyResult) => {
        const stages: StateStage[] = []

        // Util for loading locked stages back into the final 'stages' result.
        const loadLocked = (parent: string | null) => {
          locked.get(parent)?.forEach((stage) => {
            stages.push(stage)
          })
        }

        // First, load any leading locked stages.
        loadLocked(null)
        // Add result stages back with the new duration
        for (const [index, stage] of input.entries()) {
          const duration = result.stages[index]
          stages.push({
            ...stage,
            duration,
          })
          // After each stage, add back the locked stages immediately following it.
          loadLocked(stage.stageDefinitionId)
        }

        this.debug('Merged locked and adjusted stages', { stages })

        if (stages.length !== this.state.stageOrder.length) {
          throw new InternalError(
            'Invalid strategy results after inserting locked stages - stage length mismatched.',
            {
              stages,
            }
          )
        }

        return stages
      },
    }
  }

  private applyStrategy(
    strategy: (
      stages: StrategyStage[],
      getIndex: (id: string) => number
    ) => StrategyResult,
    params: LockParams
  ) {
    const { input, getLockedIndex, unlock } = this.lock(params)

    // Apply and validate the strategy
    let result: StrategyResult
    try {
      result = strategy(this.computeStageStartDue(input), getLockedIndex)
    } catch (error) {
      if (error instanceof StageAdjusterError) {
        throw error
      }

      throw new InternalError('Error applying strategy', { error })
    }

    // TODO this will be supported when we support adding stages.
    if (result.stages.length !== input.length) {
      throw new InternalError(
        'Invalid strategy results - stage length mismatched.',
        {
          result,
        }
      )
    }

    if (result.stages.find((duration) => duration <= 0) != null) {
      throw new InternalError(
        'Invalid strategy results - negative or zero duration.',
        { result }
      )
    }

    const stages = unlock(result)

    const shift = result.start
    this.state.start = this.addDays(this.state.start, shift, Bias.AFTER)
    this.state.stages = new Map(stages.map((s) => [s.stageDefinitionId, s]))
    this.state.today = this.diffAndValidateDays(
      this.state.start,
      this.todaysDate
    )

    this.debug('Applied strategy results', { result, state: this.state })
  }

  // PUBLIC INTERFACE //////////////////////////////////////////////////////////////////////

  /**
   * Prepares project start or due date adjustments
   * @param param The parameters to use
   * @param param.strategy The strategy to use when modifying stage due dates.
   * @param param.target Can be 'start' or 'due' - whether we're setting the start or due date.
   * @param param.value The new date we're setting.
   * @returns This stage adjuster instance.
   */
  public prepareProjectAdjustment({
    strategy,
    target,
    value,
  }: {
    strategy: AdjustProjectStrategy
    target: 'start' | 'due'
    value: DateLike
  }): StageAdjuster {
    this.info('Preparing project adjustment', { strategy, target, value })
    const strategyImplementation = {
      grow: loadStrategy(
        typeof strategy === 'object' ? strategy.grow : strategy,
        Feature.ADJUST_PROJECT
      ),
      shrink: loadStrategy(
        typeof strategy === 'object' ? strategy.shrink : strategy,
        Feature.ADJUST_PROJECT
      ),
    }

    const val = StageAdjuster.parseAndValidateDateOnly(value)
    const adjustment =
      target === 'start'
        ? this.diffAndValidateDays(this.state.start, val, Bias.AFTER)
        : this.diffAndValidateDays(
            this.computeEffectiveDueDate(),
            val,
            Bias.AFTER
          )

    if (adjustment === 0) {
      return this
    }

    const mode =
      (adjustment > 0 && target === 'due') ||
      (adjustment < 0 && target === 'start')
        ? 'grow'
        : 'shrink'

    let lockParams: LockParams = null
    switch (this.lockConfig.mode) {
      case LockMode.FREE:
        break
      case LockMode.SHRINK_ONLY:
        if (mode === 'grow') {
          lockParams = {
            from: 0,
            to: this.state.stageOrder.length,
            canceled: this.lockConfig.canceled,
            completed: this.lockConfig.completed,
          }
        }
        break
      case LockMode.FIXED:
        lockParams = {
          from: 0,
          to: this.state.stageOrder.length,
          canceled: this.lockConfig.canceled,
          completed: this.lockConfig.completed,
        }
        break
    }

    this.applyStrategy(
      (stages) =>
        strategyImplementation[mode].adjustProject(
          stages,
          target,
          adjustment,
          this.state.today
        ),
      lockParams
    )

    return this
  }

  /**
   * Prepare stage due date adjustments.
   * @param param The parameters to use.
   * @param param.strategy The strategy to use. Can be a strategy or
   * an object with {before, after} specifying different strategies.
   * @param param.stageDefinitionId The id of the stage we're updating.
   * @param param.value The new due date for the stage.
   * @returns This stage adjuster instance.
   */
  public prepareStageAdjustment({
    strategy,
    stageDefinitionId,
    value,
  }: {
    strategy: AdjustStageStrategy
    stageDefinitionId: string
    value: DateLike
  }): StageAdjuster {
    const index = this.getStageIndex(stageDefinitionId)

    this.info('Preparing stage adjustment', {
      strategy,
      index,
      stageDefinitionId,
      value,
    })

    const strategyImplementation = {
      before: loadStrategy(
        typeof strategy === 'object' ? strategy.before : strategy,
        Feature.ADJUST_STAGE
      ),
      after: loadStrategy(
        typeof strategy === 'object' ? strategy.after : strategy,
        Feature.ADJUST_STAGE
      ),
    }

    const targetStage = this.computeStageStartDue(this.getStateStagesInOrder())[
      index
    ]
    if (!targetStage) {
      throw new NotFoundError('Unknown stage definition id', {
        stageDefinitionId,
      })
    }

    const val = StageAdjuster.parseAndValidateDateOnly(value)
    const adjustment = this.diffAndValidateDays(
      this.addDays(this.state.start, targetStage.due),
      val
    )

    if (adjustment === 0) {
      return this
    }

    const mode = adjustment < 0 ? 'before' : 'after'

    let lockParams: LockParams = null
    switch (this.lockConfig.mode) {
      case LockMode.FREE:
        break
      case LockMode.SHRINK_ONLY:
        lockParams =
          mode === 'before'
            ? {
                from: index + 1,
                to: this.state.stageOrder.length,
                canceled: this.lockConfig.canceled,
                completed: this.lockConfig.completed,
              }
            : {
                from: 0,
                to: index,
                canceled: this.lockConfig.canceled,
                completed: this.lockConfig.completed,
              }
        break
      case LockMode.FIXED:
        lockParams = {
          from: 0,
          to: this.state.stageOrder.length,
          canceled: this.lockConfig.canceled,
          completed: this.lockConfig.completed,
        }
    }

    this.applyStrategy(
      (stages, getLockedIndex) =>
        strategyImplementation[mode].adjustStage(
          stages,
          // We have to use getLockedIndex because the
          // index of our target stage may have changed depending on
          // what the stage locking configuration is.
          getLockedIndex(stageDefinitionId),
          adjustment,
          this.state.today
        ),
      lockParams
    )

    return this
  }

  /**
   * Prepare changes from resolving a stage.
   * @param param The parameters to use
   * @param param.strategy The strategy to use. Currently only SHRINK or NOOP is supported.
   * @param param.stageDefinitionId The id of the stage to resolve.
   * @param param.status Can be one of 'cancel' | 'complete'
   * @returns This stage adjuster instance.
   */
  public prepareStageResolve({
    strategy,
    stageDefinitionId,
    status,
  }: {
    strategy: ResolveStageStrategy
    stageDefinitionId: string
    status: 'cancel' | 'complete'
  }): StageAdjuster {
    const index = this.getStageIndex(stageDefinitionId)

    this.info('Preparing project resolve', {
      strategy,
      index,
      stageDefinitionId,
      status,
    })

    const targetStage = this.state.stages.get(stageDefinitionId)
    if (!targetStage) {
      throw new NotFoundError('Unknown stage definition id', {
        stageDefinitionId,
      })
    }

    if (
      (targetStage.canceled && status === 'cancel') ||
      (targetStage.completed && status === 'complete')
    ) {
      this.info('Resolve was a no-op.')
      return this
    }

    const strategyImplementation = loadStrategy(strategy, Feature.RESOLVE_STAGE)

    this.applyStrategy(
      (stages, getLockedIndex) =>
        strategyImplementation.resolveStage(
          stages,
          getLockedIndex(stageDefinitionId),
          status,
          this.state.today
        ),
      this.lockConfig.mode === LockMode.FREE
        ? null
        : // When resolving stages, lets just assume it's the same as adjusting stage
          // due dates 'before'. If this ever changes, we need to revisit this.
          {
            from: 0,
            to: index,
            canceled: this.lockConfig.canceled,
            completed: this.lockConfig.completed,
          }
    )

    const updatedStage = this.state.stages.get(stageDefinitionId)
    if (!updatedStage) {
      throw new NotFoundError('Unknown stage definition id', {
        stageDefinitionId,
      })
    }

    updatedStage.canceled = status === 'cancel'
    updatedStage.completed = status === 'complete'

    return this
  }

  public prepareStageReorder({ order }: { order: string[] }): StageAdjuster {
    this.info('Preparing stage reorder', { order })

    // Check that reordering has not added or removed any stages.
    if (order.length !== this.state.stageOrder.length) {
      throw new InternalError('Invalid stage reorder - stage length mismatch', {
        order,
      })
    }

    // Check that reordering has the same set of stage definition ids.
    const originalStageIds = new Set(this.state.stageOrder)
    const newStageIds = new Set(order)
    if (
      !order.every((id) => originalStageIds.has(id)) ||
      !this.state.stageOrder.every((id) => newStageIds.has(id))
    ) {
      throw new InternalError('Invalid stage reorder - stage id mismatch', {
        originalStageIds,
        newStageIds,
      })
    }

    this.state.stageOrder = [...order]

    return this
  }

  /**
   * Prepare changes from adding a stage.
   * @param param The parameters to use
   * @param param.stageDefinitionId The id of the stage to add.
   * @param param.duration The duration of the stage in days. This is inclusive, and so should be 1 or more.
   * @param param.index The index to add the stage at.
   * @returns This stage adjuster instance.
   */
  public prepareStageAdd(params: {
    stageDefinitionId: string
    duration: number
    index: number
    canceled?: boolean
    completed?: boolean
  }): StageAdjuster
  public prepareStageAdd(params: {
    stageDefinitionId: string
    dueDate: DateLike
    index: number
    canceled?: boolean
    completed?: boolean
  }): StageAdjuster
  public prepareStageAdd({
    stageDefinitionId,
    index,
    canceled,
    completed,
    ...params
  }: {
    stageDefinitionId: string
    duration?: number
    dueDate?: DateLike
    index: number
    canceled?: boolean
    completed?: boolean
  }): StageAdjuster {
    this.info('Preparing stage add', { stageDefinitionId, params, index })

    let duration: number
    if ('dueDate' in params && params.dueDate != null) {
      // Calculate duration from dueDate
      // We first have to calculate the due date of the previous stage. (which is the start date of the stage we're adding).
      const durationBefore =
        this.computeStageStartDue(this.getStateStagesInOrder())[index - 1]
          ?.due ?? 0

      duration =
        this.diffAndValidateDays(
          this.state.start,
          StageAdjuster.parseAndValidateDateOnly(params.dueDate)
        ) +
        1 -
        durationBefore
    } else {
      duration = params.duration ?? 1
    }

    if (duration <= 0) {
      throw new InvalidInputError('Stage duration must be greater than 0', {
        duration,
      })
    }

    this.state.stageOrder.splice(index, 0, stageDefinitionId)

    this.state.stages.set(stageDefinitionId, {
      stageDefinitionId,
      duration,
      active: true,
      canceled,
      completed,
    })

    return this
  }

  public prepareStageRemove({
    stageDefinitionId,
  }: {
    stageDefinitionId: string
  }): StageAdjuster {
    this.info('Preparing stage remove', { stageDefinitionId })

    this.state.stageOrder = this.state.stageOrder.filter(
      (id) => id !== stageDefinitionId
    )

    return this
  }

  /**
   * Calculate results, including project start/due date, stage due dates,
   * (implicit) stage start dates, stage durations, and whether each stage due date has changed.
   * @returns This stage adjuster instance.
   */
  public calculateResult(): AdjustmentResults {
    const originalStartDate = StageAdjuster.parseAndValidateDateOnly(
      this.params.startDate ?? this.params.stages[0]?.dueDate
    )

    // The due date can be null if we're starting with a project with no stages
    // and no due date.
    const originalDueDate: DateTime | null =
      StageAdjuster.parseAndValidateDateOnly(
        this.params.stages[this.params.stages.length - 1]?.dueDate ??
          this.params.dueDate
      )

    const originalStageIndex = new Map(
      this.params.stages.map((s, index) => [s.stageDefinitionId, index])
    )

    const stagesInOrder = this.computeStageStartDue(
      this.getStateStagesInOrder()
    )

    const stages: AdjustedStage[] = stagesInOrder.map((stage, idx) => {
      const stageDefinitionId = this.state.stageOrder[idx]
      if (!stage) {
        throw new NotFoundError('Unknown stage definition id', {
          stageDefinitionId,
        })
      }

      const startDate =
        idx === 0
          ? this.state.start
          : this.addDays(this.state.start, stage.start, Bias.AFTER)
      const dueDate =
        idx === stagesInOrder.length - 1
          ? this.computeEffectiveDueDate()
          : this.addDays(this.state.start, stage.due, Bias.AFTER)

      const index = originalStageIndex.get(stageDefinitionId)

      if (index == null) {
        return {
          stageDefinitionId,
          startDate: startDate.toJSDate(),
          startDateModified: true,
          startShift: 0,
          dueDate: dueDate.toJSDate(),
          dueDateModified: true,
          dueShift: 0,
          duration: stage.duration,
          modified: true,
          active: stage.active ?? false,
          canceled: !!stage.canceled,
          completed: !!stage.completed,
          status: 'create' as const,
        }
      }

      const originalStartDate = parseDate(
        // Prior stage due date
        this.params.stages[index - 1]?.dueDate ??
          // Project start date
          this.params.startDate ??
          // Our own due date
          this.params.stages[index].dueDate
      )
      const startDateModified =
        !originalStartDate || !startDate.equals(originalStartDate)
      const originalDueDate = parseDate(this.params.stages[index].dueDate)
      const dueDateModified =
        !originalDueDate || !dueDate.equals(originalDueDate)

      return {
        stageDefinitionId,

        startDate: startDate.toJSDate(),
        startDateModified,
        startShift: startDate.diff(originalStartDate, 'days').days ?? 0,

        dueDate: dueDate.toJSDate(),
        dueDateModified,
        dueShift: dueDate.diff(originalDueDate, 'days').days ?? 0,

        duration: stage.duration,

        modified: startDateModified || dueDateModified,
        active: stage.active ?? false,
        canceled: !!stage.canceled,
        completed: !!stage.completed,

        status: 'update' as const,
      }
    })

    const usedStages = new Set(stages.map((s) => s.stageDefinitionId))
    for (const stageDefinitionId of this.params.stages.map(
      (s) => s.stageDefinitionId
    )) {
      if (!usedStages.has(stageDefinitionId)) {
        stages.push({
          stageDefinitionId,
          status: 'delete' as const,
        })
      }
    }

    const dueDate = this.computeEffectiveDueDate()

    return {
      startDate: this.state.start.toJSDate(),
      startDateModified:
        !this.params.startDate ||
        !this.state.start.equals(parseDate(this.params.startDate)),
      // Shift being zero does not necessarily mean that the start date was not modified.
      // This can happen when the start date given to us is null, and we fall back to the
      // first stage due date internally.
      startShift:
        this.state.start.diff(originalStartDate, 'days').toObject().days ?? 0,

      dueDate: dueDate.toJSDate(),
      dueDateModified:
        !this.params.dueDate || !dueDate.equals(parseDate(this.params.dueDate)),
      // Shift being zero does not necessarily mean that the due date was not modified.
      // This can happen when the due date given to us is null, and we fall back to the
      // last stage due date internally.
      dueShift: originalDueDate
        ? (dueDate.diff(originalDueDate, 'days').toObject().days ?? 0)
        : 0,

      stages,
    }
  }
}
