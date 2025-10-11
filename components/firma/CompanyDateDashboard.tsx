'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

interface CompanyDateStats {
  totalProjects: number;
  projectsWithDates: number;
  upcomingDeadlines: number;
  overdueProjects: number;
  completedProjects: number;
  flexibleDates: number;
}

interface ProjectDateInfo {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isFlexible: boolean;
  status: 'on-time' | 'upcoming' | 'overdue' | 'no-date' | 'completed';
  daysRemaining: number | null;
  progress: number;
}

interface TaskDateInfo {
  id: string;
  title: string;
  subProjectName: string;
  startDate: string | null;
  endDate: string | null;
  isFlexible: boolean;
  status: 'on-time' | 'upcoming' | 'overdue' | 'no-date' | 'completed';
  daysRemaining: number | null;
  isCompleted: boolean;
}

export default function CompanyDateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CompanyDateStats | null>(null);
  const [projects, setProjects] = useState<ProjectDateInfo[]>([]);
  const [tasks, setTasks] = useState<TaskDateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.email) {
      setError('Kullanıcı bilgisi bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Firma tarih istatistiklerini al
      const statsResponse = await fetch('/api/firma/date-stats', {
        headers: {
          'X-User-Email': user.email,
          'Content-Type': 'application/json',
        },
      });
      if (!statsResponse.ok) throw new Error('Stats fetch failed');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Proje tarih bilgilerini al
      const projectsResponse = await fetch('/api/firma/project-date-info', {
        headers: {
          'X-User-Email': user.email,
          'Content-Type': 'application/json',
        },
      });
      if (!projectsResponse.ok) throw new Error('Projects fetch failed');
      const projectsData = await projectsResponse.json();
      setProjects(projectsData);

      // Görev tarih bilgilerini al
      const tasksResponse = await fetch('/api/firma/task-date-info', {
        headers: {
          'X-User-Email': user.email,
          'Content-Type': 'application/json',
        },
      });
      if (!tasksResponse.ok) throw new Error('Tasks fetch failed');
      const tasksData = await tasksResponse.json();
      setTasks(tasksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'text-green-600 bg-green-100';
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'no-date':
        return 'text-gray-600 bg-gray-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'Zamanında';
      case 'upcoming':
        return 'Yaklaşan';
      case 'overdue':
        return 'Gecikmiş';
      case 'no-date':
        return 'Tarih Yok';
      case 'completed':
        return 'Tamamlandı';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDaysRemaining = (days: number | null) => {
    if (days === null) return '-';
    if (days === 0) return 'Bugün';
    if (days < 0) return `${Math.abs(days)} gün gecikmiş`;
    return `${days} gün kaldı`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
        Hata: {error}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* İstatistik Kartları */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 rounded-lg'>
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
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Toplam Proje</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats?.totalProjects || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 rounded-lg'>
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
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Tamamlanan</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats?.completedProjects || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 rounded-lg'>
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
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Yaklaşan Son Tarih
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats?.upcomingDeadlines || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proje Tarih Durumu */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>
            Proje Tarih Durumu
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Proje
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Başlangıç
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Bitiş
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Kalan Süre
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Durum
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  İlerleme
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {projects.map(project => (
                <tr key={project.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {project.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDaysRemaining(project.daysRemaining)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Görev Tarih Durumu */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>
            Görev Tarih Durumu
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Görev
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Alt Proje
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Başlangıç
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Bitiş
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Kalan Süre
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {task.title}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {task.subProjectName}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {task.startDate
                      ? new Date(task.startDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {task.endDate
                      ? new Date(task.endDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDaysRemaining(task.daysRemaining)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
