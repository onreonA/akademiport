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
        <div className='space-y-4'>
          {/* Compact Loading Header */}
          <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg animate-pulse'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg'></div>
                <div>
                  <div className='h-6 w-48 bg-white/30 rounded mb-2'></div>
                  <div className='h-4 w-64 bg-white/20 rounded'></div>
                </div>
              </div>
              <div className='text-right'>
                <div className='h-4 w-24 bg-white/20 rounded mb-1'></div>
                <div className='h-6 w-12 bg-white/30 rounded'></div>
              </div>
            </div>
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
      <div className='space-y-4'>
        {/* Compact Header with Gradient */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                <i className='ri-folder-line text-2xl text-white'></i>
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  Proje Yönetimi
                </h1>
                <p className='text-blue-100 text-sm'>
                  Projelerinizi yönetin ve organize edin
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-sm text-blue-100'>Toplam Proje</div>
              <div className='text-2xl font-bold text-white'>-</div>
            </div>
          </div>
        </div>

        {/* Enhanced Project List bileşenini kullan */}
        <EnhancedProjectList />
      </div>
    </FirmaLayout>
  );
}
