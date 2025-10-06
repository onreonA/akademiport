'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
interface TrainingStats {
  totalSets: number;
  totalVideos: number;
  totalDocuments: number;
  activeCompanies: number;
  completedTrainings: number;
}
export default function EgitimYonetimi() {
  const [stats, setStats] = useState<TrainingStats>({
    totalSets: 0,
    totalVideos: 0,
    totalDocuments: 0,
    activeCompanies: 0,
    completedTrainings: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Mock data - gerçek API'den gelecek
    setStats({
      totalSets: 12,
      totalVideos: 48,
      totalDocuments: 156,
      activeCompanies: 142,
      completedTrainings: 89,
    });
    setLoading(false);
  }, []);
  const quickAccessItems = [
    {
      title: 'Eğitim Setleri',
      description: 'Eğitim setlerini yönetin ve düzenleyin',
      icon: 'ri-book-open-line',
      href: '/admin/egitim-yonetimi/setler',
      color: 'bg-blue-500',
    },
    {
      title: 'Video Yönetimi',
      description: 'Eğitim videolarını yükleyin ve düzenleyin',
      icon: 'ri-video-line',
      href: '/admin/egitim-yonetimi/videolar',
      color: 'bg-green-500',
    },
    {
      title: 'Doküman Yönetimi',
      description: 'Eğitim dokümanlarını yönetin',
      icon: 'ri-file-text-line',
      href: '/admin/egitim-yonetimi/dokumanlar',
      color: 'bg-purple-500',
    },
    {
      title: 'Firma Takip',
      description: 'Firmaların eğitim ilerlemesini takip edin',
      icon: 'ri-building-line',
      href: '/admin/egitim-yonetimi/firma-takip',
      color: 'bg-orange-500',
    },
    {
      title: 'Raporlar',
      description: 'Eğitim istatistikleri ve raporları',
      icon: 'ri-bar-chart-line',
      href: '/admin/egitim-yonetimi/raporlar',
      color: 'bg-red-500',
    },
  ];
  return (
    <AdminLayout
      title='Eğitim Yönetimi'
      description='Eğitim içeriklerini yönetin, firmaların ilerlemesini takip edin'
    >
      {/* Page Actions */}
      <div className='flex justify-end items-center mb-8'>
        <div className='flex space-x-3'>
          <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
            Yeni Eğitim Seti Ekle
          </button>
          <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
            Toplu İçerik Yükle
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>Toplam Set</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.totalSets}
              </p>
            </div>
            <div className='bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-book-open-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>Toplam Video</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.totalVideos}
              </p>
            </div>
            <div className='bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-video-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Toplam Doküman
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.totalDocuments}
              </p>
            </div>
            <div className='bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-file-text-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>Aktif Firma</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.activeCompanies}
              </p>
            </div>
            <div className='bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-building-line text-white text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Tamamlanan Eğitim
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.completedTrainings}
              </p>
            </div>
            <div className='bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center'>
              <i className='ri-checkbox-circle-line text-white text-xl'></i>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Access */}
      <div className='mb-8'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Hızlı Erişim
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {quickAccessItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer'>
                <div className='flex items-center mb-4'>
                  <div
                    className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mr-4`}
                  >
                    <i className={`${item.icon} text-white text-xl`}></i>
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-gray-900'>
                      {item.title}
                    </h4>
                    <p className='text-sm text-gray-600'>{item.description}</p>
                  </div>
                </div>
                <div className='flex items-center text-blue-600 text-sm font-medium'>
                  <span>Yönet</span>
                  <i className='ri-arrow-right-line ml-2'></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Son Aktiviteler
        </h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-3 border-b border-gray-100'>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-green-500 rounded-full mr-3'></div>
              <span className='text-sm text-gray-600'>
                Yeni eğitim seti eklendi: &quot;E-İhracat Temelleri&quot;
              </span>
            </div>
            <span className='text-xs text-gray-400'>2 saat önce</span>
          </div>
          <div className='flex items-center justify-between py-3 border-b border-gray-100'>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
              <span className='text-sm text-gray-600'>
                15 firma eğitim setini tamamladı
              </span>
            </div>
            <span className='text-xs text-gray-400'>4 saat önce</span>
          </div>
          <div className='flex items-center justify-between py-3 border-b border-gray-100'>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-purple-500 rounded-full mr-3'></div>
              <span className='text-sm text-gray-600'>
                Yeni video yüklendi: &quot;Pazaryeri Entegrasyonu&quot;
              </span>
            </div>
            <span className='text-xs text-gray-400'>6 saat önce</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
