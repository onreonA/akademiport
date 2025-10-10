'use client';

import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Middleware zaten authentication'ı kontrol ediyor
    // Eğer bu sayfaya ulaştıysak, kullanıcı yetkili demektir
    setIsLoading(false);
  }, []);
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <LoadingSpinner size='lg' />
          <p className='mt-4 text-gray-600'>
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
