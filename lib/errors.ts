export abstract class CustomHttpError extends Error {
  abstract readonly status_code: number

  constructor(message: string) {
    super(message)
  }
}

export class UnauthorisedError extends CustomHttpError  {
    readonly status_code = 401;
    constructor(message = "You are unauthorised to perform this action.") {
        super(message)
        this.name = 'UnauthorisedError'
    }
}

export class NotFoundError extends CustomHttpError  {
    readonly status_code = 404
    constructor(message = "The requested resource was not found.") {
        super(message)
        this.name = 'NotFoundError'
    }
}

export class InsufficientPermissionsError extends CustomHttpError  {
    readonly status_code = 403;
    constructor(message = "You do not have the permissions to perform this action.") {
        super(message)
        this.name = 'InsufficientPermissionsError'
    }
}

export class RateLimitedError extends CustomHttpError  {
    readonly status_code = 429;
    readonly retryIn: number;
    constructor(message = "Rate limit exceeded.", retryIn: number) {
        super(message)
        this.name = 'RateLimitedError';
        this.retryIn = retryIn;
    }
}

export class InvalidConfigurationError extends CustomHttpError  {
    readonly status_code = 400
    constructor(message = "The configuration provided is invalid or missing.") {
        super(message)
        this.name = 'InvalidConfigurationError'
    }
}
