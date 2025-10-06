'use client';

import { useCallback, useEffect, useState } from 'react';

import CompanyReportCard from '@/components/firma/CompanyReportCard';

interface Report {
  id: string;
  subProject: {
    id: string;
    name: string;
    description: string;
    projectName: string;
    projectId: string;
  };
  consultant: {
    id: string;
    name: string;
  };
  ratings: {
    overall: number;
    quality: number;
    timeliness: number;
    communication: number;
    average: number;
  };
  statistics: {
    taskCompletionRate: number;
    totalTasks: number;
    completedTasks: number;
    delayedTasks: number;
  };
  dates: {
    completionDate: string;
    createdAt: string;
  };
}

interface ReportsResponse {
  reports: Report[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function CompanyReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filterRating, setFilterRating] = useState<string>('all');

  const pageSize = 9;

  const fetchReports = useCallback(
    async (page: number = 1, search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const offset = (page - 1) * pageSize;
        let url = `/api/firma/sub-project-reports?limit=${pageSize}&offset=${offset}`;

        if (search.trim()) {
          // Note: API doesn't support search yet, but we'll add it here for future
          url += `&search=${encodeURIComponent(search.trim())}`;
        }

        const response = await fetch(url, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Raporlar yüklenirken hata oluştu');
        }

        const data: ReportsResponse = await response.json();

        if (page === 1) {
          setReports(data.reports);
        } else {
          setReports(prev => [...prev, ...data.reports]);
        }

        setTotalReports(data.total);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchReports(1, searchTerm);
    setCurrentPage(1);
  }, [fetchReports, searchTerm]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchReports(nextPage, searchTerm);
  };

  // Filter reports based on rating
  const filteredReports = reports.filter(report => {
    if (filterRating === 'all') return true;
    if (filterRating === 'excellent') return report.ratings.average >= 4.5;
    if (filterRating === 'good')
      return report.ratings.average >= 3.5 && report.ratings.average < 4.5;
    if (filterRating === 'average')
      return report.ratings.average >= 2.5 && report.ratings.average < 3.5;
    if (filterRating === 'poor') return report.ratings.average < 2.5;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: reports.length,
    averageRating:
      reports.length > 0
        ? reports.reduce((sum, report) => sum + report.ratings.average, 0) /
          reports.length
        : 0,
    excellentCount: reports.filter(r => r.ratings.average >= 4.5).length,
    goodCount: reports.filter(
      r => r.ratings.average >= 3.5 && r.ratings.average < 4.5
    ).length,
    averageCount: reports.filter(
      r => r.ratings.average >= 2.5 && r.ratings.average < 3.5
    ).length,
    poorCount: reports.filter(r => r.ratings.average < 2.5).length,
  };

  if (loading && reports.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Statistics Overview */}
      {reports.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Toplam Rapor
                </p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Ortalama Puan
                </p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-yellow-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-yellow-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Mükemmel</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {stats.excellentCount}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-purple-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>İyi</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {stats.goodCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg
                className='h-5 w-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Proje adı ile ara...'
            />
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <span className='text-sm text-gray-700'>Filtrele:</span>
          <select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value)}
            className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='all'>Tüm Raporlar</option>
            <option value='excellent'>Mükemmel (4.5+)</option>
            <option value='good'>İyi (3.5-4.4)</option>
            <option value='average'>Orta (2.5-3.4)</option>
            <option value='poor'>Gelişmeli (2.5-)</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className='text-center py-12'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            {reports.length === 0
              ? 'Henüz rapor yok'
              : 'Filtre kriterlerine uygun rapor bulunamadı'}
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            {reports.length === 0
              ? 'Tamamladığınız alt projeler için değerlendirme raporları burada görünecek.'
              : 'Farklı filtre seçeneklerini deneyebilirsiniz.'}
          </p>
        </div>
      ) : (
        <>
          {/* Reports Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {filteredReports.map(report => (
              <CompanyReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && filteredReports.length === reports.length && (
            <div className='flex justify-center pt-6'>
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className='inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2'></div>
                    Yükleniyor...
                  </>
                ) : (
                  'Daha Fazla Göster'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
