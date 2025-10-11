'use client';

import Button from './ui/Button';

interface ApiErrorHandlerProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * API Error Handler Component
 *
 * Displays user-friendly error messages for API failures
 *
 * @example
 * {error && <ApiErrorHandler error={error} onRetry={fetchData} />}
 */
export default function ApiErrorHandler({
  error,
  onRetry,
  className = '',
  compact = false,
}: ApiErrorHandlerProps) {
  if (!error) return null;

  const errorMessage =
    typeof error === 'string'
      ? error
      : error.message || 'Bilinmeyen bir hata oluştu';

  // Parse common API errors
  const getFriendlyMessage = (msg: string): string => {
    if (msg.includes('fetch failed') || msg.includes('Network')) {
      return 'İnternet bağlantınızı kontrol edin.';
    }
    if (msg.includes('401') || msg.includes('Unauthorized')) {
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    }
    if (msg.includes('403') || msg.includes('Forbidden')) {
      return 'Bu işlem için yetkiniz yok.';
    }
    if (msg.includes('404') || msg.includes('Not Found')) {
      return 'İstenen kaynak bulunamadı.';
    }
    if (msg.includes('500') || msg.includes('Internal Server')) {
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    }
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
      return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    }
    return msg;
  };

  const friendlyMessage = getFriendlyMessage(errorMessage);

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className='flex items-center gap-2'>
          <svg
            className='w-5 h-5 text-red-600 flex-shrink-0'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <span className='text-sm text-red-800'>{friendlyMessage}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className='text-sm text-red-600 hover:text-red-700 font-medium underline'
          >
            Tekrar Dene
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}
    >
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0'>
          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-6 h-6 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-red-900 mb-2'>
            Bir Hata Oluştu
          </h3>
          <p className='text-red-700 mb-4'>{friendlyMessage}</p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className='mb-4'>
              <summary className='cursor-pointer text-sm text-red-600 hover:text-red-700 font-medium'>
                Teknik Detaylar (Sadece Development)
              </summary>
              <pre className='mt-2 p-3 bg-red-100 rounded text-xs text-red-800 overflow-auto'>
                {errorMessage}
              </pre>
            </details>
          )}

          {onRetry && (
            <Button variant='secondary' size='sm' onClick={onRetry}>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              Tekrar Dene
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Network Error Component
 * Specifically for network/connection errors
 */
export function NetworkError({
  onRetry,
  className = '',
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
        <svg
          className='w-8 h-8 text-gray-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414'
          />
        </svg>
      </div>
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
        Bağlantı Hatası
      </h3>
      <p className='text-gray-600 mb-4'>
        İnternet bağlantınızı kontrol edip tekrar deneyin.
      </p>
      {onRetry && (
        <Button variant='primary' onClick={onRetry}>
          Tekrar Dene
        </Button>
      )}
    </div>
  );
}

/**
 * Not Found Component
 * For 404 errors
 */
export function NotFoundError({
  message = 'Aradığınız kayıt bulunamadı.',
  onBack,
  className = '',
}: {
  message?: string;
  onBack?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
        <svg
          className='w-8 h-8 text-gray-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </div>
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>Bulunamadı</h3>
      <p className='text-gray-600 mb-4'>{message}</p>
      {onBack && (
        <Button variant='secondary' onClick={onBack}>
          ← Geri Dön
        </Button>
      )}
    </div>
  );
}
