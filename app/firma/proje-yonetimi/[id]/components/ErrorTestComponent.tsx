'use client';
import React, { useState } from 'react';

import { useErrorHandler } from '../hooks/useErrorHandler';

import ErrorBoundary from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';
// Test component that can throw errors
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({
  shouldThrow,
}) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return (
    <div className='p-4 bg-green-100 text-green-800 rounded'>
      Component loaded successfully!
    </div>
  );
};
// Test component for error handling hook
const ErrorHandlerTest: React.FC = () => {
  const { error, handleError, clearError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const simulateApiError = async () => {
    setIsLoading(true);
    try {
      // Simulate API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('API call failed: 500 Internal Server Error'));
        }, 1000);
      });
    } catch (err) {
      handleError(err, 'simulateApiError');
    } finally {
      setIsLoading(false);
    }
  };
  const simulateNetworkError = async () => {
    setIsLoading(true);
    try {
      // Simulate network error
      await new Promise((_, reject) => {
        setTimeout(() => {
          const networkError = new Error('Network Error');
          (networkError as any).code = 'NETWORK_ERROR';
          reject(networkError);
        }, 1000);
      });
    } catch (err) {
      handleError(err, 'simulateNetworkError');
    } finally {
      setIsLoading(false);
    }
  };
  const simulateAuthError = async () => {
    setIsLoading(true);
    try {
      // Simulate auth error
      await new Promise((_, reject) => {
        setTimeout(() => {
          const authError = new Error('Unauthorized');
          (authError as any).status = 401;
          reject(authError);
        }, 1000);
      });
    } catch (err) {
      handleError(err, 'simulateAuthError');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900'>
        Error Handling Test
      </h3>
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={clearError}
          onDismiss={clearError}
          context='Error Test Component'
        />
      )}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <button
          onClick={simulateApiError}
          disabled={isLoading}
          className='bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors'
        >
          {isLoading ? 'Loading...' : 'Test API Error'}
        </button>
        <button
          onClick={simulateNetworkError}
          disabled={isLoading}
          className='bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors'
        >
          {isLoading ? 'Loading...' : 'Test Network Error'}
        </button>
        <button
          onClick={simulateAuthError}
          disabled={isLoading}
          className='bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors'
        >
          {isLoading ? 'Loading...' : 'Test Auth Error'}
        </button>
      </div>
    </div>
  );
};
// Main test component
const ErrorTestComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  return (
    <div className='p-6 space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900'>
        Error Handling Test Suite
      </h2>
      {/* ErrorBoundary Test */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          ErrorBoundary Test
        </h3>
        <div className='flex space-x-4'>
          <button
            onClick={() => setShouldThrow(false)}
            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors'
          >
            Load Component
          </button>
          <button
            onClick={() => setShouldThrow(true)}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors'
          >
            Throw Error
          </button>
        </div>
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </div>
      {/* Error Handler Hook Test */}
      <ErrorHandlerTest />
    </div>
  );
};
export default ErrorTestComponent;
