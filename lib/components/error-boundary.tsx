// =====================================================
// ERROR BOUNDARY COMPONENT
// =====================================================
// Global error boundary for the application
'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

import { useUIStore } from '@/lib/stores/ui-store';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
interface State {
  hasError: boolean;
  error?: Error;
}
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    //// Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
// Default error fallback component
function DefaultErrorFallback({ error }: { error?: Error }) {
  const { showError } = useUIStore();
  const handleRetry = () => {
    window.location.reload();
  };
  const handleReportError = () => {
    // In a real app, you would send this to an error reporting service
    // Error reported to service
    // showError(
    //   'Error Reported',
    //   'Thank you for reporting this error. We will look into it.'
    // );
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
        <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4'>
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
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>
        <h1 className='text-xl font-semibold text-gray-900 text-center mb-2'>
          Something went wrong
        </h1>
        <p className='text-gray-600 text-center mb-6'>
          We&apos;re sorry, but something unexpected happened. Please try
          refreshing the page or contact support if the problem persists.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <h3 className='text-sm font-medium text-red-800 mb-2'>
              Error Details:
            </h3>
            <pre className='text-xs text-red-700 whitespace-pre-wrap'>
              {error.message}
            </pre>
          </div>
        )}
        <div className='flex space-x-3'>
          <button
            onClick={handleRetry}
            className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Try Again
          </button>
          <button
            onClick={handleReportError}
            className='flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
          >
            Report Error
          </button>
        </div>
      </div>
    </div>
  );
}
// Hook for functional components to use error boundary
export function useErrorHandler() {
  const { showError } = useUIStore();
  return (error: Error, errorInfo?: any) => {
    //showError('An error occurred', error.message);
  };
}
