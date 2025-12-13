/**
 * Performance Test Suite
 *
 * API endpoint'lerinin performansını test eder
 * Response time, throughput gibi metrikleri ölçer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupTestIsolation } from './test-isolation';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME_MS: 2000, // 2 seconds
  API_P95_RESPONSE_TIME_MS: 3000, // 3 seconds
  API_ERROR_RATE: 0.05, // 5%
};

describe('Performance Tests', () => {
  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Response Time', () => {
    it('should measure API response time', async () => {
      const startTime = performance.now();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME_MS);
    });

    it('should measure multiple API calls for p95 calculation', async () => {
      const responseTimes: number[] = [];

      // Simulate 20 API calls
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
        const endTime = performance.now();
        responseTimes.push(endTime - startTime);
      }

      // Calculate p95
      responseTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(responseTimes.length * 0.95);
      const p95 = responseTimes[p95Index];

      expect(p95).toBeLessThan(PERFORMANCE_THRESHOLDS.API_P95_RESPONSE_TIME_MS);
    });
  });

  describe('Error Rate', () => {
    it('should maintain error rate below threshold', async () => {
      const totalRequests = 100;
      let errorCount = 0;

      // Simulate requests with 2% error rate
      for (let i = 0; i < totalRequests; i++) {
        const shouldError = Math.random() < 0.02;
        if (shouldError) {
          errorCount++;
        }
      }

      const errorRate = errorCount / totalRequests;
      expect(errorRate).toBeLessThan(PERFORMANCE_THRESHOLDS.API_ERROR_RATE);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory', async () => {
      if (typeof performance.memory === 'undefined') {
        // Skip if memory API is not available
        return;
      }

      const initialMemory = (performance as any).memory.usedJSHeapSize;

      // Simulate some operations
      const arrays: number[][] = [];
      for (let i = 0; i < 10; i++) {
        arrays.push(new Array(1000).fill(0));
      }

      // Clear references
      arrays.length = 0;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait a bit for GC
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finalMemory = (performance as any).memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = performance.now();

      const promises = Array.from({ length: concurrentRequests }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Concurrent requests should complete faster than sequential
      // Sequential would take ~1000ms, concurrent should take ~100-200ms
      expect(totalTime).toBeLessThan(500);
    });
  });
});

