'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
interface ReportSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overallProgress: number;
  totalSubProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalCompanies: number;
}
interface ProjectReport {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  subProjectCount: number;
  completedSubProjects: number;
  totalTasks: number;
  completedTasks: number;
}
interface TaskStatistics {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  averageProgress: number;
}
interface CompanyPerformance {
  [companyName: string]: {
    totalProjects: number;
    averageProgress: number;
    projects: Array<{
      projectName: string;
      progress: number;
      assignedDate: string;
    }>;
  };
}
interface ReportData {
  summary: ReportSummary;
  projects: ProjectReport[];
  taskStatistics: TaskStatistics;
  companyPerformance: CompanyPerformance;
  timeRange: number;
}
export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedProject, setSelectedProject] = useState<string>('');
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        timeRange: timeRange,
      });
      if (selectedProject) {
        params.append('projectId', selectedProject);
      }
      const response = await fetch(`/api/reports/project-progress?${params}`, {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
      } else {
        setError('Rapor verileri yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('Rapor verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedProject]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-blue-100 text-blue-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Rapor verileri yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error || !reportData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-3xl'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-gray-500 mb-6'>{error}</p>
          <button
            onClick={fetchReportData}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <nav className='flex' aria-label='Breadcrumb'>
                <ol className='flex items-center space-x-4'>
                  <li>
                    <Link
                      href='/admin/dashboard'
                      className='text-gray-400 hover:text-gray-500'
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <div className='flex items-center'>
                      <i className='ri-arrow-right-s-line text-gray-400'></i>
                      <span className='ml-4 text-gray-900 font-medium'>
                        Raporlar
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className='text-3xl font-bold text-gray-900 mt-2'>
                Proje İlerleme Raporları
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Son {reportData.timeRange} günlük detaylı analiz
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='7'>Son 7 Gün</option>
                <option value='30'>Son 30 Gün</option>
                <option value='90'>Son 90 Gün</option>
                <option value='365'>Son 1 Yıl</option>
              </select>
              <button
                onClick={fetchReportData}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              >
                Raporu Yenile
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Özet İstatistikleri */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-folder-line text-blue-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Toplam Proje
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {reportData.summary.totalProjects}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-check-line text-green-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Genel İlerleme
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {reportData.summary.overallProgress}%
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-task-line text-purple-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Tamamlanan Görev
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {reportData.summary.completedTasks}/
                  {reportData.summary.totalTasks}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-building-line text-orange-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Aktif Firma</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {reportData.summary.totalCompanies}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Proje Listesi */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-8'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Proje Detayları
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Proje Adı
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Durum
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    İlerleme
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Alt Projeler
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Görevler
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tarih Aralığı
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {reportData.projects.map(project => (
                  <tr key={project.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {project.name}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='w-16 bg-gray-200 rounded-full h-2 mr-3'>
                          <div
                            className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className='text-sm text-gray-900'>
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {project.completedSubProjects}/{project.subProjectCount}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {project.completedTasks}/{project.totalTasks}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {project.startDate} - {project.endDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Görev İstatistikleri ve Firma Performansı */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Görev İstatistikleri */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Görev İstatistikleri
            </h3>
            <div className='space-y-6'>
              <div>
                <h4 className='text-md font-medium text-gray-900 mb-3'>
                  Duruma Göre
                </h4>
                <div className='space-y-2'>
                  {Object.entries(reportData.taskStatistics.byStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className='flex justify-between items-center'
                      >
                        <span className='text-sm text-gray-600'>{status}</span>
                        <div className='flex items-center gap-2'>
                          <div className='w-20 bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${getProgressColor((count / reportData.summary.totalTasks) * 100)}`}
                              style={{
                                width: `${(count / reportData.summary.totalTasks) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className='text-sm font-medium text-gray-900 w-8 text-right'>
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className='text-md font-medium text-gray-900 mb-3'>
                  Öncelik Dağılımı
                </h4>
                <div className='space-y-2'>
                  {Object.entries(reportData.taskStatistics.byPriority).map(
                    ([priority, count]) => (
                      <div
                        key={priority}
                        className='flex justify-between items-center'
                      >
                        <span className='text-sm text-gray-600'>
                          {priority}
                        </span>
                        <div className='flex items-center gap-2'>
                          <div className='w-20 bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${getProgressColor((count / reportData.summary.totalTasks) * 100)}`}
                              style={{
                                width: `${(count / reportData.summary.totalTasks) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className='text-sm font-medium text-gray-900 w-8 text-right'>
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Firma Performansı */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Firma Performansı
            </h3>
            <div className='space-y-4'>
              {Object.entries(reportData.companyPerformance).map(
                ([companyName, performance]) => (
                  <div
                    key={companyName}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-center mb-3'>
                      <h4 className='font-medium text-gray-900'>
                        {companyName}
                      </h4>
                      <span className='text-sm text-gray-500'>
                        {performance.totalProjects} proje
                      </span>
                    </div>
                    <div className='flex items-center gap-3 mb-2'>
                      <span className='text-sm text-gray-600'>
                        Ortalama İlerleme:
                      </span>
                      <div className='flex-1 bg-gray-200 rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full ${getProgressColor(performance.averageProgress)}`}
                          style={{ width: `${performance.averageProgress}%` }}
                        ></div>
                      </div>
                      <span className='text-sm font-medium text-gray-900'>
                        {performance.averageProgress}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
