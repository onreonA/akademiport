'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import ProjectOverview from '@/components/dashboard/ProjectOverview';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import StatCard from '@/components/dashboard/StatCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  subProjectCount: number;
  assignedCompanyCount: number;
  totalTasks: number;
  completedTasks: number;
}
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalCompanies: number;
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
}
export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalCompanies: 0,
    totalTasks: 0,
    completedTasks: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        // İstatistikleri hesapla
        const totalProjects = data.projects?.length || 0;
        const activeProjects =
          data.projects?.filter((p: Project) => p.status === 'Aktif').length ||
          0;
        const completedProjects =
          data.projects?.filter((p: Project) => p.status === 'Tamamlandı')
            .length || 0;
        const totalTasks =
          data.projects?.reduce(
            (sum: number, p: Project) => sum + (p.totalTasks || 0),
            0
          ) || 0;
        const completedTasks =
          data.projects?.reduce(
            (sum: number, p: Project) => sum + (p.completedTasks || 0),
            0
          ) || 0;
        const overallProgress =
          totalProjects > 0
            ? Math.round(
                data.projects?.reduce(
                  (sum: number, p: Project) => sum + (p.progress || 0),
                  0
                ) / totalProjects
              )
            : 0;
        setStats({
          totalProjects,
          activeProjects,
          completedProjects,
          totalCompanies: 20, // Şimdilik sabit
          totalTasks,
          completedTasks,
          overallProgress,
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // Helper functions moved to components
  if (loading) {
    return (
      <AdminLayout
        title='Ana Panel'
        description='Tüm projelerin genel durumu ve istatistikleri'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Dashboard yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout
      title='Ana Panel'
      description='Tüm projelerin genel durumu ve istatistikleri'
    >
      {/* Breadcrumb */}
      <Breadcrumb className='mb-6' />

      {/* Header Actions */}
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Proje Yönetimi Dashboard
          </h2>
          <p className='text-gray-600 mt-1'>
            Tüm projelerin genel durumu ve istatistikleri
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-3'>
          <Link href='/admin/proje-yonetimi'>
            <Button variant='primary' size='lg' icon='ri-folder-line'>
              Tüm Projeler
            </Button>
          </Link>
          <Link href='/admin/raporlar'>
            <Button variant='success' size='lg' icon='ri-file-chart-line'>
              Raporlar
            </Button>
          </Link>
        </div>
      </div>
      {/* Modern Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='Toplam Proje'
          value={stats.totalProjects}
          icon='ri-folder-line'
          color='blue'
          trend={{ value: 12, isPositive: true }}
          subtitle='Bu ay +2 yeni proje'
          onClick={() => (window.location.href = '/admin/proje-yonetimi')}
        />
        <StatCard
          title='Genel İlerleme'
          value={`${stats.overallProgress}%`}
          icon='ri-check-line'
          color='green'
          trend={{ value: 8, isPositive: true }}
          subtitle='Ortalama ilerleme'
        />
        <StatCard
          title='Aktif Firma'
          value={stats.totalCompanies}
          icon='ri-building-line'
          color='purple'
          subtitle='Sistemde kayıtlı'
          onClick={() => (window.location.href = '/admin/firma-yonetimi')}
        />
        <StatCard
          title='Tamamlanan Görev'
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          icon='ri-checkbox-line'
          color='orange'
          subtitle={`${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% tamamlandı`}
        />
      </div>
      {/* Quick Actions & Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <QuickActions
          actions={[
            {
              id: 'create-project',
              label: 'Yeni Proje Oluştur',
              icon: 'ri-add-line',
              href: '/admin/proje-yonetimi',
              variant: 'primary',
              description: 'Hızlı proje oluşturma',
            },
            {
              id: 'bulk-assign',
              label: 'Toplu Atama',
              icon: 'ri-user-add-line',
              variant: 'success',
              description: 'Çoklu firma ataması',
            },
            {
              id: 'export-data',
              label: 'Veri Dışa Aktar',
              icon: 'ri-download-line',
              variant: 'secondary',
              description: 'Excel/PDF formatında',
            },
            {
              id: 'view-analytics',
              label: 'Analitik Raporlar',
              icon: 'ri-bar-chart-line',
              href: '/admin/analytics',
              variant: 'warning',
              description: 'Detaylı analiz',
            },
            {
              id: 'manage-companies',
              label: 'Firma Yönetimi',
              icon: 'ri-building-line',
              href: '/admin/firma-yonetimi',
              variant: 'ghost',
              description: 'Firma ayarları',
            },
            {
              id: 'system-settings',
              label: 'Sistem Ayarları',
              icon: 'ri-settings-line',
              href: '/admin/ayarlar',
              variant: 'ghost',
              description: 'Genel yapılandırma',
            },
          ]}
        />

        <RecentActivity
          activities={[
            {
              id: '1',
              type: 'project_created',
              title: 'Yeni Proje Oluşturuldu',
              description: 'Test 7 projesi başarıyla oluşturuldu',
              timestamp: new Date().toISOString(),
              user: 'Admin',
              projectId: '72b1b240-a9d3-45df-924d-8ebc73c2eb18',
              projectName: 'Test 7',
            },
            {
              id: '2',
              type: 'task_completed',
              title: 'Görev Tamamlandı',
              description: 'Test 6 Alt Proje 1 - Analiz görevi tamamlandı',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              user: 'Mundo Yatak',
            },
            {
              id: '3',
              type: 'assignment',
              title: 'Firma Ataması',
              description: 'Sarmobi firması Test 4 projesine atandı',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              user: 'Admin',
            },
            {
              id: '4',
              type: 'report',
              title: 'Rapor Oluşturuldu',
              description: 'Test 3 projesi için tamamlama raporu hazırlandı',
              timestamp: new Date(Date.now() - 14400000).toISOString(),
              user: 'Danışman',
            },
            {
              id: '5',
              type: 'update',
              title: 'Sistem Güncellemesi',
              description: 'Firma-First Tarih Yönetimi sistemi aktif edildi',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              user: 'Sistem',
            },
          ]}
        />
      </div>
      {/* Project Overview */}
      <ProjectOverview
        projects={projects.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status as 'Planlandı' | 'Aktif' | 'Tamamlandı',
          progress: project.progress,
          assignedCompanies: project.assignedCompanyCount || 0,
          subProjectCount: project.subProjectCount || 0,
          lastUpdate:
            project.updatedAt || project.createdAt || new Date().toISOString(),
        }))}
        title='Proje Özeti'
        maxItems={6}
      />
    </AdminLayout>
  );
}
