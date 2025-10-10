'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import MinimalHeader from '@/components/layout/MinimalHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';

const AnimatedSidebar = dynamic(
  () => import('@/components/layout/AnimatedSidebar'),
  {
    ssr: false,
    loading: () => <div className='w-52 h-full bg-white' />,
  }
);

interface FirmaLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showNotifications?: boolean;
  showHeader?: boolean;
}

export default function FirmaLayout({
  children,
  title,
  description,
  showNotifications = true,
  showHeader = false,
}: FirmaLayoutProps) {
  const router = useRouter();

  // Simple state management - always collapsed by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Opera cache fix
    if (
      typeof window !== 'undefined' &&
      window.navigator.userAgent.includes('Opera')
    ) {
      const style = document.createElement('style');
      style.textContent = `
        .sidebar-fix { 
          position: fixed !important; 
          top: 4rem !important; 
          left: 0 !important; 
          height: calc(100vh - 4rem) !important; 
          z-index: 50 !important; 
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Authentication kontrolü - JWT Token kullan
  useEffect(() => {
    const checkAuth = () => {
      try {
        // JWT token kontrolü - middleware ile uyumlu
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1];

        if (!authToken) {
          // No JWT token found, redirecting to login
          setError('Kullanıcı oturumu bulunamadı');
          router.push('/giris');
          return;
        }

        // JWT token var - middleware zaten doğrulamış
        // FirmaLayout sadece UI render ediyor, authentication middleware'de yapılıyor

        // Authorization successful
        setError(null);
      } catch (error) {
        // Auth check error
        setError('Kimlik doğrulama hatası');
        router.push('/giris');
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      checkAuth();
    }
  }, [mounted, router]);

  // Auto-collapse timer logic - 10 saniye sonra daralt
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.innerWidth >= 768 &&
      !sidebarCollapsed &&
      !isHovered &&
      mounted
    ) {
      const timer = setTimeout(() => {
        setSidebarCollapsed(true);
      }, 10000); // 10 saniye

      return () => clearTimeout(timer);
    }
  }, [sidebarCollapsed, isHovered, mounted]);

  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleSidebarMouseEnter = () => {
    setIsHovered(true);
    // Eğer sidebar daraltılmışsa, hover ile aç
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };

  if (!mounted || isLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50' />
        <div className='pt-16'>
          <div className='p-4 sm:p-6 lg:p-8'>
            <div className='mb-6'>
              <h1 className='text-xl font-bold text-gray-900'>{title}</h1>
              {description && (
                <p className='mt-1 text-xs text-gray-600'>{description}</p>
              )}
            </div>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                <p className='mt-2 text-sm text-gray-600'>Yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50' />
        <div className='pt-16'>
          <div className='p-4 sm:p-6 lg:p-8'>
            <div className='mb-6'>
              <h1 className='text-xl font-bold text-gray-900'>{title}</h1>
              {description && (
                <p className='mt-1 text-xs text-gray-600'>{description}</p>
              )}
            </div>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='text-red-600 text-lg mb-2'>⚠️</div>
                <h3 className='text-sm font-medium text-red-800 mb-2'>
                  Erişim Engellendi
                </h3>
                <p className='text-sm text-gray-600'>{error}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  Giriş sayfasına yönlendiriliyorsunuz...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Header */}
      <MinimalHeader onSidebarToggle={handleSidebarToggle} />

      {/* Desktop Sidebar */}
      <div
        className={`
                fixed top-16 left-0 h-[calc(100vh-4rem)] z-60 transition-all duration-300 ease-in-out
                ${sidebarCollapsed ? 'w-16' : 'w-52'}
                bg-white/60 backdrop-blur-sm shadow-xl border-r border-white/30
                hidden md:block sidebar-fix
              `}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <AnimatedSidebar
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] z-50 transition-all duration-300 ease-in-out
          w-52
          bg-white/60 backdrop-blur-sm shadow-xl rounded-tr-lg border-r border-white/30
          md:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <AnimatedSidebar
          collapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`
          ${sidebarCollapsed && !isHovered ? 'md:ml-16' : 'md:ml-52'}
          pt-8
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Page Content */}
        <main className='pt-3 pr-3 pb-3 sm:pt-4 sm:pr-4 sm:pb-4 lg:pt-6 lg:pr-6 lg:pb-6'>
          {/* Page Header - Breadcrumb + Title + Description */}
          {showHeader && (
            <div className='mb-8'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                {/* Breadcrumb Navigation */}
                <Breadcrumb className='mb-4' />

                {/* Page Title */}
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
                  {title}
                </h1>

                {/* Page Description */}
                {description && (
                  <p className='text-gray-600 leading-relaxed'>{description}</p>
                )}
              </div>
            </div>
          )}

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
