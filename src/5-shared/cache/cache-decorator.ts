/**
 * Cache Decorator
 *
 * Decorator for caching method results
 */

import { cacheManager, cacheKeys } from './cache-manager';
import { logger } from '@/5-shared/utils/logger';

export interface CacheDecoratorOptions {
  /**
   * Cache key (can be a function that receives method arguments)
   */
  key?: string | ((...args: any[]) => string);

  /**
   * Time to live in seconds
   */
  ttl?: number;

  /**
   * Cache key prefix
   */
  prefix?: string;

  /**
   * Invalidate cache on method call (for write operations)
   */
  invalidate?: boolean | string | ((...args: any[]) => string | string[]);
}

/**
 * Cache decorator for methods
 */
export function Cache(options: CacheDecoratorOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const { key, ttl = 3600, prefix = '', invalidate = false } = options;

    descriptor.value = async function (...args: any[]) {
      // If invalidate is true, delete cache and execute method
      if (invalidate) {
        let keysToDelete: string[] = [];

        if (typeof invalidate === 'string') {
          keysToDelete = [invalidate];
        } else if (typeof invalidate === 'function') {
          const result = invalidate(...args);
          keysToDelete = Array.isArray(result) ? result : [result];
        } else {
          // Generate key from method name and args
          const cacheKey = generateCacheKey(propertyKey, args, prefix);
          keysToDelete = [cacheKey];
        }

        await Promise.all(keysToDelete.map((k) => cacheManager.delete(k)));

        // Execute method
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      let cacheKey: string;
      if (typeof key === 'function') {
        cacheKey = key(...args);
      } else if (key) {
        cacheKey = key;
      } else {
        cacheKey = generateCacheKey(propertyKey, args, prefix);
      }

      // Try to get from cache
      try {
        const cached = await cacheManager.get(cacheKey);
        if (cached !== null) {
          logger.debug('Cache hit', { key: cacheKey, method: propertyKey });
          return cached;
        }
      } catch (error) {
        logger.warn('Cache get error', { error, key: cacheKey });
      }

      // Execute method and cache result
      try {
        const result = await originalMethod.apply(this, args);
        await cacheManager.set(cacheKey, result, { ttl });
        logger.debug('Cache set', { key: cacheKey, method: propertyKey });
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Generate cache key from method name and arguments
 */
function generateCacheKey(methodName: string, args: any[], prefix: string): string {
  const argsStr = args
    .map((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join(':');

  return `${prefix}${methodName}:${argsStr}`;
}

/**
 * Invalidate cache helper
 */
export async function invalidateCache(pattern: string): Promise<void> {
  await cacheManager.deletePattern(pattern);
}

/**
 * Invalidate cache for specific keys
 */
export async function invalidateCacheKeys(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => cacheManager.delete(key)));
}
