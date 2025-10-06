// Error Handling Utilities
export interface ApiError {
  code?: string;
  message: string;
  details?: any;
  status?: number;
}
export interface ErrorState {
  hasError: boolean;
  error: ApiError | null;
  retryCount: number;
}
// Error message mapping
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    // API error messages
    if (error.code === 'NETWORK_ERROR') {
      return 'İnternet bağlantınızı kontrol edin';
    }
    if (error.code === 'AUTH_ERROR' || error.status === 401) {
      return 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın';
    }
    if (error.code === 'VALIDATION_ERROR' || error.status === 400) {
      return 'Lütfen tüm alanları doğru şekilde doldurun';
    }
    if (error.status === 403) {
      return 'Bu işlem için yetkiniz bulunmuyor';
    }
    if (error.status === 404) {
      return 'Aradığınız kaynak bulunamadı';
    }
    if (error.status === 500) {
      return 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin';
    }
    if (error.status >= 500) {
      return 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin';
    }
    return error.message;
  }
  return 'Beklenmeyen bir hata oluştu';
};
// Retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};
// Safe API call wrapper
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  fallback?: T,
  retryCount: number = 2
): Promise<T> => {
  try {
    return await retryWithBackoff(apiCall, retryCount);
  } catch (error) {
    // if (fallback !== undefined) {
    //   return fallback;
    // }
    throw error;
  }
};
// Form validation errors
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, any>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${rule.label || field} alanı zorunludur`;
      return;
    }
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] =
        `${rule.label || field} en az ${rule.minLength} karakter olmalıdır`;
      return;
    }
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] =
        `${rule.label || field} en fazla ${rule.maxLength} karakter olmalıdır`;
      return;
    }
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${rule.label || field} formatı geçersiz`;
      return;
    }
    if (value && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field] = 'Geçerli bir e-posta adresi giriniz';
      return;
    }
  });
  return errors;
};
// Error logging utility
export const logError = (error: any, context?: string) => {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server',
  };
  //// Burada gerçek bir error monitoring servisi kullanılabilir
  // Örnek: Sentry, LogRocket, vs.
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: errorInfo.message,
      fatal: false,
    });
  }
};
// Network error detection
export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Connection refused') ||
    !navigator.onLine
  );
};
// Offline detection
export const isOffline = (): boolean => {
  return typeof navigator !== 'undefined' && !navigator.onLine;
};
// Error recovery strategies
export const getRecoveryStrategy = (error: any): string => {
  if (isNetworkError(error) || isOffline()) {
    return 'network';
  }
  if (error?.status === 401 || error?.code === 'AUTH_ERROR') {
    return 'auth';
  }
  if (error?.status === 403) {
    return 'permission';
  }
  if (error?.status >= 500) {
    return 'server';
  }
  return 'unknown';
};
// Recovery actions
export const getRecoveryAction = (strategy: string): string => {
  switch (strategy) {
    case 'network':
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin';
    case 'auth':
      return 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın';
    case 'permission':
      return 'Bu işlem için yetkiniz bulunmuyor';
    case 'server':
      return 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin';
    default:
      return 'Beklenmeyen bir hata oluştu, lütfen sayfayı yenileyin';
  }
};
