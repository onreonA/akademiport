import { useCallback, useState } from 'react';

import {
  ApiError,
  getErrorMessage,
  getRecoveryAction,
  getRecoveryStrategy,
  logError,
  safeApiCall,
} from '../utils/errorHandling';
interface UseErrorHandlerReturn {
  error: ApiError | null;
  isLoading: boolean;
  retryCount: number;
  handleError: (error: any, context?: string) => void;
  clearError: () => void;
  executeWithErrorHandling: <T>(
    fn: () => Promise<T>,
    fallback?: T,
    retryCount?: number
  ) => Promise<T | undefined>;
  retry: () => void;
}
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const handleError = useCallback(
    (error: any, context?: string) => {
      const errorMessage = getErrorMessage(error);
      const strategy = getRecoveryStrategy(error);
      const recoveryAction = getRecoveryAction(strategy);
      const apiError: ApiError = {
        code: error?.code,
        message: errorMessage,
        details: error?.details,
        status: error?.status,
      };
      setError(apiError);
      logError(error, context);
      // Auto-retry for network errors
      if (strategy === 'network' && retryCount < 3) {
        setTimeout(
          () => {
            setRetryCount(prev => prev + 1);
            setError(null);
          },
          2000 * (retryCount + 1)
        ); // Exponential backoff
      }
    },
    [retryCount]
  );
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);
  const executeWithErrorHandling = useCallback(
    async <T>(
      fn: () => Promise<T>,
      fallback?: T,
      retryCount: number = 2
    ): Promise<T | undefined> => {
      try {
        setIsLoading(true);
        clearError();
        const result = await safeApiCall(fn, fallback, retryCount);
        return result;
      } catch (error) {
        handleError(error, 'executeWithErrorHandling');
        return fallback;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, clearError]
  );
  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
  }, []);
  return {
    error,
    isLoading,
    retryCount,
    handleError,
    clearError,
    executeWithErrorHandling,
    retry,
  };
};
