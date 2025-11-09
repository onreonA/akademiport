/**
 * Base Application Error
 *
 * Tüm custom error'ların base class'ı
 */
export class AppError<
  TDetails extends Record<string, unknown> | Record<string, unknown>[] | undefined = undefined,
> extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
    public readonly details?: TDetails
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 *
 * Input validation hatalarında kullanılır
 */
export class ValidationError extends AppError<Record<string, string> | undefined> {
  constructor(
    message: string,
    public readonly fields?: Record<string, string>
  ) {
    super(message, 400, 'VALIDATION_ERROR', fields);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error (404)
 *
 * Kaynak bulunamadığında kullanılır
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized Error (401)
 *
 * Authentication hatalarında kullanılır
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 *
 * Authorization hatalarında kullanılır
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict Error (409)
 *
 * Kaynak çakışmalarında kullanılır (örn: duplicate email)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Internal Server Error (500)
 *
 * Beklenmeyen hatalar için kullanılır
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}
