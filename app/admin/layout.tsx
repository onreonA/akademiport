'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
interface AdminLayoutProps {
  children: React.ReactNode;
}
export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Cookie'lerden kullanıcı bilgilerini oku
        const userEmail = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-user-email='))
          ?.split('=')[1];
        const userRole = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-user-role='))
          ?.split('=')[1];
        if (!userEmail) {
          setError('Kullanıcı oturumu bulunamadı');
          router.push('/giris');
          return;
        }
        if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
          setError('Admin paneline erişim yetkiniz yok');
          // Firma kullanıcısı ise firma paneline yönlendir
          if (['user', 'operator', 'manager'].includes(userRole || '')) {
            router.push('/firma');
            return;
          }
          router.push('/giris');
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        setError('Yetkilendirme kontrolü başarısız');
        router.push('/giris');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <LoadingSpinner size='lg' />
          <p className='mt-4 text-gray-600'>
            Yetkilendirme kontrolü yapılıyor...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6 max-w-md'>
            <div className='text-red-600 text-lg font-semibold mb-2'>
              Erişim Engellendi
            </div>
            <p className='text-red-500 mb-4'>{error}</p>
            <button
              onClick={() => router.push('/giris')}
              className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
            >
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!isAuthorized) {
    return null;
  }
  return <>{children}</>;
}
