'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface CompanyReport {
  projectId: string;
  projectName: string;
  progress: number;
  status: string;
  assignedDate: string;
  totalTasks: number;
  completedTasks: number;
  averageTaskProgress: number;
}
interface CompanySummary {
  totalProjects: number;
  averageProgress: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  teamSize: number;
  activeUsers: number;
}
export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [companySummary, setCompanySummary] = useState<CompanySummary | null>(
    null
  );
  const [projectReports, setProjectReports] = useState<CompanyReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'quarter' | 'year'
  >('month');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  // Mock data for demonstration
  const mockSummary: CompanySummary = {
    totalProjects: 12,
    averageProgress: 68,
    totalTasks: 156,
    completedTasks: 98,
    pendingTasks: 45,
    overdueTasks: 13,
    teamSize: 8,
    activeUsers: 6,
  };
  const mockReports: CompanyReport[] = [
    {
      projectId: '1',
      projectName: 'E-ticaret Platformu',
      progress: 85,
      status: 'active',
      assignedDate: '2024-01-15',
      totalTasks: 45,
      completedTasks: 38,
      averageTaskProgress: 87,
    },
    {
      projectId: '2',
      projectName: 'Mobil Uygulama',
      progress: 62,
      status: 'active',
      assignedDate: '2024-02-01',
      totalTasks: 32,
      completedTasks: 20,
      averageTaskProgress: 65,
    },
    {
      projectId: '3',
      projectName: 'Web Sitesi Yenileme',
      progress: 100,
      status: 'completed',
      assignedDate: '2023-12-01',
      totalTasks: 28,
      completedTasks: 28,
      averageTaskProgress: 100,
    },
    {
      projectId: '4',
      projectName: 'API Geliştirme',
      progress: 45,
      status: 'active',
      assignedDate: '2024-02-15',
      totalTasks: 25,
      completedTasks: 11,
      averageTaskProgress: 48,
    },
    {
      projectId: '5',
      projectName: 'Veritabanı Optimizasyonu',
      progress: 78,
      status: 'active',
      assignedDate: '2024-01-20',
      totalTasks: 18,
      completedTasks: 14,
      averageTaskProgress: 82,
    },
    {
      projectId: '6',
      projectName: 'Güvenlik Güncellemesi',
      progress: 92,
      status: 'active',
      assignedDate: '2024-01-10',
      totalTasks: 8,
      completedTasks: 7,
      averageTaskProgress: 95,
    },
  ];
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCompanySummary(mockSummary);
        setProjectReports(mockReports);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedPeriod]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'paused':
        return 'Duraklatıldı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Raporlar'
        description='Proje ve görev raporlarını görüntüleyin'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Raporlar yükleniyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Raporlar'
      description='Proje ve görev raporlarını görüntüleyin'
    >
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              📊 Raporlar
            </h1>
            <p className='text-gray-600'>
              Proje ve görev raporlarını görüntüleyin
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value as any)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='week'>Bu Hafta</option>
              <option value='month'>Bu Ay</option>
              <option value='quarter'>Bu Çeyrek</option>
              <option value='year'>Bu Yıl</option>
            </select>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
              <i className='ri-download-line mr-2'></i>
              Rapor İndir
            </button>
          </div>
        </div>
        {/* Summary Cards */}
        {companySummary && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Toplam Proje
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {companySummary.totalProjects}
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
                    Ortalama İlerleme
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {companySummary.averageProgress}%
                  </p>
                </div>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-line-chart-line text-green-600 text-xl'></i>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Toplam Görev
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {companySummary.totalTasks}
                  </p>
                </div>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-task-line text-purple-600 text-xl'></i>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Aktif Kullanıcı
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {companySummary.activeUsers}/{companySummary.teamSize}
                  </p>
                </div>
                <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-user-line text-orange-600 text-xl'></i>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Task Statistics */}
        {companySummary && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Görev Durumu
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Tamamlanan</span>
                  <span className='font-medium text-green-600'>
                    {companySummary.completedTasks}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Bekleyen</span>
                  <span className='font-medium text-yellow-600'>
                    {companySummary.pendingTasks}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Geciken</span>
                  <span className='font-medium text-red-600'>
                    {companySummary.overdueTasks}
                  </span>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                İlerleme Dağılımı
              </h3>
              <div className='space-y-3'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Tamamlanan</span>
                    <span>
                      {Math.round(
                        (companySummary.completedTasks /
                          companySummary.totalTasks) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-600 h-2 rounded-full'
                      style={{
                        width: `${(companySummary.completedTasks / companySummary.totalTasks) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Bekleyen</span>
                    <span>
                      {Math.round(
                        (companySummary.pendingTasks /
                          companySummary.totalTasks) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-yellow-600 h-2 rounded-full'
                      style={{
                        width: `${(companySummary.pendingTasks / companySummary.totalTasks) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Geciken</span>
                    <span>
                      {Math.round(
                        (companySummary.overdueTasks /
                          companySummary.totalTasks) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-red-600 h-2 rounded-full'
                      style={{
                        width: `${(companySummary.overdueTasks / companySummary.totalTasks) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Hızlı İstatistikler
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    Ortalama Görev İlerlemesi
                  </span>
                  <span className='font-medium'>
                    {Math.round(
                      projectReports.reduce(
                        (acc, report) => acc + report.averageTaskProgress,
                        0
                      ) / projectReports.length
                    )}
                    %
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    En Yüksek İlerleme
                  </span>
                  <span className='font-medium text-green-600'>
                    {Math.max(...projectReports.map(r => r.progress))}%
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    En Düşük İlerleme
                  </span>
                  <span className='font-medium text-red-600'>
                    {Math.min(...projectReports.map(r => r.progress))}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Project Reports Table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Proje Raporları
              </h3>
              <div className='flex items-center gap-4'>
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='all'>Tüm Projeler</option>
                  {projectReports.map(report => (
                    <option key={report.projectId} value={report.projectId}>
                      {report.projectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Proje
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Durum
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    İlerleme
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Görevler
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Atama Tarihi
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {projectReports
                  .filter(
                    report =>
                      selectedProject === 'all' ||
                      report.projectId === selectedProject
                  )
                  .map(report => (
                    <tr key={report.projectId} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {report.projectName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            ID: {report.projectId}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                        >
                          {getStatusText(report.status)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-16 bg-gray-200 rounded-full h-2 mr-3'>
                            <div
                              className='bg-blue-600 h-2 rounded-full'
                              style={{ width: `${report.progress}%` }}
                            ></div>
                          </div>
                          <span className='text-sm text-gray-900'>
                            {report.progress}%
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        <div>
                          <div>
                            {report.completedTasks}/{report.totalTasks}{' '}
                            tamamlandı
                          </div>
                          <div className='text-xs text-gray-500'>
                            Ortalama: {report.averageTaskProgress}%
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatDate(report.assignedDate)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          <button className='text-blue-600 hover:text-blue-900'>
                            <i className='ri-eye-line'></i>
                          </button>
                          <button className='text-green-600 hover:text-green-900'>
                            <i className='ri-download-line'></i>
                          </button>
                          <button className='text-purple-600 hover:text-purple-900'>
                            <i className='ri-share-line'></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
