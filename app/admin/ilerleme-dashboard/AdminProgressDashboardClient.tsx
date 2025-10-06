'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowUpLine,
  RiBarChartLine,
  RiBuildingLine,
  RiCalendarLine,
  RiCheckLine,
  RiFlagLine,
  RiRefreshLine,
  RiStarLine,
  RiTimeLine,
  RiUserLine,
} from 'react-icons/ri';

interface AdminProgressData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingApprovals: number;
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    averageQualityScore: number;
  };
  projectTrends: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    daysSinceCreation: number;
    company: {
      id: string;
      name: string;
      city: string;
      industry: string;
    };
    startDate?: string;
    endDate?: string;
    createdAt: string;
  }>;
  companyPerformance: Array<{
    id: string;
    name: string;
    city: string;
    industry: string;
    status: string;
    createdAt: string;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    completionRate: number;
    averageProgress: number;
    projectCompletionRate: number;
  }>;
  taskStatusDistribution: {
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  monthlyProgress: Array<{
    month: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  qualityDistribution: Record<string, number>;
  recentActivities: Array<{
    id: string;
    type: string;
    taskTitle: string;
    projectName: string;
    companyName: string;
    completedBy: string;
    completionDate: string;
    approvedAt?: string;
    actualHours?: number;
    qualityScore?: number;
    status: string;
  }>;
  timeRange: {
    start: string;
    end: string;
    days: number;
  };
}

export default function AdminProgressDashboardClient() {
  const [progressData, setProgressData] = useState<AdminProgressData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'companies' | 'projects' | 'activities'
  >('overview');

  // Fetch progress data
  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/progress?timeRange=${timeRange}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('İlerleme verileri yüklenirken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        setProgressData(data.data);
      } else {
        throw new Error(data.error || 'Veri yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatHours = (hours?: number) => {
    if (!hours) return 'Belirtilmemiş';
    return `${hours} saat`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <RiBarChartLine className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Hata</h2>
          <p className='text-gray-600'>
            {error || 'Veri yüklenirken hata oluştu'}
          </p>
          <button
            onClick={fetchProgressData}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <RiRefreshLine className='w-4 h-4 inline mr-2' />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Admin İlerleme Dashboard&apos;u
            </h1>
            <p className='text-gray-600'>
              Sistem geneli ilerleme ve performans analizi
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='7'>Son 7 Gün</option>
              <option value='30'>Son 30 Gün</option>
              <option value='90'>Son 90 Gün</option>
              <option value='365'>Son 1 Yıl</option>
            </select>
            <button
              onClick={fetchProgressData}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center'
            >
              <RiRefreshLine className='w-4 h-4 mr-2' />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Toplam Projeler
              </p>
              <p className='text-3xl font-bold text-blue-600'>
                {progressData.overview.totalProjects}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {progressData.overview.activeProjects} aktif
              </p>
            </div>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
              <RiFlagLine className='w-6 h-6 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Toplam Görevler
              </p>
              <p className='text-3xl font-bold text-green-600'>
                {progressData.overview.totalTasks}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {progressData.overview.completedTasks} tamamlandı
              </p>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
              <RiCheckLine className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Toplam Firmalar
              </p>
              <p className='text-3xl font-bold text-purple-600'>
                {progressData.overview.totalCompanies}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {progressData.overview.activeCompanies} aktif
              </p>
            </div>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
              <RiBuildingLine className='w-6 h-6 text-purple-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Toplam Kullanıcılar
              </p>
              <p className='text-3xl font-bold text-orange-600'>
                {progressData.overview.totalUsers}
              </p>
              <p className='text-xs text-gray-500 mt-1'>Sistem kullanıcıları</p>
            </div>
            <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center'>
              <RiUserLine className='w-6 h-6 text-orange-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Ortalama Kalite
              </p>
              <p className='text-3xl font-bold text-yellow-600'>
                {progressData.overview.averageQualityScore}/10
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {progressData.overview.pendingApprovals} onay bekliyor
              </p>
            </div>
            <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
              <RiStarLine className='w-6 h-6 text-yellow-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            {[
              { id: 'overview', label: 'Genel Bakış', icon: RiBarChartLine },
              {
                id: 'companies',
                label: 'Firma Performansı',
                icon: RiBuildingLine,
              },
              { id: 'projects', label: 'Projeler', icon: RiFlagLine },
              { id: 'activities', label: 'Son Aktiviteler', icon: RiTimeLine },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Task Status Distribution */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-gray-50 rounded-xl p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Görev Durumu Dağılımı
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-600'>Beklemede</span>
                      <span className='font-semibold text-yellow-600'>
                        {progressData.taskStatusDistribution.pending}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-600'>Devam Ediyor</span>
                      <span className='font-semibold text-blue-600'>
                        {progressData.taskStatusDistribution.in_progress}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-600'>Tamamlandı</span>
                      <span className='font-semibold text-green-600'>
                        {progressData.taskStatusDistribution.completed}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-600'>İptal Edildi</span>
                      <span className='font-semibold text-red-600'>
                        {progressData.taskStatusDistribution.cancelled}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Aylık İlerleme
                  </h3>
                  <div className='space-y-3'>
                    {progressData.monthlyProgress.slice(-6).map(month => (
                      <div
                        key={month.month}
                        className='flex items-center justify-between'
                      >
                        <span className='text-gray-600 text-sm'>
                          {new Date(month.month + '-01').toLocaleDateString(
                            'tr-TR',
                            { month: 'long' }
                          )}
                        </span>
                        <div className='text-right'>
                          <span className='font-semibold text-blue-600'>
                            {month.completed}/{month.total}
                          </span>
                          <span className='text-xs text-gray-500 ml-2'>
                            ({month.completionRate}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quality Distribution */}
              <div className='bg-gray-50 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Kalite Puanı Dağılımı
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                  {Object.entries(progressData.qualityDistribution).map(
                    ([range, count]) => (
                      <div key={range} className='text-center'>
                        <div className='text-2xl font-bold text-blue-600'>
                          {count}
                        </div>
                        <div className='text-sm text-gray-600'>{range}</div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Overall Completion Rate */}
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Genel Tamamlama Oranı
                  </h3>
                  <RiArrowUpLine className='w-6 h-6 text-blue-600' />
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='text-4xl font-bold text-blue-600'>
                    {progressData.overview.totalTasks > 0
                      ? Math.round(
                          (progressData.overview.completedTasks /
                            progressData.overview.totalTasks) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className='text-gray-600'>
                    <p>
                      {progressData.overview.completedTasks} /{' '}
                      {progressData.overview.totalTasks} görev
                    </p>
                    <p className='text-sm'>sistem geneli tamamlandı</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className='space-y-6'>
              {progressData.companyPerformance.map(company => (
                <div key={company.id} className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h4 className='text-lg font-semibold text-gray-900'>
                          {company.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}
                        >
                          {company.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-3'>
                        {company.city} • {company.industry}
                      </p>

                      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {company.totalProjects}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Toplam Proje
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-green-600'>
                            {company.totalTasks}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Toplam Görev
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-purple-600'>
                            {company.completionRate}%
                          </div>
                          <div className='text-sm text-gray-600'>
                            Tamamlama Oranı
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-orange-600'>
                            {company.averageProgress}%
                          </div>
                          <div className='text-sm text-gray-600'>
                            Ortalama İlerleme
                          </div>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className='space-y-2'>
                        <div>
                          <div className='flex items-center justify-between text-sm mb-1'>
                            <span className='text-gray-600'>
                              Görev Tamamlama
                            </span>
                            <span className='font-semibold text-gray-900'>
                              {company.completionRate}%
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-green-600 h-2 rounded-full transition-all duration-300'
                              style={{ width: `${company.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className='flex items-center justify-between text-sm mb-1'>
                            <span className='text-gray-600'>
                              Proje İlerlemesi
                            </span>
                            <span className='font-semibold text-gray-900'>
                              {company.averageProgress}%
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                              style={{ width: `${company.averageProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {progressData.companyPerformance.length === 0 && (
                <div className='text-center py-12 text-gray-500'>
                  <RiBuildingLine className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                  <h3 className='text-lg font-medium mb-2'>
                    Henüz firma verisi yok
                  </h3>
                  <p>Firma performans verileri bulunmuyor.</p>
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className='space-y-6'>
              {progressData.projectTrends.map(project => (
                <div key={project.id} className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h4 className='text-lg font-semibold text-gray-900'>
                          {project.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                        >
                          {project.status === 'active'
                            ? 'Aktif'
                            : project.status === 'completed'
                              ? 'Tamamlandı'
                              : project.status === 'pending'
                                ? 'Beklemede'
                                : 'İptal Edildi'}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-3'>
                        {project.company.name} • {project.company.city} •{' '}
                        {project.company.industry}
                      </p>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {project.progress}%
                          </div>
                          <div className='text-sm text-gray-600'>İlerleme</div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-green-600'>
                            {project.daysSinceCreation}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Gün Önce Başladı
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-purple-600'>
                            {project.startDate
                              ? formatDate(project.startDate)
                              : 'Belirtilmemiş'}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Başlangıç Tarihi
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className='mb-2'>
                        <div className='flex items-center justify-between text-sm mb-1'>
                          <span className='text-gray-600'>İlerleme</span>
                          <span className='font-semibold text-gray-900'>
                            {project.progress}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {progressData.projectTrends.length === 0 && (
                <div className='text-center py-12 text-gray-500'>
                  <RiFlagLine className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                  <h3 className='text-lg font-medium mb-2'>Henüz proje yok</h3>
                  <p>Proje verileri bulunmuyor.</p>
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className='space-y-4'>
              {progressData.recentActivities.map(activity => (
                <div key={activity.id} className='bg-gray-50 rounded-xl p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h5 className='font-semibold text-gray-900'>
                          {activity.taskTitle}
                        </h5>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}
                        >
                          {activity.type === 'completed'
                            ? 'Tamamlandı'
                            : activity.type === 'rejected'
                              ? 'Reddedildi'
                              : 'Onay Bekliyor'}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-2'>
                        {activity.projectName} • {activity.companyName}
                      </p>
                      <p className='text-sm text-gray-500 mb-2'>
                        Tamamlayan: {activity.completedBy}
                      </p>
                      <div className='flex items-center space-x-4 text-sm text-gray-500'>
                        <div className='flex items-center space-x-1'>
                          <RiCalendarLine className='w-4 h-4' />
                          <span>{formatDate(activity.completionDate)}</span>
                        </div>
                        {activity.actualHours && (
                          <div className='flex items-center space-x-1'>
                            <RiTimeLine className='w-4 h-4' />
                            <span>{formatHours(activity.actualHours)}</span>
                          </div>
                        )}
                        {activity.qualityScore && (
                          <div className='flex items-center space-x-1'>
                            <RiStarLine className='w-4 h-4' />
                            <span>{activity.qualityScore}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {progressData.recentActivities.length === 0 && (
                <div className='text-center py-12 text-gray-500'>
                  <RiTimeLine className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                  <h3 className='text-lg font-medium mb-2'>
                    Henüz aktivite yok
                  </h3>
                  <p>Son aktiviteler bulunmuyor.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
