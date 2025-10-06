'use client';

import { useEffect, useState } from 'react';

interface CompanyComparison {
  company_id: string;
  company_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  avg_quality_score: number;
  avg_timeliness_score: number;
  avg_communication_score: number;
  overall_rating: number;
  started_at: string;
  completed_at: string | null;
  progress_notes: string;
}

interface SubProjectInfo {
  id: string;
  name: string;
  description: string;
  project_name: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface CompanyComparisonClientProps {
  subProjectId: string;
}

export default function CompanyComparisonClient({
  subProjectId,
}: CompanyComparisonClientProps) {
  const [subProject, setSubProject] = useState<SubProjectInfo | null>(null);
  const [comparisons, setComparisons] = useState<CompanyComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComparisonData();
  }, [subProjectId]);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/sub-projects/${subProjectId}/company-comparison`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Karşılaştırma verileri yüklenirken hata oluştu');
      }

      const data = await response.json();
      setSubProject(data.subProject);
      setComparisons(data.comparisons || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Karşılaştırma verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 mb-4'>
            <svg
              className='w-12 h-12 mx-auto'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Hata</h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={fetchComparisonData}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md'
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Firma Karşılaştırması
              </h1>
              <p className='mt-2 text-gray-600'>
                Alt proje performans analizi ve firma karşılaştırması
              </p>
            </div>
            <button
              onClick={() => window.close()}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md'
            >
              Kapat
            </button>
          </div>
        </div>

        {/* Sub Project Info */}
        {subProject && (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Alt Proje Bilgileri
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  {subProject.name}
                </h3>
                <p className='text-gray-600 mt-1'>{subProject.description}</p>
                <p className='text-sm text-gray-500 mt-2'>
                  Ana Proje: {subProject.project_name}
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium text-gray-700'>
                    Durum:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subProject.status === 'Tamamlandı'
                        ? 'bg-green-100 text-green-800'
                        : subProject.status === 'Aktif'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {subProject.status}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium text-gray-700'>
                    Başlangıç:
                  </span>
                  <span className='text-sm text-gray-600'>
                    {new Date(subProject.start_date).toLocaleDateString(
                      'tr-TR'
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm font-medium text-gray-700'>
                    Bitiş:
                  </span>
                  <span className='text-sm text-gray-600'>
                    {new Date(subProject.end_date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Comparisons */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Firma Performans Karşılaştırması
            </h2>
            <p className='text-gray-600 mt-1'>
              {comparisons.length} firma karşılaştırması
            </p>
          </div>

          {comparisons.length === 0 ? (
            <div className='p-8 text-center'>
              <div className='text-gray-400 mb-4'>
                <svg
                  className='w-12 h-12 mx-auto'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Karşılaştırma Verisi Bulunamadı
              </h3>
              <p className='text-gray-600'>
                Bu alt proje için henüz firma karşılaştırma verisi bulunmuyor.
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Firma
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Tamamlanma
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Kalite
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Zamanında Teslim
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      İletişim
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Genel Puan
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {comparisons.map(comparison => (
                    <tr
                      key={comparison.company_id}
                      className='hover:bg-gray-50'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {comparison.company_name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {comparison.completed_tasks}/{comparison.total_tasks}{' '}
                          görev
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
                            <div
                              className='bg-blue-600 h-2 rounded-full'
                              style={{
                                width: `${comparison.completion_rate}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-medium ${getCompletionColor(
                              comparison.completion_rate
                            )}`}
                          >
                            {comparison.completion_rate}%
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(
                            comparison.avg_quality_score
                          )}`}
                        >
                          {comparison.avg_quality_score.toFixed(1)}/5
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(
                            comparison.avg_timeliness_score
                          )}`}
                        >
                          {comparison.avg_timeliness_score.toFixed(1)}/5
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(
                            comparison.avg_communication_score
                          )}`}
                        >
                          {comparison.avg_communication_score.toFixed(1)}/5
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(
                            comparison.overall_rating
                          )}`}
                        >
                          {comparison.overall_rating.toFixed(1)}/5
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            comparison.completed_at
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {comparison.completed_at
                            ? 'Tamamlandı'
                            : 'Devam Ediyor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
