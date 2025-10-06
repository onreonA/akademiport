'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  consultantName: string;
  subProjectCount: number;
}
interface SubProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  taskCount: number;
  assignedTasks: number;
  completedTasks: number;
}
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
  subProjectName: string;
}
export default function CompanyProjectDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  useEffect(() => {
    if (params.id) {
      fetchProjectDetails();
    }
  }, [params.id, fetchProjectDetails]);
  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Proje detaylarını getir
      const projectResponse = await fetch(`/api/projects/${params.id}`, {
        headers: {
          'X-User-Email': 'info@mundo.com', // Firma email
        },
      });
      if (!projectResponse.ok) {
        throw new Error('Proje detayları yüklenirken hata oluştu');
      }
      const projectData = await projectResponse.json();
      if (projectData.project) {
        setProject({
          id: projectData.project.id,
          name: projectData.project.name,
          description: projectData.project.description,
          type: projectData.project.type,
          status: projectData.project.status,
          progress: projectData.project.progress || 0,
          startDate: projectData.project.startDate,
          endDate: projectData.project.endDate,
          consultantName: projectData.project.consultantName || 'Atanmamış',
          subProjectCount: projectData.project.subProjects?.length || 0,
        });
      }
      // Alt projeleri getir
      const subProjectsResponse = await fetch(
        `/api/projects/${params.id}/sub-projects`,
        {
          headers: {
            'X-User-Email': 'info@mundo.com',
          },
        }
      );
      if (subProjectsResponse.ok) {
        const subProjectsData = await subProjectsResponse.json();
        if (subProjectsData.subProjects) {
          const formattedSubProjects = subProjectsData.subProjects.map(
            (subProject: any) => ({
              id: subProject.id,
              name: subProject.name,
              description: subProject.description,
              status: subProject.status,
              progress: subProject.progress || 0,
              startDate: subProject.startDate,
              endDate: subProject.endDate,
              taskCount: subProject.taskCount || 0,
              assignedTasks: subProject.taskCount || 0, // Toplam görev sayısı
              completedTasks: subProject.completedTasks || 0,
            })
          );
          setSubProjects(formattedSubProjects);
        }
      }
      // Görevleri getir (firma için atanmış görevler)
      const tasksResponse = await fetch(`/api/projects/${params.id}/tasks`, {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        if (tasksData.tasks) {
          const formattedTasks = tasksData.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            progress: task.progress || 0,
            subProjectName: task.subProjectName || 'Genel',
          }));
          setTasks(formattedTasks);
        }
      }
    } catch (error) {
      setError('Proje detayları yüklenirken bir hata oluştu');
      // Hata durumunda fallback mock data
      setProject({
        id: params.id,
        name: 'Proje Yüklenemedi',
        description: 'Proje detayları yüklenirken hata oluştu',
        type: 'Bilinmiyor',
        status: 'Bilinmiyor',
        progress: 0,
        startDate: '',
        endDate: '',
        consultantName: 'Bilinmiyor',
        subProjectCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [params.id]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-blue-100 text-blue-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
      case 'Bekliyor':
        return 'bg-gray-100 text-gray-800';
      case 'Devam Ediyor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Kritik':
        return 'bg-red-100 text-red-800';
      case 'Yüksek':
        return 'bg-orange-100 text-orange-800';
      case 'Orta':
        return 'bg-blue-100 text-blue-800';
      case 'Düşük':
        return 'bg-gray-100 text-gray-800';
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
          <p className='mt-4 text-gray-600'>Proje detayları yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-3xl'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-gray-500 mb-6'>{error || 'Proje bulunamadı'}</p>
          <Link
            href='/firma/proje-yonetimi'
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
          >
            Proje Listesine Dön
          </Link>
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
                      href='/firma'
                      className='text-gray-400 hover:text-gray-500'
                    >
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <div className='flex items-center'>
                      <i className='ri-arrow-right-s-line text-gray-400'></i>
                      <Link
                        href='/firma/proje-yonetimi'
                        className='ml-4 text-gray-400 hover:text-gray-500'
                      >
                        Proje Yönetimi
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className='flex items-center'>
                      <i className='ri-arrow-right-s-line text-gray-400'></i>
                      <span className='ml-4 text-gray-900 font-medium'>
                        {project.name}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className='text-3xl font-bold text-gray-900 mt-2'>
                {project.name}
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                {project.description}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                href='/firma/reports'
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              >
                Raporlarım
              </Link>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                İlerleme Raporu
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Proje Özeti */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-check-line text-blue-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Genel İlerleme
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {project.progress}%
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-folder-line text-purple-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Alt Proje</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {project.subProjectCount}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-task-line text-green-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Atanan Görev
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {tasks.length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-user-line text-orange-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Danışman</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {project.consultantName}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Proje Detayları */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Proje Detayları
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>
                Proje Bilgileri
              </h4>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Başlangıç Tarihi:</span>
                  <span className='font-medium'>{project.startDate}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Bitiş Tarihi:</span>
                  <span className='font-medium'>{project.endDate}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Durum:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Proje Türü:</span>
                  <span className='font-medium'>{project.type}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>İlerleme</h4>
              <div className='space-y-3'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-500'>Genel İlerleme</span>
                    <span className='font-medium'>{project.progress}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className='mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8'>
              {[
                {
                  id: 'overview',
                  name: 'Genel Bakış',
                  icon: 'ri-dashboard-line',
                },
                {
                  id: 'sub-projects',
                  name: 'Alt Projeler',
                  icon: 'ri-folder-line',
                },
                { id: 'reports', name: 'Raporlar', icon: 'ri-file-chart-line' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Proje Özeti
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>
                  Son Aktiviteler
                </h4>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Görev tamamlandı
                      </p>
                      <p className='text-xs text-gray-500'>2 saat önce</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Yeni görev atandı
                      </p>
                      <p className='text-xs text-gray-500'>1 gün önce</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Alt proje başladı
                      </p>
                      <p className='text-xs text-gray-500'>3 gün önce</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>
                  Hızlı İstatistikler
                </h4>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                    <span className='text-sm text-gray-600'>
                      Tamamlanan Görevler
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {tasks.filter(t => t.status === 'Tamamlandı').length}/
                      {tasks.length}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                    <span className='text-sm text-gray-600'>
                      Aktif Alt Projeler
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {subProjects.filter(sp => sp.status === 'Aktif').length}/
                      {subProjects.length}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                    <span className='text-sm text-gray-600'>
                      Kritik Görevler
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {
                        tasks.filter(
                          t =>
                            t.priority === 'Kritik' || t.priority === 'Yüksek'
                        ).length
                      }
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                    <span className='text-sm text-gray-600'>Kalan Süre</span>
                    <span className='text-sm font-medium text-gray-900'>
                      8 ay
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'sub-projects' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Alt Projeler
              </h3>
            </div>
            {subProjects.length === 0 ? (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center'>
                <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-folder-line text-gray-400 text-3xl'></i>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Henüz alt proje bulunmuyor
                </h3>
                <p className='text-gray-500 mb-6'>
                  Bu proje için henüz alt proje oluşturulmamış.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {subProjects.map(subProject => (
                  <div
                    key={subProject.id}
                    className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <h4 className='text-lg font-semibold text-gray-900'>
                        {subProject.name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subProject.status)}`}
                      >
                        {subProject.status}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-4'>
                      {subProject.description}
                    </p>
                    <div className='space-y-3 mb-4'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>Tarih:</span>
                        <span className='font-medium'>
                          {subProject.startDate} - {subProject.endDate}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>Atanan Görev:</span>
                        <span className='font-medium'>
                          {subProject.assignedTasks}/{subProject.taskCount}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>Tamamlanan:</span>
                        <span className='font-medium'>
                          {subProject.completedTasks}
                        </span>
                      </div>
                    </div>
                    <div className='mb-4'>
                      <div className='flex justify-between text-sm mb-1'>
                        <span className='text-gray-500'>İlerleme</span>
                        <span className='font-medium'>
                          {subProject.progress}%
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(subProject.progress)}`}
                          style={{ width: `${subProject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Link
                        href={`/firma/proje-yonetimi/${params.id}/alt-projeler/${subProject.id}/gorevler`}
                      >
                        <button className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm'>
                          Görevleri Gör
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'reports' && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Raporlar
            </h3>
            <p className='text-gray-500'>
              Raporlama özelliği yakında eklenecek.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
