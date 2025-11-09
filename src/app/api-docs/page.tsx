/**
 * API Documentation Page
 * Swagger UI for API documentation
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Import Swagger UI CSS
if (typeof window !== 'undefined') {
  require('swagger-ui-react/swagger-ui.css');
}

export default function APIDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch OpenAPI spec from API
    fetch('/api/openapi.json')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load API spec:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">API dokümantasyonu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">API dokümantasyonu yüklenemedi</p>
          <p className="text-gray-600 dark:text-gray-400">
            Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SwaggerUI spec={spec} />
    </div>
  );
}
