'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import SmartForm from '@/components/forms/SmartForm';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  type: string;
  assignedCompanies: number;
  subProjectCount: number;
  lastUpdate: string;
}

interface SubProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  taskCount: number;
  assignedCompanyCount: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  assignedTo?: string;
  dueDate?: string;
}

export default function ModernProjectDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateSubProject, setShowCreateSubProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showAssignCompany, setShowAssignCompany] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [params.id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      setProject({
        id: params.id,
        name: 'Test Projesi',
        description: 'Bu bir test projesidir',
        status: 'Aktif',
        progress: 65,
        type: 'B2B',
        assignedCompanies: 3,
        subProjectCount: 2,
        lastUpdate: new Date().toISOString(),
      });

      setSubProjects([
        {
          id: '1',
          name: 'Alt Proje 1',
          description: 'İlk alt proje',
          status: 'Aktif',
          progress: 80,
          taskCount: 5,
          assignedCompanyCount: 2,
        },
        {
          id: '2',
          name: 'Alt Proje 2',
          description: 'İkinci alt proje',
          status: 'Planlandı',
          progress: 20,
          taskCount: 3,
          assignedCompanyCount: 1,
        },
      ]);

      setTasks([
        {
          id: '1',
          title: 'Görev 1',
          description: 'İlk görev',
          status: 'Tamamlandı',
          priority: 'Yüksek',
          progress: 100,
          assignedTo: 'Mundo Yatak',
          dueDate: '2025-10-15',
        },
        {
          id: '2',
          title: 'Görev 2',
          description: 'İkinci görev',
          status: 'Devam Ediyor',
          priority: 'Orta',
          progress: 60,
          assignedTo: 'Sarmobi',
          dueDate: '2025-10-20',
        },
      ]);
    } catch (err) {
      setError('Proje detayları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubProject = async (data: any) => {
    // API call to create sub-project
    setShowCreateSubProject(false);
    fetchProjectDetails(); // Refresh data
  };

  const handleCreateTask = async (data: any) => {
    // API call to create task
    setShowCreateTask(false);
    fetchProjectDetails(); // Refresh data
  };

  const handleEditProject = async (data: any) => {
    // API call to update project
    setShowEditProject(false);
    fetchProjectDetails(); // Refresh data
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Tamamlandı':
        return 'bg-blue-100 text-blue-800';
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
      case 'Devam Ediyor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek':
        return 'bg-red-100 text-red-800';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Düşük':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title='Proje Detayı'
        description='Proje detayları yükleniyor...'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !project) {
    return (
      <AdminLayout title='Hata' description='Proje bulunamadı'>
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-2xl'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-gray-500 mb-6'>{error || 'Proje bulunamadı'}</p>
          <Button onClick={fetchProjectDetails}>Tekrar Dene</Button>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Genel Bakış',
      icon: 'ri-dashboard-line',
      content: (
        <div className='space-y-6'>
          {/* Project Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-blue-50 rounded-lg p-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-folder-line text-blue-600 text-xl'></i>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-blue-600'>
                    Alt Projeler
                  </p>
                  <p className='text-2xl font-bold text-blue-900'>
                    {project.subProjectCount}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-green-50 rounded-lg p-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-building-line text-green-600 text-xl'></i>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-green-600'>
                    Atanan Firmalar
                  </p>
                  <p className='text-2xl font-bold text-green-900'>
                    {project.assignedCompanies}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-purple-50 rounded-lg p-6'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-checkbox-line text-purple-600 text-xl'></i>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-purple-600'>
                    Genel İlerleme
                  </p>
                  <p className='text-2xl font-bold text-purple-900'>
                    {project.progress}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Proje Açıklaması
            </h3>
            <p className='text-gray-600'>{project.description}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'subprojects',
      label: 'Alt Projeler',
      icon: 'ri-folder-open-line',
      badge: subProjects.length,
      content: (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Alt Projeler
            </h3>
            <Button
              onClick={() => setShowCreateSubProject(true)}
              variant='primary'
              icon='ri-add-line'
            >
              Yeni Alt Proje
            </Button>
          </div>

          {subProjects.length === 0 ? (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-folder-line text-gray-400 text-2xl'></i>
              </div>
              <p className='text-gray-500'>Henüz alt proje bulunmuyor</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {subProjects.map(subProject => (
                <div
                  key={subProject.id}
                  className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h4 className='text-lg font-semibold text-gray-900'>
                        {subProject.name}
                      </h4>
                      <p className='text-gray-600 text-sm mt-1'>
                        {subProject.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subProject.status)}`}
                    >
                      {subProject.status}
                    </span>
                  </div>

                  <div className='flex items-center justify-between text-sm text-gray-500 mb-3'>
                    <span>{subProject.taskCount} görev</span>
                    <span>{subProject.assignedCompanyCount} firma</span>
                  </div>

                  <div className='mb-4'>
                    <div className='flex items-center justify-between text-sm mb-1'>
                      <span className='text-gray-600'>İlerleme</span>
                      <span className='text-gray-900 font-medium'>
                        {subProject.progress}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='h-2 bg-blue-500 rounded-full transition-all'
                        style={{ width: `${subProject.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    href={`/admin/proje-yonetimi/${params.id}/alt-projeler/${subProject.id}`}
                    className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                  >
                    Detayları Görüntüle →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Görevler',
      icon: 'ri-task-line',
      badge: tasks.length,
      content: (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Görevler</h3>
            <Button
              onClick={() => setShowCreateTask(true)}
              variant='primary'
              icon='ri-add-line'
            >
              Yeni Görev
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-task-line text-gray-400 text-2xl'></i>
              </div>
              <p className='text-gray-500'>Henüz görev bulunmuyor</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {tasks.map(task => (
                <div
                  key={task.id}
                  className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h4 className='text-base font-semibold text-gray-900'>
                        {task.title}
                      </h4>
                      <p className='text-gray-600 text-sm mt-1'>
                        {task.description}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2 ml-4'>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between text-sm text-gray-500 mb-3'>
                    <span>
                      {task.assignedTo && `Atanan: ${task.assignedTo}`}
                    </span>
                    <span>
                      {task.dueDate &&
                        `Bitiş: ${new Date(task.dueDate).toLocaleDateString('tr-TR')}`}
                    </span>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <div className='flex-1 bg-gray-200 rounded-full h-2'>
                      <div
                        className='h-2 bg-green-500 rounded-full transition-all'
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className='text-sm font-medium text-gray-700 w-12 text-right'>
                      {task.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title={project.name} description={project.description}>
      <Breadcrumb className='mb-6' />

      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8'>
        <div>
          <div className='flex items-center space-x-3 mb-2'>
            <h1 className='text-3xl font-bold text-gray-900'>{project.name}</h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
            >
              {project.status}
            </span>
          </div>
          <p className='text-gray-600'>{project.description}</p>
          <div className='flex items-center space-x-4 text-sm text-gray-500 mt-2'>
            <span>Tip: {project.type}</span>
            <span>
              Son Güncelleme:{' '}
              {new Date(project.lastUpdate).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <Button
            onClick={() => setShowAssignCompany(true)}
            variant='success'
            icon='ri-user-add-line'
          >
            Firma Ata
          </Button>
          <Button
            onClick={() => setShowEditProject(true)}
            variant='secondary'
            icon='ri-edit-line'
          >
            Düzenle
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} variant='underline' />

      {/* Modals */}
      <Modal
        isOpen={showCreateSubProject}
        onClose={() => setShowCreateSubProject(false)}
        title='Yeni Alt Proje Oluştur'
        size='md'
      >
        <SmartForm
          fields={[
            {
              name: 'name',
              label: 'Alt Proje Adı',
              type: 'text',
              required: true,
              placeholder: 'Alt proje adını girin',
            },
            {
              name: 'description',
              label: 'Açıklama',
              type: 'textarea',
              placeholder: 'Alt proje açıklamasını girin',
            },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              required: true,
              options: [
                { value: 'Planlandı', label: 'Planlandı' },
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Tamamlandı', label: 'Tamamlandı' },
              ],
            },
          ]}
          onSubmit={handleCreateSubProject}
          onCancel={() => setShowCreateSubProject(false)}
        />
      </Modal>

      <Modal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title='Yeni Görev Oluştur'
        size='md'
      >
        <SmartForm
          fields={[
            {
              name: 'title',
              label: 'Görev Başlığı',
              type: 'text',
              required: true,
              placeholder: 'Görev başlığını girin',
            },
            {
              name: 'description',
              label: 'Açıklama',
              type: 'textarea',
              placeholder: 'Görev açıklamasını girin',
            },
            {
              name: 'priority',
              label: 'Öncelik',
              type: 'select',
              required: true,
              options: [
                { value: 'Düşük', label: 'Düşük' },
                { value: 'Orta', label: 'Orta' },
                { value: 'Yüksek', label: 'Yüksek' },
              ],
            },
            {
              name: 'dueDate',
              label: 'Bitiş Tarihi',
              type: 'date',
            },
          ]}
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateTask(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditProject}
        onClose={() => setShowEditProject(false)}
        title='Projeyi Düzenle'
        size='lg'
      >
        <SmartForm
          fields={[
            {
              name: 'name',
              label: 'Proje Adı',
              type: 'text',
              required: true,
              defaultValue: project.name,
            },
            {
              name: 'description',
              label: 'Açıklama',
              type: 'textarea',
              defaultValue: project.description,
            },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              required: true,
              defaultValue: project.status,
              options: [
                { value: 'Planlandı', label: 'Planlandı' },
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Tamamlandı', label: 'Tamamlandı' },
              ],
            },
            {
              name: 'type',
              label: 'Tip',
              type: 'select',
              required: true,
              defaultValue: project.type,
              options: [
                { value: 'B2B', label: 'B2B' },
                { value: 'B2C', label: 'B2C' },
              ],
            },
          ]}
          onSubmit={handleEditProject}
          onCancel={() => setShowEditProject(false)}
        />
      </Modal>
    </AdminLayout>
  );
}
