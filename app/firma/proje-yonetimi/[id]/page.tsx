'use client';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowDownLine,
  RiArrowLeftLine,
  RiBarChartLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiFolderLine,
  RiMessage3Line,
  RiPlayLine,
  RiSearchLine,
  RiTimeLine,
} from 'react-icons/ri';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';

import TaskCompletionModal from './TaskCompletionModal';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  companies: {
    name: string;
  };
}

interface SubProject {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  due_date: string;
  assigned_to: string;
  progress: number;
  subProject: {
    id: string;
    name: string;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubProject, setSelectedSubProject] = useState<string | null>(
    null
  );
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedSubProjects, setExpandedSubProjects] = useState<Set<string>>(
    new Set()
  );

  const fetchProjectData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/firma/projects/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project data');
      }

      setProject(data.project);
      setSubProjects(data.subProjects || []);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleTaskCompletedWithRefresh = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      // Refresh project data
      await fetchProjectData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      planning: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-orange-100 text-orange-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
      Yüksek: 'bg-red-100 text-red-800',
      Orta: 'bg-yellow-100 text-yellow-800',
      Düşük: 'bg-green-100 text-green-800',
    };
    return priorityMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const calculateRemainingDays = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRemainingTimeDisplay = (dueDate: string, status: string) => {
    if (status === 'completed') return null;

    const days = calculateRemainingDays(dueDate);

    if (days < 0) {
      return {
        text: `${Math.abs(days)} gün gecikmiş`,
        className: 'bg-red-50/80 border-red-100/50 text-red-700',
      };
    } else if (days === 0) {
      return {
        text: 'Bugün bitiyor',
        className: 'bg-orange-50/80 border-orange-100/50 text-orange-700',
      };
    } else if (days <= 3) {
      return {
        text: `${days} gün kaldı`,
        className: 'bg-yellow-50/80 border-yellow-100/50 text-yellow-700',
      };
    } else {
      return {
        text: `${days} gün kaldı`,
        className: 'bg-green-50/80 border-green-100/50 text-green-700',
      };
    }
  };

  const filteredSubProjects = subProjects.filter(subProject =>
    subProject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubProject = selectedSubProject
      ? task.subProject.id === selectedSubProject
      : true;
    return matchesSearch && matchesSubProject;
  });

  const toggleSubProject = (subProjectId: string) => {
    const newExpanded = new Set(expandedSubProjects);
    if (newExpanded.has(subProjectId)) {
      newExpanded.delete(subProjectId);
    } else {
      newExpanded.add(subProjectId);
    }
    setExpandedSubProjects(newExpanded);
  };

  // Calculate statistics
  const completedTasks = tasks.filter(
    task => task.status === 'Tamamlandı'
  ).length;
  const totalTasks = tasks.length;
  const completedSubProjects = subProjects.filter(
    sp =>
      sp.status === 'Tamamlandı' ||
      sp.status === 'completed' ||
      (sp.progress_percentage || sp.progress || 0) >= 100
  ).length;
  const totalSubProjects = subProjects.length;

  console.log('Sub project stats:', {
    totalSubProjects,
    completedSubProjects,
    subProjects: subProjects.map(sp => ({
      id: sp.id,
      name: sp.name,
      status: sp.status,
      progress_percentage: sp.progress_percentage,
      progress: sp.progress,
      isCompleted:
        sp.status === 'Tamamlandı' ||
        sp.status === 'completed' ||
        (sp.progress_percentage || sp.progress || 0) >= 100,
    })),
  });
  const overdueTasks = tasks.filter(
    task => new Date(task.due_date) < new Date() && task.status !== 'Tamamlandı'
  ).length;

  if (isLoading) {
    return (
      <FirmaLayout
        title='Proje Detayı'
        description='Proje detaylarını görüntüleyin'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      </FirmaLayout>
    );
  }

  if (error) {
    return (
      <FirmaLayout
        title='Proje Detayı'
        description='Proje detaylarını görüntüleyin'
      >
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout
      title='Proje Detayı'
      description='Proje detaylarını görüntüleyin'
      showHeader={false}
    >
      <div className='space-y-6'>
        {/* Modern Page Header */}
        <div className='mb-6'>
          {/* Breadcrumb Navigation */}
          <div className='mb-3'>
            <nav className='flex items-center space-x-2 text-sm text-gray-500'>
              <span className='hover:text-gray-700 cursor-pointer'>
                Ana Sayfa
              </span>
              <i className='ri-arrow-right-s-line text-xs'></i>
              <span
                className='hover:text-gray-700 cursor-pointer'
                onClick={() => router.push('/firma/proje-yonetimi')}
              >
                Proje Yönetimi
              </span>
              <i className='ri-arrow-right-s-line text-xs'></i>
              <span className='text-gray-900 font-medium'>{project?.name}</span>
            </nav>
          </div>

          {/* Page Title */}
          <div className='mb-3'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => router.back()}
                className='p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
              >
                <RiArrowLeftLine className='w-4 h-4 text-gray-600' />
              </button>
              <h1 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>
                {project?.name?.toUpperCase()}
              </h1>
            </div>
          </div>

          {/* Page Description */}
          <div className='mb-4'>
            <p className='text-sm text-gray-600 font-medium leading-relaxed'>
              {project?.description}
            </p>
          </div>

          {/* Decorative Line */}
          <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'></div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Project Progress */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Proje İlerlemesi
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {project?.progressPercentage || project?.progress || 0}%
                </p>
              </div>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <RiBarChartLine className='w-5 h-5 text-blue-600' />
              </div>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-1.5'>
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  (project?.progressPercentage || project?.progress || 0) >= 80
                    ? 'bg-green-500'
                    : (project?.progressPercentage || project?.progress || 0) >=
                        50
                      ? 'bg-yellow-500'
                      : (project?.progressPercentage ||
                            project?.progress ||
                            0) >= 20
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                }`}
                style={{
                  width: `${project?.progressPercentage || project?.progress || 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Tamamlanan Görevler
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {completedTasks}/{totalTasks}
                </p>
              </div>
              <div className='p-2 bg-green-100 rounded-lg'>
                <RiPlayLine className='w-5 h-5 text-green-600' />
              </div>
            </div>
            <div className='text-xs text-gray-500'>
              {totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0}
              % tamamlandı
            </div>
          </div>

          {/* Sub Projects */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Alt Projeler
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {completedSubProjects}/{totalSubProjects}
                </p>
              </div>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <RiFolderLine className='w-5 h-5 text-purple-600' />
              </div>
            </div>
            <div className='text-xs text-gray-500'>
              {totalSubProjects > 0
                ? Math.round((completedSubProjects / totalSubProjects) * 100)
                : 0}
              % tamamlandı
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Geciken Görevler
                </p>
                <p className='text-xl font-bold text-red-600'>{overdueTasks}</p>
              </div>
              <div className='p-2 bg-red-100 rounded-lg'>
                <RiTimeLine className='w-5 h-5 text-red-600' />
              </div>
            </div>
            <div className='text-xs text-gray-500'>
              {overdueTasks > 0 ? 'Dikkat gerekli' : 'Gecikme yok'}
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            Proje Bilgileri
          </h3>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='text-gray-600'>Durum:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status || 'planning')}`}
              >
                {project?.status === 'active'
                  ? 'Aktif'
                  : project?.status || 'Planlama'}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>Firma:</span>
              <span className='ml-2 font-medium text-gray-900'>
                {project?.companies?.name || 'N/A'}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>Başlangıç:</span>
              <span className='ml-2 font-medium text-gray-900'>
                {project?.startDate
                  ? new Date(project.startDate).toLocaleDateString('tr-TR')
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>Bitiş:</span>
              <span className='ml-2 font-medium text-gray-900'>
                {project?.endDate
                  ? new Date(project.endDate).toLocaleDateString('tr-TR')
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>İlerleme:</span>
              <span className='ml-2 font-medium text-gray-900'>
                {project?.progressPercentage || project?.progress || 0}%
              </span>
            </div>
          </div>

          {/* Ana Proje Progress Bar */}
          <div className='mt-4'>
            <div className='flex justify-between text-sm mb-1'>
              <span className='text-gray-600'>Proje İlerlemesi</span>
              <span className='font-medium text-gray-900'>
                {project?.progressPercentage || project?.progress || 0}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  (project?.progressPercentage || project?.progress || 0) >= 80
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : (project?.progressPercentage || project?.progress || 0) >=
                        50
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : (project?.progressPercentage ||
                            project?.progress ||
                            0) >= 20
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{
                  width: `${project?.progressPercentage || project?.progress || 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            Filtreler
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Search */}
            <div className='relative'>
              <RiSearchLine className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Alt proje ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Sub Project Filter */}
            <div>
              <select
                value={selectedSubProject || ''}
                onChange={e => setSelectedSubProject(e.target.value || null)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Tüm Alt Projeler</option>
                {subProjects.map(subProject => (
                  <option key={subProject.id} value={subProject.id}>
                    {subProject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub Projects */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='p-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <RiFolderLine className='w-5 h-5 text-blue-600' />
              Alt Projeler ({filteredSubProjects.length})
            </h3>
          </div>
          <div className='p-4 space-y-4'>
            {filteredSubProjects.map(subProject => (
              <div
                key={subProject.id}
                className='bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors'
              >
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-semibold text-gray-900 text-lg'>
                    {subProject.name}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subProject.status)}`}
                  >
                    {subProject.status === 'active'
                      ? 'Aktif'
                      : subProject.status}
                  </span>
                </div>

                {/* Sub Project Details */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3'>
                  <div>
                    <span className='text-gray-600'>Açıklama:</span>
                    <p className='font-medium text-gray-900 mt-1'>
                      {subProject.description || 'Açıklama yok'}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Başlangıç:</span>
                    <p className='font-medium text-gray-900 mt-1'>
                      {subProject.startDate
                        ? new Date(subProject.startDate).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Bitiş:</span>
                    <p className='font-medium text-gray-900 mt-1'>
                      {subProject.endDate
                        ? new Date(subProject.endDate).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='mb-3'>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-600'>İlerleme</span>
                    <span className='font-medium text-gray-900'>
                      {(() => {
                        const progress =
                          subProject.progress_percentage ||
                          subProject.progress ||
                          0;
                        console.log(
                          '🔍 Frontend - Sub-project progress render:',
                          {
                            subProjectId: subProject.id,
                            subProjectName: subProject.name,
                            progress_percentage: subProject.progress_percentage,
                            progress: subProject.progress,
                            finalProgress: progress,
                          }
                        );
                        return progress;
                      })()}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (subProject.progress_percentage ||
                          subProject.progress ||
                          0) >= 80
                          ? 'bg-green-500'
                          : (subProject.progress_percentage ||
                                subProject.progress ||
                                0) >= 50
                            ? 'bg-yellow-500'
                            : (subProject.progress_percentage ||
                                  subProject.progress ||
                                  0) >= 20
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      }`}
                      style={{
                        width: `${subProject.progress_percentage || subProject.progress || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Tasks for this sub-project */}
                <div className='mt-4'>
                  <button
                    onClick={() => toggleSubProject(subProject.id)}
                    className='flex items-center justify-between w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                  >
                    <h5 className='font-medium text-gray-700'>
                      Görevler (
                      {
                        tasks.filter(
                          task => task.subProject.id === subProject.id
                        ).length
                      }
                      )
                    </h5>
                    <RiArrowDownLine
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedSubProjects.has(subProject.id)
                          ? 'rotate-180'
                          : ''
                      }`}
                    />
                  </button>

                  {expandedSubProjects.has(subProject.id) && (
                    <div className='mt-3 space-y-3'>
                      {tasks
                        .filter(task => task.subProject.id === subProject.id)
                        .map(task => (
                          <div
                            key={task.id}
                            className='bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden'
                          >
                            {/* Task Header */}
                            <div className='p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1 min-w-0'>
                                  <h6 className='font-semibold text-gray-900 text-base mb-1 leading-tight'>
                                    {task.title}
                                  </h6>
                                  {task.description && (
                                    <p className='text-sm text-gray-600 leading-relaxed line-clamp-2'>
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                                <div className='flex items-center gap-2 ml-3'>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(task.priority)}`}
                                  >
                                    {task.priority}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(task.status)}`}
                                  >
                                    {task.status === 'completed'
                                      ? 'Tamamlandı'
                                      : task.status === 'pending_approval'
                                        ? 'Onaya Gönderildi'
                                        : 'Aktif'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Task Content */}
                            <div className='p-4'>
                              {/* Timeline Section */}
                              {(task.start_date || task.due_date) && (
                                <div className='mb-4'>
                                  <div className='flex items-center gap-3 flex-wrap'>
                                    {task.start_date && (
                                      <div className='flex items-center gap-2'>
                                        <div className='flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200'>
                                          <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                          <RiCalendarLine className='w-4 h-4 text-blue-600' />
                                          <div className='text-sm'>
                                            <div className='text-xs text-blue-600 font-medium uppercase tracking-wide'>
                                              Başlangıç
                                            </div>
                                            <div className='font-semibold text-blue-800'>
                                              {new Date(
                                                task.start_date
                                              ).toLocaleDateString('tr-TR')}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {task.due_date && (
                                      <div className='flex items-center gap-2'>
                                        <div
                                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                            new Date(task.due_date) <
                                              new Date() &&
                                            task.status !== 'completed'
                                              ? 'bg-red-50 border-red-200'
                                              : 'bg-green-50 border-green-200'
                                          }`}
                                        >
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              new Date(task.due_date) <
                                                new Date() &&
                                              task.status !== 'completed'
                                                ? 'bg-red-500'
                                                : 'bg-green-500'
                                            }`}
                                          ></div>
                                          <RiTimeLine
                                            className={`w-4 h-4 ${
                                              new Date(task.due_date) <
                                                new Date() &&
                                              task.status !== 'completed'
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                            }`}
                                          />
                                          <div className='text-sm'>
                                            <div
                                              className={`text-xs font-medium uppercase tracking-wide ${
                                                new Date(task.due_date) <
                                                  new Date() &&
                                                task.status !== 'completed'
                                                  ? 'text-red-600'
                                                  : 'text-green-600'
                                              }`}
                                            >
                                              Bitiş
                                            </div>
                                            <div
                                              className={`font-semibold ${
                                                new Date(task.due_date) <
                                                  new Date() &&
                                                task.status !== 'completed'
                                                  ? 'text-red-800'
                                                  : 'text-green-800'
                                              }`}
                                            >
                                              {new Date(
                                                task.due_date
                                              ).toLocaleDateString('tr-TR')}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Remaining Time */}
                                    {task.due_date &&
                                      getRemainingTimeDisplay(
                                        task.due_date,
                                        task.status
                                      ) && (
                                        <div className='flex items-center gap-2'>
                                          <div
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm ${getRemainingTimeDisplay(task.due_date, task.status)?.className}`}
                                          >
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                getRemainingTimeDisplay(
                                                  task.due_date,
                                                  task.status
                                                )?.className.includes('red')
                                                  ? 'bg-red-500'
                                                  : getRemainingTimeDisplay(
                                                        task.due_date,
                                                        task.status
                                                      )?.className.includes(
                                                        'orange'
                                                      )
                                                    ? 'bg-orange-500'
                                                    : getRemainingTimeDisplay(
                                                          task.due_date,
                                                          task.status
                                                        )?.className.includes(
                                                          'yellow'
                                                        )
                                                      ? 'bg-yellow-500'
                                                      : 'bg-green-500'
                                              }`}
                                            ></div>
                                            <RiTimeLine className='w-4 h-4' />
                                            <div className='text-sm'>
                                              <div className='text-xs font-medium uppercase tracking-wide'>
                                                Kalan
                                              </div>
                                              <div className='font-bold'>
                                                {
                                                  getRemainingTimeDisplay(
                                                    task.due_date,
                                                    task.status
                                                  )?.text
                                                }
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}

                              {/* Action Section */}
                              <div className='flex items-center justify-end pt-3 border-t border-gray-100'>
                                {task.status === 'completed' && (
                                  <div className='flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                    <RiPlayLine className='w-4 h-4' />
                                    <span className='font-medium text-sm'>
                                      Tamamlandı
                                    </span>
                                  </div>
                                )}
                                {task.status === 'Onaya Gönderildi' && (
                                  <div className='flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-200'>
                                    <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                                    <RiPlayLine className='w-4 h-4' />
                                    <span className='font-medium text-sm'>
                                      Onaya Gönderildi
                                    </span>
                                  </div>
                                )}
                                {task.status === 'Tamamlandı' && (
                                  <div className='flex items-center justify-between w-full'>
                                    {/* Approval Note - Sol taraf */}
                                    {task.approval_note && (
                                      <div className='flex-1 mr-4'>
                                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                                          <div className='flex items-start gap-2'>
                                            <div className='flex-shrink-0 mt-0.5'>
                                              <RiMessage3Line className='w-4 h-4 text-blue-600' />
                                            </div>
                                            <div className='flex-1'>
                                              <p className='text-xs font-medium text-blue-800 mb-1'>
                                                Admin Notu:
                                              </p>
                                              <p className='text-sm text-blue-700 leading-relaxed'>
                                                {task.approval_note}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Tamamlandı Badge - Sağ taraf */}
                                    <div className='flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200 flex-shrink-0'>
                                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                      <RiCheckboxCircleLine className='w-4 h-4' />
                                      <span className='font-medium text-sm'>
                                        Tamamlandı
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {task.status !== 'completed' &&
                                  task.status !== 'Onaya Gönderildi' &&
                                  task.status !== 'Tamamlandı' && (
                                    <button
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setShowTaskModal(true);
                                      }}
                                      className='px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                                    >
                                      <div className='flex items-center gap-2'>
                                        <RiTimeLine className='w-4 h-4' />
                                        Bekliyor
                                      </div>
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskCompleted={fetchProjectData}
      />
    </FirmaLayout>
  );
}
