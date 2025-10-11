'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
          <div className='max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8'>
            {/* Error Icon */}
            <div className='flex justify-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-8 h-8 text-red-600'
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

            {/* Error Message */}
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Bir Hata Oluştu
              </h2>
              <p className='text-gray-600'>
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin
                veya daha sonra tekrar deneyin.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='mb-6 p-4 bg-gray-100 rounded-lg'>
                <details className='cursor-pointer'>
                  <summary className='text-sm font-semibold text-gray-700 mb-2'>
                    Hata Detayları (Sadece Development)
                  </summary>
                  <div className='text-xs text-gray-600 font-mono overflow-auto max-h-40'>
                    <p className='mb-2 text-red-600 font-bold'>
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className='whitespace-pre-wrap'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Actions */}
            <div className='flex gap-3'>
              <Button variant='secondary' fullWidth onClick={this.handleReset}>
                Tekrar Dene
              </Button>
              <Button
                variant='primary'
                fullWidth
                onClick={() => window.location.reload()}
              >
                Sayfayı Yenile
              </Button>
            </div>

            {/* Support Link */}
            <div className='mt-6 text-center'>
              <button
                onClick={() => (window.location.href = '/')}
                className='text-sm text-blue-600 hover:text-blue-700 hover:underline'
              >
                ← Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Lightweight Error Boundary for small components
 * Shows inline error message instead of full screen
 */
export class InlineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('InlineErrorBoundary caught an error:', error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0'>
              <svg
                className='w-5 h-5 text-red-600'
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
            </div>
            <div className='flex-1'>
              <h3 className='text-sm font-semibold text-red-800 mb-1'>
                Bu bileşen yüklenemedi
              </h3>
              <p className='text-sm text-red-600'>
                {this.state.error?.message || 'Bilinmeyen bir hata oluştu'}
              </p>
              <button
                onClick={this.handleReset}
                className='mt-2 text-sm text-red-600 hover:text-red-700 underline'
              >
                Tekrar dene
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
