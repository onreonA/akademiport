'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
interface CompanyDetail {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  total_assignments: number;
  completed_assignments: number;
  average_progress: number;
  last_activity: string;
}
interface AssignmentDetail {
  id: string;
  set_name: string;
  set_category: string;
  status: string;
  progress_percentage: number;
  assigned_at: string;
  completed_at: string | null;
  notes: string;
}
interface VideoProgress {
  video_id: string;
  video_title: string;
  watched_duration: number;
  total_duration: number;
  completed: boolean;
  last_watched: string;
}
interface DocumentProgress {
  document_id: string;
  document_title: string;
  downloaded: boolean;
  viewed: boolean;
  last_accessed: string;
}
export default function CompanyDetailReport() {
  const params = useParams();
  const companyId = params.id as string;
  const [companyDetail, setCompanyDetail] = useState<CompanyDetail | null>(
    null
  );
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
  const [documentProgress, setDocumentProgress] = useState<DocumentProgress[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'assignments' | 'videos' | 'documents'
  >('overview');
  useEffect(() => {
    if (companyId) {
      fetchCompanyDetail();
      fetchAssignments();
      fetchVideoProgress();
      fetchDocumentProgress();
    }
  }, [
    companyId,
    fetchAssignments,
    fetchCompanyDetail,
    fetchVideoProgress,
    fetchDocumentProgress,
  ]);
  const fetchCompanyDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/company-detail/${companyId}`, {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompanyDetail(result.data);
        }
      }
    } catch (err) {}
  }, [companyId]);
  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/assignment-history?company_id=${companyId}`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAssignments(result.data || []);
        }
      }
    } catch (err) {}
  }, [companyId]);
  const fetchVideoProgress = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/video-progress?company_id=${companyId}`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVideoProgress(result.data || []);
        }
      }
    } catch (err) {}
  }, [companyId]);
  const fetchDocumentProgress = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/document-progress?company_id=${companyId}`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDocumentProgress(result.data || []);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [companyId]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getProgressColor = (percentage: number) => {
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
          <p className='text-gray-600'>Firma detayları yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-2xl'></i>
          </div>
          <h3 className='text-lg font-medium text-red-900 mb-2'>Hata Oluştu</h3>
          <p className='text-red-700 mb-6'>{error}</p>
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
                href='/admin/egitim-yonetimi/raporlar'
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
                  href='/admin/egitim-yonetimi/raporlar'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Raporlar
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>Firma Detayı</span>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Company Header */}
          {companyDetail && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                    {companyDetail.name}
                  </h1>
                  <p className='text-gray-600'>{companyDetail.email}</p>
                </div>
                <div className='flex items-center gap-4'>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(companyDetail.status)}`}
                  >
                    {companyDetail.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                  <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                    <i className='ri-download-line mr-2'></i>
                    Rapor İndir
                  </button>
                </div>
              </div>
              {/* Quick Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {companyDetail.total_assignments}
                  </div>
                  <div className='text-sm text-gray-600'>Toplam Atama</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {companyDetail.completed_assignments}
                  </div>
                  <div className='text-sm text-gray-600'>Tamamlanan</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {companyDetail.average_progress}%
                  </div>
                  <div className='text-sm text-gray-600'>Ortalama İlerleme</div>
                </div>
                <div className='text-center'>
                  <div className='text-sm text-gray-600'>Son Aktivite</div>
                  <div className='text-sm font-medium text-gray-900'>
                    {new Date(companyDetail.last_activity).toLocaleDateString(
                      'tr-TR'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Tabs */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-8'>
            <div className='border-b border-gray-200'>
              <nav className='flex space-x-8 px-6'>
                {[
                  {
                    id: 'overview',
                    label: 'Genel Bakış',
                    icon: 'ri-dashboard-line',
                  },
                  {
                    id: 'assignments',
                    label: 'Atamalar',
                    icon: 'ri-list-check',
                  },
                  {
                    id: 'videos',
                    label: 'Video İlerleme',
                    icon: 'ri-video-line',
                  },
                  {
                    id: 'documents',
                    label: 'Döküman İlerleme',
                    icon: 'ri-file-text-line',
                  },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className={tab.icon}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className='p-6'>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        İlerleme Özeti
                      </h3>
                      <div className='space-y-3'>
                        {assignments.map(assignment => (
                          <div
                            key={assignment.id}
                            className='flex items-center justify-between'
                          >
                            <span className='text-sm text-gray-600'>
                              {assignment.set_name}
                            </span>
                            <div className='flex items-center gap-2'>
                              <div className='w-20 bg-gray-200 rounded-full h-2'>
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(assignment.progress_percentage)}`}
                                  style={{
                                    width: `${assignment.progress_percentage}%`,
                                  }}
                                ></div>
                              </div>
                              <span className='text-sm font-medium text-gray-900'>
                                {assignment.progress_percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Son Aktiviteler
                      </h3>
                      <div className='space-y-3'>
                        {assignments.slice(0, 5).map(assignment => (
                          <div
                            key={assignment.id}
                            className='flex items-center justify-between'
                          >
                            <div>
                              <div className='text-sm font-medium text-gray-900'>
                                {assignment.set_name}
                              </div>
                              <div className='text-xs text-gray-600'>
                                {new Date(
                                  assignment.assigned_at
                                ).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}
                            >
                              {assignment.status === 'completed'
                                ? 'Tamamlandı'
                                : assignment.status === 'active'
                                  ? 'Aktif'
                                  : 'Beklemede'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Eğitim Seti
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Kategori
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Durum
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          İlerleme
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Atama Tarihi
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Tamamlanma
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(assignment => (
                        <tr
                          key={assignment.id}
                          className='border-b border-gray-100 hover:bg-gray-50'
                        >
                          <td className='py-3 px-4'>
                            <div className='font-medium text-gray-900'>
                              {assignment.set_name}
                            </div>
                          </td>
                          <td className='py-3 px-4'>
                            <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              {assignment.set_category}
                            </span>
                          </td>
                          <td className='py-3 px-4'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}
                            >
                              {assignment.status === 'completed'
                                ? 'Tamamlandı'
                                : assignment.status === 'active'
                                  ? 'Aktif'
                                  : 'Beklemede'}
                            </span>
                          </td>
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-2'>
                              <div className='w-16 bg-gray-200 rounded-full h-2'>
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(assignment.progress_percentage)}`}
                                  style={{
                                    width: `${assignment.progress_percentage}%`,
                                  }}
                                ></div>
                              </div>
                              <span className='text-sm font-medium text-gray-900'>
                                {assignment.progress_percentage}%
                              </span>
                            </div>
                          </td>
                          <td className='py-3 px-4 text-sm text-gray-600'>
                            {new Date(
                              assignment.assigned_at
                            ).toLocaleDateString('tr-TR')}
                          </td>
                          <td className='py-3 px-4 text-sm text-gray-600'>
                            {assignment.completed_at
                              ? new Date(
                                  assignment.completed_at
                                ).toLocaleDateString('tr-TR')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Video
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          İzlenme Durumu
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          İzlenme Süresi
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Son İzleme
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {videoProgress.map(video => (
                        <tr
                          key={video.video_id}
                          className='border-b border-gray-100 hover:bg-gray-50'
                        >
                          <td className='py-3 px-4'>
                            <div className='font-medium text-gray-900'>
                              {video.video_title}
                            </div>
                          </td>
                          <td className='py-3 px-4'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                video.completed
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-yellow-600 bg-yellow-100'
                              }`}
                            >
                              {video.completed ? 'Tamamlandı' : 'Devam Ediyor'}
                            </span>
                          </td>
                          <td className='py-3 px-4 text-sm text-gray-600'>
                            {Math.round(
                              (video.watched_duration / video.total_duration) *
                                100
                            )}
                            %
                          </td>
                          <td className='py-3 px-4 text-sm text-gray-600'>
                            {new Date(video.last_watched).toLocaleDateString(
                              'tr-TR'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Döküman
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          İndirme
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Görüntüleme
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>
                          Son Erişim
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentProgress.map(document => (
                        <tr
                          key={document.document_id}
                          className='border-b border-gray-100 hover:bg-gray-50'
                        >
                          <td className='py-3 px-4'>
                            <div className='font-medium text-gray-900'>
                              {document.document_title}
                            </div>
                          </td>
                          <td className='py-3 px-4'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                document.downloaded
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-gray-600 bg-gray-100'
                              }`}
                            >
                              {document.downloaded
                                ? 'İndirildi'
                                : 'İndirilmedi'}
                            </span>
                          </td>
                          <td className='py-3 px-4'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                document.viewed
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-gray-600 bg-gray-100'
                              }`}
                            >
                              {document.viewed
                                ? 'Görüntülendi'
                                : 'Görüntülenmedi'}
                            </span>
                          </td>
                          <td className='py-3 px-4 text-sm text-gray-600'>
                            {document.last_accessed
                              ? new Date(
                                  document.last_accessed
                                ).toLocaleDateString('tr-TR')
                              : '-'}
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
      </div>
    </div>
  );
}
