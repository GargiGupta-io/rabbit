export class StageAdjusterError extends Error {
  private readonly _context: { [key: string]: any }

  constructor(
    message: string,
    context: { [key: string]: any } = {},
    options?: {
      cause?: Error
    }
  ) {
    super(message)
    this._context = context

    // Ensure the prototype chain is correct, without this we don't get types =>
    //     - const error = new StageAdjusterError("An error occurred", {});
    //     - console.log(error instanceof StageAdjusterError); // false
    Object.setPrototypeOf(this, new.target.prototype)

    // Attach the cause if provided (Node.js 16+ supports native `Error.cause`)
    if (options?.cause) {
      ;(this as any).cause = options.cause
    }

    // Ensure correct name for the error
    this.name = this.constructor.name
  }

  get context() {
    return this._context
  }
}

export class InternalError extends StageAdjusterError {
  constructor(
    message: string = 'Internal error',
    context?: { [key: string]: any },
    options?: { cause?: Error }
  ) {
    if (options?.cause) {
      super(message, context ?? {}, { cause: options.cause })
    } else {
      super(message, context ?? {})
    }
    this.name = 'InternalError'
  }
}

export class InvalidInputError extends StageAdjusterError {
  constructor(message: string, context: { [key: string]: any } = {}) {
    super(message, context)
  }
}

export class NotFoundError extends StageAdjusterError {
  constructor(message: string, context: { [key: string]: any } = {}) {
    super(message, context)
  }
}
