'use client';
import React from 'react';
import { RiErrorWarningLine, RiRefreshLine } from 'react-icons/ri';
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
  }
  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Burada gerçek bir error monitoring servisi kullanılabilir
    // Örnek: Sentry, LogRocket, vs.
    // Error logged to service: {
    //   message: error.message,
    //   stack: error.stack,
    //   componentStack: errorInfo.componentStack,
    //   timestamp: new Date().toISOString(),
    // }
  };
  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent error={this.state.error} retry={this.retry} />
        );
      }
      return (
        <div className='flex flex-col items-center justify-center min-h-[400px] p-8'>
          <div className='text-center max-w-md'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <RiErrorWarningLine className='w-8 h-8 text-red-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Bir Hata Oluştu
            </h3>
            <p className='text-gray-600 mb-6'>
              {this.state.error?.message ||
                'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.'}
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <button
                onClick={this.retry}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2'
              >
                <RiRefreshLine className='w-4 h-4' />
                <span>Tekrar Dene</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors'
              >
                Sayfayı Yenile
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-6 text-left'>
                <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                  Hata Detayları (Geliştirici)
                </summary>
                <pre className='mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto'>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
