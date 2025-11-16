'use client';

/**
 * Page-Level Error Boundary
 * Wraps individual pages to catch errors without breaking the entire app
 */

import { ErrorBoundary } from './ErrorBoundary';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Card, CardContent } from '@/1-presentation/components/ui/atoms/card';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  const fallback = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sayfa Yüklenemedi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pageName
                ? `${pageName} sayfası yüklenirken bir hata oluştu.`
                : 'Bu sayfa yüklenirken bir hata oluştu.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="shadow-sm"
            >
              Sayfayı Yenile
            </Button>
            <Button onClick={() => (window.location.href = '/dashboard')} className="shadow-sm">
              Ana Sayfa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
