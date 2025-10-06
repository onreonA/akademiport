// =====================================================
// REDIS CACHE LAYER
// =====================================================
// High-performance caching with Redis-like interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  maxAge?: number; // Maximum age in milliseconds
}
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private maxAge: number;
  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default
  }
  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.maxAge);
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      hits: 0,
    });
  }
  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    const now = Date.now();
    // Check if expired
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    // Update hit count
    entry.hits++;
    return entry.data;
  }
  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  // Clear all cache
  clear(): void {
    this.cache.clear();
  }
  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
        totalHits += entry.hits;
      }
    }
    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      totalHits,
      hitRate: validEntries > 0 ? totalHits / validEntries : 0,
    };
  }
  // Evict oldest entries
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
  // Clean expired entries
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
// Global cache instance
const cache = new MemoryCache({
  maxSize: 2000,
  maxAge: 5 * 60 * 1000, // 5 minutes
});
// Cache key generators
export const cacheKeys = {
  // Companies
  companies: (filters?: any) => `companies:${JSON.stringify(filters || {})}`,
  company: (id: string) => `company:${id}`,
  // Projects
  projects: (filters?: any) => `projects:${JSON.stringify(filters || {})}`,
  project: (id: string) => `project:${id}`,
  // Dashboard stats
  adminStats: () => 'admin:stats',
  firmaStats: (companyId: string) => `firma:stats:${companyId}`,
  // User data
  user: (email: string) => `user:${email}`,
  userCompany: (email: string) => `user:company:${email}`,
  // Search results
  search: (query: string, filters?: any) =>
    `search:${query}:${JSON.stringify(filters || {})}`,
  // Notifications
  notifications: (userId: string, filters?: any) =>
    `notifications:${userId}:${JSON.stringify(filters || {})}`,
  // Files
  files: (companyId: string, filters?: any) =>
    `files:${companyId}:${JSON.stringify(filters || {})}`,
};
// Cache utilities
export const cacheUtils = {
  // Set cache with TTL
  set: <T>(key: string, data: T, ttl?: number) => {
    cache.set(key, data, ttl);
  },
  // Get cache
  get: <T>(key: string): T | null => {
    return cache.get<T>(key);
  },
  // Check if exists
  has: (key: string): boolean => {
    return cache.has(key);
  },
  // Delete cache
  delete: (key: string): boolean => {
    return cache.delete(key);
  },
  // Clear all
  clear: () => {
    cache.clear();
  },
  // Get stats
  getStats: () => {
    return cache.getStats();
  },
  // Clean expired
  cleanExpired: () => {
    cache.cleanExpired();
  },
  // Invalidate related caches
  invalidateCompany: (companyId: string) => {
    cache.delete(cacheKeys.company(companyId));
    cache.delete(cacheKeys.firmaStats(companyId));
    // Invalidate companies list cache
    cache.delete(cacheKeys.companies({}));
  },
  invalidateProject: (projectId: string) => {
    cache.delete(cacheKeys.project(projectId));
    // Invalidate projects list cache
    cache.delete(cacheKeys.projects({}));
  },
  invalidateUser: (email: string) => {
    cache.delete(cacheKeys.user(email));
    cache.delete(cacheKeys.userCompany(email));
  },
  invalidateAdminStats: () => {
    cache.delete(cacheKeys.adminStats());
  },
  invalidateFirmaStats: (companyId: string) => {
    cache.delete(cacheKeys.firmaStats(companyId));
  },
};
// Auto-cleanup expired entries every 2 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      cacheUtils.cleanExpired();
    },
    2 * 60 * 1000
  );
}
export default cacheUtils;
