'use client';

/**
 * Error Boundary Component
 * Catches React errors and displays a user-friendly error page
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';

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

export class ErrorBoundary extends Component<Props, State> {
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
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
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

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm max-w-2xl w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Bir Hata Oluştu
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Üzgünüz, beklenmeyen bir hata oluştu
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lütfen sayfayı yenileyin veya ana sayfaya dönün. Sorun devam ederse, lütfen destek
                  ekibi ile iletişime geçin.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Hata Detayları (Geliştirme Modu)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Hata Mesajı:
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
                          {this.state.error.message}
                        </p>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Stack Trace:
                          </p>
                          <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono overflow-auto max-h-40">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={this.handleReset} variant="outline" className="flex-1 shadow-sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tekrar Dene
                </Button>
                <Button onClick={this.handleReload} className="flex-1 shadow-sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sayfayı Yenile
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1 shadow-sm">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error boundary (for functional components)
 * Note: This doesn't replace ErrorBoundary, but can be used for error handling in hooks
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', error, errorInfo);
    }
    // In production, you might want to send this to an error tracking service
    throw error; // Re-throw to be caught by ErrorBoundary
  };
}
