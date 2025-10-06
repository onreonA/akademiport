import { NextRequest } from 'next/server';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    return JSON.stringify(logEntry);
  }

  private writeLog(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    const formattedMessage = this.formatMessage(level, message, context);

    if (this.isDevelopment) {
      // Development: Console output with colors
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m', // Yellow
        [LogLevel.INFO]: '\x1b[36m', // Cyan
        [LogLevel.DEBUG]: '\x1b[90m', // Gray
      };

      // Development logging disabled for production
    } else {
      // Production: Structured JSON logging
      // Production logging disabled
    }
  }

  error(message: string, context?: LogContext): void {
    this.writeLog(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.writeLog(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.writeLog(LogLevel.DEBUG, message, context);
    }
  }

  // Helper method to extract context from NextRequest
  extractRequestContext(request: NextRequest): LogContext {
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userId = request.cookies.get('auth-user-id')?.value;

    return {
      userId,
      userEmail,
      userRole,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
  }

  // API-specific logging methods
  apiRequest(endpoint: string, method: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${endpoint}`, context);
  }

  apiResponse(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info(
      `API Response: ${method} ${endpoint} - ${statusCode} (${duration}ms)`,
      {
        ...context,
        statusCode,
        duration,
      }
    );
  }

  apiError(
    endpoint: string,
    method: string,
    error: Error,
    context?: LogContext
  ): void {
    this.error(`API Error: ${method} ${endpoint} - ${error.message}`, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  databaseQuery(query: string, duration: number, context?: LogContext): void {
    this.debug(`Database Query: ${query} (${duration}ms)`, context);
  }

  databaseError(query: string, error: Error, context?: LogContext): void {
    this.error(`Database Error: ${query} - ${error.message}`, {
      ...context,
      query,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    if (duration > 1000) {
      // Log slow operations
      this.warn(`Slow Operation: ${operation} took ${duration}ms`, context);
    } else {
      this.debug(`Operation: ${operation} took ${duration}ms`, context);
    }
  }
}

export const logger = new Logger();

// Performance monitoring decorator
export function withPerformanceLogging<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.performance(operation, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Failed Operation: ${operation} (${duration}ms)`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };
}

// API route wrapper for automatic logging
export function withApiLogging(
  handler: (request: NextRequest, context?: any) => Promise<Response>
) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    const requestContext = logger.extractRequestContext(request);
    const start = Date.now();

    logger.apiRequest(
      requestContext.endpoint || '',
      requestContext.method || '',
      requestContext
    );

    try {
      const response = await handler(request, context);
      const duration = Date.now() - start;

      logger.apiResponse(
        requestContext.endpoint || '',
        requestContext.method || '',
        response.status,
        duration,
        requestContext
      );

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      logger.apiError(
        requestContext.endpoint || '',
        requestContext.method || '',
        error instanceof Error ? error : new Error('Unknown error'),
        requestContext
      );

      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
