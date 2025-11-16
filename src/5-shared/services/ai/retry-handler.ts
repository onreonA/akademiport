/**
 * Retry Handler
 *
 * Exponential backoff ile retry mekanizması
 */

import { AIError } from '@/3-domain/entities/AI';
import { logger } from '@/5-shared/utils/logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Retryable bir fonksiyonu retry mekanizması ile çalıştır
 */
export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Son deneme ise hata fırlat
      if (attempt === opts.maxRetries) {
        throw error;
      }

      // Retry edilemez hata ise fırlat
      if (error.retryable === false) {
        throw error;
      }

      // Retry edilebilir hata ise bekle ve tekrar dene
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelayMs
      );

      logger.warn(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms:`,
        error.message
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Error'ı AIError'a çevir ve retryable bilgisini ekle
 */
export function toAIError(error: any, retryable: boolean = false): AIError {
  return {
    message: error.message || 'Unknown error',
    code: error.code || error.status?.toString(),
    status: error.status,
    retryable,
  };
}
