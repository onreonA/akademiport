// =====================================================
// CACHED API HOOK
// =====================================================
// High-performance API hook with intelligent caching
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store-optimized-v2';
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
interface ApiOptions {
  cacheTime?: number; // Cache duration in milliseconds
  staleTime?: number; // Stale time in milliseconds
  retryCount?: number;
  retryDelay?: number;
}
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
// Global cache store
const cache = new Map<string, CacheEntry<any>>();
// Cache configuration
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_STALE_TIME = 2 * 60 * 1000; // 2 minutes
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000;
export function useApiCached<T>(
  url: string,
  options: ApiOptions = {}
): ApiState<T> {
  const {
    cacheTime = DEFAULT_CACHE_TIME,
    staleTime = DEFAULT_STALE_TIME,
    retryCount = DEFAULT_RETRY_COUNT,
    retryDelay = DEFAULT_RETRY_DELAY,
  } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Generate cache key
  const cacheKey = `${url}:${user?.id || 'anonymous'}`;
  // Check if data is cached and valid
  const getCachedData = useCallback((): T | null => {
    const cached = cache.get(cacheKey);
    if (!cached) return null;
    const now = Date.now();
    // Check if cache is expired
    if (now > cached.expiresAt) {
      cache.delete(cacheKey);
      return null;
    }
    return cached.data;
  }, [cacheKey]);
  // Set data in cache
  const setCachedData = useCallback(
    (newData: T) => {
      const now = Date.now();
      cache.set(cacheKey, {
        data: newData,
        timestamp: now,
        expiresAt: now + cacheTime,
      });
    },
    [cacheKey, cacheTime]
  );
  // Check if data is stale
  const isStale = useCallback((): boolean => {
    const cached = cache.get(cacheKey);
    if (!cached) return true;
    const now = Date.now();
    return now > cached.timestamp + staleTime;
  }, [cacheKey, staleTime]);
  // Fetch data from API
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData && !isStale()) {
          setData(cachedData);
          setError(null);
          return;
        }
      }
      setLoading(true);
      setError(null);
      try {
        abortControllerRef.current = new AbortController();
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          setCachedData(result.data);
          retryCountRef.current = 0;
        } else {
          throw new Error(result.error || 'API request failed');
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return; // Request was cancelled
        }
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => {
            fetchData(forceRefresh);
          }, retryDelay * retryCountRef.current);
          return;
        }
        setError(error.message || 'Veri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    },
    [url, getCachedData, setCachedData, isStale, retryCount, retryDelay]
  );
  // Refetch function
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchData();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, user, fetchData]);
  return {
    data,
    loading,
    error,
    refetch,
  };
}
// Cache management utilities
export const cacheUtils = {
  // Clear specific cache entry
  clear: (url: string, userId?: string) => {
    const key = `${url}:${userId || 'anonymous'}`;
    cache.delete(key);
  },
  // Clear all cache
  clearAll: () => {
    cache.clear();
  },
  // Clear expired entries
  clearExpired: () => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(key);
      }
    }
  },
  // Get cache stats
  getStats: () => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    for (const entry of cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }
    return {
      total: cache.size,
      valid: validEntries,
      expired: expiredEntries,
    };
  },
};
// Auto-cleanup expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      cacheUtils.clearExpired();
    },
    5 * 60 * 1000
  );
}
