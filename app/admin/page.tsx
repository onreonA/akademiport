'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import DashboardCharts from '@/components/charts/DashboardCharts';
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalCompanies: number;
  activeCompanies: number;
  totalConsultants: number;
  totalTasks: number;
  completedTasks: number;
  monthlyRevenue: number;
  growthRate: number;
  // Education Stats
  totalEducationSets: number;
  totalVideos: number;
  totalDocuments: number;
  activeEducationAssignments: number;
  completedEducationAssignments: number;
  averageEducationProgress: number;
}
interface RecentActivity {
  id: string;
  type: 'project' | 'company' | 'task' | 'consultant';
  action: string;
  title: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
}
interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
  assignedCompanies: number;
  dueDate: string;
}
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalConsultants: 0,
    totalTasks: 0,
    completedTasks: 0,
    monthlyRevenue: 0,
    growthRate: 0,
    // Education Stats
    totalEducationSets: 0,
    totalVideos: 0,
    totalDocuments: 0,
    activeEducationAssignments: 0,
    completedEducationAssignments: 0,
    averageEducationProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  // Fetch real dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Fetch both project stats and education stats in parallel
        const [projectStatsRes, educationStatsRes] = await Promise.all([
          fetch('/api/admin/dashboard-stats', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/admin/education-stats', {
            method: 'GET',
            headers: {
              'X-User-Email': 'admin@ihracatakademi.com',
            },
          }),
        ]);

        let projectStats = {};
        let educationStats = {};

        if (projectStatsRes.ok) {
          const result = await projectStatsRes.json();
          if (result.success && result.data) {
            projectStats = result.data;
          }
        }

        if (educationStatsRes.ok) {
          const result = await educationStatsRes.json();
          if (result.success && result.data) {
            educationStats = result.data;
          }
        }

        // Merge stats
        setStats(prev => ({
          ...prev,
          ...projectStats,
          totalEducationSets: educationStats.total_sets || 0,
          totalVideos: educationStats.total_videos || 0,
          totalDocuments: educationStats.total_documents || 0,
          activeEducationAssignments: educationStats.active_assignments || 0,
          completedEducationAssignments:
            educationStats.completed_assignments || 0,
          averageEducationProgress: educationStats.average_progress || 0,
        }));
      } catch (error) {
        console.error('Dashboard stats fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'project',
      action: 'Yeni proje oluşturuldu',
      title: 'Tekstil Sektörü Dijital Dönüşüm',
      time: '2 saat önce',
      status: 'success',
    },
    {
      id: '2',
      type: 'company',
      action: 'Yeni firma kaydı',
      title: 'Mundo Tekstil A.Ş.',
      time: '4 saat önce',
      status: 'info',
    },
    {
      id: '3',
      type: 'task',
      action: 'Görev tamamlandı',
      title: 'E-ihracat eğitimi modülü',
      time: '6 saat önce',
      status: 'success',
    },
    {
      id: '4',
      type: 'consultant',
      action: 'Danışman ataması',
      title: 'Ahmet Yılmaz → Tekstil Projesi',
      time: '1 gün önce',
      status: 'info',
    },
    {
      id: '5',
      type: 'project',
      action: 'Proje güncellendi',
      title: 'Gıda Ürünleri Küresel Pazarlama',
      time: '1 gün önce',
      status: 'warning',
    },
  ]);
  const [projectProgress] = useState<ProjectProgress[]>([
    {
      id: '1',
      name: 'Tekstil Sektörü Dijital Dönüşüm',
      progress: 75,
      status: 'active',
      assignedCompanies: 12,
      dueDate: '2024-06-30',
    },
    {
      id: '2',
      name: 'Gıda Ürünleri Küresel Pazarlama',
      progress: 45,
      status: 'active',
      assignedCompanies: 8,
      dueDate: '2024-08-15',
    },
    {
      id: '3',
      name: 'Makina Sanayi İhracat Eğitimi',
      progress: 100,
      status: 'completed',
      assignedCompanies: 15,
      dueDate: '2024-03-31',
    },
    {
      id: '4',
      name: 'Elektronik Sektörü E-ticaret',
      progress: 30,
      status: 'active',
      assignedCompanies: 6,
      dueDate: '2024-09-30',
    },
  ]);
  // Grafik verileri
  const chartData = {
    projectData: projectProgress.map(p => ({
      name: p.name,
      progress: p.progress,
      assignedCompanies: p.assignedCompanies,
    })),
    companyData: [
      { sector: 'Tekstil', count: 45 },
      { sector: 'Gıda', count: 32 },
      { sector: 'Makina', count: 28 },
      { sector: 'Elektronik', count: 25 },
      { sector: 'Otomotiv', count: 18 },
      { sector: 'Diğer', count: 8 },
    ],
    taskData: [
      { status: 'Tamamlandı', count: 67 },
      { status: 'İncelemede', count: 15 },
      { status: 'Bekliyor', count: 7 },
      { status: 'İptal Edildi', count: 2 },
    ],
    monthlyProgress: [
      { month: 'Ocak', progress: 25 },
      { month: 'Şubat', progress: 35 },
      { month: 'Mart', progress: 45 },
      { month: 'Nisan', progress: 55 },
      { month: 'Mayıs', progress: 65 },
      { month: 'Haziran', progress: 75 },
    ],
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return 'ri-check-line';
      case 'warning':
        return 'ri-alert-line';
      case 'error':
        return 'ri-error-warning-line';
      default:
        return 'ri-information-line';
    }
  };
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <AdminLayout
      title='Admin Dashboard'
      description='İhracat Akademi yönetim paneli genel durumu'
    >
      {/* Welcome Section */}
      <div className='mb-8'>
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold mb-2'>Hoş Geldiniz, Admin!</h1>
              <p className='text-blue-100 text-lg'>
                İhracat Akademi yönetim panelinde bugün{' '}
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                tarihinde {stats.activeProjects} aktif proje ve{' '}
                {stats.activeCompanies} aktif firma bulunuyor.
              </p>
            </div>
            <div className='hidden lg:block'>
              <div className='w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
                <i className='ri-dashboard-line text-4xl'></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>Toplam Proje</p>
              <p className='text-3xl font-bold text-gray-900'>
                {stats.totalProjects}
              </p>
              <p className='text-green-600 text-sm font-medium'>
                +{stats.activeProjects} aktif
              </p>
            </div>
            <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
              <i className='ri-folder-line text-blue-600 text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>Aktif Firma</p>
              <p className='text-3xl font-bold text-gray-900'>
                {stats.activeCompanies}
              </p>
              <p className='text-blue-600 text-sm font-medium'>
                Toplam {stats.totalCompanies}
              </p>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
              <i className='ri-building-line text-green-600 text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>Danışman</p>
              <p className='text-3xl font-bold text-gray-900'>
                {stats.totalConsultants}
              </p>
              <p className='text-purple-600 text-sm font-medium'>
                Aktif danışman
              </p>
            </div>
            <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
              <i className='ri-user-star-line text-purple-600 text-xl'></i>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Görev Tamamlanma
              </p>
              <p className='text-3xl font-bold text-gray-900'>
                {stats.completedTasks}
              </p>
              <p className='text-orange-600 text-sm font-medium'>
                /{stats.totalTasks} toplam
              </p>
            </div>
            <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
              <i className='ri-checkbox-line text-orange-600 text-xl'></i>
            </div>
          </div>
        </div>
      </div>

      {/* Education Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Eğitim Setleri
              </p>
              <p className='text-3xl font-bold text-gray-900'>
                {stats.totalEducationSets}
              </p>
              <p className='text-indigo-600 text-sm font-medium'>Toplam set</p>
            </div>
            <div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center'>
              <i className='ri-book-open-line text-indigo-600 text-xl'></i>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Video İçerikleri
              </p>
              <p className='text-3xl font-bold text-gray-900'>
                {stats.totalVideos}
              </p>
              <p className='text-pink-600 text-sm font-medium'>
                +{stats.totalDocuments} doküman
              </p>
            </div>
            <div className='w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center'>
              <i className='ri-video-line text-pink-600 text-xl'></i>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm font-medium'>
                Eğitim İlerlemesi
              </p>
              <p className='text-3xl font-bold text-gray-900'>
                %{stats.averageEducationProgress}
              </p>
              <p className='text-teal-600 text-sm font-medium'>
                {stats.completedEducationAssignments} tamamlandı
              </p>
            </div>
            <div className='w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center'>
              <i className='ri-graduation-cap-line text-teal-600 text-xl'></i>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Growth */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>Aylık Gelir</h3>
            <span className='text-green-600 text-sm font-medium'>
              +{stats.growthRate}%
            </span>
          </div>
          <div className='flex items-end space-x-2'>
            <span className='text-3xl font-bold text-gray-900'>
              ₺{stats.monthlyRevenue.toLocaleString('tr-TR')}
            </span>
            <span className='text-gray-600 text-sm mb-1'>/ay</span>
          </div>
          <div className='mt-4'>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full'
                style={{ width: `${(stats.monthlyRevenue / 200000) * 100}%` }}
              ></div>
            </div>
            <p className='text-gray-600 text-sm mt-2'>Hedef: ₺200,000</p>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Hızlı Erişim
          </h3>
          <div className='grid grid-cols-2 gap-3'>
            <Link
              href='/admin/proje-yonetimi'
              className='p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <i className='ri-folder-line text-blue-600 text-xl'></i>
                <span className='font-medium text-gray-900'>
                  Proje Yönetimi
                </span>
              </div>
            </Link>
            <Link
              href='/admin/firma-yonetimi'
              className='p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <i className='ri-building-line text-green-600 text-xl'></i>
                <span className='font-medium text-gray-900'>
                  Firma Yönetimi
                </span>
              </div>
            </Link>
            <Link
              href='/admin/danisman-yonetimi'
              className='p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <i className='ri-user-star-line text-purple-600 text-xl'></i>
                <span className='font-medium text-gray-900'>
                  Danışman Yönetimi
                </span>
              </div>
            </Link>
            <Link
              href='/admin/raporlar'
              className='p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <i className='ri-file-chart-line text-orange-600 text-xl'></i>
                <span className='font-medium text-gray-900'>Raporlar</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* Project Progress and Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Project Progress */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Proje İlerlemeleri
            </h3>
            <Link
              href='/admin/proje-yonetimi'
              className='text-blue-600 hover:text-blue-700 text-sm font-medium'
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className='space-y-4'>
            {projectProgress.map(project => (
              <div
                key={project.id}
                className='border-b border-gray-100 pb-4 last:border-b-0'
              >
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium text-gray-900 truncate'>
                    {project.name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getProjectStatusColor(project.status)}`}
                  >
                    {project.status === 'active'
                      ? 'Aktif'
                      : project.status === 'completed'
                        ? 'Tamamlandı'
                        : 'Bekliyor'}
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
                  <span>{project.assignedCompanies} firma atanmış</span>
                  <span>{project.progress}% tamamlandı</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Recent Activity */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Son Aktiviteler
            </h3>
            <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
              Tümünü Gör →
            </button>
          </div>
          <div className='space-y-4'>
            {recentActivities.map(activity => (
              <div key={activity.id} className='flex items-start space-x-3'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(activity.status)}`}
                >
                  <i
                    className={`${getStatusIcon(activity.status)} text-sm`}
                  ></i>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900'>
                    {activity.action}
                  </p>
                  <p className='text-sm text-gray-600 truncate'>
                    {activity.title}
                  </p>
                  <p className='text-xs text-gray-500'>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Charts Section */}
      <div className='mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Monthly Projects Chart */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Aylık Proje Dağılımı
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Ocak</span>
              <div className='flex items-center space-x-2'>
                <div className='w-20 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-500 h-2 rounded-full'
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>3</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Şubat</span>
              <div className='flex items-center space-x-2'>
                <div className='w-20 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-green-500 h-2 rounded-full'
                    style={{ width: '90%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>4</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Mart</span>
              <div className='flex items-center space-x-2'>
                <div className='w-20 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-purple-500 h-2 rounded-full'
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>2</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Nisan</span>
              <div className='flex items-center space-x-2'>
                <div className='w-20 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-orange-500 h-2 rounded-full'
                    style={{ width: '45%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>3</span>
              </div>
            </div>
          </div>
        </div>
        {/* Company Distribution */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Firma Sektör Dağılımı
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Tekstil</span>
              <div className='flex items-center space-x-2'>
                <div className='w-16 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-500 h-2 rounded-full'
                    style={{ width: '40%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>62</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Gıda</span>
              <div className='flex items-center space-x-2'>
                <div className='w-16 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-green-500 h-2 rounded-full'
                    style={{ width: '25%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>39</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Teknoloji</span>
              <div className='flex items-center space-x-2'>
                <div className='w-16 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-purple-500 h-2 rounded-full'
                    style={{ width: '20%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>31</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Diğer</span>
              <div className='flex items-center space-x-2'>
                <div className='w-16 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-orange-500 h-2 rounded-full'
                    style={{ width: '15%' }}
                  ></div>
                </div>
                <span className='text-sm font-medium text-gray-900'>24</span>
              </div>
            </div>
          </div>
        </div>
        {/* Performance Metrics */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Performans Metrikleri
          </h3>
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                <i className='ri-target-line text-blue-600 text-xl'></i>
              </div>
              <p className='text-2xl font-bold text-gray-900'>87%</p>
              <p className='text-sm text-gray-600'>Proje Tamamlanma Oranı</p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                <i className='ri-user-heart-line text-green-600 text-xl'></i>
              </div>
              <p className='text-2xl font-bold text-gray-900'>94%</p>
              <p className='text-sm text-gray-600'>Müşteri Memnuniyeti</p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                <i className='ri-time-line text-purple-600 text-xl'></i>
              </div>
              <p className='text-2xl font-bold text-gray-900'>2.3</p>
              <p className='text-sm text-gray-600'>
                Ortalama Tamamlanma Süresi (Ay)
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Dashboard Charts */}
      <div className='mb-8'>
        <DashboardCharts
          projectData={chartData.projectData}
          companyData={chartData.companyData}
          taskData={chartData.taskData}
          monthlyProgress={chartData.monthlyProgress}
        />
      </div>
    </AdminLayout>
  );
}
