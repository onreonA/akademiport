/**
 * Query Performance Monitoring
 *
 * Slow query detection ve performance tracking için middleware
 */

import { logger } from '@/5-shared/utils/logger';

export interface QueryPerformanceConfig {
  /**
   * Slow query threshold in milliseconds
   * Default: 1000ms (1 second)
   */
  slowQueryThreshold?: number;

  /**
   * Enable query logging
   * Default: true in development, false in production
   */
  enableLogging?: boolean;

  /**
   * Enable slow query alerts
   * Default: true
   */
  enableAlerts?: boolean;
}

const defaultConfig: Required<QueryPerformanceConfig> = {
  slowQueryThreshold: 1000, // 1 second
  enableLogging: process.env.NODE_ENV === 'development',
  enableAlerts: true,
};

/**
 * Query performance tracker
 */
export class QueryPerformanceTracker {
  private config: Required<QueryPerformanceConfig>;
  private slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
    metadata?: Record<string, any>;
  }> = [];

  constructor(config: QueryPerformanceConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Track a query execution
   */
  async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    let error: Error | null = null;

    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      this.logQuery(queryName, duration, metadata, error);
      this.checkSlowQuery(queryName, duration, metadata);

      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;

      this.logQuery(queryName, duration, metadata, error);
      throw err;
    }
  }

  /**
   * Log query execution
   */
  private logQuery(
    queryName: string,
    duration: number,
    metadata?: Record<string, any>,
    error?: Error | null
  ): void {
    if (!this.config.enableLogging) {
      return;
    }

    const logData = {
      query: queryName,
      duration: `${duration}ms`,
      ...metadata,
      ...(error && { error: error.message }),
    };

    if (error) {
      logger.error('Query execution failed', logData);
    } else if (duration > this.config.slowQueryThreshold) {
      logger.warn('Slow query detected', logData);
    } else {
      logger.debug('Query executed', logData);
    }
  }

  /**
   * Check if query is slow and alert if needed
   */
  private checkSlowQuery(
    queryName: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    if (duration > this.config.slowQueryThreshold) {
      const slowQuery = {
        query: queryName,
        duration,
        timestamp: new Date(),
        metadata,
      };

      this.slowQueries.push(slowQuery);

      // Keep only last 100 slow queries in memory
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift();
      }

      if (this.config.enableAlerts) {
        logger.warn('Slow query alert', {
          query: queryName,
          duration: `${duration}ms`,
          threshold: `${this.config.slowQueryThreshold}ms`,
          ...metadata,
        });
      }
    }
  }

  /**
   * Get slow queries statistics
   */
  getSlowQueries(limit = 10): Array<{
    query: string;
    duration: number;
    timestamp: Date;
    metadata?: Record<string, any>;
  }> {
    return this.slowQueries.sort((a, b) => b.duration - a.duration).slice(0, limit);
  }

  /**
   * Get query statistics
   */
  getStatistics(): {
    totalSlowQueries: number;
    averageDuration: number;
    maxDuration: number;
    queriesByType: Record<string, number>;
  } {
    if (this.slowQueries.length === 0) {
      return {
        totalSlowQueries: 0,
        averageDuration: 0,
        maxDuration: 0,
        queriesByType: {},
      };
    }

    const durations = this.slowQueries.map((q) => q.duration);
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);

    const queriesByType: Record<string, number> = {};
    this.slowQueries.forEach((q) => {
      queriesByType[q.query] = (queriesByType[q.query] || 0) + 1;
    });

    return {
      totalSlowQueries: this.slowQueries.length,
      averageDuration: Math.round(averageDuration),
      maxDuration,
      queriesByType,
    };
  }

  /**
   * Clear slow queries history
   */
  clearHistory(): void {
    this.slowQueries = [];
  }
}

/**
 * Global query performance tracker instance
 */
export const queryPerformanceTracker = new QueryPerformanceTracker({
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10),
  enableLogging:
    process.env.NODE_ENV === 'development' || process.env.ENABLE_QUERY_LOGGING === 'true',
  enableAlerts: process.env.ENABLE_SLOW_QUERY_ALERTS !== 'false',
});

/**
 * Decorator for tracking repository method performance
 */
export function trackQueryPerformance(queryName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const metadata = {
        method: propertyKey,
        className: target.constructor.name,
        args: args.length > 0 ? `[${args.length} args]` : undefined,
      };

      return queryPerformanceTracker.trackQuery(
        queryName || `${target.constructor.name}.${propertyKey}`,
        () => originalMethod.apply(this, args),
        metadata
      );
    };

    return descriptor;
  };
}

/**
 * Helper function to wrap Supabase queries with performance tracking
 */
export async function trackSupabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<{ data: T | null; error: any; count?: number | null }>,
  metadata?: Record<string, any>
): Promise<{ data: T | null; error: any; count?: number | null }> {
  return queryPerformanceTracker.trackQuery(
    queryName,
    async () => {
      const result = await queryFn();
      // Don't throw on error - let the caller handle it
      return result;
    },
    metadata
  );
}
