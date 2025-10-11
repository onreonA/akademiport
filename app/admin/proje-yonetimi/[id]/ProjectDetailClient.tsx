'use client';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import SmartForm from '@/components/forms/SmartForm';
import Accordion from '@/components/ui/Accordion';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';

import EnhancedAssignmentModal from './EnhancedAssignmentModal';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  type: string;
  assignedCompanies: any[];
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
  tasks?: Task[];
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

export default function ProjectDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateSubProject, setShowCreateSubProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState<any>(null);
  const [showTaskDateModal, setShowTaskDateModal] = useState(false);
  const [selectedTaskForDate, setSelectedTaskForDate] = useState<any>(null);
  const [subProjectDateRange, setSubProjectDateRange] = useState<{
    min: string;
    max: string;
  } | null>(null);
  const [showSubProjectDateModal, setShowSubProjectDateModal] = useState(false);
  const [selectedSubProjectForDate, setSelectedSubProjectForDate] =
    useState<any>(null);
  const [projectDateRange, setProjectDateRange] = useState<{
    min: string;
    max: string;
  } | null>(null);
  const [showProjectDateModal, setShowProjectDateModal] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showEditSubProject, setShowEditSubProject] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState<any>(null);
  const [showAssignCompany, setShowAssignCompany] = useState(false);
  const [showBulkDateManager, setShowBulkDateManager] = useState(false);

  // Date Manager Modal States
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [mainProjectDates, setMainProjectDates] = useState({
    startDate: '',
    endDate: '',
  });
  const [subProjectDates, setSubProjectDates] = useState({
    startDate: '',
    endDate: '',
  });
  const [taskDates, setTaskDates] = useState({
    startDate: '',
    endDate: '',
  });
  const [isSavingDates, setIsSavingDates] = useState(false);
  const [showCompanyComparison, setShowCompanyComparison] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    mainProject: '',
    subProject: '',
    tasks: '',
  });

  // Delete states
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [deletingSubProject, setDeletingSubProject] = useState<string | null>(
    null
  );

  // Date Manager Functions
  const handleCompanySelection = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = project.assignedCompanies?.find(
      (c: any) => c.id === companyId
    );
    setSelectedCompany(company);

    // Use the actual company ID, not the assignment ID
    const actualCompanyId = company?.companies?.id;

    // Load existing dates for selected company
    if (actualCompanyId) {
      await loadExistingDates(actualCompanyId);
    }
  };

  // Load existing dates for a company
  const loadExistingDates = async (companyId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/dates?companyId=${companyId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Set main project dates from company-specific dates
        if (data.dates?.project) {
          const startDate = data.dates.project.start_date
            ? new Date(data.dates.project.start_date)
                .toISOString()
                .split('T')[0]
            : '';
          const endDate = data.dates.project.end_date
            ? new Date(data.dates.project.end_date).toISOString().split('T')[0]
            : '';
          setMainProjectDates({ startDate, endDate });
        } else {
          setMainProjectDates({ startDate: '', endDate: '' });
        }

        // Set sub-project dates (use first sub-project as template)
        if (data.dates?.subProjects && data.dates.subProjects.length > 0) {
          const firstSubProject = data.dates.subProjects[0];
          const subStartDate = firstSubProject.start_date
            ? new Date(firstSubProject.start_date).toISOString().split('T')[0]
            : '';
          const subEndDate = firstSubProject.end_date
            ? new Date(firstSubProject.end_date).toISOString().split('T')[0]
            : '';

          setSubProjectDates({ startDate: subStartDate, endDate: subEndDate });
        } else {
          setSubProjectDates({ startDate: '', endDate: '' });
        }

        // Set task dates (use first task as template)
        if (data.dates?.tasks && data.dates.tasks.length > 0) {
          const firstTask = data.dates.tasks[0];
          const taskEndDate = firstTask.end_date
            ? new Date(firstTask.end_date).toISOString().split('T')[0]
            : '';
          setTaskDates({
            startDate: '', // Tasks don't have start_date
            endDate: taskEndDate,
          });
        } else {
          setTaskDates({ startDate: '', endDate: '' });
        }
      } else {
        // Reset dates if no existing dates found
        setMainProjectDates({ startDate: '', endDate: '' });
        setSubProjectDates({ startDate: '', endDate: '' });
        setTaskDates({ startDate: '', endDate: '' });
      }
    } catch (error) {
      // Error loading existing dates - handled by error state
      // Reset dates on error
      setMainProjectDates({ startDate: '', endDate: '' });
      setSubProjectDates({ startDate: '', endDate: '' });
      setTaskDates({ startDate: '', endDate: '' });
    }
  };

  // Validation functions
  const validateDateHierarchy = () => {
    const errors = {
      mainProject: '',
      subProject: '',
      tasks: '',
    };

    // Main project validation
    if (mainProjectDates.startDate && mainProjectDates.endDate) {
      if (
        new Date(mainProjectDates.startDate) >=
        new Date(mainProjectDates.endDate)
      ) {
        errors.mainProject = 'Başlangıç tarihi bitiş tarihinden önce olmalıdır';
      }
    }

    // Sub-project validation
    if (subProjectDates.startDate && subProjectDates.endDate) {
      if (
        new Date(subProjectDates.startDate) >= new Date(subProjectDates.endDate)
      ) {
        errors.subProject = 'Başlangıç tarihi bitiş tarihinden önce olmalıdır';
      }

      // Check if sub-project dates are within main project range
      if (mainProjectDates.startDate && mainProjectDates.endDate) {
        const mainStart = new Date(mainProjectDates.startDate);
        const mainEnd = new Date(mainProjectDates.endDate);
        const subStart = new Date(subProjectDates.startDate);
        const subEnd = new Date(subProjectDates.endDate);

        if (subStart < mainStart || subEnd > mainEnd) {
          errors.subProject =
            'Alt proje tarihleri ana proje aralığında olmalıdır';
        }
      } else {
        errors.subProject = 'Önce ana proje tarihlerini belirleyin';
      }
    }

    // Task validation
    if (taskDates.endDate) {
      // Check if task date is within sub-project range
      if (subProjectDates.startDate && subProjectDates.endDate) {
        const subStart = new Date(subProjectDates.startDate);
        const subEnd = new Date(subProjectDates.endDate);
        const taskEnd = new Date(taskDates.endDate);

        if (taskEnd < subStart || taskEnd > subEnd) {
          errors.tasks = 'Görev tarihi alt proje aralığında olmalıdır';
        }
      } else {
        errors.tasks = 'Önce alt proje tarihlerini belirleyin';
      }
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  // Get date picker props for dynamic constraints
  const getDatePickerProps = (
    level: 'main-project' | 'sub-project' | 'task',
    type: 'start' | 'end'
  ) => {
    switch (level) {
      case 'sub-project':
        return {
          min: mainProjectDates.startDate || undefined,
          max: mainProjectDates.endDate || undefined,
          disabled: !mainProjectDates.startDate || !mainProjectDates.endDate,
        };
      case 'task':
        return {
          min: subProjectDates.startDate || undefined,
          max: subProjectDates.endDate || undefined,
          disabled: !subProjectDates.startDate || !subProjectDates.endDate,
        };
      default:
        return {};
    }
  };

  // Check if bulk operations are enabled
  const isBulkOperationEnabled = (
    operation: 'sub-projects' | 'tasks' | 'hierarchical'
  ) => {
    switch (operation) {
      case 'hierarchical':
        return mainProjectDates.startDate && mainProjectDates.endDate;
      case 'sub-projects':
        return mainProjectDates.startDate && mainProjectDates.endDate;
      case 'tasks':
        return subProjectDates.startDate && subProjectDates.endDate;
      default:
        return false;
    }
  };

  const handleBulkOperation = async (
    operation: 'sub-projects' | 'tasks' | 'hierarchical'
  ) => {
    if (!selectedCompanyId) {
      alert('Önce bir firma seçin');
      return;
    }

    // Get the actual company ID
    const company = project.assignedCompanies?.find(
      (c: any) => c.id === selectedCompanyId
    );
    const actualCompanyId = company?.companies?.id;

    if (!actualCompanyId) {
      alert('Firma bilgisi bulunamadı');
      return;
    }

    try {
      setIsSavingDates(true);

      // Use company-specific date API for all bulk operations
      const response = await fetch(`/api/projects/${params.id}/dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyId: actualCompanyId,
          mainProjectDates: {
            startDate: mainProjectDates.startDate || null,
            endDate: mainProjectDates.endDate || null,
          },
          subProjectDates: {
            startDate: subProjectDates.startDate || null,
            endDate: subProjectDates.endDate || null,
          },
          taskDates: {
            startDate: null, // Tasks don't have start_date
            endDate: taskDates.endDate || null,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Toplu tarih atama başarısız');
      }

      const result = await response.json();

      // Show operation-specific success message
      if (operation === 'hierarchical') {
        alert('Tarihler hiyerarşik olarak dağıtıldı');
      } else if (operation === 'sub-projects') {
        alert('Tarihler tüm alt projelere uygulandı');
      } else if (operation === 'tasks') {
        alert('Tarihler tüm görevlere uygulandı');
      }

      await fetchProjectDetails(); // Refresh data
    } catch (error) {
      // Bulk operation error - handled by error state
      alert(
        'Toplu işlem sırasında hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata')
      );
    } finally {
      setIsSavingDates(false);
    }
  };

  const handleSaveDates = async () => {
    if (!selectedCompanyId) {
      alert('Önce bir firma seçin');
      return;
    }

    // Get the actual company ID
    const company = project.assignedCompanies?.find(
      (c: any) => c.id === selectedCompanyId
    );
    const actualCompanyId = company?.companies?.id;

    if (!actualCompanyId) {
      alert('Firma bilgisi bulunamadı');
      return;
    }

    try {
      setIsSavingDates(true);

      // Use company-specific date API instead of global API
      const response = await fetch(`/api/projects/${params.id}/dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyId: actualCompanyId,
          mainProjectDates: {
            startDate: mainProjectDates.startDate || null,
            endDate: mainProjectDates.endDate || null,
          },
          subProjectDates: {
            startDate: subProjectDates.startDate || null,
            endDate: subProjectDates.endDate || null,
          },
          taskDates: {
            startDate: null, // Tasks don't have start_date
            endDate: taskDates.endDate || null,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Tarihler kaydedilemedi');
      }

      const result = await response.json();
      alert('Tarihler başarıyla kaydedildi!');
      setShowBulkDateManager(false);
      await fetchProjectDetails(); // Refresh data
    } catch (error) {
      // Date saving error - handled by error state
      alert(
        'Tarih kaydetme sırasında hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata')
      );
    } finally {
      setIsSavingDates(false);
    }
  };
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState<
    'project' | 'sub-project'
  >('project');
  const [assignmentTarget, setAssignmentTarget] = useState<{
    id: string;
    title: string;
  }>({ id: '', title: '' });
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetchProjectDetails();
  }, [params.id]);

  // Auto-select first company when modal opens
  useEffect(() => {
    if (
      showBulkDateManager &&
      project?.assignedCompanies &&
      project.assignedCompanies.length > 0 &&
      !selectedCompanyId
    ) {
      const firstCompany = project.assignedCompanies[0];
      handleCompanySelection(firstCompany.id);
    }
  }, [showBulkDateManager, project?.assignedCompanies, selectedCompanyId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details from API
      const response = await fetch(`/api/projects/${params.id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform API data to component format
      const projectData = data.project || data;

      setProject({
        id: projectData.id,
        name: projectData.name || 'Proje Adı Bulunamadı',
        description: projectData.description || 'Açıklama bulunamadı',
        status: projectData.status || 'Planlandı',
        progress: projectData.progress || 0,
        type: projectData.type || 'B2B',
        assignedCompanies: data.project?.assignedCompanies || [],
        subProjectCount: data.sub_projects?.length || 0,
        lastUpdate:
          projectData.updated_at ||
          projectData.created_at ||
          new Date().toISOString(),
      });

      // Transform sub-projects data
      const transformedSubProjects = (data.project?.sub_projects || []).map(
        (subProject: any) => ({
          id: subProject.id,
          name: subProject.name || 'Alt Proje Adı Bulunamadı',
          description: subProject.description || 'Açıklama bulunamadı',
          status: subProject.status || 'Planlandı',
          progress: subProject.progress || 0,
          taskCount: subProject.tasks?.length || 0,
          assignedCompanyCount: 0, // Will be updated when we have company assignment data
          tasks: (subProject.tasks || []).map((task: any) => ({
            id: task.id,
            title: task.title || 'Görev Adı Bulunamadı',
            description: task.description || 'Açıklama bulunamadı',
            status: task.status || 'Başlamadı',
            priority: task.priority || 'Orta',
            progress: 0, // Default progress since column doesn't exist
            assignedTo: 'Atanmamış', // Will be updated when we have assignment data
            dueDate: task.due_date,
            subProjectId: subProject.id, // Alt proje ID'sini ekle
          })),
        })
      );

      setSubProjects(transformedSubProjects);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Proje detayları yüklenirken hata oluştu';
      setError(errorMessage);

      // Fallback to mock data if API fails
      setProject({
        id: params.id,
        name: 'Proje Yüklenemedi',
        description: 'API bağlantısında sorun oluştu',
        status: 'Hata',
        progress: 0,
        type: 'Bilinmiyor',
        assignedCompanies: 0,
        subProjectCount: 0,
        lastUpdate: new Date().toISOString(),
      });
      setSubProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete functions
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeletingTask(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });

      if (response.ok) {
        // Remove task from local state
        setSubProjects(prev =>
          prev.map(subProject => ({
            ...subProject,
            tasks: subProject.tasks?.filter(task => task.id !== taskId) || [],
            taskCount: (
              subProject.tasks?.filter(task => task.id !== taskId) || []
            ).length,
          }))
        );
        alert('Görev başarıyla silindi!');
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          // Silme kısıtlaması hatası - detaylı mesaj göster
          alert(
            `❌ Silme İşlemi Engellendi:\n\n${errorData.error}\n\nDetaylar:\n${JSON.stringify(errorData.details, null, 2)}`
          );
        } else {
          alert(errorData.error || 'Görev silinirken hata oluştu');
        }
      }
    } catch (error) {
      alert('Görev silinirken hata oluştu');
    } finally {
      setDeletingTask(null);
    }
  };

  const handleDeleteSubProject = async (subProjectId: string) => {
    if (
      !confirm(
        'Bu alt projeyi silmek istediğinizden emin misiniz? Tüm görevler de silinecektir.'
      )
    ) {
      return;
    }

    setDeletingSubProject(subProjectId);
    try {
      const response = await fetch(`/api/sub-projects/${subProjectId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });

      if (response.ok) {
        // Remove sub-project from local state
        setSubProjects(prev =>
          prev.filter(subProject => subProject.id !== subProjectId)
        );

        // Update project sub-project count
        setProject(prev =>
          prev
            ? {
                ...prev,
                subProjectCount: prev.subProjectCount - 1,
              }
            : null
        );

        alert('Alt proje başarıyla silindi!');
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          // Silme kısıtlaması hatası - detaylı mesaj göster
          alert(
            `❌ Silme İşlemi Engellendi:\n\n${errorData.error}\n\nDetaylar:\n${JSON.stringify(errorData.details, null, 2)}`
          );
        } else {
          alert(errorData.error || 'Alt proje silinirken hata oluştu');
        }
      }
    } catch (error) {
      alert('Alt proje silinirken hata oluştu');
    } finally {
      setDeletingSubProject(null);
    }
  };

  const handleDeleteProject = async () => {
    if (
      !confirm(
        'Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm alt projeler ve görevler silinecektir.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });

      if (response.ok) {
        alert('Proje başarıyla silindi! Ana sayfaya yönlendiriliyorsunuz...');
        window.location.href = '/admin/proje-yonetimi';
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          // Silme kısıtlaması hatası - detaylı mesaj göster
          alert(
            `❌ Silme İşlemi Engellendi:\n\n${errorData.error}\n\nDetaylar:\n${JSON.stringify(errorData.details, null, 2)}`
          );
        } else {
          alert(errorData.error || 'Proje silinirken hata oluştu');
        }
      }
    } catch (error) {
      alert('Proje silinirken hata oluştu');
    }
  };

  const handleCreateSubProject = async (data: any) => {
    try {
      const response = await fetch('/api/admin/sub-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          project_id: params.id,
          name: data.name,
          description: data.description,
          status: data.status || 'Planlandı',
        }),
      });

      if (!response.ok) {
        throw new Error('Alt proje oluşturulamadı');
      }

      setShowCreateSubProject(false);
      await fetchProjectDetails();
    } catch (error) {
      alert(
        'Alt proje oluşturulurken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata')
      );
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      // Get the selected sub-project ID from form data
      const selectedSubProjectId = data.sub_project_id;

      if (!selectedSubProjectId) {
        alert('Lütfen bir alt proje seçin');
        return;
      }

      const requestBody = {
        sub_project_id: selectedSubProjectId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'Orta',
      };

      const response = await fetch(`/api/projects/${params.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Görev oluşturulamadı');
      }

      setShowCreateTask(false);
      await fetchProjectDetails();
    } catch (error) {
      // Task creation error - handled by error state
      alert(
        'Görev oluşturulurken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata')
      );
    }
  };

  const handleUpdateTask = async (data: any) => {
    try {
      if (!selectedTaskForUpdate) {
        alert('Güncellenecek görev bulunamadı');
        return;
      }

      const requestBody = {
        title: data.title,
        description: data.description,
        priority: data.priority || 'Orta',
        status: data.status || 'Bekliyor',
      };

      const response = await fetch(`/api/tasks/${selectedTaskForUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Görev başarıyla güncellendi!');
        setShowUpdateTaskModal(false);
        setSelectedTaskForUpdate(null);
        await fetchProjectDetails(); // Refresh data
      } else {
        const errorData = await response.json();
        alert('Görev güncellenirken hata oluştu: ' + errorData.error);
      }
    } catch (error) {
      alert('Görev güncellenirken hata oluştu');
    }
  };

  const fetchSubProjectDateRange = async (
    subProjectId: string,
    companyId: string
  ) => {
    try {
      const response = await fetch(
        `/api/sub-projects/${subProjectId}/dates?companyId=${companyId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.dates) {
          setSubProjectDateRange({
            min: data.dates.start_date || '',
            max: data.dates.end_date || '',
          });
        }
      }
    } catch (error) {
      console.error('Alt proje tarihleri alınamadı:', error);
      setSubProjectDateRange(null);
    }
  };

  const fetchProjectDateRange = async (companyId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/dates?companyId=${companyId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.dates?.project) {
          setProjectDateRange({
            min: data.dates.project.start_date || '',
            max: data.dates.project.end_date || '',
          });
        }
      }
    } catch (error) {
      console.error('Ana proje tarihleri alınamadı:', error);
      setProjectDateRange(null);
    }
  };

  const loadExistingProjectDates = async (companyId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/dates?companyId=${companyId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.dates?.project) {
          // Mevcut tarihleri form alanlarına yükle
          const startDateInput = document.getElementById(
            'projectStartDate'
          ) as HTMLInputElement;
          const endDateInput = document.getElementById(
            'projectEndDate'
          ) as HTMLInputElement;

          if (startDateInput && data.dates.project.start_date) {
            startDateInput.value = data.dates.project.start_date;
          }
          if (endDateInput && data.dates.project.end_date) {
            endDateInput.value = data.dates.project.end_date;
          }
        }
      }
    } catch (error) {
      console.error('Mevcut proje tarihleri yüklenemedi:', error);
    }
  };

  const handleSaveProjectDate = async (
    projectId: string,
    companyId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          start_date: startDate || null,
          end_date: endDate || null,
        }),
      });

      if (response.ok) {
        alert('Ana proje tarihi başarıyla kaydedildi!');
        setShowProjectDateModal(false);
        await fetchProjectDetails(); // Refresh data
      } else {
        const errorData = await response.json();
        alert('Ana proje tarihi kaydedilirken hata oluştu: ' + errorData.error);
      }
    } catch (error) {
      alert('Ana proje tarihi kaydedilirken hata oluştu');
    }
  };

  const loadExistingSubProjectDates = async (
    subProjectId: string,
    companyId: string
  ) => {
    try {
      const response = await fetch(
        `/api/sub-projects/${subProjectId}/dates?companyId=${companyId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.dates) {
          // Mevcut tarihleri form alanlarına yükle
          const startDateInput = document.getElementById(
            'subProjectStartDate'
          ) as HTMLInputElement;
          const endDateInput = document.getElementById(
            'subProjectEndDate'
          ) as HTMLInputElement;

          if (startDateInput && data.dates.start_date) {
            startDateInput.value = data.dates.start_date;
          }
          if (endDateInput && data.dates.end_date) {
            endDateInput.value = data.dates.end_date;
          }
        }
      }
    } catch (error) {
      console.error('Mevcut alt proje tarihleri yüklenemedi:', error);
    }
  };

  const handleSaveSubProjectDate = async (
    subProjectId: string,
    companyId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const response = await fetch(`/api/sub-projects/${subProjectId}/dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          companyId,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      if (response.ok) {
        alert('Alt proje tarihi başarıyla kaydedildi!');
        setShowSubProjectDateModal(false);
        setSelectedSubProjectForDate(null);
        await fetchProjectDetails(); // Refresh data
      } else {
        const errorData = await response.json();
        alert('Alt proje tarihi kaydedilirken hata oluştu: ' + errorData.error);
      }
    } catch (error) {
      alert('Alt proje tarihi kaydedilirken hata oluştu');
    }
  };

  const loadExistingTaskDates = async (taskId: string, companyId: string) => {
    try {
      const response = await fetch(
        `/api/tasks/${taskId}/dates?companyId=${companyId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.dates) {
          // Mevcut tarihleri form alanlarına yükle
          const startDateInput = document.getElementById(
            'startDate'
          ) as HTMLInputElement;
          const endDateInput = document.getElementById(
            'endDate'
          ) as HTMLInputElement;

          if (startDateInput && data.dates.start_date) {
            startDateInput.value = data.dates.start_date;
          }
          if (endDateInput && data.dates.end_date) {
            endDateInput.value = data.dates.end_date;
          }
        }
      }
    } catch (error) {
      console.error('Mevcut görev tarihleri yüklenemedi:', error);
    }
  };

  const handleSaveTaskDate = async (
    taskId: string,
    companyId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          companyId,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      if (response.ok) {
        alert('Görev tarihi başarıyla kaydedildi!');
        setShowTaskDateModal(false);
        setSelectedTaskForDate(null);
        await fetchProjectDetails();
      } else {
        const errorData = await response.json();
        alert('Görev tarihi kaydedilirken hata oluştu: ' + errorData.error);
      }
    } catch (error) {
      alert('Görev tarihi kaydedilirken hata oluştu');
    }
  };

  const handleEditProject = async (data: any) => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          status: data.status,
          type: data.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Proje güncellenemedi');
      }

      setShowEditProject(false);
      await fetchProjectDetails();
    } catch (error) {
      alert(
        'Proje güncellenirken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata')
      );
    }
  };

  // Handle edit sub-project
  const handleEditSubProject = (subProject: any) => {
    setEditingSubProject(subProject);
    setShowEditSubProject(true);
  };

  // Handle update sub-project
  const handleUpdateSubProject = async (data: any) => {
    try {
      const response = await fetch(
        `/api/sub-projects/${editingSubProject.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            status: data.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Alt proje güncellenemedi');
      }

      setShowEditSubProject(false);
      setEditingSubProject(null);
      await fetchProjectDetails();
    } catch (error) {
      alert('Alt proje güncellenirken hata oluştu');
    }
  };

  // Mapping functions for StatusBadge component
  const mapProjectStatus = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'active';
      case 'Tamamlandı':
        return 'completed';
      case 'Planlandı':
        return 'pending';
      case 'Devam Ediyor':
        return 'in-progress';
      case 'Beklemede':
        return 'on-hold';
      case 'Başlamadı':
        return 'cancelled';
      default:
        return 'inactive';
    }
  };

  const mapTaskPriority = (priority: string) => {
    switch (priority) {
      case 'Yüksek':
        return 'urgent';
      case 'Orta':
        return 'medium';
      case 'Düşük':
        return 'low';
      default:
        return 'low';
    }
  };

  const handleEnhancedAssignment = async (
    type: 'project' | 'sub-project',
    target: { id: string; title: string }
  ) => {
    try {
      // Fetch companies and current assignments
      const [companiesResponse, assignmentsResponse] = await Promise.all([
        fetch('/api/companies', { credentials: 'include' }),
        fetch(
          `/api/admin/${type === 'project' ? 'projects' : 'sub-projects'}/${target.id}/assignments`,
          { credentials: 'include' }
        ),
      ]);

      const companiesData = await companiesResponse.json();
      const assignmentsData = await assignmentsResponse.json();

      setCompanies(companiesData.companies || []);
      setCurrentAssignments(assignmentsData.assignments || []);
      setAssignmentType(type);
      setAssignmentTarget(target);
      setShowEnhancedModal(true);
    } catch (error) {
      alert('Firma bilgileri yüklenirken hata oluştu');
      // Error fetching data - handled by error state
    }
  };

  const handleEnhancedSave = async (
    assignments: { companyId: string; status: string }[]
  ) => {
    try {
      const response = await fetch(
        `/api/admin/${assignmentType === 'project' ? 'projects' : 'sub-projects'}/${assignmentTarget.id}/assignments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            assignments: assignments,
          }),
        }
      );

      if (response.ok) {
        alert('Firma atamaları başarıyla kaydedildi!');
        setShowEnhancedModal(false);
        // Refresh project data
        fetchProjectDetails();
      } else {
        throw new Error('Firma ataması başarısız');
      }
    } catch (error) {
      alert('Firma ataması sırasında hata oluştu');
      // Assignment error - handled by error state
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

  // Accordion items for sub-projects with tasks
  const accordionItems = subProjects.map(subProject => ({
    id: subProject.id,
    title: subProject.name,
    icon: 'ri-folder-open-line',
    badge: `${subProject.taskCount} görev`,
    defaultOpen: subProject.status === 'Aktif',
    content: (
      <div className='space-y-4'>
        {/* Sub-project Info */}
        <div className='bg-gray-50 rounded-lg p-4'>
          <div className='flex items-start justify-between mb-3'>
            <div>
              <p className='text-sm text-gray-600 mb-2'>
                {subProject.description}
              </p>
              <div className='flex items-center space-x-4 text-sm text-gray-500'>
                <span className='flex items-center'>
                  <i className='ri-building-line mr-1'></i>
                  {subProject.assignedCompanyCount} firma
                </span>
                <span className='flex items-center'>
                  <i className='ri-calendar-line mr-1'></i>
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <StatusBadge status={mapProjectStatus(subProject.status)} size='sm'>
                {subProject.status}
              </StatusBadge>
              <div className='flex items-center space-x-1'>
                <Button
                  size='xs'
                  variant='ghost'
                  icon='ri-eye-line'
                  onClick={() =>
                    (window.location.href = `/admin/proje-yonetimi/${params.id}/alt-projeler/${subProject.id}`)
                  }
                  title='Detayları Görüntüle'
                />
                <Button
                  size='xs'
                  variant='ghost'
                  icon='ri-add-line'
                  onClick={() => setShowCreateTask(true)}
                  title='Görev Ekle'
                />
                <Button
                  size='xs'
                  variant='ghost'
                  icon='ri-user-add-line'
                  onClick={() =>
                    handleEnhancedAssignment('sub-project', {
                      id: subProject.id,
                      title: subProject.name,
                    })
                  }
                  title='Firma Ata'
                />
                <Button
                  size='xs'
                  variant='ghost'
                  icon='ri-calendar-line'
                  onClick={() => {
                    setSelectedSubProjectForDate(subProject);
                    setShowSubProjectDateModal(true);
                    setProjectDateRange(null); // Reset project date range
                  }}
                  title='Alt Proje Tarih Yönetimi'
                />
                <Button
                  size='xs'
                  variant='ghost'
                  icon='ri-bar-chart-line'
                  onClick={() => setShowCompanyComparison(true)}
                  title='Firma Karşılaştırması'
                />
                <Button
                  size='xs'
                  variant='ghost'
                  icon='ri-edit-line'
                  onClick={() => handleEditSubProject(subProject)}
                  title='Düzenle'
                />
                <Button
                  size='xs'
                  variant='ghost'
                  icon='ri-delete-bin-line'
                  onClick={() => handleDeleteSubProject(subProject.id)}
                  disabled={deletingSubProject === subProject.id}
                  title='Alt Projeyi Sil'
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className='mb-4'>
            <div className='flex items-center justify-between text-xs mb-1'>
              <span className='text-gray-500'>İlerleme</span>
              <span className='text-gray-700 font-medium'>
                {subProject.progress}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-1'>
              <div
                className='h-1 bg-blue-500 rounded-full transition-all'
                style={{ width: `${subProject.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-base font-semibold text-gray-900'>Görevler</h4>
            <Button
              size='sm'
              variant='primary'
              icon='ri-add-line'
              onClick={() => setShowCreateTask(true)}
            >
              Yeni Görev
            </Button>
          </div>

          {subProject.tasks && subProject.tasks.length > 0 ? (
            <div className='space-y-2'>
              {subProject.tasks.map(task => (
                <div
                  key={task.id}
                  className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h5 className='text-sm font-semibold text-gray-900'>
                        {task.title}
                      </h5>
                      <p className='text-xs text-gray-600 mt-1'>
                        {task.description}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2 ml-4'>
                      <StatusBadge status={mapTaskPriority(task.priority)} size='xs'>
                        {task.priority}
                      </StatusBadge>
                      <StatusBadge status={mapProjectStatus(task.status)} size='xs'>
                        {task.status}
                      </StatusBadge>
                    </div>
                  </div>

                  <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
                    <span>
                      {task.assignedTo && `Atanan: ${task.assignedTo}`}
                    </span>
                    <span>
                      {task.dueDate &&
                        `Bitiş: ${new Date(task.dueDate).toLocaleDateString('tr-TR')}`}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2 flex-1'>
                      <div className='flex-1 bg-gray-200 rounded-full h-2'>
                        <div
                          className='h-2 bg-green-500 rounded-full transition-all'
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className='text-xs font-medium text-gray-700 w-12 text-right'>
                        {task.progress}%
                      </span>
                    </div>
                    <div className='flex items-center space-x-2 ml-3'>
                      <button
                        onClick={() => {
                          setSelectedTaskForUpdate(task);
                          setShowUpdateTaskModal(true);
                        }}
                        className='p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors'
                        title='Görevi Güncelle'
                      >
                        <i className='ri-edit-line text-sm'></i>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTaskForDate(task);
                          setShowTaskDateModal(true);
                          setSubProjectDateRange(null); // Reset date range
                        }}
                        className='p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors'
                        title='Tarih Yönet'
                      >
                        <i className='ri-calendar-line text-sm'></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTask === task.id}
                        className='p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50'
                        title='Görevi Sil'
                      >
                        {deletingTask === task.id ? (
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-500'></div>
                        ) : (
                          <i className='ri-delete-bin-line text-sm'></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-6 bg-gray-50 rounded-lg'>
              <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3'>
                <i className='ri-task-line text-gray-400 text-xl'></i>
              </div>
              <p className='text-gray-500 text-sm'>Henüz görev bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <AdminLayout title={project.name} description={project.description}>
      <Breadcrumb className='mb-6' />

      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8'>
        <div>
          <div className='flex items-center space-x-3 mb-2'>
            <h1 className='text-3xl font-bold text-gray-900'>{project.name}</h1>
            <StatusBadge status={mapProjectStatus(project.status)} size='md'>
              {project.status}
            </StatusBadge>
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
            onClick={() =>
              handleEnhancedAssignment('project', {
                id: params.id,
                title: project?.name || '',
              })
            }
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
          <Button
            onClick={() => setShowProjectDateModal(true)}
            variant='secondary'
            icon='ri-calendar-line'
          >
            Tarih Yönetimi
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant='danger'
            icon='ri-delete-bin-line'
          >
            Projeyi Sil
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-blue-50 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
              <i className='ri-folder-line text-blue-600 text-xl'></i>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-blue-600'>Alt Projeler</p>
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
                {project.assignedCompanies?.length || 0}
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
        <div className='bg-orange-50 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
              <i className='ri-calendar-line text-orange-600 text-xl'></i>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-orange-600'>
                Toplam Görev
              </p>
              <p className='text-2xl font-bold text-orange-900'>
                {subProjects.reduce((total, sp) => total + sp.taskCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-projects with Tasks - Accordion */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Alt Projeler ve Görevler
          </h2>
          <Button
            onClick={() => setShowCreateSubProject(true)}
            variant='primary'
            icon='ri-add-line'
          >
            Yeni Alt Proje
          </Button>
        </div>

        {subProjects.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-folder-line text-gray-400 text-2xl'></i>
            </div>
            <p className='text-gray-500'>Henüz alt proje bulunmuyor</p>
          </div>
        ) : (
          <>
            <Accordion items={accordionItems} />
          </>
        )}
      </div>

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
              name: 'sub_project_id',
              label: 'Alt Proje',
              type: 'select',
              required: true,
              options: subProjects.map(sp => ({
                value: sp.id,
                label: sp.name,
              })),
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

      {/* Edit Sub-Project Modal */}
      <Modal
        isOpen={showEditSubProject}
        onClose={() => {
          setShowEditSubProject(false);
          setEditingSubProject(null);
        }}
        title='Alt Projeyi Düzenle'
        size='lg'
      >
        <SmartForm
          fields={[
            {
              name: 'name',
              label: 'Alt Proje Adı',
              type: 'text',
              required: true,
              defaultValue: editingSubProject?.name || '',
            },
            {
              name: 'description',
              label: 'Açıklama',
              type: 'textarea',
              defaultValue: editingSubProject?.description || '',
            },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              required: true,
              defaultValue: editingSubProject?.status || 'Planlandı',
              options: [
                { value: 'Planlandı', label: 'Planlandı' },
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Tamamlandı', label: 'Tamamlandı' },
              ],
            },
          ]}
          onSubmit={handleUpdateSubProject}
          onCancel={() => {
            setShowEditSubProject(false);
            setEditingSubProject(null);
          }}
        />
      </Modal>

      {/* Assign Company Modal */}
      <Modal
        isOpen={showAssignCompany}
        onClose={() => setShowAssignCompany(false)}
        title='Firma Atama'
        size='lg'
      >
        <div className='space-y-4'>
          <p className='text-gray-600'>
            Bu proje için firma ataması yapabilirsiniz.
          </p>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <i className='ri-information-line text-yellow-600 text-lg mr-2'></i>
              <p className='text-sm text-yellow-800'>
                Firma atama fonksiyonu geliştirilmektedir.
              </p>
            </div>
          </div>
          <div className='flex justify-end mt-6 space-x-3'>
            <Button
              variant='secondary'
              onClick={() => setShowAssignCompany(false)}
            >
              İptal
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                alert('Firma atama fonksiyonu yakında aktif olacak');
                setShowAssignCompany(false);
              }}
            >
              Firma Ata
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Date Manager Modal */}
      <Modal
        isOpen={showBulkDateManager}
        onClose={() => setShowBulkDateManager(false)}
        title='Gelişmiş Tarih Yönetimi'
        size='xl'
      >
        <div className='space-y-6'>
          {/* Header */}
          <div className='border-b pb-4'>
            <h3 className='text-lg font-semibold text-gray-800'>
              Hiyerarşik Tarih Yönetimi
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              Ana proje, alt proje ve görevler için firma bazında tarih ataması
              yapın
            </p>
          </div>

          {/* Company Selection */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Firma Seçin
            </label>
            <select
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedCompanyId}
              onChange={e => handleCompanySelection(e.target.value)}
            >
              <option value=''>Firma seçin...</option>
              {project.assignedCompanies?.map((company: any) => (
                <option key={company.id} value={company.id}>
                  {company.companies?.name || company.name}
                </option>
              )) || []}
            </select>
          </div>

          {/* Hierarchical Date Management */}
          <div className='space-y-4'>
            {/* Main Project Dates */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-medium text-gray-800'>
                  Ana Proje Tarihleri
                </h4>
                <StatusBadge status='info' size='sm'>
                  Üst Seviye
                </StatusBadge>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Başlangıç Tarihi
                  </label>
                  <input
                    type='date'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.mainProject
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    value={mainProjectDates.startDate}
                    onChange={e => {
                      setMainProjectDates(prev => ({
                        ...prev,
                        startDate: e.target.value,
                      }));
                      // Clear validation error when user starts typing
                      if (validationErrors.mainProject) {
                        setValidationErrors(prev => ({
                          ...prev,
                          mainProject: '',
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Bitiş Tarihi
                  </label>
                  <input
                    type='date'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.mainProject
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    value={mainProjectDates.endDate}
                    onChange={e => {
                      setMainProjectDates(prev => ({
                        ...prev,
                        endDate: e.target.value,
                      }));
                      // Clear validation error when user starts typing
                      if (validationErrors.mainProject) {
                        setValidationErrors(prev => ({
                          ...prev,
                          mainProject: '',
                        }));
                      }
                    }}
                  />
                </div>
              </div>
              {validationErrors.mainProject && (
                <div className='mt-2 text-sm text-red-600 flex items-center'>
                  <i className='ri-error-warning-line mr-1'></i>
                  {validationErrors.mainProject}
                </div>
              )}
            </div>

            {/* Sub-Project Dates */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-medium text-gray-800'>
                  Alt Proje Tarihleri
                </h4>
                <StatusBadge status='success' size='sm'>
                  Ana Proje Aralığında
                </StatusBadge>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Başlangıç Tarihi
                  </label>
                  <input
                    type='date'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.subProject
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-500'
                    } ${!mainProjectDates.startDate || !mainProjectDates.endDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={subProjectDates.startDate}
                    min={getDatePickerProps('sub-project', 'start').min}
                    max={getDatePickerProps('sub-project', 'start').max}
                    disabled={
                      getDatePickerProps('sub-project', 'start').disabled
                    }
                    onChange={e => {
                      setSubProjectDates(prev => ({
                        ...prev,
                        startDate: e.target.value,
                      }));
                      // Clear validation error when user starts typing
                      if (validationErrors.subProject) {
                        setValidationErrors(prev => ({
                          ...prev,
                          subProject: '',
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Bitiş Tarihi
                  </label>
                  <input
                    type='date'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.subProject
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-500'
                    } ${!mainProjectDates.startDate || !mainProjectDates.endDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={subProjectDates.endDate}
                    min={getDatePickerProps('sub-project', 'end').min}
                    max={getDatePickerProps('sub-project', 'end').max}
                    disabled={getDatePickerProps('sub-project', 'end').disabled}
                    onChange={e => {
                      setSubProjectDates(prev => ({
                        ...prev,
                        endDate: e.target.value,
                      }));
                      // Clear validation error when user starts typing
                      if (validationErrors.subProject) {
                        setValidationErrors(prev => ({
                          ...prev,
                          subProject: '',
                        }));
                      }
                    }}
                  />
                </div>
              </div>
              {validationErrors.subProject && (
                <div className='mt-2 text-sm text-red-600 flex items-center'>
                  <i className='ri-error-warning-line mr-1'></i>
                  {validationErrors.subProject}
                </div>
              )}
              {(!mainProjectDates.startDate || !mainProjectDates.endDate) && (
                <div className='mt-2 text-sm text-gray-500 flex items-center'>
                  <i className='ri-lock-line mr-1'></i>
                  Önce ana proje tarihlerini belirleyin
                </div>
              )}
            </div>

            {/* Task Dates */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-medium text-gray-800'>Görev Tarihleri</h4>
                <StatusBadge status='warning' size='sm'>
                  Alt Proje Aralığında
                </StatusBadge>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Başlangıç Tarihi
                  </label>
                  <input
                    type='date'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.tasks
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    } ${!subProjectDates.startDate || !subProjectDates.endDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={taskDates.startDate}
                    min={getDatePickerProps('task', 'start').min}
                    max={getDatePickerProps('task', 'start').max}
                    disabled={getDatePickerProps('task', 'start').disabled}
                    onChange={e => {
                      setTaskDates(prev => ({
                        ...prev,
                        startDate: e.target.value,
                      }));
                      // Clear validation error when user starts typing
                      if (validationErrors.tasks) {
                        setValidationErrors(prev => ({ ...prev, tasks: '' }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Bitiş Tarihi
                  </label>
                  <input
                    type='date'
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.tasks
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    } ${!subProjectDates.startDate || !subProjectDates.endDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={taskDates.endDate}
                    min={getDatePickerProps('task', 'end').min}
                    max={getDatePickerProps('task', 'end').max}
                    disabled={getDatePickerProps('task', 'end').disabled}
                    onChange={e => {
                      setTaskDates(prev => ({
                        ...prev,
                        endDate: e.target.value,
                      }));
                      // Clear validation error when user starts typing
                      if (validationErrors.tasks) {
                        setValidationErrors(prev => ({ ...prev, tasks: '' }));
                      }
                    }}
                  />
                </div>
              </div>
              {validationErrors.tasks && (
                <div className='mt-2 text-sm text-red-600 flex items-center'>
                  <i className='ri-error-warning-line mr-1'></i>
                  {validationErrors.tasks}
                </div>
              )}
              {(!subProjectDates.startDate || !subProjectDates.endDate) && (
                <div className='mt-2 text-sm text-gray-500 flex items-center'>
                  <i className='ri-lock-line mr-1'></i>
                  Önce alt proje tarihlerini belirleyin
                </div>
              )}
            </div>
          </div>

          {/* Bulk Operations */}
          <div className='bg-blue-50 rounded-lg p-4'>
            <h4 className='font-medium text-gray-800 mb-3'>Toplu İşlemler</h4>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => handleBulkOperation('sub-projects')}
                disabled={
                  isSavingDates ||
                  !selectedCompanyId ||
                  !isBulkOperationEnabled('sub-projects')
                }
                className={`px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-2 ${
                  isBulkOperationEnabled('sub-projects')
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isBulkOperationEnabled('sub-projects')
                    ? 'Önce ana proje tarihlerini belirleyin'
                    : ''
                }
              >
                <i className='ri-folder-line'></i>
                Tüm Alt Projelere Uygula
              </button>
              <button
                onClick={() => handleBulkOperation('tasks')}
                disabled={
                  isSavingDates ||
                  !selectedCompanyId ||
                  !isBulkOperationEnabled('tasks')
                }
                className={`px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-2 ${
                  isBulkOperationEnabled('tasks')
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isBulkOperationEnabled('tasks')
                    ? 'Önce alt proje tarihlerini belirleyin'
                    : ''
                }
              >
                <i className='ri-task-line'></i>
                Tüm Görevlere Uygula
              </button>
              <button
                onClick={() => handleBulkOperation('hierarchical')}
                disabled={
                  isSavingDates ||
                  !selectedCompanyId ||
                  !isBulkOperationEnabled('hierarchical')
                }
                className={`px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-2 ${
                  isBulkOperationEnabled('hierarchical')
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isBulkOperationEnabled('hierarchical')
                    ? 'Önce ana proje tarihlerini belirleyin'
                    : ''
                }
              >
                <i className='ri-node-tree'></i>
                Hiyerarşik Dağıt
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <button
              onClick={() => setShowBulkDateManager(false)}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              İptal
            </button>
            <button
              onClick={() => {
                if (validateDateHierarchy()) {
                  handleSaveDates();
                } else {
                  alert('Lütfen tarih hatalarını düzeltin');
                }
              }}
              disabled={isSavingDates || !selectedCompanyId}
              className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isSavingDates ? (
                <>
                  <i className='ri-loader-4-line animate-spin'></i>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <i className='ri-save-line'></i>
                  Tarihleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Company Comparison Modal */}
      <Modal
        isOpen={showCompanyComparison}
        onClose={() => setShowCompanyComparison(false)}
        title='Firma Karşılaştırması'
        size='xl'
      >
        <div className='space-y-4'>
          <p className='text-gray-600'>
            Proje üzerindeki firmaların performans karşılaştırması.
          </p>
          <div className='mb-4'>
            <div className='grid grid-cols-2 gap-6'>
              <div className='bg-blue-50 rounded-lg p-4'>
                <h4 className='font-semibold text-blue-900 mb-2'>Mundo</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>İlerleme:</span>
                    <span className='font-medium'>75%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tamamlanan Görev:</span>
                    <span className='font-medium'>15/20</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Ortalama Süre:</span>
                    <span className='font-medium'>3.2 gün</span>
                  </div>
                </div>
              </div>
              <div className='bg-green-50 rounded-lg p-4'>
                <h4 className='font-semibold text-green-900 mb-2'>Sarmobi</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>İlerleme:</span>
                    <span className='font-medium'>60%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tamamlanan Görev:</span>
                    <span className='font-medium'>12/20</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Ortalama Süre:</span>
                    <span className='font-medium'>4.1 gün</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-end mt-6 space-x-3'>
            <Button
              variant='secondary'
              onClick={() => setShowCompanyComparison(false)}
            >
              İptal
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                window.open('/admin/analytics', '_blank');
                setShowCompanyComparison(false);
              }}
            >
              Analytics&apos;e Git
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Assignment Modal */}
      <EnhancedAssignmentModal
        isOpen={showEnhancedModal}
        onClose={() => setShowEnhancedModal(false)}
        onSave={handleEnhancedSave}
        title={`${assignmentTarget.title} - Firma Atamaları`}
        type={assignmentType}
        projectId={
          assignmentType === 'project' ? assignmentTarget.id : params.id
        }
        subProjectId={
          assignmentType === 'sub-project' ? assignmentTarget.id : undefined
        }
        currentAssignments={currentAssignments}
        allCompanies={companies}
      />

      {/* Görev Güncelleme Modal */}
      {showUpdateTaskModal && selectedTaskForUpdate && (
        <Modal
          isOpen={showUpdateTaskModal}
          onClose={() => {
            setShowUpdateTaskModal(false);
            setSelectedTaskForUpdate(null);
          }}
          title='Görevi Güncelle'
          size='md'
        >
          <SmartForm
            fields={[
              {
                name: 'title',
                label: 'Görev Başlığı',
                type: 'text',
                required: true,
                defaultValue: selectedTaskForUpdate.title,
              },
              {
                name: 'description',
                label: 'Açıklama',
                type: 'textarea',
                defaultValue: selectedTaskForUpdate.description,
              },
              {
                name: 'priority',
                label: 'Öncelik',
                type: 'select',
                required: true,
                defaultValue: selectedTaskForUpdate.priority,
                options: [
                  { value: 'Düşük', label: 'Düşük' },
                  { value: 'Orta', label: 'Orta' },
                  { value: 'Yüksek', label: 'Yüksek' },
                ],
              },
              {
                name: 'status',
                label: 'Durum',
                type: 'select',
                required: true,
                defaultValue: selectedTaskForUpdate.status,
                options: [
                  { value: 'Bekliyor', label: 'Bekliyor' },
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Tamamlandı', label: 'Tamamlandı' },
                  { value: 'pending_approval', label: 'Onaya Gönderildi' },
                  { value: 'completed', label: 'Tamamlandı' },
                ],
              },
            ]}
            onSubmit={handleUpdateTask}
            onCancel={() => {
              setShowUpdateTaskModal(false);
              setSelectedTaskForUpdate(null);
            }}
          />
        </Modal>
      )}

      {/* Görev Tarih Yönetimi Modal */}
      {showTaskDateModal && selectedTaskForDate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-800'>
                Görev Tarih Yönetimi
              </h2>
              <button
                onClick={() => {
                  setShowTaskDateModal(false);
                  setSelectedTaskForDate(null);
                }}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <i className='ri-close-line text-xl'></i>
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='font-semibold text-gray-800 mb-2'>
                  Görev Bilgileri
                </h3>
                <p className='text-sm text-gray-600 mb-1'>
                  <span className='font-medium'>Başlık:</span>{' '}
                  {selectedTaskForDate.title}
                </p>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium'>Açıklama:</span>{' '}
                  {selectedTaskForDate.description}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Firma Seçin
                </label>
                <select
                  id='companySelect'
                  onChange={async e => {
                    const companyId = e.target.value;
                    if (companyId && selectedTaskForDate?.subProjectId) {
                      // Alt proje tarih aralığını getir (kısıtlama için)
                      await fetchSubProjectDateRange(
                        selectedTaskForDate.subProjectId,
                        companyId
                      );
                      // Mevcut görev tarihlerini yükle (form alanları için)
                      await loadExistingTaskDates(
                        selectedTaskForDate.id,
                        companyId
                      );
                    } else {
                      setSubProjectDateRange(null);
                      // Form alanlarını temizle
                      const startDateInput = document.getElementById(
                        'startDate'
                      ) as HTMLInputElement;
                      const endDateInput = document.getElementById(
                        'endDate'
                      ) as HTMLInputElement;
                      if (startDateInput) startDateInput.value = '';
                      if (endDateInput) endDateInput.value = '';
                    }
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Firma seçin...</option>
                  {project?.assignedCompanies?.map((assignment: any) => (
                    <option
                      key={assignment.companies?.id}
                      value={assignment.companies?.id}
                    >
                      {assignment.companies?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Başlangıç Tarihi
                  {subProjectDateRange && (
                    <span className='text-xs text-gray-500 ml-2'>
                      (Alt proje:{' '}
                      {subProjectDateRange.min
                        ? new Date(subProjectDateRange.min).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}{' '}
                      -{' '}
                      {subProjectDateRange.max
                        ? new Date(subProjectDateRange.max).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}
                      )
                    </span>
                  )}
                </label>
                <input
                  type='date'
                  id='startDate'
                  min={subProjectDateRange?.min || undefined}
                  max={subProjectDateRange?.max || undefined}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bitiş Tarihi
                  {subProjectDateRange && (
                    <span className='text-xs text-gray-500 ml-2'>
                      (Alt proje:{' '}
                      {subProjectDateRange.min
                        ? new Date(subProjectDateRange.min).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}{' '}
                      -{' '}
                      {subProjectDateRange.max
                        ? new Date(subProjectDateRange.max).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}
                      )
                    </span>
                  )}
                </label>
                <input
                  type='date'
                  id='endDate'
                  min={subProjectDateRange?.min || undefined}
                  max={subProjectDateRange?.max || undefined}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex justify-end space-x-3 p-6 border-t border-gray-200'>
              <button
                onClick={() => {
                  setShowTaskDateModal(false);
                  setSelectedTaskForDate(null);
                }}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const companyId = (
                    document.getElementById(
                      'companySelect'
                    ) as HTMLSelectElement
                  )?.value;
                  const startDate = (
                    document.getElementById('startDate') as HTMLInputElement
                  )?.value;
                  const endDate = (
                    document.getElementById('endDate') as HTMLInputElement
                  )?.value;

                  if (!companyId) {
                    alert('Lütfen bir firma seçin');
                    return;
                  }

                  handleSaveTaskDate(
                    selectedTaskForDate.id,
                    companyId,
                    startDate,
                    endDate
                  );
                }}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alt Proje Tarih Yönetimi Modal */}
      {showSubProjectDateModal && selectedSubProjectForDate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-800'>
                Alt Proje Tarih Yönetimi
              </h2>
              <button
                onClick={() => {
                  setShowSubProjectDateModal(false);
                  setSelectedSubProjectForDate(null);
                }}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <i className='ri-close-line text-xl'></i>
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='font-semibold text-gray-800 mb-2'>
                  Alt Proje Bilgileri
                </h3>
                <p className='text-sm text-gray-600 mb-1'>
                  <span className='font-medium'>Adı:</span>{' '}
                  {selectedSubProjectForDate.name}
                </p>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium'>Açıklama:</span>{' '}
                  {selectedSubProjectForDate.description}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Firma Seçin
                </label>
                <select
                  id='subProjectCompanySelect'
                  onChange={async e => {
                    const companyId = e.target.value;
                    if (companyId && selectedSubProjectForDate) {
                      // Ana proje tarih aralığını getir (kısıtlama için)
                      await fetchProjectDateRange(companyId);
                      // Mevcut alt proje tarihlerini yükle (form alanları için)
                      await loadExistingSubProjectDates(
                        selectedSubProjectForDate.id,
                        companyId
                      );
                    } else {
                      setProjectDateRange(null);
                      // Form alanlarını temizle
                      const startDateInput = document.getElementById(
                        'subProjectStartDate'
                      ) as HTMLInputElement;
                      const endDateInput = document.getElementById(
                        'subProjectEndDate'
                      ) as HTMLInputElement;
                      if (startDateInput) startDateInput.value = '';
                      if (endDateInput) endDateInput.value = '';
                    }
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Firma seçin...</option>
                  {project?.assignedCompanies?.map((assignment: any) => (
                    <option
                      key={assignment.companies?.id}
                      value={assignment.companies?.id}
                    >
                      {assignment.companies?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Başlangıç Tarihi
                  {projectDateRange && (
                    <span className='text-xs text-gray-500 ml-2'>
                      (Ana proje:{' '}
                      {projectDateRange.min
                        ? new Date(projectDateRange.min).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}{' '}
                      -{' '}
                      {projectDateRange.max
                        ? new Date(projectDateRange.max).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}
                      )
                    </span>
                  )}
                </label>
                <input
                  type='date'
                  id='subProjectStartDate'
                  min={projectDateRange?.min || undefined}
                  max={projectDateRange?.max || undefined}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bitiş Tarihi
                  {projectDateRange && (
                    <span className='text-xs text-gray-500 ml-2'>
                      (Ana proje:{' '}
                      {projectDateRange.min
                        ? new Date(projectDateRange.min).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}{' '}
                      -{' '}
                      {projectDateRange.max
                        ? new Date(projectDateRange.max).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Sınırsız'}
                      )
                    </span>
                  )}
                </label>
                <input
                  type='date'
                  id='subProjectEndDate'
                  min={projectDateRange?.min || undefined}
                  max={projectDateRange?.max || undefined}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex justify-end space-x-3 p-6 border-t border-gray-200'>
              <button
                onClick={() => {
                  setShowSubProjectDateModal(false);
                  setSelectedSubProjectForDate(null);
                }}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const companyId = (
                    document.getElementById(
                      'subProjectCompanySelect'
                    ) as HTMLSelectElement
                  )?.value;
                  const startDate = (
                    document.getElementById(
                      'subProjectStartDate'
                    ) as HTMLInputElement
                  )?.value;
                  const endDate = (
                    document.getElementById(
                      'subProjectEndDate'
                    ) as HTMLInputElement
                  )?.value;

                  if (!companyId) {
                    alert('Lütfen bir firma seçin');
                    return;
                  }

                  handleSaveSubProjectDate(
                    selectedSubProjectForDate.id,
                    companyId,
                    startDate,
                    endDate
                  );
                }}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ana Proje Tarih Yönetimi Modal */}
      {showProjectDateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-800'>
                Ana Proje Tarih Yönetimi
              </h2>
              <button
                onClick={() => setShowProjectDateModal(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <i className='ri-close-line text-xl'></i>
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='font-semibold text-gray-800 mb-2'>
                  Ana Proje Bilgileri
                </h3>
                <p className='text-sm text-gray-600 mb-1'>
                  <span className='font-medium'>Adı:</span> {project?.name}
                </p>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium'>Açıklama:</span>{' '}
                  {project?.description}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Firma Seçin
                </label>
                <select
                  id='projectCompanySelect'
                  onChange={async e => {
                    const companyId = e.target.value;
                    if (companyId) {
                      await loadExistingProjectDates(companyId);
                    } else {
                      // Form alanlarını temizle
                      const startDateInput = document.getElementById(
                        'projectStartDate'
                      ) as HTMLInputElement;
                      const endDateInput = document.getElementById(
                        'projectEndDate'
                      ) as HTMLInputElement;
                      if (startDateInput) startDateInput.value = '';
                      if (endDateInput) endDateInput.value = '';
                    }
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Firma seçin...</option>
                  {project?.assignedCompanies?.map((assignment: any) => (
                    <option
                      key={assignment.companies?.id}
                      value={assignment.companies?.id}
                    >
                      {assignment.companies?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Başlangıç Tarihi
                </label>
                <input
                  type='date'
                  id='projectStartDate'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bitiş Tarihi
                </label>
                <input
                  type='date'
                  id='projectEndDate'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex justify-end space-x-3 p-6 border-t border-gray-200'>
              <button
                onClick={() => setShowProjectDateModal(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const companyId = (
                    document.getElementById(
                      'projectCompanySelect'
                    ) as HTMLSelectElement
                  )?.value;
                  const startDate = (
                    document.getElementById(
                      'projectStartDate'
                    ) as HTMLInputElement
                  )?.value;
                  const endDate = (
                    document.getElementById(
                      'projectEndDate'
                    ) as HTMLInputElement
                  )?.value;

                  if (!companyId) {
                    alert('Lütfen bir firma seçin');
                    return;
                  }

                  handleSaveProjectDate(
                    params.id,
                    companyId,
                    startDate,
                    endDate
                  );
                }}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
