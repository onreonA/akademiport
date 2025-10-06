'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowUpLine,
  RiBarChartLine,
  RiCalendarLine,
  RiCheckLine,
  RiFlagLine,
  RiRefreshLine,
  RiStarLine,
  RiTimeLine,
} from 'react-icons/ri';

interface ProgressData {
  company: {
    id: string;
    name: string;
  };
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    approvedCompletions: number;
    pendingApprovals: number;
    rejectedCompletions: number;
    averageQualityScore: number;
    totalHours: number;
  };
  projectStats: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    progress: number;
    startDate?: string;
    endDate?: string;
    assignedAt: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalHours: number;
    avgQualityScore: number;
    company: {
      id: string;
      name: string;
      city: string;
      industry: string;
    };
  }>;
  taskStatusDistribution: {
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  monthlyProgress: Array<{
    month: string;
    completed: number;
  }>;
  recentActivities: Array<{
    id: string;
    taskTitle: string;
    projectName: string;
    completionDate: string;
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

export default function ProgressDashboardClient() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'activities'
  >('overview');

  // Fetch progress data
  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/firma/progress?timeRange=${timeRange}`,
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
              İlerleme Dashboard&apos;u
            </h1>
            <p className='text-gray-600'>{progressData.company.name}</p>
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
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
                Ortalama Kalite
              </p>
              <p className='text-3xl font-bold text-yellow-600'>
                {progressData.overview.averageQualityScore}/10
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {progressData.overview.approvedCompletions} onaylandı
              </p>
            </div>
            <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
              <RiStarLine className='w-6 h-6 text-yellow-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Toplam Çalışma
              </p>
              <p className='text-3xl font-bold text-purple-600'>
                {progressData.overview.totalHours}h
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {progressData.overview.pendingApprovals} onay bekliyor
              </p>
            </div>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
              <RiTimeLine className='w-6 h-6 text-purple-600' />
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
                    Görev Durumu
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
                    {progressData.monthlyProgress
                      .slice(-6)
                      .map((month, index) => (
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
                          <span className='font-semibold text-blue-600'>
                            {month.completed} görev
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
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
                    <p className='text-sm'>tamamlandı</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className='space-y-6'>
              {progressData.projectStats.map(project => (
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
                        {project.description}
                      </p>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {project.totalTasks}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Toplam Görev
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-green-600'>
                            {project.completedTasks}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Tamamlanan
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-purple-600'>
                            {project.totalHours}h
                          </div>
                          <div className='text-sm text-gray-600'>
                            Çalışma Süresi
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className='mb-2'>
                        <div className='flex items-center justify-between text-sm mb-1'>
                          <span className='text-gray-600'>İlerleme</span>
                          <span className='font-semibold text-gray-900'>
                            {project.propletionRate}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${project.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {progressData.projectStats.length === 0 && (
                <div className='text-center py-12 text-gray-500'>
                  <RiFlagLine className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                  <h3 className='text-lg font-medium mb-2'>
                    Henüz proje atanmamış
                  </h3>
                  <p>Size atanmış proje bulunmuyor.</p>
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : activity.status === 'pending_approval'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {activity.status === 'approved'
                            ? 'Onaylandı'
                            : activity.status === 'pending_approval'
                              ? 'Onay Bekliyor'
                              : 'Reddedildi'}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-2'>
                        {activity.projectName}
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
                  <p>Tamamlanan görev bulunmuyor.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
