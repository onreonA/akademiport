'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Report {
  id: string;
  sub_project_id: string;
  company_id: string;
  consultant_id: string;
  completion_date: string;
  overall_rating: number;
  quality_score: number;
  timeliness_score: number;
  communication_score: number;
  task_completion_rate: number;
  created_at: string;
  sub_projects: {
    id: string;
    name: string;
    projects: {
      id: string;
      name: string;
    };
  };
  companies: {
    id: string;
    name: string;
  };
  users: {
    id: string;
    full_name: string;
  };
}

interface ReportsResponse {
  reports: Report[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function SubProjectReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const pageSize = 10;

  const fetchReports = useCallback(
    async (page: number = 1, search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const offset = (page - 1) * pageSize;
        let url = `/api/consultant/sub-project-reports?limit=${pageSize}&offset=${offset}`;

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

  const getGradeLetter = (score: number): string => {
    if (!score || score < 1) return 'F';
    if (score >= 4.5) return 'A+';
    if (score >= 4.0) return 'A';
    if (score >= 3.5) return 'B+';
    if (score >= 3.0) return 'B';
    if (score >= 2.5) return 'C+';
    if (score >= 2.0) return 'C';
    if (score >= 1.5) return 'D+';
    return 'D';
  };

  const getGradeColor = (score: number): string => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 4.0) return 'text-green-600 bg-green-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-100';
    if (score >= 3.0) return 'text-blue-600 bg-blue-100';
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100';
    if (score >= 2.0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center'>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
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
      {/* Search Bar */}
      <div className='flex items-center space-x-4'>
        <div className='flex-1'>
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
              placeholder='Proje, firma veya danışman adı ile ara...'
            />
          </div>
        </div>
        <div className='text-sm text-gray-500'>Toplam {totalReports} rapor</div>
      </div>

      {error ? (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      ) : reports.length === 0 ? (
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
            Henüz rapor yok
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Tamamlanan alt projeler için danışman değerlendirme raporları burada
            görünecek.
          </p>
        </div>
      ) : (
        <>
          {/* Reports Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {reports.map(report => (
              <div
                key={report.id}
                className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'
              >
                {/* Header */}
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {report.sub_projects?.name || 'Bilinmeyen Alt Proje'}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(report.overall_rating)}`}
                        >
                          {getGradeLetter(report.overall_rating)}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 mb-1'>
                        <span className='font-medium'>Ana Proje:</span>{' '}
                        {report.sub_projects?.projects?.name ||
                          'Bilinmeyen Proje'}
                      </p>
                      <p className='text-sm text-gray-600 mb-1'>
                        <span className='font-medium'>Firma:</span>{' '}
                        {report.companies?.name || 'Bilinmeyen Firma'}
                      </p>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>Danışman:</span>{' '}
                        {report.users?.full_name || 'Bilinmeyen Danışman'}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {report.overall_rating.toFixed(1)}
                      </div>
                      <div className='text-xs text-gray-500'>Genel Puan</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className='p-6'>
                  {/* Ratings */}
                  <div className='grid grid-cols-2 gap-3 mb-4'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>Kalite</span>
                      <div className='flex items-center space-x-1'>
                        {renderStars(report.quality_score)}
                        <span className='text-xs text-gray-500 ml-1'>
                          ({report.quality_score})
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>Zaman</span>
                      <div className='flex items-center space-x-1'>
                        {renderStars(report.timeliness_score)}
                        <span className='text-xs text-gray-500 ml-1'>
                          ({report.timeliness_score})
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>İletişim</span>
                      <div className='flex items-center space-x-1'>
                        {renderStars(report.communication_score)}
                        <span className='text-xs text-gray-500 ml-1'>
                          ({report.communication_score})
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>Tamamlama</span>
                      <span className='font-medium text-green-600'>
                        {report.task_completion_rate}%
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className='text-sm text-gray-600 mb-4'>
                    <div className='flex justify-between'>
                      <span>Rapor Tarihi:</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex justify-end pt-4 border-t border-gray-200'>
                    <Link
                      href={`/admin/alt-proje-raporlari/${report.id}`}
                      className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      Detayları Gör
                      <svg
                        className='ml-2 w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
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
