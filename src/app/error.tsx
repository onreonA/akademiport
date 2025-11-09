'use client';

/**
 * Global Error Page
 * Next.js App Router error.tsx - Catches errors in the app directory
 */

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error caught:', error);
    }

    // Send error to Sentry
    Sentry.captureException(error);
  }, [error]);

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
            {process.env.NODE_ENV === 'development' && (
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
                      {error.message}
                    </p>
                  </div>
                  {error.digest && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Error Digest:
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {error.digest}
                      </p>
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Stack Trace:
                      </p>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={reset} variant="outline" className="flex-1 shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1 shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sayfayı Yenile
            </Button>
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              variant="outline"
              className="flex-1 shadow-sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
