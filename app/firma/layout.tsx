'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
interface FirmaLayoutProps {
  children: React.ReactNode;
}
export default function FirmaLayoutWrapper({ children }: FirmaLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Auto-login token kontrolü
        const urlParams = new URLSearchParams(window.location.search);
        const autoLoginToken = urlParams.get('token');
        const companyName = urlParams.get('company');

        if (autoLoginToken && companyName) {
          setIsAuthorized(true);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Cookie'lerden kullanıcı bilgilerini oku
        const userEmail = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-user-email='))
          ?.split('=')[1];
        const userRole = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-user-role='))
          ?.split('=')[1];
        const companyId = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-user-company-id='))
          ?.split('=')[1];
        if (!userEmail) {
          setError('Kullanıcı oturumu bulunamadı');
          router.push('/giris');
          return;
        }
        // Firma kullanıcıları için rol kontrolü - Middleware COMPANY_ROLES ile uyumlu
        const COMPANY_ROLES = [
          'user',
          'operator',
          'manager',
          'firma_admin',
          'firma_kullanıcı',
        ];

        if (!COMPANY_ROLES.includes(userRole || '')) {
          setError('Firma paneline erişim yetkiniz yok');
          // Admin kullanıcısı ise admin paneline yönlendir
          if (
            ['admin', 'consultant', 'master_admin'].includes(userRole || '')
          ) {
            router.push('/admin');
            return;
          }
          router.push('/giris');
          return;
        }

        setIsAuthorized(true);
        setError(null);
      } catch (error) {
        setError('Yetkilendirme kontrolünde hata oluştu');
        router.push('/giris');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center'>
          <div className='mb-4'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
              <svg
                className='h-6 w-6 text-red-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Erişim Engellendi
          </h3>
          <p className='text-sm text-gray-500 mb-4'>{error}</p>
          <button
            onClick={() => router.push('/giris')}
            className='w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors'
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }
  if (!isAuthorized) {
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
