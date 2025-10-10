'use client';

import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FirmaLayoutProps {
  children: React.ReactNode;
}

export default function FirmaLayoutWrapper({ children }: FirmaLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Middleware zaten authentication'ı kontrol ediyor
    // Eğer bu sayfaya ulaştıysak, kullanıcı yetkili demektir
    setIsLoading(false);
  }, []);
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <FirmaLayout
      title='Firma Paneli'
      description='Firma yönetim merkezi'
      showHeader={false}
    >
      {children}
    </FirmaLayout>
  );
}
