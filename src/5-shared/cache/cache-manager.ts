/**
 * Cache Manager
 *
 * Unified caching interface supporting both in-memory and Redis
 */

import { logger } from '@/5-shared/utils/logger';

export interface CacheOptions {
  /**
   * Time to live in seconds
   * Default: 3600 (1 hour)
   */
  ttl?: number;

  /**
   * Cache key prefix
   */
  prefix?: string;
}

export interface ICacheManager {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

  /**
   * Delete value from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple keys matching pattern
   */
  deletePattern(pattern: string): Promise<void>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Check if key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get multiple keys
   */
  getMany<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Set multiple keys
   */
  setMany<T>(entries: Array<{ key: string; value: T; options?: CacheOptions }>): Promise<void>;
}

/**
 * In-memory cache implementation
 */
class InMemoryCacheManager implements ICacheManager {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();
  private defaultTtl: number;

  constructor(defaultTtl: number = 3600) {
    this.defaultTtl = defaultTtl;
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || this.defaultTtl;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key)));
  }

  async setMany<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    await Promise.all(entries.map((entry) => this.set(entry.key, entry.value, entry.options)));
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Redis cache implementation (when Redis is available)
 */
class RedisCacheManager implements ICacheManager {
  private redis: any;
  private defaultTtl: number;
  private prefix: string;

  constructor(redisClient: any, defaultTtl: number = 3600, prefix: string = 'cache:') {
    this.redis = redisClient;
    this.defaultTtl = defaultTtl;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(this.getKey(key));
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error', { error, key });
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.defaultTtl;
      const serialized = JSON.stringify(value);
      await this.redis.setex(this.getKey(key), ttl, serialized);
    } catch (error) {
      logger.error('Redis set error', { error, key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key));
    } catch (error) {
      logger.error('Redis delete error', { error, key });
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Redis deletePattern error', { error, pattern });
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Redis clear error', { error });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error', { error, key });
      return false;
    }
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const prefixedKeys = keys.map((k) => this.getKey(k));
      const values = await this.redis.mget(...prefixedKeys);
      return values.map((v: string | null) => (v ? (JSON.parse(v) as T) : null));
    } catch (error) {
      logger.error('Redis getMany error', { error });
      return keys.map(() => null);
    }
  }

  async setMany<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      entries.forEach((entry) => {
        const ttl = entry.options?.ttl || this.defaultTtl;
        const serialized = JSON.stringify(entry.value);
        pipeline.setex(this.getKey(entry.key), ttl, serialized);
      });
      await pipeline.exec();
    } catch (error) {
      logger.error('Redis setMany error', { error });
    }
  }
}

/**
 * Cache manager factory
 */
let cacheManagerInstance: ICacheManager | null = null;

export function createCacheManager(): ICacheManager {
  if (cacheManagerInstance) {
    return cacheManagerInstance;
  }

  // Try to use Redis if available
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      // Dynamic import to avoid requiring redis in dev/test
      const redis = require('redis');
      const client = redis.createClient({ url: redisUrl });

      client.on('error', (err: Error) => {
        logger.error('Redis client error', { error: err.message });
        // Fallback to in-memory cache
        cacheManagerInstance = new InMemoryCacheManager();
      });

      client.on('connect', () => {
        logger.info('Redis cache connected');
      });

      cacheManagerInstance = new RedisCacheManager(client);
      return cacheManagerInstance;
    } catch (error) {
      logger.warn('Redis not available, using in-memory cache', { error });
    }
  }

  // Fallback to in-memory cache
  const defaultTtl = parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10);
  cacheManagerInstance = new InMemoryCacheManager(defaultTtl);
  return cacheManagerInstance;
}

/**
 * Global cache manager instance
 */
export const cacheManager = createCacheManager();

/**
 * Cache key generators
 */
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userPrograms: (userId: string) => `user:${userId}:programs`,
  company: (id: string) => `company:${id}`,
  program: (id: string) => `program:${id}`,
  leaderboard: (programId?: string, companyId?: string) => {
    if (programId && companyId) {
      return `leaderboard:${programId}:${companyId}`;
    }
    if (programId) {
      return `leaderboard:${programId}`;
    }
    return 'leaderboard:all';
  },
  forumTopics: (filters: Record<string, any>) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `forum:topics:${filterStr}`;
  },
  news: (filters: Record<string, any>) => {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `news:${filterStr}`;
  },
};
