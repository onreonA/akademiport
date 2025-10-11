'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RiAlertLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiFolderLine,
  RiPlayLine,
  RiSearchLine,
} from 'react-icons/ri';

import { useAuthStore } from '@/lib/stores/auth-store';

type ProjectStatus =
  | 'planning'
  | 'active'
  | 'completed'
  | 'paused'
  | 'cancelled';
type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress_percentage: number;
  deadline: string;
  created_at: string;
  updated_at: string;
  consultant_id?: string;
  companies: {
    name: string;
    city: string;
    industry: string;
  };
  project_comments: Array<{ id: string }>;
  project_files: Array<{ id: string }>;
  project_milestones: Array<{ id: string }>;
  tasks: Array<{ id: string }>;
}

interface ProjectFilters {
  search: string;
  status: ProjectStatus | '';
  priority: ProjectPriority | '';
  consultant: string;
  page: number;
  limit: number;
}

const statusLabels = {
  planning: 'Planlama',
  active: 'Aktif',
  completed: 'Tamamlandı',
  paused: 'Duraklatıldı',
  cancelled: 'İptal Edildi',
};

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil',
};

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const ProjectCard = ({
  project,
  onViewDetails,
}: {
  project: Project;
  onViewDetails: (project: Project) => void;
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 20) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'from-green-500 to-emerald-600';
      case 'completed':
        return 'from-blue-500 to-blue-600';
      case 'planning':
        return 'from-yellow-500 to-orange-500';
      case 'paused':
        return 'from-orange-500 to-red-500';
      case 'cancelled':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Belirtilmemiş';

    const date = new Date(dateString);
    // Invalid date kontrolü
    if (isNaN(date.getTime())) return 'Geçersiz Tarih';

    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isOverdue = (deadline: string | null | undefined, status: string) => {
    if (!deadline) return false;
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return false;
    return (
      date < new Date() && status !== 'completed' && status !== 'Tamamlandı'
    );
  };

  return (
    <div
      className='group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden'
      onClick={() => onViewDetails(project)}
    >
      {/* Animated Background */}
      <div className='absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

      {/* Floating Elements */}
      <div className='absolute top-4 right-4 w-8 h-8 bg-blue-500/10 rounded-full blur-sm group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300'></div>
      <div className='absolute bottom-6 left-6 w-6 h-6 bg-purple-500/10 rounded-full blur-sm group-hover:scale-105 group-hover:bg-purple-500/20 transition-all duration-300'></div>

      {/* Header */}
      <div className='relative p-6 pb-4'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    project.status === 'active'
                      ? 'bg-green-500'
                      : project.status === 'completed'
                        ? 'bg-blue-500'
                        : project.status === 'planning'
                          ? 'bg-yellow-500'
                          : project.status === 'paused'
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                  }`}
                ></div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : project.status === 'planning'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : project.status === 'paused'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {statusLabels[project.status]}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                  project.priority === 'urgent'
                    ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                    : project.priority === 'high'
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : project.priority === 'medium'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {priorityLabels[project.priority]}
              </span>
            </div>

            <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300'>
              {project.name}
            </h3>
            <p className='text-sm text-gray-600 mb-2 font-medium'>
              {project.companies.name}
            </p>
            <p className='text-sm text-gray-500 line-clamp-2 leading-relaxed'>
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='relative p-6 pt-0'>
        {/* Deadline */}
        <div
          className={`flex items-center text-sm mb-4 p-3 rounded-xl border-2 ${
            isOverdue(project.deadline, project.status)
              ? 'bg-red-50 border-red-200 animate-pulse'
              : 'bg-gray-50 border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50'
          } transition-all duration-300`}
        >
          <RiCalendarLine
            className={`w-5 h-5 mr-3 ${isOverdue(project.deadline, project.status) ? 'text-red-500' : 'text-gray-400 group-hover:text-blue-500'}`}
          />
          <span
            className={`font-medium ${
              isOverdue(project.deadline, project.status)
                ? 'text-red-700'
                : 'text-gray-600 group-hover:text-blue-700'
            }`}
          >
            Bitiş: {formatDate(project.deadline)}
          </span>
          {isOverdue(project.deadline, project.status) && (
            <RiAlertLine className='w-5 h-5 ml-2 text-red-500 animate-bounce' />
          )}
        </div>

        {/* Stats - Etkileyici */}
        <div className='grid grid-cols-3 gap-3 mb-6'>
          <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300'>
            <div className='text-lg font-bold text-blue-600 group-hover:scale-105 transition-transform duration-300'>
              {project.tasks.length}
            </div>
            <div className='text-xs text-blue-600 font-medium'>Görevler</div>
          </div>
          <div className='bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center group-hover:from-purple-100 group-hover:to-purple-200 transition-all duration-300'>
            <div className='text-lg font-bold text-purple-600 group-hover:scale-105 transition-transform duration-300'>
              {project.project_files.length}
            </div>
            <div className='text-xs text-purple-600 font-medium'>Dosyalar</div>
          </div>
          <div className='bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300'>
            <div className='text-lg font-bold text-green-600 group-hover:scale-105 transition-transform duration-300'>
              {project.project_comments.length}
            </div>
            <div className='text-xs text-green-600 font-medium'>Yorumlar</div>
          </div>
        </div>

        {/* Progress */}
        <div className='mb-6'>
          <div className='flex items-center justify-between text-sm mb-3'>
            <span className='text-gray-600 font-medium'>İlerleme</span>
            <span className='font-bold text-gray-900 text-lg'>
              {project.progress_percentage}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                project.progress_percentage >= 80
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                  : project.progress_percentage >= 50
                    ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                    : project.progress_percentage >= 20
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-r from-red-400 to-red-600'
              } shadow-lg`}
              style={{ width: `${project.progress_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onViewDetails(project);
          }}
          className='w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-102'
        >
          <RiPlayLine className='w-4 h-4 group-hover:rotate-3 transition-transform duration-300' />
          Detayları Görüntüle
        </button>
      </div>
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm text-gray-600 mb-1'>{title}</p>
        <p className='text-2xl font-bold text-gray-900'>{value}</p>
        {trend && (
          <p
            className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}% bu ay
          </p>
        )}
      </div>
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className='w-6 h-6' />
      </div>
    </div>
  </div>
);

export default function EnhancedProjectList() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: '',
    priority: '',
    consultant: '',
    page: 1,
    limit: 12,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sortBy, setSortBy] = useState<
    'name' | 'deadline' | 'progress' | 'created_at'
  >('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // API entegrasyonu
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API çağrısı
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/projects', {
          method: 'GET',
          credentials: 'include', // Cookie'leri dahil et
        });

        if (!response.ok) {
          throw new Error(
            `Atanmış projeler yüklenirken hata oluştu: ${response.status}`
          );
        }

        const data = await response.json();

        // Type guard for API response
        const isValidProjectData = (
          project: unknown
        ): project is {
          id: string;
          name: string;
          description: string;
          status: string;
          progress?: number;
          end_date?: string;
          start_date: string;
          created_at: string;
          updated_at: string;
          consultant_id?: string;
          companies?: {
            name?: string;
            city?: string;
            industry?: string;
          };
        } => {
          return (
            typeof project === 'object' &&
            project !== null &&
            'id' in project &&
            'name' in project &&
            'description' in project &&
            'status' in project
          );
        };

        // Yeni API formatını kontrol et
        if (data.projects) {
          const formattedProjects = data.projects.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status as ProjectStatus,
            priority: (project.priority || 'medium') as ProjectPriority,
            progress_percentage:
              project.progressPercentage ||
              project.progress_percentage ||
              project.progress ||
              0,
            deadline:
              project.deadline || project.endDate || project.end_date || null,
            created_at: project.createdAt || project.created_at,
            updated_at: project.updatedAt || project.updated_at,
            consultant_id: project.consultantId || project.consultant_id,
            companies: {
              name:
                project.companies?.name ||
                (project.company_id ? 'Atanmış Firma' : 'Genel Proje'),
              city: project.companies?.city || 'Belirtilmemiş',
              industry: project.companies?.industry || 'Belirtilmemiş',
            },
            project_comments: project.project_comments || [],
            project_files: project.project_files || [],
            project_milestones: [],
            tasks: project.tasks || [],
            subProjects: project.subProjects || [],
            assignedAt: project.assignedAt,
            assignmentStatus: project.assignmentStatus,
          }));
          setProjects(formattedProjects);
        } else {
          throw new Error(data.error || 'API yanıtı beklenmedik format');
        }
      } catch (err) {
        console.error('❌ EnhancedProjectList - API Error:', err);
        // API Error
        setError(
          err instanceof Error
            ? err.message
            : 'Atanmış projeler yüklenirken hata oluştu'
        );
        // Mock data kullanma, sadece hata göster
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Mock data - fallback için
  const mockProjects = [
    {
      id: '1',
      name: 'E-ticaret Platformu Geliştirme',
      description: 'Modern e-ticaret platformu geliştirme projesi',
      status: 'active' as const,
      priority: 'high' as const,
      progress_percentage: 65,
      deadline: '2024-12-31',
      created_at: '2024-01-15',
      updated_at: '2024-01-20',
      consultant_id: 'consultant-1',
      companies: {
        name: 'ABC Teknoloji',
        city: 'İstanbul',
        industry: 'Teknoloji',
      },
      project_comments: [{ id: '1' }, { id: '2' }],
      project_files: [{ id: '1' }, { id: '2' }, { id: '3' }],
      project_milestones: [{ id: '1' }, { id: '2' }],
      tasks: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
    },
    {
      id: '2',
      name: 'Mobil Uygulama Projesi',
      description: 'iOS ve Android mobil uygulama geliştirme',
      status: 'active' as const,
      priority: 'medium' as const,
      progress_percentage: 30,
      deadline: '2024-11-30',
      created_at: '2024-02-01',
      updated_at: '2024-02-15',
      consultant_id: 'consultant-2',
      companies: {
        name: 'XYZ Yazılım',
        city: 'Ankara',
        industry: 'Yazılım',
      },
      project_comments: [{ id: '1' }],
      project_files: [{ id: '1' }, { id: '2' }],
      project_milestones: [{ id: '1' }],
      tasks: [{ id: '1' }, { id: '2' }],
    },
    {
      id: '3',
      name: 'Web Sitesi Yenileme',
      description: 'Kurumsal web sitesi yenileme projesi',
      status: 'completed' as const,
      priority: 'low' as const,
      progress_percentage: 100,
      deadline: '2024-10-15',
      created_at: '2024-01-01',
      updated_at: '2024-10-15',
      consultant_id: 'consultant-3',
      companies: {
        name: 'DEF Danışmanlık',
        city: 'İzmir',
        industry: 'Danışmanlık',
      },
      project_comments: [{ id: '1' }, { id: '2' }, { id: '3' }],
      project_files: [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
      ],
      project_milestones: [{ id: '1' }, { id: '2' }, { id: '3' }],
      tasks: [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '6' },
      ],
    },
  ];

  // Filtreleme ve sıralama mantığı
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Arama filtresi
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        project =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.companies.name.toLowerCase().includes(searchLower)
      );
    }

    // Durum filtresi
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Öncelik filtresi
    if (filters.priority) {
      filtered = filtered.filter(
        project => project.priority === filters.priority
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'deadline':
          aValue = new Date(a.deadline);
          bValue = new Date(b.deadline);
          break;
        case 'progress':
          aValue = a.progress_percentage;
          bValue = b.progress_percentage;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [filters, sortBy, sortOrder, projects]);

  const pagination = {
    total: projects.length,
    page: 1,
    limit: 12,
    totalPages: 1,
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!projects.length) return null;

    const total = projects.length;
    const active = projects.filter(
      p => p.status === 'Aktif' || p.status === 'active'
    ).length;
    const completed = projects.filter(
      p => p.status === 'Tamamlandı' || p.status === 'completed'
    ).length;
    const overdue = projects.filter(
      p =>
        p.deadline &&
        new Date(p.deadline) < new Date() &&
        p.status !== 'Tamamlandı' &&
        p.status !== 'completed'
    ).length;
    const avgProgress = Math.round(
      projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / total
    );

    return { total, active, completed, overdue, avgProgress };
  }, [projects]);

  const handleFilterChange = useCallback(
    (key: keyof ProjectFilters, value: string | number) => {
      setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  const handleSearch = useCallback((searchValue: string) => {
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  }, []);

  const handleViewDetails = useCallback((project: Project) => {
    setSelectedProject(project);
    // Navigate to project details page
    window.location.href = `/firma/proje-yonetimi/${project.id}`;
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      consultant: '',
      page: 1,
      limit: 12,
    });
  }, []);

  if (loading) {
    return (
      <div className='space-y-6'>
        {/* Loading Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <div className='h-4 bg-gray-200 rounded w-20 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-12'></div>
                </div>
                <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Projects */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse'
            >
              <div className='space-y-4'>
                <div className='h-6 bg-gray-200 rounded w-3/4'></div>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-2/3'></div>
                <div className='h-2 bg-gray-200 rounded w-full'></div>
                <div className='h-10 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards - Etkileyici */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Toplam Proje */}
          <div className='group relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white overflow-hidden cursor-pointer transform hover:scale-102 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent'></div>
            <div className='absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500'></div>
            <div className='absolute -bottom-5 -left-5 w-16 h-16 bg-white/10 rounded-full blur-lg group-hover:scale-105 transition-transform duration-500'></div>

            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-3 transition-transform duration-300'>
                  <RiFolderLine className='text-white text-2xl' />
                </div>
                <div className='text-right'>
                  <div className='text-3xl font-bold group-hover:scale-105 transition-transform duration-300'>
                    {stats.total}
                  </div>
                  <div className='text-white/80 text-sm font-medium'>
                    Toplam
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Aktif</span>
                  <span className='font-semibold'>{stats.active}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Tamamlanan</span>
                  <span className='font-semibold'>{stats.completed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aktif Proje */}
          <div className='group relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-2xl p-6 text-white overflow-hidden cursor-pointer transform hover:scale-102 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent'></div>
            <div className='absolute -top-8 -right-8 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500'></div>
            <div className='absolute -bottom-6 -left-6 w-14 h-14 bg-white/10 rounded-full blur-lg group-hover:scale-105 transition-transform duration-500'></div>

            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:-rotate-3 transition-transform duration-300'>
                  <RiPlayLine className='text-white text-2xl' />
                </div>
                <div className='text-right'>
                  <div className='text-3xl font-bold group-hover:scale-105 transition-transform duration-300'>
                    {stats.active}
                  </div>
                  <div className='text-white/80 text-sm font-medium'>Aktif</div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Planlama</span>
                  <span className='font-semibold'>
                    {
                      projects.filter(
                        p => p.status === 'Planlama' || p.status === 'planning'
                      ).length
                    }
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Duraklatıldı</span>
                  <span className='font-semibold'>
                    {
                      projects.filter(
                        p =>
                          p.status === 'Duraklatıldı' || p.status === 'paused'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tamamlanan */}
          <div className='group relative bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-2xl p-6 text-white overflow-hidden cursor-pointer transform hover:scale-102 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent'></div>
            <div className='absolute -top-12 -right-12 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500'></div>
            <div className='absolute -bottom-8 -left-8 w-18 h-18 bg-white/10 rounded-full blur-lg group-hover:scale-105 transition-transform duration-500'></div>

            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-3 transition-transform duration-300'>
                  <RiCheckLine className='text-white text-2xl' />
                </div>
                <div className='text-right'>
                  <div className='text-3xl font-bold group-hover:scale-105 transition-transform duration-300'>
                    {stats.completed}
                  </div>
                  <div className='text-white/80 text-sm font-medium'>
                    Tamamlanan
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Ortalama</span>
                  <span className='font-semibold'>{stats.avgProgress}%</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Başarı</span>
                  <span className='font-semibold'>96%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Geciken */}
          <div className='group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl p-6 text-white overflow-hidden cursor-pointer transform hover:scale-102 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent'></div>
            <div className='absolute -top-6 -right-6 w-18 h-18 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500'></div>
            <div className='absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full blur-lg group-hover:scale-105 transition-transform duration-500'></div>

            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:-rotate-3 transition-transform duration-300'>
                  <RiAlertLine className='text-white text-2xl' />
                </div>
                <div className='text-right'>
                  <div className='text-3xl font-bold group-hover:scale-105 transition-transform duration-300'>
                    {stats.overdue}
                  </div>
                  <div className='text-white/80 text-sm font-medium'>
                    Geciken
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-white/80'>Kritik</span>
                  <span className='font-semibold'>{stats.overdue}</span>
                </div>
                {stats.overdue > 0 && (
                  <div className='flex justify-center'>
                    <span className='text-xs font-bold bg-white/20 px-2 py-1 rounded-full animate-pulse'>
                      ⚠ DİKKAT
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etkileyici Search and Filters */}
      <div className='relative bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden'>
        {/* Animated Background */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500'></div>

        <div className='relative p-6'>
          <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
            {/* Search Box */}
            <div className='flex-1'>
              <div className='relative group'>
                <RiSearchLine className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors duration-300' />
                <input
                  type='text'
                  placeholder='Proje ara...'
                  value={filters.search}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                  className='w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md'
                />
              </div>
            </div>

            {/* Filters */}
            <div className='flex items-center gap-3'>
              <select
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                className='px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md'
              >
                <option value=''>Tüm Durumlar</option>
                <option value='planning'>Planlama</option>
                <option value='active'>Aktif</option>
                <option value='completed'>Tamamlandı</option>
                <option value='paused'>Duraklatıldı</option>
                <option value='cancelled'>İptal Edildi</option>
              </select>

              <select
                value={filters.priority}
                onChange={e => handleFilterChange('priority', e.target.value)}
                className='px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md'
              >
                <option value=''>Tüm Öncelikler</option>
                <option value='urgent'>Acil</option>
                <option value='high'>Yüksek</option>
                <option value='medium'>Orta</option>
                <option value='low'>Düşük</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [newSortBy, newSortOrder] = e.target.value.split(
                    '-'
                  ) as [typeof sortBy, typeof sortOrder];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className='px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md'
              >
                <option value='created_at-desc'>En Yeni</option>
                <option value='created_at-asc'>En Eski</option>
                <option value='name-asc'>A-Z</option>
                <option value='name-desc'>Z-A</option>
                <option value='deadline-asc'>Bitiş (Yakın)</option>
                <option value='deadline-desc'>Bitiş (Uzak)</option>
                <option value='progress-desc'>İlerleme (Yüksek)</option>
                <option value='progress-asc'>İlerleme (Düşük)</option>
              </select>

              {(filters.search || filters.status || filters.priority) && (
                <button
                  onClick={clearFilters}
                  className='px-4 py-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-red-200 shadow-sm hover:shadow-md'
                >
                  <RiCloseLine className='w-4 h-4' />
                </button>
              )}
            </div>
          </div>

          {/* Results Info */}
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <span className='text-sm text-gray-600'>
                  <span className='font-bold text-gray-900 text-lg'>
                    {projects.length}
                  </span>{' '}
                  proje bulundu
                </span>
                {(filters.search || filters.status || filters.priority) && (
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 animate-pulse'>
                    ✨ Filtrelenmiş
                  </span>
                )}
              </div>
              {projects.length > 0 && (
                <span className='text-xs text-gray-500 font-medium'>
                  {sortBy === 'name'
                    ? 'İsim'
                    : sortBy === 'deadline'
                      ? 'Bitiş Tarihi'
                      : sortBy === 'progress'
                        ? 'İlerleme'
                        : 'Oluşturma Tarihi'}
                  ({sortOrder === 'asc' ? 'Artan' : 'Azalan'})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <div className='flex items-center gap-2'>
            <RiAlertLine className='text-red-500' />
            <span className='text-red-700 font-medium'>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className='ml-auto text-red-600 hover:text-red-800 font-medium'
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className='text-center py-12'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <RiFolderLine className='text-gray-400 text-3xl' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            {filters.search || filters.status || filters.priority
              ? 'Proje bulunamadı'
              : 'Henüz proje bulunmuyor'}
          </h3>
          <p className='text-gray-500'>
            {filters.search || filters.status || filters.priority
              ? 'Seçilen kriterlere uygun proje bulunmuyor. Filtreleri temizleyip tekrar deneyin.'
              : 'Size henüz proje atanmamış. Lütfen admin ile iletişime geçin.'}
          </p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredAndSortedProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className='flex justify-center items-center gap-2'>
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                className='px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Önceki
              </button>

              <span className='px-4 py-2 text-sm text-gray-600'>
                Sayfa {filters.page} / {pagination.totalPages}
              </span>

              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page === pagination.totalPages}
                className='px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
