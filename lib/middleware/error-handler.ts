// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================
// Merkezi hata yönetimi
import { NextResponse } from 'next/server';
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}
export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
// Yaygın hata türleri
export const ErrorTypes = {
  // Authentication & Authorization
  UNAUTHORIZED: new AppError('Unauthorized access', 401, 'UNAUTHORIZED'),
  FORBIDDEN: new AppError('Access forbidden', 403, 'FORBIDDEN'),
  USER_NOT_FOUND: new AppError('User not found', 404, 'USER_NOT_FOUND'),
  INVALID_CREDENTIALS: new AppError(
    'Invalid credentials',
    401,
    'INVALID_CREDENTIALS'
  ),
  // Validation
  VALIDATION_ERROR: new AppError('Validation failed', 400, 'VALIDATION_ERROR'),
  MISSING_REQUIRED_FIELDS: new AppError(
    'Missing required fields',
    400,
    'MISSING_REQUIRED_FIELDS'
  ),
  INVALID_INPUT: new AppError('Invalid input data', 400, 'INVALID_INPUT'),
  // Resource Management
  RESOURCE_NOT_FOUND: new AppError(
    'Resource not found',
    404,
    'RESOURCE_NOT_FOUND'
  ),
  RESOURCE_ALREADY_EXISTS: new AppError(
    'Resource already exists',
    409,
    'RESOURCE_ALREADY_EXISTS'
  ),
  RESOURCE_CONFLICT: new AppError(
    'Resource conflict',
    409,
    'RESOURCE_CONFLICT'
  ),
  // Database
  DATABASE_ERROR: new AppError(
    'Database operation failed',
    500,
    'DATABASE_ERROR'
  ),
  DUPLICATE_ENTRY: new AppError(
    'Duplicate entry found',
    409,
    'DUPLICATE_ENTRY'
  ),
  FOREIGN_KEY_CONSTRAINT: new AppError(
    'Referenced record not found',
    400,
    'FOREIGN_KEY_CONSTRAINT'
  ),
  // External Services
  EXTERNAL_SERVICE_ERROR: new AppError(
    'External service error',
    502,
    'EXTERNAL_SERVICE_ERROR'
  ),
  RATE_LIMIT_EXCEEDED: new AppError(
    'Rate limit exceeded',
    429,
    'RATE_LIMIT_EXCEEDED'
  ),
  // General
  INTERNAL_ERROR: new AppError('Internal server error', 500, 'INTERNAL_ERROR'),
  NOT_IMPLEMENTED: new AppError(
    'Feature not implemented',
    501,
    'NOT_IMPLEMENTED'
  ),
  SERVICE_UNAVAILABLE: new AppError(
    'Service unavailable',
    503,
    'SERVICE_UNAVAILABLE'
  ),
};
/**
 * Hata response'u oluştur
 */
export function createErrorResponse(
  error: ApiError | Error,
  context?: string
): NextResponse {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
    // Yaygın hata türlerini tanı
    if (error.message.includes('not found')) {
      statusCode = 404;
      code = 'RESOURCE_NOT_FOUND';
    } else if (
      error.message.includes('duplicate') ||
      error.message.includes('already exists')
    ) {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
    } else if (
      error.message.includes('unauthorized') ||
      error.message.includes('access denied')
    ) {
      statusCode = 401;
      code = 'UNAUTHORIZED';
    } else if (error.message.includes('forbidden')) {
      statusCode = 403;
      code = 'FORBIDDEN';
    } else if (
      error.message.includes('validation') ||
      error.message.includes('invalid')
    ) {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
    }
  }
  // Log error
  //// Response oluştur
  const response = {
    success: false,
    error: message,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
  return NextResponse.json(response, { status: statusCode });
}
/**
 * Başarılı response oluştur
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: { total?: number; page?: number; limit?: number }
): NextResponse {
  const response: any = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  if (meta) {
    response.meta = meta;
  }
  return NextResponse.json(response);
}
/**
 * Try-catch wrapper for API routes
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error as ApiError, context);
    }
  };
}
/**
 * Database hatalarını işle
 */
export function handleDatabaseError(error: any, operation: string): AppError {
  //// PostgreSQL hata kodları
  switch (error.code) {
    case '23505': // unique_violation
      return new AppError('Duplicate entry found', 409, 'DUPLICATE_ENTRY', {
        field: error.detail,
      });
    case '23503': // foreign_key_violation
      return new AppError(
        'Referenced record not found',
        400,
        'FOREIGN_KEY_CONSTRAINT',
        { detail: error.detail }
      );
    case '23514': // check_violation
      return new AppError('Data validation failed', 400, 'VALIDATION_ERROR', {
        detail: error.detail,
      });
    case '23502': // not_null_violation
      return new AppError(
        'Required field is missing',
        400,
        'MISSING_REQUIRED_FIELDS',
        { field: error.column }
      );
    case '42P01': // undefined_table
      return new AppError('Database table not found', 500, 'DATABASE_ERROR', {
        table: error.table,
      });
    case '42703': // undefined_column
      return new AppError('Database column not found', 500, 'DATABASE_ERROR', {
        column: error.column,
      });
    default:
      return new AppError(
        `Database operation failed: ${operation}`,
        500,
        'DATABASE_ERROR',
        {
          code: error.code,
          detail: error.detail,
        }
      );
  }
}
/**
 * Validation hatalarını işle
 */
export function handleValidationError(errors: any[]): AppError {
  return new AppError('Validation failed', 400, 'VALIDATION_ERROR', { errors });
}
/**
 * Rate limiting kontrolü
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  // Basit in-memory rate limiting (production'da Redis kullanılmalı)
  const now = Date.now();
  const windowStart = now - windowMs;
  // Bu basit implementasyon production için yeterli değil
  // Gerçek implementasyon için Redis veya başka bir cache sistemi kullanılmalı
  return true; // Şimdilik her zaman true döndür
}
