'use client';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import LoadingState from '@/components/ui/LoadingState';
import { useAuthStore } from '@/lib/stores/auth-store';

import EnhancedProjectList from './EnhancedProjectList';
export default function ProjeYonetimiClient() {
  const { user, signOut } = useAuthStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Simulate loading time for the component
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Sign out error
    }
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Proje Yönetimi'
        description='Projelerinizi yönetin ve organize edin'
        showHeader={false}
      >
        <div className='space-y-6'>
          {/* Modern Page Header - Single Source */}
          <div className='mb-6'>
            {/* Breadcrumb Navigation */}
            <div className='mb-3'>
              <nav className='flex items-center space-x-2 text-sm text-gray-500'>
                <span className='hover:text-gray-700 cursor-pointer'>
                  Ana Sayfa
                </span>
                <i className='ri-arrow-right-s-line text-xs'></i>
                <span className='text-gray-900 font-medium'>
                  Proje Yönetimi
                </span>
              </nav>
            </div>

            {/* Page Title */}
            <div className='mb-3'>
              <h1 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>
                PROJE YÖNETİMİ
              </h1>
            </div>

            {/* Page Description */}
            <div className='mb-4'>
              <p className='text-sm text-gray-600 font-medium leading-relaxed'>
                Projelerinizi yönetin ve organize edin
              </p>
            </div>

            {/* Decorative Line */}
            <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'></div>
          </div>

          <LoadingState
            type='skeleton'
            message='Proje yönetimi yükleniyor...'
          />
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Proje Yönetimi'
      description='Projelerinizi yönetin ve organize edin'
      showHeader={false}
    >
      <div className='space-y-6'>
        {/* Modern Page Header - Single Source */}
        <div className='mb-6'>
          {/* Breadcrumb Navigation */}
          <div className='mb-3'>
            <nav className='flex items-center space-x-2 text-sm text-gray-500'>
              <span className='hover:text-gray-700 cursor-pointer'>
                Ana Sayfa
              </span>
              <i className='ri-arrow-right-s-line text-xs'></i>
              <span className='text-gray-900 font-medium'>Proje Yönetimi</span>
            </nav>
          </div>

          {/* Page Title */}
          <div className='mb-3'>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>
              PROJE YÖNETİMİ
            </h1>
          </div>

          {/* Page Description */}
          <div className='mb-4'>
            <p className='text-sm text-gray-600 font-medium leading-relaxed'>
              Projelerinizi yönetin ve organize edin
            </p>
          </div>

          {/* Decorative Line */}
          <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'></div>
        </div>

        {/* Enhanced Project List bileşenini kullan */}
        <EnhancedProjectList />
      </div>
    </FirmaLayout>
  );
}
