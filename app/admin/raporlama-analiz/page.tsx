'use client';

import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ConsolidatedReport {
  id: string;
  title: string;
  content: string;
  type: string;
  report_type: 'regular' | 'sub_project_evaluation';
  type_display: string;
  status: string;
  created_at: string;
  companies?: {
    id: string;
    name: string;
    sector: string;
  };
  users?: {
    id: string;
    name: string;
    email: string;
  };
  sub_project_completions?: {
    sub_projects: {
      name: string;
      projects: {
        name: string;
      };
    };
    companies: {
      name: string;
    };
  };
  evaluation_score?: number;
}

export default function RaporlamaAnaliz() {
  const [reports, setReports] = useState<ConsolidatedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'regular' | 'evaluation'>(
    'all'
  );
  const [selectedReport, setSelectedReport] =
    useState<ConsolidatedReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchConsolidatedReports();
  }, []);

  const fetchConsolidatedReports = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/reports/consolidated', {
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
      console.error('Error fetching consolidated reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: ConsolidatedReport) => {
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
    switch (activeTab) {
      case 'regular':
        return reports.filter(report => report.report_type === 'regular');
      case 'evaluation':
        return reports.filter(
          report => report.report_type === 'sub_project_evaluation'
        );
      default:
        return reports;
    }
  };

  const getReportTypeIcon = (reportType: string) => {
    switch (reportType) {
      case 'sub_project_evaluation':
        return 'ri-file-text-line';
      case 'regular':
        return 'ri-bar-chart-line';
      default:
        return 'ri-file-line';
    }
  };

  const getReportTypeColor = (reportType: string) => {
    switch (reportType) {
      case 'sub_project_evaluation':
        return 'bg-blue-100 text-blue-800';
      case 'regular':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout title='Raporlama & Analiz'>
        <div className='flex items-center justify-center h-64'>
          <LoadingSpinner size='lg' />
        </div>
      </AdminLayout>
    );
  }

  const filteredReports = getFilteredReports();
  const regularCount = reports.filter(r => r.report_type === 'regular').length;
  const evaluationCount = reports.filter(
    r => r.report_type === 'sub_project_evaluation'
  ).length;

  return (
    <AdminLayout title='Raporlama & Analiz'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Kapsamlı Raporlama & Analiz
              </h1>
              <p className='text-gray-600 mt-1'>
                Tüm rapor türlerini tek yerden görüntüleyin ve analiz edin
              </p>
            </div>
            <div className='flex space-x-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-blue-600'>
                  {reports.length}
                </div>
                <div className='text-sm text-gray-500'>Toplam Rapor</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600'>
                  {regularCount}
                </div>
                <div className='text-sm text-gray-500'>Genel Rapor</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-purple-600'>
                  {evaluationCount}
                </div>
                <div className='text-sm text-gray-500'>Değerlendirme</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8 px-6'>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tüm Raporlar ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('regular')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'regular'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Genel Raporlar ({regularCount})
              </button>
              <button
                onClick={() => setActiveTab('evaluation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'evaluation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Alt Proje Değerlendirmeleri ({evaluationCount})
              </button>
            </nav>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
            <div className='text-gray-500 text-lg'>
              {activeTab === 'all'
                ? 'Henüz rapor bulunmuyor'
                : activeTab === 'regular'
                  ? 'Genel rapor bulunmuyor'
                  : 'Alt proje değerlendirme raporu bulunmuyor'}
            </div>
            <p className='text-gray-400 mt-2'>
              {activeTab === 'evaluation'
                ? 'Firmalar alt projelerini tamamladığında danışmanlar değerlendirme raporu hazırlayacak'
                : 'Yeni raporlar burada görünecek'}
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
                      <i
                        className={`${getReportTypeIcon(report.report_type)} text-xl text-gray-600`}
                      ></i>
                      <h3 className='text-xl font-semibold text-gray-900'>
                        {report.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(report.report_type)}`}
                      >
                        {report.type_display}
                      </span>
                      {report.evaluation_score && (
                        <div className='flex items-center space-x-1'>
                          <div className='flex items-center'>
                            {[...Array(10)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${
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
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                      <div>
                        <label className='text-sm font-medium text-gray-500'>
                          {report.report_type === 'sub_project_evaluation'
                            ? 'Alt Proje'
                            : 'Rapor Türü'}
                        </label>
                        <p className='text-sm text-gray-900'>
                          {report.report_type === 'sub_project_evaluation'
                            ? report.sub_project_completions?.sub_projects.name
                            : report.type}
                        </p>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-500'>
                          {report.report_type === 'sub_project_evaluation'
                            ? 'Ana Proje'
                            : 'Firma'}
                        </label>
                        <p className='text-sm text-gray-900'>
                          {report.report_type === 'sub_project_evaluation'
                            ? report.sub_project_completions?.sub_projects
                                .projects.name
                            : report.companies?.name || 'Genel'}
                        </p>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-500'>
                          Oluşturan
                        </label>
                        <p className='text-sm text-gray-900'>
                          {report.users?.name || 'Sistem'}
                        </p>
                      </div>
                    </div>

                    <div className='text-sm text-gray-600 mb-4'>
                      {report.content && report.content.length > 200
                        ? `${report.content.substring(0, 200)}...`
                        : report.content || 'İçerik bulunmuyor'}
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-gray-500'>
                        Oluşturulma Tarihi: {formatDate(report.created_at)}
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
    </AdminLayout>
  );
}

// Report Detail Modal Component
function ReportDetailModal({
  report,
  isOpen,
  onClose,
}: {
  report: ConsolidatedReport;
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
                <span className='text-gray-500'>Rapor Türü:</span>
                <p className='font-medium'>{report.type_display}</p>
              </div>
              <div>
                <span className='text-gray-500'>Firma:</span>
                <p className='font-medium'>
                  {report.companies?.name ||
                    report.sub_project_completions?.companies.name ||
                    'Genel'}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>Oluşturan:</span>
                <p className='font-medium'>{report.users?.name || 'Sistem'}</p>
              </div>
              <div>
                <span className='text-gray-500'>Tarih:</span>
                <p className='font-medium'>{formatDate(report.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold text-gray-900 mb-3'>
              Rapor İçeriği
            </h4>
            <div className='prose max-w-none text-gray-700'>
              {report.content ? (
                report.content.split('\n').map((paragraph, index) => (
                  <p key={index} className='mb-3'>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className='text-gray-500 italic'>İçerik bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between pt-6 border-t'>
            <div className='text-sm text-gray-500'>
              <p>Rapor ID: {report.id}</p>
              <p>Durum: {report.status || 'Aktif'}</p>
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
