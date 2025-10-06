'use client';

import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EvaluationReport {
  id: string;
  title: string;
  content: string;
  evaluation_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  next_steps: string[];
  report_status: string;
  created_at: string;
  sub_project_completions: {
    completed_at: string;
    completion_percentage: number;
    sub_projects: {
      id: string;
      name: string;
      description: string;
      project_id: string;
      projects: {
        id: string;
        name: string;
      };
    };
  };
  users: {
    id: string;
    name: string;
    email: string;
  };
}

export default function FirmaRaporlar() {
  const [reports, setReports] = useState<EvaluationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<EvaluationReport | null>(
    null
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'recent' | 'high-score'
  >('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/firma/sub-project-reports', {
        headers: {
          'X-User-Email':
            document.cookie
              .split('; ')
              .find(row => row.startsWith('auth-user-email='))
              ?.split('=')[1] || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: EvaluationReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilteredReports = () => {
    let filtered = reports;

    switch (filterStatus) {
      case 'recent':
        filtered = reports.filter(report => {
          const reportDate = new Date(report.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return reportDate >= thirtyDaysAgo;
        });
        break;
      case 'high-score':
        filtered = reports.filter(report => report.evaluation_score >= 8);
        break;
      default:
        filtered = reports;
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  if (loading) {
    return (
      <FirmaLayout title='Değerlendirme Raporları'>
        <div className='flex items-center justify-center h-64'>
          <LoadingSpinner size='lg' />
        </div>
      </FirmaLayout>
    );
  }

  const filteredReports = getFilteredReports();

  return (
    <FirmaLayout title='Değerlendirme Raporları'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Alt Proje Değerlendirme Raporları
              </h1>
              <p className='text-gray-600 mt-1'>
                Danışmanlarınızın alt projeleriniz hakkındaki değerlendirme
                raporlarını görüntüleyin
              </p>
            </div>
            <div className='text-right'>
              <div className='text-3xl font-bold text-blue-600'>
                {reports.length}
              </div>
              <div className='text-sm text-gray-500'>Toplam Rapor</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8 px-6'>
              <button
                onClick={() => setFilterStatus('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filterStatus === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tüm Raporlar ({reports.length})
              </button>
              <button
                onClick={() => setFilterStatus('recent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filterStatus === 'recent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Son 30 Gün
              </button>
              <button
                onClick={() => setFilterStatus('high-score')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filterStatus === 'high-score'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Yüksek Puan (8+)
              </button>
            </nav>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
            <div className='text-gray-500 text-lg'>
              {filterStatus === 'all'
                ? 'Henüz değerlendirme raporu bulunmuyor'
                : filterStatus === 'recent'
                  ? 'Son 30 gün içinde rapor bulunmuyor'
                  : '8 ve üzeri puan alan rapor bulunmuyor'}
            </div>
            <p className='text-gray-400 mt-2'>
              Alt projelerinizi tamamladığınızda danışmanlarınız değerlendirme
              raporu hazırlayacak
            </p>
          </div>
        ) : (
          <div className='grid gap-6'>
            {filteredReports.map(report => (
              <div
                key={report.id}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <h3 className='text-xl font-semibold text-gray-900'>
                        {report.title}
                      </h3>
                      {report.evaluation_score && (
                        <div className='flex items-center space-x-2'>
                          <div className='flex items-center'>
                            {[...Array(10)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < report.evaluation_score
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                              </svg>
                            ))}
                          </div>
                          <span className='text-sm font-medium text-gray-900'>
                            {report.evaluation_score}/10
                          </span>
                        </div>
                      )}
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        Yayınlandı
                      </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                      <div>
                        <label className='text-sm font-medium text-gray-500'>
                          Alt Proje
                        </label>
                        <p className='text-sm text-gray-900'>
                          {report.sub_project_completions.sub_projects.name}
                        </p>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-500'>
                          Ana Proje
                        </label>
                        <p className='text-sm text-gray-900'>
                          {
                            report.sub_project_completions.sub_projects.projects
                              .name
                          }
                        </p>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-500'>
                          Tamamlanma Oranı
                        </label>
                        <p className='text-sm text-gray-900'>
                          %
                          {report.sub_project_completions.completion_percentage}
                        </p>
                      </div>
                    </div>

                    <div className='text-sm text-gray-600 mb-4'>
                      {report.content.length > 200
                        ? `${report.content.substring(0, 200)}...`
                        : report.content}
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-gray-500'>
                        Danışman: {report.users.name}
                        <br />
                        Rapor Tarihi: {formatDate(report.created_at)}
                      </div>

                      <button
                        onClick={() => handleViewReport(report)}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      >
                        <svg
                          className='w-4 h-4 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                        Detayları Gör
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
        />
      )}
    </FirmaLayout>
  );
}

// Report Detail Modal Component
function ReportDetailModal({
  report,
  isOpen,
  onClose,
}: {
  report: EvaluationReport;
  isOpen: boolean;
  onClose: () => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-2xl font-bold text-gray-900'>{report.title}</h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Report Info */}
          <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-500'>Alt Proje:</span>
                <p className='font-medium'>
                  {report.sub_project_completions.sub_projects.name}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>Ana Proje:</span>
                <p className='font-medium'>
                  {report.sub_project_completions.sub_projects.projects.name}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>Tamamlanma Oranı:</span>
                <p className='font-medium'>
                  %{report.sub_project_completions.completion_percentage}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>Değerlendirme Puanı:</span>
                <p className='font-medium'>{report.evaluation_score}/10</p>
              </div>
            </div>
          </div>

          {/* Score Display */}
          {report.evaluation_score && (
            <div className='mb-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                Değerlendirme Puanı
              </h4>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center'>
                  {[...Array(10)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${
                        i < report.evaluation_score
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <span className='text-xl font-bold text-gray-900'>
                  {report.evaluation_score}/10
                </span>
              </div>
            </div>
          )}

          {/* Report Content */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-900 mb-3'>
              Değerlendirme İçeriği
            </h4>
            <div className='prose max-w-none text-gray-700'>
              {report.content.split('\n').map((paragraph, index) => (
                <p key={index} className='mb-3'>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {report.strengths && report.strengths.length > 0 && (
            <div className='mb-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3'>
                Güçlü Yönler
              </h4>
              <div className='grid gap-2'>
                {report.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-2 p-3 bg-green-50 rounded-lg'
                  >
                    <svg
                      className='w-5 h-5 text-green-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className='text-green-800'>{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {report.weaknesses && report.weaknesses.length > 0 && (
            <div className='mb-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3'>
                Gelişim Alanları
              </h4>
              <div className='grid gap-2'>
                {report.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-2 p-3 bg-red-50 rounded-lg'
                  >
                    <svg
                      className='w-5 h-5 text-red-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
                      />
                    </svg>
                    <span className='text-red-800'>{weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div className='mb-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3'>
                Öneriler
              </h4>
              <div className='grid gap-2'>
                {report.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-2 p-3 bg-blue-50 rounded-lg'
                  >
                    <svg
                      className='w-5 h-5 text-blue-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                      />
                    </svg>
                    <span className='text-blue-800'>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {report.next_steps && report.next_steps.length > 0 && (
            <div className='mb-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3'>
                Sonraki Adımlar
              </h4>
              <div className='grid gap-2'>
                {report.next_steps.map((step, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg'
                  >
                    <svg
                      className='w-5 h-5 text-yellow-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                    <span className='text-yellow-800'>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='flex items-center justify-between pt-6 border-t'>
            <div className='text-sm text-gray-500'>
              <p>Danışman: {report.users.name}</p>
              <p>Rapor Tarihi: {formatDate(report.created_at)}</p>
            </div>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
