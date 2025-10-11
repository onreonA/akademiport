'use client';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowUpSLine,
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
  progressPercentage?: number;
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
  progress_percentage?: number;
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
  approval_note?: string;
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
      <div className='space-y-4'>
        {/* Compact Gradient Header */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.back()}
                className='p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors'
              >
                <RiArrowLeftLine className='w-5 h-5 text-white' />
              </button>
              <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                <RiFolderLine className='text-2xl text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  {project?.name}
                </h1>
                <p className='text-blue-100 text-sm'>{project?.description}</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-sm text-blue-100'>Proje İlerlemesi</div>
              <div className='text-2xl font-bold text-white'>
                {project?.progressPercentage || project?.progress || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Compact Statistics Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {/* Project Progress */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center'>
                  <RiBarChartLine className='text-white text-lg' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {project?.progressPercentage || project?.progress || 0}%
                  </div>
                  <div className='text-xs text-gray-500'>İlerleme</div>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center'>
                  <RiPlayLine className='text-white text-lg' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {completedTasks}/{totalTasks}
                  </div>
                  <div className='text-xs text-gray-500'>Görevler</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Projects */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center'>
                  <RiFolderLine className='text-white text-lg' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {completedSubProjects}/{totalSubProjects}
                  </div>
                  <div className='text-xs text-gray-500'>Alt Projeler</div>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center'>
                  <RiTimeLine className='text-white text-lg' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-red-600'>
                    {overdueTasks}
                  </div>
                  <div className='text-xs text-gray-500'>Geciken</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Project Info */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-gray-600'>Durum:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status || 'planning')}`}
              >
                {project?.status === 'active'
                  ? 'Aktif'
                  : project?.status || 'Planlama'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-600'>Firma:</span>
              <span className='font-medium text-gray-900'>
                {project?.companies?.name || 'N/A'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-600'>Başlangıç:</span>
              <span className='font-medium text-gray-900'>
                {project?.startDate
                  ? new Date(project.startDate).toLocaleDateString('tr-TR')
                  : 'N/A'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-600'>Bitiş:</span>
              <span className='font-medium text-gray-900'>
                {project?.endDate
                  ? new Date(project.endDate).toLocaleDateString('tr-TR')
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='mt-4'>
            <div className='flex justify-between text-sm mb-2'>
              <span className='text-gray-600'>Proje İlerlemesi</span>
              <span className='font-medium text-gray-900'>
                {project?.progressPercentage || project?.progress || 0}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
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

        {/* Compact Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {/* Search */}
            <div className='relative'>
              <RiSearchLine className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Alt proje ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Sub Project Filter */}
            <div>
              <select
                value={selectedSubProject || ''}
                onChange={e => setSelectedSubProject(e.target.value || null)}
                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white'
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

        {/* Compact Sub Projects */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-4 border-b border-gray-100'>
            <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <RiFolderLine className='w-5 h-5 text-blue-600' />
              Alt Projeler ({filteredSubProjects.length})
            </h3>
          </div>
          <div className='p-4 space-y-3'>
            {filteredSubProjects.map((subProject, index) => (
              <div
                key={subProject.id}
                className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200'
              >
                {/* Forum Style Sub-Project Header */}
                <div className='flex items-start gap-3'>
                  {/* Avatar */}
                  <div className='flex-shrink-0'>
                    <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm'>
                      <span className='text-white font-bold text-sm'>U</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='font-semibold text-gray-900'>
                        {subProject.name}
                      </span>
                      <span className='text-gray-500 text-sm'>
                        {new Date(
                          subProject.startDate || Date.now()
                        ).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    {subProject.description && (
                      <p className='text-gray-700 leading-relaxed mb-3'>
                        {subProject.description}
                      </p>
                    )}

                    {/* Status and Priority Badges */}
                    <div className='flex items-center gap-2 mb-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subProject.status)}`}
                      >
                        {subProject.status === 'active'
                          ? 'Aktif'
                          : subProject.status}
                      </span>
                      <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                        {(() => {
                          const progress =
                            subProject.progress_percentage ||
                            subProject.progress ||
                            0;
                          return `${progress}% Tamamlandı`;
                        })()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className='mb-3'>
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
                  </div>

                  {/* Post Number and Expand Button */}
                  <div className='flex-shrink-0 flex items-center gap-3'>
                    <span className='text-gray-400 text-sm font-medium'>
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => toggleSubProject(subProject.id)}
                      className='flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
                    >
                      {expandedSubProjects.has(subProject.id) ? (
                        <RiArrowUpSLine className='w-5 h-5 text-gray-600' />
                      ) : (
                        <RiArrowDownSLine className='w-5 h-5 text-gray-600' />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tasks for this sub-project */}
                <div className='mt-3'>
                  <button
                    onClick={() => toggleSubProject(subProject.id)}
                    className='flex items-center justify-between w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                  >
                    <h5 className='font-medium text-gray-700 text-sm'>
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
                    <div className='mt-3 ml-12 space-y-2'>
                      {tasks
                        .filter(task => task.subProject.id === subProject.id)
                        .map((task, index) => (
                          <div
                            key={task.id}
                            className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden'
                          >
                            {/* Forum Style Task Header */}
                            <div className='p-4'>
                              <div className='flex items-start gap-3'>
                                {/* Avatar */}
                                <div className='flex-shrink-0'>
                                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm'>
                                    <span className='text-white font-bold text-sm'>
                                      M
                                    </span>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-center gap-2 mb-2'>
                                    <span className='font-semibold text-gray-900'>
                                      {task.assigned_to || 'Atanmamış'}
                                    </span>
                                    <span className='text-gray-500 text-sm'>
                                      {new Date(
                                        task.start_date || Date.now()
                                      ).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                  <h6 className='font-semibold text-gray-900 text-base mb-2 leading-tight'>
                                    {task.title}
                                  </h6>
                                  {task.description && (
                                    <p className='text-gray-700 leading-relaxed mb-3'>
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Status and Priority Badges */}
                                  <div className='flex items-center gap-2 mb-3'>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                                    >
                                      {task.status === 'completed'
                                        ? 'Tamamlandı'
                                        : task.status === 'pending_approval'
                                          ? 'Onaya Gönderildi'
                                          : 'Aktif'}
                                    </span>
                                  </div>
                                </div>

                                {/* Post Number */}
                                <div className='flex-shrink-0'>
                                  <span className='text-gray-400 text-sm font-medium'>
                                    #{index + 1}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Task Content */}
                            <div className='px-4 pb-4'>
                              {/* Timeline Section */}
                              {(task.start_date || task.due_date) && (
                                <div className='mb-3'>
                                  <div className='flex items-center gap-2 flex-wrap'>
                                    {task.start_date && (
                                      <div className='flex items-center gap-2'>
                                        <div className='flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-lg border border-blue-200'>
                                          <div className='w-1.5 h-1.5 bg-blue-500 rounded-full'></div>
                                          <RiCalendarLine className='w-3 h-3 text-blue-600' />
                                          <div className='text-xs'>
                                            <div className='text-xs text-blue-600 font-medium'>
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
                                          className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${
                                            new Date(task.due_date) <
                                              new Date() &&
                                            task.status !== 'completed'
                                              ? 'bg-red-50 border-red-200'
                                              : 'bg-green-50 border-green-200'
                                          }`}
                                        >
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              new Date(task.due_date) <
                                                new Date() &&
                                              task.status !== 'completed'
                                                ? 'bg-red-500'
                                                : 'bg-green-500'
                                            }`}
                                          ></div>
                                          <RiTimeLine
                                            className={`w-3 h-3 ${
                                              new Date(task.due_date) <
                                                new Date() &&
                                              task.status !== 'completed'
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                            }`}
                                          />
                                          <div className='text-xs'>
                                            <div
                                              className={`text-xs font-medium ${
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
                                            className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${getRemainingTimeDisplay(task.due_date, task.status)?.className}`}
                                          >
                                            <div
                                              className={`w-1.5 h-1.5 rounded-full ${
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
                                            <RiTimeLine className='w-3 h-3' />
                                            <div className='text-xs'>
                                              <div className='text-xs font-medium'>
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
                                  <div className='flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg border border-green-200'>
                                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full'></div>
                                    <RiPlayLine className='w-3 h-3' />
                                    <span className='font-medium text-xs'>
                                      Tamamlandı
                                    </span>
                                  </div>
                                )}
                                {task.status === 'Onaya Gönderildi' && (
                                  <div className='flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg border border-orange-200'>
                                    <div className='w-1.5 h-1.5 bg-orange-500 rounded-full'></div>
                                    <RiPlayLine className='w-3 h-3' />
                                    <span className='font-medium text-xs'>
                                      Onaya Gönderildi
                                    </span>
                                  </div>
                                )}
                                {task.status === 'Tamamlandı' && (
                                  <div className='flex items-center justify-between w-full'>
                                    {/* Approval Note - Sol taraf */}
                                    {task.approval_note && (
                                      <div className='flex-1 mr-3'>
                                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-2'>
                                          <div className='flex items-start gap-2'>
                                            <div className='flex-shrink-0 mt-0.5'>
                                              <RiMessage3Line className='w-3 h-3 text-blue-600' />
                                            </div>
                                            <div className='flex-1'>
                                              <p className='text-xs font-medium text-blue-800 mb-1'>
                                                Admin Notu:
                                              </p>
                                              <p className='text-xs text-blue-700 leading-relaxed'>
                                                {task.approval_note}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Tamamlandı Badge - Sağ taraf */}
                                    <div className='flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg border border-green-200 flex-shrink-0'>
                                      <div className='w-1.5 h-1.5 bg-green-500 rounded-full'></div>
                                      <RiCheckboxCircleLine className='w-3 h-3' />
                                      <span className='font-medium text-xs'>
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
                                      className='px-3 py-1.5 bg-gray-500 text-white text-xs font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md'
                                    >
                                      <div className='flex items-center gap-1.5'>
                                        <RiTimeLine className='w-3 h-3' />
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
