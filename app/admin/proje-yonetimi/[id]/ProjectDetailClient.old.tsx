'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import AdvancedBulkDateManager from '@/components/admin/AdvancedBulkDateManager';
import CompanyProgressModal from '@/components/admin/CompanyProgressModal';
import ProjectDateSelector from '@/components/admin/ProjectDateSelector';
import SubProjectCompletionModal from '@/components/admin/SubProjectCompletionModal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';

import EnhancedAssignmentModal from './EnhancedAssignmentModal';
import TaskAssignmentModal from './TaskAssignmentModal';

interface MainProject {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  consultantName: string;
  companyName: string;
  subProjectCount: number;
  assignedCompanies: number;
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
  assignedCompanyCount: number;
}
interface Task {
  id: string;
  title: string; // Database actually uses 'title'
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  due_date: string; // Database uses 'due_date' not 'deadline'
  progress_percentage: number;
  sub_project_id: string;
}
interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
  assignedDate: string;
  progress: number;
}
export default function ProjectDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<MainProject | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSubProjects, setExpandedSubProjects] = useState<Set<string>>(
    new Set()
  );
  const [showAssignCompanyModal, setShowAssignCompanyModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<MainProject | null>(
    null
  );
  const [assignedCompanyIds, setAssignedCompanyIds] = useState<string[]>([]);
  const [newSubProject, setNewSubProject] = useState({
    name: '',
    description: '',
    status: 'Planlandı' as 'Planlandı' | 'Aktif' | 'Tamamlandı',
  });
  const [isCreatingSubProject, setIsCreatingSubProject] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isAssigningCompanies, setIsAssigningCompanies] = useState(false);
  // Task assignment modal states
  const [showTaskAssignmentModal, setShowTaskAssignmentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // Multi-company assignment modal states
  const [showMultiCompanyModal, setShowMultiCompanyModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState<
    'project' | 'sub-project' | 'task'
  >('project');
  const [assignmentItem, setAssignmentItem] = useState<any>(null);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [subProjectAssignments, setSubProjectAssignments] = useState<any[]>([]);
  // Bulk date management states
  const [showBulkDateModal, setShowBulkDateModal] = useState(false);
  const [bulkDateLevel, setBulkDateLevel] = useState<
    'project' | 'sub-project' | 'task'
  >('project');
  const [bulkDateItems, setBulkDateItems] = useState<any[]>([]);

  // Sub-project completion report states
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Company progress modal states
  const [showCompanyProgressModal, setShowCompanyProgressModal] =
    useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const fetchAssignedCompanies = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/projects/${params.id}/assignments`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        const companyIds =
          data.assignments?.map((assignment: any) => assignment.company_id) ||
          [];
        setAssignedCompanyIds(companyIds);
      }
    } catch (error) {}
  }, [params.id]);
  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Proje detaylarını al
      const projectResponse = await fetch(`/api/projects/${params.id}`, {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (!projectResponse.ok) {
        throw new Error('Proje detayları yüklenirken hata oluştu');
      }
      const projectData = await projectResponse.json(); // Debug için
      // API'den gelen veriyi frontend formatına çevir
      const formattedProject = {
        id: projectData.project.id,
        name: projectData.project.name,
        description: projectData.project.description,
        type: 'B2B', // Varsayılan değer
        status:
          projectData.project.status === 'Aktif'
            ? 'Aktif'
            : projectData.project.status === 'Tamamlandı'
              ? 'Tamamlandı'
              : 'Planlandı',
        progress: projectData.project.progress_percentage || 0,
        startDate:
          projectData.project.start_date || projectData.project.startDate,
        endDate:
          projectData.project.end_date ||
          projectData.project.deadline ||
          projectData.project.endDate,
        consultantName: projectData.project.consultant_name || 'Atanmamış',
        companyName: projectData.project.companies?.name || 'Bilinmiyor',
        subProjectCount: projectData.project.sub_projects?.length || 0,
        assignedCompanies: companies.length, // Dinamik değer
      };
      setProject(formattedProject);
      // Alt projeleri al
      const subProjectsResponse = await fetch(
        `/api/projects/${params.id}/sub-projects`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (subProjectsResponse.ok) {
        const subProjectsData = await subProjectsResponse.json();
        setSubProjects(subProjectsData.subProjects || []);
      }
      // Görevleri al
      const tasksResponse = await fetch(`/api/projects/${params.id}/tasks`, {
        credentials: 'include',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          Cookie: document.cookie,
        },
      });
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json(); // Debug için
        setTasks(tasksData.tasks || []);
      } else {
      }
      // Projeye atanmış firmaları getir
      const assignmentsResponse = await fetch(
        `/api/admin/projects/${params.id}/assignments`,
        {
          credentials: 'include',
        }
      );
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setCompanies(
          assignmentsData.assignments.map((assignment: any) => ({
            id: assignment.company_id,
            name: assignment.companies.name,
            email: assignment.companies.email,
            status: assignment.status,
            assignedDate: assignment.assignedAt,
            progress:
              assignment.status === 'Aktif'
                ? 75
                : assignment.status === 'Planlandı'
                  ? 25
                  : 0,
          }))
        );
      }
      // Tüm firmaları getir
      const companiesResponse = await fetch('/api/companies', {
        credentials: 'include',
      });
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        const companiesList = companiesData.companies.map((company: any) => ({
          id: company.id,
          name: company.name,
          email: company.email,
          status: company.status,
        }));
        setAvailableCompanies(companiesList);
        setAllCompanies(companiesList);
      }

      // Alt proje atamalarını al
      const subProjectAssignmentsResponse = await fetch(
        `/api/admin/projects/${params.id}/sub-project-assignments`,
        {
          credentials: 'include',
        }
      );
      if (subProjectAssignmentsResponse.ok) {
        const subProjectAssignmentsData =
          await subProjectAssignmentsResponse.json();
        setSubProjectAssignments(subProjectAssignmentsData.assignments || []);
      }
    } catch (error) {
      setError('Proje detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [params.id, companies.length]);

  // useEffect'i function'lardan sonra ekliyoruz
  useEffect(() => {
    if (params.id) {
      fetchProjectDetails();
      fetchAssignedCompanies();
    }
  }, [params.id, fetchProjectDetails, fetchAssignedCompanies]);

  const handleAssignCompanies = async (companyIds: string[]) => {
    if (companyIds.length === 0) {
      alert('Lütfen en az bir firma seçin');
      return;
    }
    setIsAssigningCompanies(true);
    try {
      const response = await fetch(
        `/api/admin/projects/${params.id}/assignments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            assignments: companyIds.map((id: string) => ({
              companyId: id,
              status: 'active',
            })),
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Firmalar başarıyla atandı!');
        // Firmaları yeniden yükle
        fetchProjectDetails();
        setSelectedCompanies([]);
        setShowAssignCompanyModal(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Firma atanırken hata oluştu');
        throw new Error(errorData.error || 'Firma atanırken hata oluştu');
      }
    } catch (error) {
      alert('Firma atanırken hata oluştu');
      throw error;
    } finally {
      setIsAssigningCompanies(false);
    }
  };
  const handleEditProject = () => {
    setEditingProject(project);
    setShowEditProjectModal(true);
  };
  const handleUpdateProject = async (updatedProject: Partial<MainProject>) => {
    try {
      // Debug
      const response = await fetch(`/api/projects`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: params.id, ...updatedProject }),
      }); // Debug
      if (response.ok) {
        const data = await response.json();
        setProject({ ...project, ...data.project });
        setShowEditProjectModal(false);
        alert('Proje başarıyla güncellendi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Proje güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Proje güncellenirken hata oluştu');
    }
  };
  const handleCompanySelection = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };
  const toggleSubProject = (subProjectId: string) => {
    const newExpanded = new Set(expandedSubProjects);
    if (newExpanded.has(subProjectId)) {
      newExpanded.delete(subProjectId);
    } else {
      newExpanded.add(subProjectId);
    }
    setExpandedSubProjects(newExpanded);
  };
  const getTasksForSubProject = (subProjectId: string) => {
    const filteredTasks = tasks.filter(
      task => task.sub_project_id === subProjectId
    ); // Debug için
    return filteredTasks;
  };
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      if (response.ok) {
        setTasks(prev =>
          prev.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        alert('Görev durumu güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Görev durumu güncellenirken hata oluştu');
    }
  };
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showTaskDatesModal, setShowTaskDatesModal] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState<SubProject | null>(
    null
  );
  const [showEditSubProjectModal, setShowEditSubProjectModal] = useState(false);
  const [showSubProjectDatesModal, setShowSubProjectDatesModal] =
    useState(false);
  const [showProjectDatesModal, setShowProjectDatesModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedSubProjectForTask, setSelectedSubProjectForTask] = useState<
    string | null
  >(null);
  const [showCreateSubProjectModal, setShowCreateSubProjectModal] =
    useState(false);
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowEditTaskModal(true);
  };
  const handleUpdateTask = async (updatedTask: Partial<Task>) => {
    if (!editingTask) return;
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify(updatedTask),
      });
      if (response.ok) {
        setTasks(prev =>
          prev.map(task =>
            task.id === editingTask.id ? { ...task, ...updatedTask } : task
          )
        );
        setShowEditTaskModal(false);
        setEditingTask(null);
        alert('Görev başarıyla güncellendi!');
      } else {
        alert('Görev güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Görev güncellenirken hata oluştu');
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        alert('Görev başarıyla silindi!');
      } else {
        alert('Görev silinirken hata oluştu');
      }
    } catch (error) {
      alert('Görev silinirken hata oluştu');
    }
  };
  const handleEditSubProject = (subProject: SubProject) => {
    setEditingSubProject(subProject);
    setShowEditSubProjectModal(true);
  };

  const handleSubProjectDates = (subProject: SubProject) => {
    setEditingSubProject(subProject);
    setShowSubProjectDatesModal(true);
  };

  const handleTaskDates = (task: Task) => {
    setEditingTask(task);
    setShowTaskDatesModal(true);
  };
  const handleUpdateSubProject = async (
    updatedSubProject: Partial<SubProject>
  ) => {
    if (!editingSubProject) return;
    try {
      const response = await fetch(
        `/api/sub-projects/${editingSubProject.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': 'admin@ihracatakademi.com',
          },
          body: JSON.stringify(updatedSubProject),
        }
      );
      if (response.ok) {
        setSubProjects(prev =>
          prev.map(subProject =>
            subProject.id === editingSubProject.id
              ? { ...subProject, ...updatedSubProject }
              : subProject
          )
        );
        setShowEditSubProjectModal(false);
        setEditingSubProject(null);
        alert('Alt proje başarıyla güncellendi!');
      } else {
        alert('Alt proje güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Alt proje güncellenirken hata oluştu');
    }
  };
  const handleDeleteSubProject = async (subProjectId: string) => {
    if (
      !confirm(
        'Bu alt projeyi silmek istediğinizden emin misiniz? Alt proje içindeki tüm görevler de silinecektir.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/sub-projects/${subProjectId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        setSubProjects(prev =>
          prev.filter(subProject => subProject.id !== subProjectId)
        );
        setTasks(prev =>
          prev.filter(task => task.sub_project_id !== subProjectId)
        );
        alert('Alt proje başarıyla silindi!');
      } else {
        alert('Alt proje silinirken hata oluştu');
      }
    } catch (error) {
      alert('Alt proje silinirken hata oluştu');
    }
  };
  const handleCreateTask = (subProjectId: string) => {
    setSelectedSubProjectForTask(subProjectId);
    setShowCreateTaskModal(true);
  };
  const handleSubmitNewTask = async (taskData: {
    title: string;
    description: string;
    priority: string;
  }) => {
    if (!selectedSubProjectForTask) return;
    try {
      const response = await fetch(`/api/projects/${params.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          subProjectId: selectedSubProjectForTask,
          priority: taskData.priority,
        }),
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [...prev, newTask.task]);
        setShowCreateTaskModal(false);
        setSelectedSubProjectForTask(null);
        alert('Görev başarıyla oluşturuldu!');
      } else {
        alert('Görev oluşturulurken hata oluştu');
      }
    } catch (error) {
      alert('Görev oluşturulurken hata oluştu');
    }
  };
  const handleCreateSubProject = () => {
    setShowCreateSubProjectModal(true);
  };
  const handleSubmitNewSubProject = async (subProjectData: {
    name: string;
    description: string;
    status: string;
  }) => {
    setIsCreatingSubProject(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/sub-projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify(subProjectData),
      });
      if (response.ok) {
        const newSubProject = await response.json();
        setSubProjects(prev => [...prev, newSubProject.subProject]);
        setShowCreateSubProjectModal(false);
        // Form state'ini temizle
        setNewSubProject({
          name: '',
          description: '',
          status: 'Planlandı' as 'Planlandı' | 'Aktif' | 'Tamamlandı',
        });
        alert('Alt proje başarıyla oluşturuldu!');
      } else {
        alert('Alt proje oluşturulurken hata oluştu');
      }
    } catch (error) {
      alert('Alt proje oluşturulurken hata oluştu');
    } finally {
      setIsCreatingSubProject(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-blue-100 text-blue-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
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
  // Task assignment handlers
  const handleAssignTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskAssignmentModal(true);
  };
  const handleTaskAssigned = () => {
    // Refresh tasks data
    fetchProjectDetails();
    setShowTaskAssignmentModal(false);
    setSelectedTask(null);
  };
  // Multi-company assignment handlers
  const handleAssignToCompanies = async (
    type: 'project' | 'sub-project' | 'task',
    item: any
  ) => {
    setAssignmentType(type);
    setAssignmentItem(item);

    // Fetch assignment data for Enhanced Modal
    try {
      let endpoint = '';
      if (type === 'project') {
        endpoint = `/api/admin/projects/${item.id}/assignments`;
      } else if (type === 'sub-project') {
        endpoint = `/api/admin/sub-projects/${item.id}/assignments`;
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAssignmentItem({
            ...item,
            type,
            assignments: data.assignments || [],
          });
          // allCompanies state'ini güncelle
          if (data.allCompanies) {
            setAllCompanies(data.allCompanies);
          }
        }
      }
    } catch (error) {
      setAssignmentItem({ ...item, type, assignments: [] });
    }

    setShowMultiCompanyModal(true);
  };
  const handleMultiCompanyAssign = async (companyIds: string[]) => {
    try {
      let endpoint = '';
      let payload: any = {};
      switch (assignmentType) {
        case 'project':
          endpoint = '/api/admin/project-assignments';
          payload = { projectId: assignmentItem.id, companyIds };
          break;
        case 'sub-project':
          endpoint = '/api/admin/sub-project-assignments';
          payload = { subProjectId: assignmentItem.id, companyIds };
          break;
        case 'task':
          endpoint = '/api/admin/task-assignments';
          payload = { taskId: assignmentItem.id, companyIds };
          break;
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert(
          `${assignmentType === 'project' ? 'Proje' : assignmentType === 'sub-project' ? 'Alt Proje' : 'Görev'} başarıyla firmalara atandı!`
        );
        fetchProjectDetails(); // Refresh data
      } else {
        alert('Atama işlemi sırasında hata oluştu');
      }
    } catch (error) {
      alert('Atama işlemi sırasında hata oluştu');
    }
  };

  // Enhanced Assignment Handler
  const handleEnhancedAssignment = async (
    assignments: { companyId: string; status: string }[]
  ) => {
    try {
      let endpoint = '';
      let payload: any = {};

      if (assignmentItem?.type === 'project') {
        endpoint = `/api/admin/projects/${assignmentItem.id}/assignments`;
        payload = { assignments };
      } else if (assignmentItem?.type === 'sub-project') {
        endpoint = `/api/admin/sub-projects/${assignmentItem.id}/assignments`;
        payload = { assignments, autoAssignParent: true };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);

        // Refresh project details
        fetchProjectDetails();

        // Close modal
        setShowMultiCompanyModal(false);
        setAssignmentItem(null);
      } else {
        const errorData = await response.json();
        alert(`❌ Atama işlemi sırasında hata oluştu: ${errorData.error}`);
      }
    } catch (error) {
      alert('❌ Atama işlemi sırasında hata oluştu');
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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
            href='/admin/proje-yonetimi'
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
          >
            Proje Listesine Dön
          </Link>
        </div>
      </div>
    );
  }
  return (
    <AdminLayout
      title={project?.name || 'Proje Detayı'}
      description={project?.description}
      showNotifications={false}
    >
      {/* Header Actions */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <nav className='flex mb-2' aria-label='Breadcrumb'>
            <ol className='flex items-center space-x-2 text-sm'>
              <li>
                <Link
                  href='/admin'
                  className='text-gray-500 hover:text-gray-700'
                >
                  Ana Panel
                </Link>
              </li>
              <li>
                <i className='ri-arrow-right-s-line text-gray-400'></i>
              </li>
              <li>
                <Link
                  href='/admin/proje-yonetimi'
                  className='text-gray-500 hover:text-gray-700'
                >
                  Proje Yönetimi
                </Link>
              </li>
              <li>
                <i className='ri-arrow-right-s-line text-gray-400'></i>
              </li>
              <li>
                <span className='text-gray-900 font-medium'>
                  {project?.name}
                </span>
              </li>
            </ol>
          </nav>
          <h2 className='text-2xl font-bold text-gray-900'>{project?.name}</h2>
          <p className='text-gray-600 mt-1'>{project?.description}</p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={() => handleAssignToCompanies('project', project)}
            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
          >
            Firmalara Ata
          </button>
          <button
            onClick={() => setShowCreateSubProjectModal(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
          >
            Alt Proje Ekle
          </button>
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
                  <i className='ri-building-line text-green-600'></i>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Atanan Firma
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {companies.length}
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
                <p className='text-sm font-medium text-gray-500'>Proje Türü</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {project.type}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Proje Detayları */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Proje Detayları
            </h3>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowMultiCompanyModal(true)}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm'
              >
                Firma Ata
              </button>
              <button
                onClick={() => setShowProjectDatesModal(true)}
                className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm'
              >
                Tarih Yönetimi
              </button>
              <button
                onClick={() => {
                  setBulkDateLevel('project');
                  setBulkDateItems([{ id: project.id, name: project.name }]);
                  setShowBulkDateModal(true);
                }}
                className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm'
              >
                Gelişmiş Toplu Tarih
              </button>
            </div>
          </div>
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
                  <span className='text-gray-500'>Danışman:</span>
                  <span className='font-medium'>
                    {project.consultantName || 'Atanmamış'}
                  </span>
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
                  name: 'Alt Projeler & Görevler',
                  icon: 'ri-folder-line',
                },
                {
                  id: 'companies',
                  name: 'Atanan Firmalar',
                  icon: 'ri-building-line',
                },
                {
                  id: 'dates',
                  name: 'Tarih Yönetimi',
                  icon: 'ri-calendar-line',
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
                        Alt proje tamamlandı
                      </p>
                      <p className='text-xs text-gray-500'>2 saat önce</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Yeni firma atandı
                      </p>
                      <p className='text-xs text-gray-500'>1 gün önce</p>
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
                      Tamamlanan Alt Projeler
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {
                        subProjects.filter(sp => sp.status === 'Tamamlandı')
                          .length
                      }
                      /{subProjects.length}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                    <span className='text-sm text-gray-600'>
                      Aktif Firmalar
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {companies.filter(c => c.status === 'Aktif').length}/
                      {companies.length}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                    <span className='text-sm text-gray-600'>Kalan Süre</span>
                    <span className='text-sm font-medium text-gray-900'>
                      45 gün
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
                Alt Projeler ve Görevler
              </h3>
              <button
                onClick={() => setShowCreateSubProjectModal(true)}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
              >
                Yeni Alt Proje Oluştur
              </button>
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
                  Bu proje için alt proje oluşturarak çalışmaya
                  başlayabilirsiniz.
                </p>
                <button
                  onClick={() => setShowCreateSubProjectModal(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                >
                  İlk Alt Projeyi Oluştur
                </button>
              </div>
            ) : (
              <div className='space-y-4'>
                {subProjects.map(subProject => {
                  const subProjectTasks = getTasksForSubProject(subProject.id);
                  const isExpanded = expandedSubProjects.has(subProject.id);
                  return (
                    <div
                      key={subProject.id}
                      className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
                    >
                      {/* Sub Project Header */}
                      <div
                        className='p-6 cursor-pointer hover:bg-gray-50 transition-colors'
                        onClick={() => toggleSubProject(subProject.id)}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-4'>
                            <div
                              className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-blue-500' : 'bg-gray-300'} transition-colors`}
                            />
                            <h4 className='font-medium text-gray-900'>
                              {subProject.name}
                            </h4>
                            <span className='text-sm text-gray-500'>
                              ({subProjectTasks.length} görev)
                            </span>
                          </div>
                          <div className='flex items-center space-x-3'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subProject.status)}`}
                            >
                              {subProject.status}
                            </span>
                            <span className='text-sm text-gray-600'>
                              {subProject.progress}%
                            </span>
                            <button
                              onClick={() =>
                                handleAssignToCompanies(
                                  'sub-project',
                                  subProject
                                )
                              }
                              className='p-1 text-green-600 hover:text-green-800'
                              title='Firmalara Ata'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditSubProject(subProject)}
                              className='p-1 text-blue-600 hover:text-blue-800'
                              title='Düzenle'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleSubProjectDates(subProject)}
                              className='p-1 text-purple-600 hover:text-purple-800'
                              title='Tarih Yönetimi'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setBulkDateLevel('sub-project');
                                setBulkDateItems([
                                  { id: subProject.id, name: subProject.name },
                                ]);
                                setShowBulkDateModal(true);
                              }}
                              className='p-1 text-indigo-600 hover:text-indigo-800'
                              title='Toplu Tarih Yönetimi'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                                />
                              </svg>
                            </button>

                            {/* Firma Karşılaştırması Butonu */}
                            <button
                              onClick={() => {
                                // Alt proje karşılaştırması için yeni bir modal açılacak
                                window.open(
                                  `/admin/sub-projects/${subProject.id}/company-comparison`,
                                  '_blank'
                                );
                              }}
                              className='p-1 text-purple-600 hover:text-purple-800'
                              title='Firma Karşılaştırması'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                                />
                              </svg>
                            </button>

                            {/* Rapor Yazma Butonu */}
                            <button
                              onClick={() => {
                                setSelectedSubProjectId(subProject.id);
                                setShowCompletionModal(true);
                              }}
                              className='p-1 text-green-600 hover:text-green-800'
                              title='Tamamlama Raporu Yaz'
                            >
                              <svg
                                className='w-4 h-4'
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
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteSubProject(subProject.id)
                              }
                              className='p-1 text-red-600 hover:text-red-800'
                              title='Sil'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                            </button>
                            <div
                              className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            >
                              <i className='ri-arrow-down-s-line text-gray-400 text-xl'></i>
                            </div>
                          </div>
                        </div>
                        <div className='mt-3 w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(subProject.progress)}`}
                            style={{ width: `${subProject.progress}%` }}
                          />
                        </div>
                      </div>
                      {/* Tasks (Accordion Content) */}
                      {isExpanded && (
                        <div className='border-t border-gray-100 p-6 bg-gray-50'>
                          <div className='space-y-3'>
                            {subProjectTasks.map(task => (
                              <div
                                key={task.id}
                                className='bg-white rounded-lg p-4 border border-gray-200'
                              >
                                <div className='flex items-center justify-between mb-2'>
                                  <h5 className='font-medium text-gray-900'>
                                    {task.title}
                                  </h5>
                                  <div className='flex items-center space-x-2'>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                                    >
                                      {task.status === 'Tamamlandı'
                                        ? 'Tamamlandı'
                                        : task.status === 'in_progress'
                                          ? 'Devam Ediyor'
                                          : 'Beklemede'}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority === 'Yüksek'
                                        ? 'Yüksek'
                                        : task.priority === 'Orta'
                                          ? 'Orta'
                                          : 'Düşük'}
                                    </span>
                                    <button
                                      onClick={() => handleEditTask(task)}
                                      className='p-1 text-blue-600 hover:text-blue-800'
                                      title='Düzenle'
                                    >
                                      <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleTaskDates(task)}
                                      className='p-1 text-purple-600 hover:text-purple-800'
                                      title='Tarih Yönetimi'
                                    >
                                      <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setBulkDateLevel('task');
                                        setBulkDateItems([
                                          { id: task.id, name: task.title },
                                        ]);
                                        setShowBulkDateModal(true);
                                      }}
                                      className='p-1 text-indigo-600 hover:text-indigo-800'
                                      title='Toplu Tarih Yönetimi'
                                    >
                                      <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedTaskId(task.id);
                                        setShowCompanyProgressModal(true);
                                      }}
                                      className='p-1 text-orange-600 hover:text-orange-800'
                                      title='Firma İlerlemesi'
                                    >
                                      <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAssignToCompanies('task', task)
                                      }
                                      className='p-1 text-green-600 hover:text-green-800'
                                      title='Firmalara Ata'
                                    >
                                      <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className='p-1 text-red-600 hover:text-red-800'
                                      title='Sil'
                                    >
                                      <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className='flex items-center justify-between text-sm text-gray-600 mb-3'>
                                  <span>Atanan: {task.assigned_to}</span>
                                  <span>
                                    Son Tarih:{' '}
                                    {new Date(task.due_date).toLocaleDateString(
                                      'tr-TR'
                                    )}
                                  </span>
                                </div>
                                {/* Task Progress */}
                                <div className='mb-3'>
                                  <div className='flex justify-between text-sm mb-1'>
                                    <span className='text-gray-500'>
                                      İlerleme
                                    </span>
                                    <span className='font-medium'>
                                      {task.progress_percentage}%
                                    </span>
                                  </div>
                                  <div className='w-full bg-gray-200 rounded-full h-2'>
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(task.progress_percentage)}`}
                                      style={{
                                        width: `${task.progress_percentage}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                {/* Task Status Update Buttons */}
                                <div className='flex space-x-2'>
                                  <button
                                    onClick={() =>
                                      updateTaskStatus(task.id, 'in_progress')
                                    }
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                      task.status === 'in_progress'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    Devam Ediyor
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateTaskStatus(task.id, 'Tamamlandı')
                                    }
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                      task.status === 'Tamamlandı'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                                    }`}
                                  >
                                    Tamamlandı
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateTaskStatus(task.id, 'Bekliyor')
                                    }
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                      task.status === 'Bekliyor'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                                    }`}
                                  >
                                    Beklemede
                                  </button>
                                </div>
                              </div>
                            ))}
                            {subProjectTasks.length === 0 && (
                              <div className='text-center py-4'>
                                <p className='text-gray-500 mb-4'>
                                  Bu alt projede henüz görev bulunmuyor.
                                </p>
                                <button
                                  onClick={() =>
                                    handleCreateTask(subProject.id)
                                  }
                                  className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors'
                                >
                                  Yeni Görev Ekle
                                </button>
                              </div>
                            )}
                            {subProjectTasks.length > 0 && (
                              <div className='mt-4 text-center'>
                                <button
                                  onClick={() =>
                                    handleCreateTask(subProject.id)
                                  }
                                  className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors'
                                >
                                  Yeni Görev Ekle
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'companies' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Atanan Firmalar
              </h3>
              <button
                onClick={() => handleAssignToCompanies('project', project)}
                className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors'
              >
                Firma Ata
              </button>
            </div>
            {companies.length === 0 ? (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center'>
                <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-building-line text-gray-400 text-3xl'></i>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Henüz firma atanmamış
                </h3>
                <p className='text-gray-500 mb-6'>
                  Bu projeye firma atayarak çalışmaya başlayabilirsiniz.
                </p>
                <button
                  onClick={() => handleAssignToCompanies('project', project)}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                >
                  İlk Firmayı Ata
                </button>
              </div>
            ) : (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h4 className='text-lg font-semibold text-gray-900'>
                    Firma Listesi
                  </h4>
                </div>
                <div className='divide-y divide-gray-200'>
                  {companies.map(company => (
                    <div
                      key={company.id}
                      className='px-6 py-4 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-2'>
                            <h5 className='text-lg font-semibold text-gray-900'>
                              {company.name}
                            </h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}
                            >
                              {typeof company.status === 'string'
                                ? company.status
                                : 'Bilinmiyor'}
                            </span>
                          </div>
                          <p className='text-sm text-gray-600 mb-3'>
                            {company.email}
                          </p>
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                              <span className='text-gray-500'>
                                Atanma Tarihi:
                              </span>
                              <span className='ml-1 font-medium'>
                                {typeof company.assignedDate === 'string'
                                  ? new Date(
                                      company.assignedDate
                                    ).toLocaleDateString('tr-TR')
                                  : 'Bilinmiyor'}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-500'>İlerleme:</span>
                              <span className='ml-1 font-medium'>
                                {typeof company.progress === 'number'
                                  ? company.progress
                                  : 0}
                                %
                              </span>
                            </div>
                          </div>
                          <div className='mt-3'>
                            <div className='flex items-center gap-2 mb-1'>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(typeof company.progress === 'number' ? company.progress : 0)}`}
                                  style={{
                                    width: `${typeof company.progress === 'number' ? company.progress : 0}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='ml-6'>
                          <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm'>
                            Detayları Gör
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'dates' && (
          <div>
            <ProjectDateSelector
              projectId={params.id}
              level='project'
              onDatesChange={dates => {
                // Tarih değişikliklerini handle et
              }}
              onSave={async (companyId, startDate, endDate, isFlexible) => {
                try {
                  const response = await fetch(
                    `/api/admin/projects/${params.id}/dates`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        companyId,
                        startDate,
                        endDate,
                        isFlexible,
                      }),
                    }
                  );

                  if (!response.ok) {
                    throw new Error('Tarih kaydedilemedi');
                  }

                  return await response.json();
                } catch (error) {
                  throw error;
                }
              }}
            />
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
      {/* Alt Proje Ekleme Modal */}
      {showCreateSubProjectModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Yeni Alt Proje Oluştur
                </h2>
                <button
                  onClick={() => {
                    setShowCreateSubProjectModal(false);
                    // Form state'ini temizle
                    setNewSubProject({
                      name: '',
                      description: '',
                      status: 'Planlandı' as
                        | 'Planlandı'
                        | 'Aktif'
                        | 'Tamamlandı',
                    });
                  }}
                  className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <i className='ri-close-line text-gray-500 text-xl'></i>
                </button>
              </div>
            </div>
            <div className='p-6'>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSubmitNewSubProject(newSubProject);
                }}
              >
                <div className='space-y-6'>
                  <div>
                    <label
                      htmlFor='name'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Alt Proje Adı *
                    </label>
                    <input
                      type='text'
                      id='name'
                      value={newSubProject.name}
                      onChange={e =>
                        setNewSubProject(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                      placeholder='Alt proje adını girin'
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='description'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Açıklama *
                    </label>
                    <textarea
                      id='description'
                      value={newSubProject.description}
                      onChange={e =>
                        setNewSubProject(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none'
                      placeholder='Alt proje açıklamasını girin'
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='status'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Durum
                    </label>
                    <select
                      id='status'
                      value={newSubProject.status}
                      onChange={e =>
                        setNewSubProject(prev => ({
                          ...prev,
                          status: e.target.value as any,
                        }))
                      }
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    >
                      <option value='Planlandı'>Planlandı</option>
                      <option value='Aktif'>Aktif</option>
                      <option value='Tamamlandı'>Tamamlandı</option>
                    </select>
                  </div>
                </div>
                <div className='flex justify-end gap-3 mt-8'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowCreateSubProjectModal(false);
                      // Form state'ini temizle
                      setNewSubProject({
                        name: '',
                        description: '',
                        status: 'Planlandı' as
                          | 'Planlandı'
                          | 'Aktif'
                          | 'Tamamlandı',
                      });
                    }}
                    className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                  >
                    İptal
                  </button>
                  <button
                    type='submit'
                    disabled={isCreatingSubProject}
                    className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isCreatingSubProject ? (
                      <div className='flex items-center gap-2'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        Oluşturuluyor...
                      </div>
                    ) : (
                      'Alt Proje Oluştur'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Firma Atama Modal */}
      {showAssignCompanyModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Firma Ata
                </h2>
                <button
                  onClick={() => setShowAssignCompanyModal(false)}
                  className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <i className='ri-close-line text-gray-500 text-xl'></i>
                </button>
              </div>
            </div>
            <div className='p-6'>
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Mevcut Firmalar
                </h3>
                <p className='text-sm text-gray-600'>
                  Bu projeye atamak istediğiniz firmaları seçin.
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                {availableCompanies.map(company => (
                  <div
                    key={company.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCompanies.includes(company.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCompanySelection(company.id)}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900'>
                          {company.name}
                        </h4>
                        <p className='text-sm text-gray-600'>{company.email}</p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}
                        >
                          {company.status}
                        </span>
                      </div>
                      <div className='ml-4'>
                        {selectedCompanies.includes(company.id) ? (
                          <div className='w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center'>
                            <i className='ri-check-line text-white text-sm'></i>
                          </div>
                        ) : (
                          <div className='w-6 h-6 border-2 border-gray-300 rounded-full'></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex justify-between items-center'>
                <div className='text-sm text-gray-600'>
                  {selectedCompanies.length} firma seçildi
                </div>
                <div className='flex gap-3'>
                  <button
                    onClick={() => setShowAssignCompanyModal(false)}
                    className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAssignCompanies}
                    disabled={
                      isAssigningCompanies || selectedCompanies.length === 0
                    }
                    className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isAssigningCompanies ? (
                      <div className='flex items-center gap-2'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        Atanıyor...
                      </div>
                    ) : (
                      'Firmaları Ata'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Görev Düzenleme Modal */}
      {showEditTaskModal && editingTask && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Görev Düzenle</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Görev Başlığı
                </label>
                <input
                  type='text'
                  defaultValue={editingTask.title}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  onChange={e =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Açıklama
                </label>
                <textarea
                  defaultValue={editingTask.description}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  rows={3}
                  onChange={e =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Durum
                </label>
                <select
                  defaultValue={editingTask.status}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  onChange={e =>
                    setEditingTask({ ...editingTask, status: e.target.value })
                  }
                >
                  <option value='pending'>Beklemede</option>
                  <option value='in_progress'>Devam Ediyor</option>
                  <option value='completed'>Tamamlandı</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Öncelik
                </label>
                <select
                  defaultValue={editingTask.priority}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  onChange={e =>
                    setEditingTask({ ...editingTask, priority: e.target.value })
                  }
                >
                  <option value='low'>Düşük</option>
                  <option value='medium'>Orta</option>
                  <option value='high'>Yüksek</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Atanan Kişi
                </label>
                <input
                  type='text'
                  defaultValue={editingTask.assigned_to}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  onChange={e =>
                    setEditingTask({
                      ...editingTask,
                      assigned_to: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                İptal
              </button>
              <button
                onClick={() => handleUpdateTask(editingTask)}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md'
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Proje Tarih Yönetimi Modal */}
      {showProjectDatesModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-semibold'>
                  {project?.name} - Tarih Yönetimi
                </h3>
                <button
                  onClick={() => setShowProjectDatesModal(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              <ProjectDateSelector
                level='project'
                projectId={project?.id || ''}
                companyId=''
                onClose={() => setShowProjectDatesModal(false)}
                onSuccess={() => {
                  setShowProjectDatesModal(false);
                  fetchProjectDetails();
                }}
                companies={companies}
                parentProjectId={undefined}
              />
            </div>
          </div>
        </div>
      )}
      {/* Görev Tarih Yönetimi Modal */}
      {showTaskDatesModal && editingTask && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-semibold'>
                  {editingTask.title} - Tarih Yönetimi
                </h3>
                <button
                  onClick={() => {
                    setShowTaskDatesModal(false);
                    setEditingTask(null);
                  }}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <ProjectDateSelector
                projectId={editingTask.id}
                level='task'
                parentProjectId={editingTask.sub_project_id || undefined}
                parentDates={undefined}
                onDatesChange={dates => {}}
                onSave={async (companyId, startDate, endDate, isFlexible) => {
                  try {
                    const response = await fetch(
                      `/api/admin/tasks/${editingTask.id}/dates`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          companyId,
                          startDate,
                          endDate,
                          isFlexible,
                        }),
                      }
                    );

                    if (!response.ok) {
                      throw new Error('Tarih kaydedilemedi');
                    }

                    return await response.json();
                  } catch (error) {
                    throw error;
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Alt Proje Düzenleme Modal */}
      {showEditSubProjectModal && editingSubProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Alt Proje Düzenle</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Alt Proje Adı
                </label>
                <input
                  type='text'
                  defaultValue={editingSubProject.name}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  onChange={e =>
                    setEditingSubProject({
                      ...editingSubProject,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Açıklama
                </label>
                <textarea
                  defaultValue={editingSubProject.description}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  rows={3}
                  onChange={e =>
                    setEditingSubProject({
                      ...editingSubProject,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Durum
                </label>
                <select
                  defaultValue={editingSubProject.status}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  onChange={e =>
                    setEditingSubProject({
                      ...editingSubProject,
                      status: e.target.value,
                    })
                  }
                >
                  <option value='planning'>Planlandı</option>
                  <option value='active'>Aktif</option>
                  <option value='completed'>Tamamlandı</option>
                  <option value='paused'>Duraklatıldı</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  İlerleme (%)
                </label>
                <input
                  type='number'
                  min='0'
                  max='100'
                  defaultValue={editingSubProject.progress}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  onChange={e =>
                    setEditingSubProject({
                      ...editingSubProject,
                      progress: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  setShowEditSubProjectModal(false);
                  setEditingSubProject(null);
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                İptal
              </button>
              <button
                onClick={() => handleUpdateSubProject(editingSubProject)}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md'
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Alt Proje Tarih Yönetimi Modal */}
      {showSubProjectDatesModal && editingSubProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-semibold'>
                  {editingSubProject.name} - Tarih Yönetimi
                </h3>
                <button
                  onClick={() => {
                    setShowSubProjectDatesModal(false);
                    setEditingSubProject(null);
                  }}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <ProjectDateSelector
                projectId={editingSubProject.id}
                level='sub-project'
                parentProjectId={params.id}
                parentDates={{
                  start: '2024-01-01',
                  end: '2024-12-31',
                }}
                onDatesChange={dates => {}}
                onSave={async (companyId, startDate, endDate, isFlexible) => {
                  try {
                    const response = await fetch(
                      `/api/admin/sub-projects/${editingSubProject.id}/dates`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          companyId,
                          startDate,
                          endDate,
                          isFlexible,
                        }),
                      }
                    );

                    if (!response.ok) {
                      throw new Error('Tarih kaydedilemedi');
                    }

                    return await response.json();
                  } catch (error) {
                    throw error;
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Yeni Görev Oluşturma Modal */}
      {showCreateTaskModal && selectedSubProjectForTask && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Yeni Görev Oluştur</h3>
            <CreateTaskForm
              onSubmit={handleSubmitNewTask}
              onCancel={() => {
                setShowCreateTaskModal(false);
                setSelectedSubProjectForTask(null);
              }}
            />
          </div>
        </div>
      )}
      {/* Task Assignment Modal */}
      {selectedTask && (
        <TaskAssignmentModal
          isOpen={showTaskAssignmentModal}
          onClose={() => {
            setShowTaskAssignmentModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskAssigned={handleTaskAssigned}
        />
      )}
      {/* Enhanced Assignment Modal */}
      {assignmentItem && (
        <EnhancedAssignmentModal
          isOpen={showMultiCompanyModal}
          onClose={() => {
            setShowMultiCompanyModal(false);
            setAssignmentItem(null);
          }}
          onSave={handleEnhancedAssignment}
          title={`${assignmentItem.type === 'project' ? 'Ana Proje' : 'Alt Proje'} Atama`}
          type={assignmentItem.type === 'project' ? 'project' : 'sub-project'}
          projectId={project?.id || ''}
          subProjectId={
            assignmentItem.type === 'sub-project'
              ? assignmentItem.id
              : undefined
          }
          currentAssignments={assignmentItem.assignments || []}
          allCompanies={allCompanies}
        />
      )}
      {/* Proje Düzenleme Modal */}
      {showEditProjectModal && editingProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>
                  Proje Düzenle
                </h2>
                <button
                  onClick={() => {
                    setShowEditProjectModal(false);
                    setEditingProject(null);
                  }}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedProject = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    status: formData.get('status') as string,
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                  };
                  handleUpdateProject(updatedProject);
                }}
              >
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Proje Adı
                    </label>
                    <input
                      type='text'
                      name='name'
                      defaultValue={editingProject.name}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Açıklama
                    </label>
                    <textarea
                      name='description'
                      defaultValue={editingProject.description}
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Durum
                      </label>
                      <select
                        name='status'
                        defaultValue={editingProject.status}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value='Planlandı'>Planlandı</option>
                        <option value='Aktif'>Aktif</option>
                        <option value='Tamamlandı'>Tamamlandı</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        İlerleme (%)
                      </label>
                      <input
                        type='number'
                        name='progress'
                        defaultValue={editingProject.progress}
                        min='0'
                        max='100'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Başlangıç Tarihi
                      </label>
                      <input
                        type='date'
                        name='startDate'
                        defaultValue={editingProject.startDate}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Bitiş Tarihi
                      </label>
                      <input
                        type='date'
                        name='endDate'
                        defaultValue={editingProject.endDate}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>
                <div className='flex justify-end space-x-3 mt-6'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowEditProjectModal(false);
                      setEditingProject(null);
                    }}
                    className='px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors'
                  >
                    İptal
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Bulk Date Management Modal */}
      {showBulkDateModal && (
        <AdvancedBulkDateManager
          level={bulkDateLevel}
          items={bulkDateItems}
          companies={allCompanies}
          onClose={() => setShowBulkDateModal(false)}
          onSuccess={() => {
            setShowBulkDateModal(false);
            // Refresh data if needed
            fetchProjectDetails();
          }}
        />
      )}

      {/* Sub-Project Completion Report Modal */}
      {showCompletionModal && (
        <SubProjectCompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedSubProjectId('');
          }}
          subProjectId={selectedSubProjectId}
          onReportCreated={() => {
            // Refresh data if needed
            fetchProjectDetails();
          }}
        />
      )}

      {/* Company Progress Modal */}
      {showCompanyProgressModal && (
        <CompanyProgressModal
          isOpen={showCompanyProgressModal}
          onClose={() => {
            setShowCompanyProgressModal(false);
            setSelectedTaskId('');
          }}
          taskId={selectedTaskId}
          onProgressUpdated={() => {
            // Refresh data if needed
            fetchProjectDetails();
          }}
        />
      )}
    </AdminLayout>
  );
}
// Yeni Görev Formu Komponenti
function CreateTaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    title: string;
    description: string;
    priority: string;
  }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Orta',
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Görev başlığı gereklidir');
      return;
    }
    onSubmit(formData);
  };
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Görev Başlığı *
        </label>
        <input
          type='text'
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Açıklama
        </label>
        <textarea
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          rows={3}
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Öncelik
        </label>
        <select
          value={formData.priority}
          onChange={e => setFormData({ ...formData, priority: e.target.value })}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='low'>Düşük</option>
          <option value='medium'>Orta</option>
          <option value='high'>Yüksek</option>
        </select>
      </div>
      <div className='flex justify-end space-x-3 mt-6'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-gray-600 hover:text-gray-800'
        >
          İptal
        </button>
        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md'
        >
          Oluştur
        </button>
      </div>
    </form>
  );
}
