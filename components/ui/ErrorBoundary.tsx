'use client';
import { Component, ReactNode } from 'react';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {}
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center'>
              <i className='ri-error-warning-line text-2xl text-red-600'></i>
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Bir Hata Oluştu
            </h2>
            <p className='text-gray-600 mb-4'>
              Sayfa yüklenirken beklenmeyen bir hata oluştu.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// Functional error component
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='text-center'>
        <div className='w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center'>
          <i className='ri-error-warning-line text-2xl text-red-600'></i>
        </div>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
          Bir Hata Oluştu
        </h2>
        <p className='text-gray-600 mb-2'>
          {error.message || 'Beklenmeyen bir hata oluştu.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
