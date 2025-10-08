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
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/10'>
        <div className='px-3 sm:px-4 lg:px-6 py-4'>
          <div className='max-w-7xl mx-auto space-y-6'>
            {/* Stats Cards - Modern Design */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {loading ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse'
                    >
                      <div className='h-10 w-10 bg-gray-200 rounded-lg mb-3'></div>
                      <div className='h-6 w-12 bg-gray-200 rounded mb-2'></div>
                      <div className='h-3 w-20 bg-gray-200 rounded'></div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className='group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-105 hover:border-blue-200 transition-all duration-300'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200'>
                        <i className='ri-folder-3-line text-white text-xl'></i>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-600'>
                          Toplam Set
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {stats.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-105 hover:border-green-200 transition-all duration-300'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-200'>
                        <i className='ri-checkbox-circle-line text-white text-xl'></i>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-600'>
                          Tamamlanan
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {stats.completed}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-105 hover:border-yellow-200 transition-all duration-300'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200'>
                        <i className='ri-time-line text-white text-xl'></i>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-600'>
                          Devam Eden
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {stats.active}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-105 hover:border-red-200 transition-all duration-300'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200'>
                        <i className='ri-lock-line text-white text-xl'></i>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-600'>
                          Kilitli
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {stats.locked}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Filters - Sticky & Modern */}
            <div className='sticky top-16 z-10 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 p-4'>
              <div className='flex flex-col md:flex-row gap-3'>
                <div className='flex-1'>
                  <label className='block text-xs font-semibold text-gray-700 mb-1'>
                    <i className='ri-search-line mr-1'></i>
                    Ara
                  </label>
                  <div className='relative'>
                    <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm'></i>
                    <input
                      type='text'
                      placeholder='Eğitim seti ara...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm'
                    />
                  </div>
                </div>
                <div className='w-full md:w-48'>
                  <label className='block text-xs font-semibold text-gray-700 mb-1'>
                    <i className='ri-folder-line mr-1'></i>
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium'
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='w-full md:w-48'>
                  <label className='block text-xs font-semibold text-gray-700 mb-1'>
                    <i className='ri-filter-line mr-1'></i>
                    Durum
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium'
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(searchTerm ||
                selectedCategory !== 'all' ||
                selectedStatus !== 'all') && (
                <div className='mt-3 flex items-center justify-between'>
                  <p className='text-xs text-gray-600'>
                    <span className='font-semibold text-blue-600'>
                      {filteredSets.length}
                    </span>{' '}
                    sonuç bulundu
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                    }}
                    className='text-xs text-gray-600 hover:text-blue-600 font-medium transition-colors'
                  >
                    <i className='ri-close-circle-line mr-1'></i>
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className='flex items-center justify-center py-20'>
                <div className='text-center'>
                  <div className='relative w-20 h-20 mx-auto mb-6'>
                    <div className='absolute inset-0 border-4 border-blue-200 rounded-full'></div>
                    <div className='absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                  </div>
                  <p className='text-lg font-medium text-gray-600'>
                    Eğitim setleri yükleniyor...
                  </p>
                  <p className='text-sm text-gray-500 mt-2'>Lütfen bekleyin</p>
                </div>
              </div>
            ) : error ? (
              <div className='bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 rounded-2xl p-12 text-center'>
                <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                  <i className='ri-error-warning-line text-red-600 text-4xl'></i>
                </div>
                <h3 className='text-2xl font-bold text-red-900 mb-3'>
                  Hata Oluştu
                </h3>
                <p className='text-red-700 mb-6 text-lg'>{error}</p>
                <button
                  onClick={fetchEducationSets}
                  className='inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:scale-105 shadow-lg'
                >
                  <i className='ri-refresh-line'></i>
                  Tekrar Dene
                </button>
              </div>
            ) : filteredSets.length === 0 ? (
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center'>
                <div className='w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                  <i className='ri-video-line text-gray-400 text-5xl'></i>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                  {searchTerm ||
                  selectedCategory !== 'all' ||
                  selectedStatus !== 'all'
                    ? 'Sonuç bulunamadı'
                    : 'Henüz eğitim seti bulunmuyor'}
                </h3>
                <p className='text-gray-600 mb-8 text-lg max-w-md mx-auto'>
                  {searchTerm ||
                  selectedCategory !== 'all' ||
                  selectedStatus !== 'all'
                    ? 'Farklı filtreler deneyebilir veya arama teriminizi değiştirebilirsiniz.'
                    : 'Size henüz video eğitim seti atanmamış. Yöneticinizle iletişime geçebilirsiniz.'}
                </p>
                {(searchTerm ||
                  selectedCategory !== 'all' ||
                  selectedStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                    }}
                    className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg'
                  >
                    <i className='ri-refresh-line'></i>
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
      </div>
    </FirmaLayout>
  );
}
