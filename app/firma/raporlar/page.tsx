'use client';

import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';

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
      <div className='space-y-4'>
        {/* Modern Compact Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
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
              <div>
                <h1 className='text-xl font-bold'>Değerlendirme Raporları</h1>
                <p className='text-blue-100 text-sm'>
                  Danışman değerlendirmelerinizi görüntüleyin
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-3xl font-bold text-white'>
                {reports.length}
              </div>
              <div className='text-sm text-blue-100'>Toplam Rapor</div>
            </div>
          </div>
        </div>

        {/* Modern Filter Tabs */}
        <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2'>
          <div className='flex space-x-2'>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tümü ({reports.length})
            </button>
            <button
              onClick={() => setFilterStatus('recent')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filterStatus === 'recent'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Son 30 Gün
            </button>
            <button
              onClick={() => setFilterStatus('high-score')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filterStatus === 'high-score'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Yüksek Puan (8+)
            </button>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-12 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-gray-400'
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
            <div className='text-gray-600 text-lg font-medium mb-2'>
              {filterStatus === 'all'
                ? 'Henüz değerlendirme raporu bulunmuyor'
                : filterStatus === 'recent'
                  ? 'Son 30 gün içinde rapor bulunmuyor'
                  : '8 ve üzeri puan alan rapor bulunmuyor'}
            </div>
            <p className='text-gray-500'>
              Alt projelerinizi tamamladığınızda danışmanlarınız değerlendirme
              raporu hazırlayacak
            </p>
          </div>
        ) : (
          <div className='grid gap-4'>
            {filteredReports.map(report => (
              <div
                key={report.id}
                className='bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center'>
                          <svg
                            className='w-5 h-5 text-white'
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
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {report.title}
                          </h3>
                          <div className='flex items-center space-x-2 text-sm text-gray-500'>
                            <span>Rapor #{report.id.slice(-6)}</span>
                            <span>•</span>
                            <span>{formatDate(report.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {report.evaluation_score && (
                          <div className='flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full'>
                            <div className='flex items-center'>
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.ceil(report.evaluation_score / 2)
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
                            <span className='text-xs font-medium text-gray-700'>
                              {report.evaluation_score}/10
                            </span>
                          </div>
                        )}
                        <StatusBadge status='published' />
                      </div>
                    </div>

                    <div className='flex items-center space-x-6 mb-4 p-3 bg-gray-50 rounded-lg'>
                      <div className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        <span className='text-sm text-gray-600'>
                          {report.sub_project_completions?.sub_projects?.name ||
                            'Bilinmeyen Alt Proje'}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <span className='text-sm text-gray-600'>
                          {report.sub_project_completions?.sub_projects
                            ?.projects?.name || 'Bilinmeyen Ana Proje'}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                        <span className='text-sm text-gray-600'>
                          %
                          {report.sub_project_completions
                            ?.completion_percentage || 0}{' '}
                          Tamamlandı
                        </span>
                      </div>
                    </div>

                    <div className='text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg'>
                      {report.content.length > 150
                        ? `${report.content.substring(0, 150)}...`
                        : report.content}
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4 text-sm text-gray-500'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center'>
                            <span className='text-xs font-medium text-white'>
                              {report.users?.name?.charAt(0) || 'D'}
                            </span>
                          </div>
                          <span>
                            {report.users?.name || 'Bilinmeyen Danışman'}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>

                      <button
                        onClick={() => handleViewReport(report)}
                        className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl'
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
    <div className='fixed inset-0 bg-white/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50'>
      <div className='relative top-5 mx-auto p-4 w-11/12 max-w-4xl shadow-xl rounded-xl bg-white border border-gray-200'>
        <div className='mt-2'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-5 h-5 text-white'
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
              <div>
                <h3 className='text-xl font-bold text-gray-900'>
                  {report.title}
                </h3>
                <p className='text-xs text-gray-500'>Değerlendirme Raporu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200'
            >
              <svg
                className='w-6 h-6 text-gray-400 hover:text-gray-600'
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
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2'>
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
                      d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                    />
                  </svg>
                </div>
                <p className='text-xs text-gray-500 mb-1'>Alt Proje</p>
                <p className='font-semibold text-gray-900 text-sm'>
                  {report.sub_project_completions?.sub_projects?.name ||
                    'Bilinmeyen Alt Proje'}
                </p>
              </div>
              <div className='text-center'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2'>
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
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <p className='text-xs text-gray-500 mb-1'>Ana Proje</p>
                <p className='font-semibold text-gray-900 text-sm'>
                  {report.sub_project_completions?.sub_projects?.projects
                    ?.name || 'Bilinmeyen Ana Proje'}
                </p>
              </div>
              <div className='text-center'>
                <div className='w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2'>
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
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                </div>
                <p className='text-xs text-gray-500 mb-1'>Tamamlanma</p>
                <p className='font-semibold text-gray-900 text-sm'>
                  %{report.sub_project_completions?.completion_percentage || 0}
                </p>
              </div>
              <div className='text-center'>
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2'>
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
                      d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                    />
                  </svg>
                </div>
                <p className='text-xs text-gray-500 mb-1'>Puan</p>
                <p className='font-semibold text-gray-900 text-sm'>
                  {report.evaluation_score}/10
                </p>
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
              <p>Danışman: {report.users?.name || 'Bilinmeyen Danışman'}</p>
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
