import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry, toAIError } from './retry-handler';

describe('Retry Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const fn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary error');
        }
        return Promise.resolve('success');
      });

      const result = await withRetry(fn, { maxRetries: 3, initialDelayMs: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Persistent error'));
      await expect(withRetry(fn, { maxRetries: 2, initialDelayMs: 10 })).rejects.toThrow(
        'Persistent error'
      );
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry if error is not retryable', async () => {
      const error: any = new Error('Non-retryable error');
      error.retryable = false;
      const fn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(fn)).rejects.toThrow('Non-retryable error');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('toAIError', () => {
    it('should convert error to AIError', () => {
      const error = new Error('Test error');
      const aiError = toAIError(error, true);

      expect(aiError.message).toBe('Test error');
      expect(aiError.retryable).toBe(true);
    });

    it('should handle error with code', () => {
      const error: any = new Error('Test error');
      error.code = 'TEST_CODE';
      error.status = 500;
      const aiError = toAIError(error, false);

      expect(aiError.message).toBe('Test error');
      expect(aiError.code).toBe('TEST_CODE');
      expect(aiError.status).toBe(500);
      expect(aiError.retryable).toBe(false);
    });
  });
});
