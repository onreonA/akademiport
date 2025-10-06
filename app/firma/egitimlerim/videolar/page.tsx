'use client';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import EducationCard from '@/components/ui/EducationCard';
import { useAuthStore } from '@/lib/stores/auth-store';
interface EducationSet {
  id: string;
  name: string;
  description: string;
  category: string;
  video_count: number;
  total_duration: number;
  status: string;
  created_at: string;
  progress_percentage: number;
  isLocked?: boolean;
  points?: number;
  level?: number;
  badges?: string[];
}
export default function FirmaVideoEgitimleriPage() {
  const { user } = useAuthStore();
  const [educationSets, setEducationSets] = useState<EducationSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const fetchEducationSets = useCallback(async () => {
    try {
      setLoading(true);
      const userEmail = user?.email || '';
      if (!userEmail) {
        setError('Kullanıcı bilgisi bulunamadı');
        return;
      }
      const response = await fetch('/api/company/education-assignments', {
        headers: {
          'X-User-Email': userEmail,
        },
      });
      if (!response.ok) {
        throw new Error('Eğitim setleri getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        // Transform API data to match EducationSet interface
        const transformedData: EducationSet[] = result.data.map(
          (item: any) => ({
            id: item.set_id || item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            video_count: item.totalVideos || 0,
            total_duration: item.estimatedDuration || 0,
            status: item.status,
            created_at: item.assignedDate,
            progress_percentage: item.completionPercentage || 0,
            isLocked: item.isLocked || false,
            // Add gamification data (will be implemented in V3.4)
            points: Math.floor(Math.random() * 300) + 50,
            level: Math.floor(Math.random() * 5) + 1,
            badges: ['Başlangıç'],
          })
        );
        setEducationSets(transformedData);
      } else {
        setError(result.error || 'Bilinmeyen hata');
      }
    } catch (err) {
      setError('Eğitim setleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    if (user) {
      fetchEducationSets();
    }
  }, [user, fetchEducationSets]);
  const filteredSets = educationSets.filter(set => {
    const matchesCategory =
      selectedCategory === 'all' || set.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || set.status === selectedStatus;
    const matchesSearch =
      set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });
  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'B2B', label: 'B2B' },
    { value: 'B2C', label: 'B2C' },
    { value: 'Destek', label: 'Destek' },
  ];
  const statuses = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'Devam Ediyor', label: 'Devam Ediyor' },
    { value: 'Tamamlandı', label: 'Tamamlandı' },
    { value: 'Kilitli', label: 'Kilitli' },
  ];
  const stats = {
    total: educationSets.length,
    active: educationSets.filter(s => s.status === 'Devam Ediyor').length,
    completed: educationSets.filter(s => s.status === 'Tamamlandı').length,
    locked: educationSets.filter(s => s.isLocked).length,
  };
  return (
    <FirmaLayout
      title='Video Eğitimlerim'
      description='Atanan eğitim setlerinizi takip edin ve öğrenmeye devam edin'
    >
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-play-circle-line text-blue-600 text-xl'></i>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Toplam Set
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-check-line text-green-600 text-xl'></i>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Tamamlanan
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-time-line text-yellow-600 text-xl'></i>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Devam Eden
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-lock-line text-red-600 text-xl'></i>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Kilitli</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.locked}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Arama
                </label>
                <div className='relative'>
                  <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
                  <input
                    type='text'
                    placeholder='Eğitim seti ara...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>
              <div className='w-full md:w-48'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='w-full md:w-48'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Content */}
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Eğitim setleri yükleniyor...</p>
              </div>
            </div>
          ) : error ? (
            <div className='bg-red-50 border border-red-200 rounded-xl p-6 text-center'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-error-warning-line text-red-600 text-2xl'></i>
              </div>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Hata Oluştu
              </h3>
              <p className='text-red-700'>{error}</p>
              <button
                onClick={fetchEducationSets}
                className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredSets.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-video-line text-gray-400 text-3xl'></i>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Henüz eğitim seti bulunmuyor
              </h3>
              <p className='text-gray-500 mb-6'>
                Size henüz video eğitim seti atanmamış.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredSets.map(set => (
                <EducationCard
                  key={set.id}
                  educationSet={set}
                  showGamification={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </FirmaLayout>
  );
}
