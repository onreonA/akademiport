'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
interface EducationStats {
  total_sets: number;
  total_videos: number;
  total_documents: number;
  total_companies: number;
  active_assignments: number;
  completed_assignments: number;
  average_progress: number;
}
interface CompanyProgress {
  id: string;
  name: string;
  email: string;
  total_assigned: number;
  completed_sets: number;
  progress_percentage: number;
  last_activity: string;
}
interface SetPerformance {
  id: string;
  name: string;
  category: string;
  video_count: number;
  document_count: number;
  assigned_companies: number;
  average_completion: number;
  total_views: number;
}
export default function AdminReportsPage() {
  const [stats, setStats] = useState<EducationStats | null>(null);
  const [companyProgress, setCompanyProgress] = useState<CompanyProgress[]>([]);
  const [setPerformance, setSetPerformance] = useState<SetPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedCategory]);
  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Fetch statistics
      const statsResponse = await fetch('/api/admin/education-stats', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }
      // Fetch company progress
      const progressResponse = await fetch('/api/admin/company-progress', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        if (progressData.success) {
          setCompanyProgress(progressData.data || []);
        }
      }
      // Fetch set performance
      const performanceResponse = await fetch('/api/admin/set-performance', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        if (performanceData.success) {
          setSetPerformance(performanceData.data || []);
        }
      }
    } catch (err) {
      setError('Rapor verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link
                href='/admin/egitim-yonetimi'
                className='flex items-center gap-2 text-gray-600 hover:text-blue-600'
              >
                <i className='ri-arrow-left-line'></i>
                <span>Geri Dön</span>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <Link
                  href='/admin/egitim-yonetimi'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Eğitim Yönetimi
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>Raporlar</span>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Eğitim Raporları
              </h1>
              <p className='text-gray-600'>
                Firma ve eğitim seti bazlı detaylı raporlar
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='7'>Son 7 Gün</option>
                <option value='30'>Son 30 Gün</option>
                <option value='90'>Son 90 Gün</option>
                <option value='365'>Son 1 Yıl</option>
              </select>
              <Link
                href='/admin/egitim-yonetimi/raporlar/atama-gecmisi'
                className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              >
                <i className='ri-history-line mr-2'></i>
                Atama Geçmişi
              </Link>
              <button
                onClick={fetchReportData}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              >
                <i className='ri-refresh-line mr-2'></i>
                Yenile
              </button>
            </div>
          </div>
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <i className='ri-error-warning-line text-red-600'></i>
                <p className='text-red-800'>{error}</p>
              </div>
            </div>
          )}
          {/* Statistics Grid */}
          {stats && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Toplam Eğitim Seti
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {stats.total_sets}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-folder-line text-blue-600 text-xl'></i>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Toplam Video
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {stats.total_videos}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-video-line text-purple-600 text-xl'></i>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Toplam Döküman
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {stats.total_documents}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-file-text-line text-green-600 text-xl'></i>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Aktif Firma
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {stats.total_companies}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-building-line text-orange-600 text-xl'></i>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Progress Overview */}
          {stats && (
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Atama Durumu
                </h3>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>
                      Aktif Atamalar
                    </span>
                    <span className='font-semibold text-blue-600'>
                      {stats.active_assignments}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Tamamlanan</span>
                    <span className='font-semibold text-green-600'>
                      {stats.completed_assignments}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${stats.active_assignments > 0 ? (stats.completed_assignments / stats.active_assignments) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Ortalama İlerleme
                </h3>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-gray-900 mb-2'>
                    {stats.average_progress}%
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(stats.average_progress)}`}
                      style={{ width: `${stats.average_progress}%` }}
                    ></div>
                  </div>
                  <p className='text-sm text-gray-600 mt-2'>
                    Tüm firmaların ortalama ilerlemesi
                  </p>
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Hızlı İstatistikler
                </h3>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>
                      Tamamlanma Oranı
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(stats.average_progress)}`}
                    >
                      {stats.average_progress}%
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Aktif Atama</span>
                    <span className='text-sm font-medium text-blue-600'>
                      {stats.active_assignments}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Toplam İçerik</span>
                    <span className='text-sm font-medium text-gray-900'>
                      {stats.total_videos + stats.total_documents}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Company Progress Table */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Firma İlerleme Raporu
              </h3>
              <div className='flex items-center gap-2'>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='all'>Tüm Kategoriler</option>
                  <option value='B2B'>B2B</option>
                  <option value='B2C'>B2C</option>
                  <option value='Dijital'>Dijital</option>
                </select>
              </div>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Firma
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Atanan Set
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Tamamlanan
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      İlerleme
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Son Aktivite
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900'>
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companyProgress.map(company => (
                    <tr
                      key={company.id}
                      className='border-b border-gray-100 hover:bg-gray-50'
                    >
                      <td className='py-3 px-4'>
                        <div>
                          <div className='font-medium text-gray-900'>
                            {company.name}
                          </div>
                          <div className='text-sm text-gray-600'>
                            {company.email}
                          </div>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-gray-900'>
                        {company.total_assigned}
                      </td>
                      <td className='py-3 px-4 text-gray-900'>
                        {company.completed_sets}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <div className='w-16 bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${getProgressBarColor(company.progress_percentage)}`}
                              style={{
                                width: `${company.progress_percentage}%`,
                              }}
                            ></div>
                          </div>
                          <span className='text-sm font-medium text-gray-900'>
                            {company.progress_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-sm text-gray-600'>
                        {new Date(company.last_activity).toLocaleDateString(
                          'tr-TR'
                        )}
                      </td>
                      <td className='py-3 px-4'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(company.progress_percentage)}`}
                        >
                          {company.progress_percentage >= 80
                            ? 'Tamamlandı'
                            : company.progress_percentage >= 60
                              ? 'İyi İlerleme'
                              : company.progress_percentage >= 40
                                ? 'Orta İlerleme'
                                : 'Yavaş İlerleme'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Set Performance Grid */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Eğitim Seti Performansı
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {setPerformance.map(set => (
                <div
                  key={set.id}
                  className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-semibold text-gray-900'>{set.name}</h4>
                    <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {set.category}
                    </span>
                  </div>
                  <div className='space-y-2 mb-4'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Video Sayısı:</span>
                      <span className='font-medium'>{set.video_count}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Döküman Sayısı:</span>
                      <span className='font-medium'>{set.document_count}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Atanan Firma:</span>
                      <span className='font-medium'>
                        {set.assigned_companies}
                      </span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>
                        Ortalama Tamamlanma:
                      </span>
                      <span
                        className={`font-medium ${getProgressColor(set.average_completion)}`}
                      >
                        {set.average_completion}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${getProgressBarColor(set.average_completion)}`}
                        style={{ width: `${set.average_completion}%` }}
                      ></div>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Toplam Görüntüleme:</span>
                      <span className='font-medium'>{set.total_views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
