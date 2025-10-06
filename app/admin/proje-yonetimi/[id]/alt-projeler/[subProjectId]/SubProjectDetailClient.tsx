'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
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
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  progress: number;
}
interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
  assignedDate: string;
  progress: number;
}
export default function SubProjectDetailClient({
  params,
}: {
  params: { id: string; subProjectId: string };
}) {
  const [subProject, setSubProject] = useState<SubProject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tasks'); // Varsayılan olarak görevler tab'ı
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAssignCompanyModal, setShowAssignCompanyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTaskDateModal, setShowTaskDateModal] = useState(false);
  const [selectedTaskForDate, setSelectedTaskForDate] = useState<Task | null>(
    null
  );
  const [selectedCompanyForReport, setSelectedCompanyForReport] =
    useState<Company | null>(null);
  const [existingReports, setExistingReports] = useState<any[]>([]);
  const [reportForm, setReportForm] = useState({
    overallRating: 5,
    qualityScore: 5,
    timelinessScore: 5,
    communicationScore: 5,
    strengths: '',
    areasForImprovement: '',
    recommendations: '',
    generalFeedback: '',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Orta' as 'Düşük' | 'Orta' | 'Yüksek',
    dueDate: '',
    assignedTo: '',
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isAssigningCompanies, setIsAssigningCompanies] = useState(false);
  const fetchSubProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Alt proje detaylarını getir
      const subProjectResponse = await fetch(
        `/api/sub-projects/${params.subProjectId}`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (subProjectResponse.ok) {
        const subProjectData = await subProjectResponse.json();
        setSubProject({
          id: subProjectData.id,
          name: subProjectData.name,
          description: subProjectData.description,
          status: subProjectData.status,
          progress: subProjectData.progress,
          startDate: subProjectData.start_date,
          endDate: subProjectData.end_date,
          taskCount: subProjectData.task_count,
          assignedCompanyCount: 0,
        });
      }
      // Görevleri getir
      const tasksResponse = await fetch(
        `/api/sub-projects/${params.subProjectId}/tasks`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }
      // Atanan firmaları getir
      const companiesResponse = await fetch(
        `/api/sub-projects/${params.subProjectId}/assign-companies`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        // Transform assignments to companies format
        const transformedCompanies = (companiesData.assignments || []).map(
          (assignment: any) => ({
            id: assignment.company.id,
            name: assignment.company.name,
            email: assignment.company.email,
            status: assignment.status,
            assignedDate: assignment.assignedAt,
            progress: 0, // Default progress
          })
        );
        setCompanies(transformedCompanies);
      }
      // Mevcut firmaları getir (atama için)
      const availableCompaniesResponse = await fetch('/api/companies', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (availableCompaniesResponse.ok) {
        const availableCompaniesData = await availableCompaniesResponse.json();
        setAvailableCompanies(availableCompaniesData.companies || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  }, [params.subProjectId]);

  // Rapor fonksiyonları
  const fetchExistingReports = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/consultant/sub-project-reports?subProjectId=${params.subProjectId}`
      );
      if (response.ok) {
        const data = await response.json();
        setExistingReports(data.reports || []);
      }
    } catch (error) {
      // Error fetching reports - handled by error state
    }
  }, [params.subProjectId]);

  const handleCreateReport = useCallback(async () => {
    if (!selectedCompanyForReport) return;

    try {
      const response = await fetch('/api/consultant/sub-project-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subProjectId: params.subProjectId,
          companyId: selectedCompanyForReport.id,
          ...reportForm,
        }),
      });

      if (response.ok) {
        alert('Rapor başarıyla oluşturuldu!');
        setShowReportModal(false);
        setSelectedCompanyForReport(null);
        setReportForm({
          overallRating: 5,
          qualityScore: 5,
          timelinessScore: 5,
          communicationScore: 5,
          strengths: '',
          areasForImprovement: '',
          recommendations: '',
          generalFeedback: '',
        });
        fetchExistingReports();
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error || 'Rapor oluşturulamadı'}`);
      }
    } catch (error) {
      // Error creating report - handled by error state
      alert('Rapor oluşturulurken hata oluştu');
    }
  }, [
    selectedCompanyForReport,
    reportForm,
    params.subProjectId,
    fetchExistingReports,
  ]);

  const openReportModal = useCallback((company: Company) => {
    setSelectedCompanyForReport(company);
    setShowReportModal(true);
  }, []);

  useEffect(() => {
    if (params.subProjectId) {
      fetchSubProjectDetails();
      fetchExistingReports();
    }
  }, [params.subProjectId, fetchSubProjectDetails, fetchExistingReports]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('Görev başlığı gereklidir');
      return;
    }
    try {
      setIsCreatingTask(true);
      const response = await fetch(
        `/api/sub-projects/${params.subProjectId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': 'admin@ihracatakademi.com',
          },
          body: JSON.stringify({
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            due_date: newTask.dueDate,
            status: 'Bekliyor',
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTasks(prev => [...prev, data.task]);
        setNewTask({
          title: '',
          description: '',
          priority: 'Orta',
          dueDate: '',
          assignedTo: '',
        });
        setShowCreateTaskModal(false);
        alert('Görev başarıyla oluşturuldu!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Görev oluşturulamadı');
      }
    } catch (error) {
      alert('Görev oluşturulamadı');
    } finally {
      setIsCreatingTask(false);
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
      } else {
        const errorData = await response.json();
        alert('Görev tarihi kaydedilirken hata oluştu: ' + errorData.error);
      }
    } catch (error) {
      alert('Görev tarihi kaydedilirken hata oluştu');
    }
  };

  const handleAssignCompanies = async () => {
    if (selectedCompanies.length === 0) {
      alert('En az bir firma seçmelisiniz');
      return;
    }
    try {
      setIsAssigningCompanies(true);
      const response = await fetch(
        `/api/sub-projects/${params.subProjectId}/assign-companies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': 'admin@ihracatakademi.com',
          },
          body: JSON.stringify({
            companyIds: selectedCompanies,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCompanies(prev => [...prev, ...data.assignedCompanies]);
        setSelectedCompanies([]);
        setShowAssignCompanyModal(false);
        alert('Firmalar başarıyla atandı!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Firma atama işlemi başarısız');
      }
    } catch (error) {
      alert('Firma atama işlemi başarısız');
    } finally {
      setIsAssigningCompanies(false);
    }
  };
  const handleCompanySelection = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-blue-100 text-blue-800';
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
      case 'Beklemede':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'İncelemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'Bekliyor':
        return 'bg-red-100 text-red-800';
      case 'İptal Edildi':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getTaskPriorityColor = (priority: string) => {
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
      <AdminLayout title='Alt Proje Detayı'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
        </div>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout title='Alt Proje Detayı'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>Hata</h2>
            <p className='text-gray-600'>{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  if (!subProject) {
    return (
      <AdminLayout title='Alt Proje Detayı'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Alt Proje Bulunamadı
            </h2>
            <p className='text-gray-600'>Aradığınız alt proje mevcut değil.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout title='Alt Proje Detayı'>
      <div className='p-6'>
        {/* Breadcrumb */}
        <nav className='flex mb-6' aria-label='Breadcrumb'>
          <ol className='inline-flex items-center space-x-1 md:space-x-3'>
            <li className='inline-flex items-center'>
              <Link
                href='/admin/proje-yonetimi'
                className='text-gray-700 hover:text-blue-600'
              >
                Proje Yönetimi
              </Link>
            </li>
            <li>
              <div className='flex items-center'>
                <span className='mx-2 text-gray-400'>/</span>
                <Link
                  href={`/admin/proje-yonetimi/${params.id}`}
                  className='text-gray-700 hover:text-blue-600'
                >
                  Ana Proje
                </Link>
              </div>
            </li>
            <li aria-current='page'>
              <div className='flex items-center'>
                <span className='mx-2 text-gray-400'>/</span>
                <span className='text-gray-500'>{subProject.name}</span>
              </div>
            </li>
          </ol>
        </nav>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            {subProject.name}
          </h1>
          <p className='text-gray-600'>{subProject.description}</p>
        </div>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
          <div className='bg-white p-6 rounded-lg shadow'>
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
                    d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Toplam Görev
                </p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {tasks.length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
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
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Tamamlanan</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {tasks.filter(task => task.status === 'Tamamlandı').length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
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
                <p className='text-sm font-medium text-gray-600'>İncelemede</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {tasks.filter(task => task.status === 'İncelemede').length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-2 bg-red-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Bekleyen</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  {tasks.filter(task => task.status === 'Bekliyor').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className='bg-white rounded-lg shadow mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8 px-6'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Görevler ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'companies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Atanan Firmalar ({companies.length})
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Raporlar
              </button>
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div className='bg-white rounded-lg shadow'>
          {/* Genel Bakış Tab */}
          {activeTab === 'overview' && (
            <div className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Proje Bilgileri
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-2'>
                    Başlangıç Tarihi
                  </h4>
                  <p className='text-sm text-gray-900'>
                    {new Date(subProject.startDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-2'>
                    Bitiş Tarihi
                  </h4>
                  <p className='text-sm text-gray-900'>
                    {new Date(subProject.endDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-2'>
                    Durum
                  </h4>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subProject.status)}`}
                  >
                    {subProject.status}
                  </span>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 mb-2'>
                    Genel İlerleme
                  </h4>
                  <div className='flex items-center'>
                    <div className='flex-1 bg-gray-200 rounded-full h-2 mr-2'>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(subProject.progress)}`}
                        style={{ width: `${subProject.progress}%` }}
                      ></div>
                    </div>
                    <span className='text-sm font-medium text-gray-900'>
                      {subProject.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Görevler Tab */}
          {activeTab === 'tasks' && (
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Görevler
                </h3>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  + Yeni Görev Ekle
                </button>
              </div>
              {tasks.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-task-line text-gray-400 text-3xl'></i>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Henüz görev yok
                  </h3>
                  <p className='text-gray-500 mb-6'>
                    Bu alt proje için henüz görev oluşturulmamış.
                  </p>
                  <button
                    onClick={() => setShowCreateTaskModal(true)}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                  >
                    İlk Görevi Oluştur
                  </button>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Görev
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Durum
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Öncelik
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Bitiş Tarihi
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {tasks.map(task => (
                        <tr key={task.id} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div>
                              <div className='text-sm font-medium text-gray-900'>
                                {task.title}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {task.description?.substring(0, 100)}...
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaskStatusColor(task.status)}`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaskPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  'tr-TR'
                                )
                              : '-'}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                            <button
                              onClick={() => {
                                setSelectedTaskForDate(task);
                                setShowTaskDateModal(true);
                              }}
                              className='text-green-600 hover:text-green-900 mr-3'
                            >
                              Tarih Yönet
                            </button>
                            <button className='text-blue-600 hover:text-blue-900 mr-3'>
                              Düzenle
                            </button>
                            <button className='text-red-600 hover:text-red-900'>
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* Atanan Firmalar Tab */}
          {activeTab === 'companies' && (
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Atanan Firmalar
                </h3>
                <button
                  onClick={() => setShowAssignCompanyModal(true)}
                  className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  Firma Ata
                </button>
              </div>
              {companies.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-building-line text-gray-400 text-3xl'></i>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Henüz firma atanmamış
                  </h3>
                  <p className='text-gray-500 mb-6'>
                    Bu alt projeye firma atayarak çalışmaya başlayabilirsiniz.
                  </p>
                  <button
                    onClick={() => setShowAssignCompanyModal(true)}
                    className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                  >
                    İlk Firmayı Ata
                  </button>
                </div>
              ) : (
                <div className='divide-y divide-gray-200'>
                  {companies.map(company => (
                    <div
                      key={company.id}
                      className='py-4 hover:bg-gray-50 transition-colors'
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
                              {company.status}
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
                                {company.assignedDate}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-500'>İlerleme:</span>
                              <span className='ml-1 font-medium'>
                                {company.progress}%
                              </span>
                            </div>
                          </div>
                          <div className='mt-3'>
                            <div className='flex items-center gap-2 mb-1'>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(company.progress)}`}
                                  style={{ width: `${company.progress}%` }}
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
              )}
            </div>
          )}
          {/* Raporlar Tab */}
          {activeTab === 'reports' && (
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Danışman Değerlendirme Raporları
                </h3>
              </div>

              {/* Mevcut Raporlar */}
              {existingReports.length > 0 && (
                <div className='mb-6'>
                  <h4 className='text-md font-medium text-gray-900 mb-3'>
                    Mevcut Raporlar
                  </h4>
                  <div className='space-y-3'>
                    {existingReports.map(report => (
                      <div
                        key={report.id}
                        className='bg-gray-50 rounded-lg p-4 border'
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {companies.find(c => c.id === report.company_id)
                                ?.name || 'Bilinmeyen Firma'}
                            </p>
                            <p className='text-sm text-gray-600'>
                              Genel Değerlendirme: {report.overall_rating}/5
                            </p>
                            <p className='text-sm text-gray-600'>
                              Oluşturulma:{' '}
                              {new Date(report.created_at).toLocaleDateString(
                                'tr-TR'
                              )}
                            </p>
                          </div>
                          <div className='flex space-x-2'>
                            <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                              Hazır
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Firma Listesi - Rapor Oluşturma */}
              <div>
                <h4 className='text-md font-medium text-gray-900 mb-3'>
                  Rapor Oluştur
                </h4>
                <div className='space-y-3'>
                  {companies.map(company => {
                    const hasReport = existingReports.some(
                      r => r.company_id === company.id
                    );
                    const completedTasks = tasks.filter(
                      task => task.status === 'Tamamlandı'
                    ).length;
                    const totalTasks = tasks.length;
                    const canCreateReport =
                      completedTasks === totalTasks && totalTasks > 0;

                    return (
                      <div
                        key={company.id}
                        className='bg-white border rounded-lg p-4'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-3'>
                              <div>
                                <p className='font-medium text-gray-900'>
                                  {company.name}
                                </p>
                                <p className='text-sm text-gray-600'>
                                  {company.email}
                                </p>
                                <p className='text-sm text-gray-600'>
                                  Görev Durumu: {completedTasks}/{totalTasks}{' '}
                                  tamamlandı
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center space-x-2'>
                            {hasReport ? (
                              <span className='px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full'>
                                Rapor Hazır
                              </span>
                            ) : canCreateReport ? (
                              <button
                                onClick={() => openReportModal(company)}
                                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                              >
                                Rapor Oluştur
                              </button>
                            ) : (
                              <span className='px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full'>
                                Tüm Görevler Tamamlanmalı
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Görev Oluşturma Modal */}
        {showCreateTaskModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4'>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Yeni Görev Oluştur
                  </h2>
                  <button
                    onClick={() => setShowCreateTaskModal(false)}
                    className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <i className='ri-close-line text-gray-500 text-xl'></i>
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Görev Başlığı *
                    </label>
                    <input
                      type='text'
                      value={newTask.title}
                      onChange={e =>
                        setNewTask(prev => ({ ...prev, title: e.target.value }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Görev başlığını girin'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Açıklama
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={e =>
                        setNewTask(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Görev açıklamasını girin'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Öncelik
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={e =>
                          setNewTask(prev => ({
                            ...prev,
                            priority: e.target.value as any,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value='Düşük'>Düşük</option>
                        <option value='Orta'>Orta</option>
                        <option value='Yüksek'>Yüksek</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Bitiş Tarihi
                      </label>
                      <input
                        type='date'
                        value={newTask.dueDate}
                        onChange={e =>
                          setNewTask(prev => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>
                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    onClick={() => setShowCreateTaskModal(false)}
                    className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateTask}
                    disabled={isCreatingTask || !newTask.title.trim()}
                    className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isCreatingTask ? (
                      <div className='flex items-center gap-2'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        Oluşturuluyor...
                      </div>
                    ) : (
                      'Görev Oluştur'
                    )}
                  </button>
                </div>
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
                    Bu alt projeye atamak istediğiniz firmaları seçin.
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
                          <p className='text-sm text-gray-600'>
                            {company.email}
                          </p>
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

        {/* Rapor Oluşturma Modal */}
        {showReportModal && selectedCompanyForReport && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Danışman Değerlendirme Raporu
                  </h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <i className='ri-close-line text-gray-500 text-xl'></i>
                  </button>
                </div>
                <p className='text-sm text-gray-600 mt-2'>
                  Firma: {selectedCompanyForReport.name}
                </p>
              </div>

              <div className='p-6 space-y-6'>
                {/* Değerlendirme Puanları */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Genel Değerlendirme
                    </label>
                    <select
                      value={reportForm.overallRating}
                      onChange={e =>
                        setReportForm(prev => ({
                          ...prev,
                          overallRating: parseInt(e.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      {[1, 2, 3, 4, 5].map(score => (
                        <option key={score} value={score}>
                          {score}/5
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Kalite Skoru
                    </label>
                    <select
                      value={reportForm.qualityScore}
                      onChange={e =>
                        setReportForm(prev => ({
                          ...prev,
                          qualityScore: parseInt(e.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      {[1, 2, 3, 4, 5].map(score => (
                        <option key={score} value={score}>
                          {score}/5
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Zamanında Teslimat
                    </label>
                    <select
                      value={reportForm.timelinessScore}
                      onChange={e =>
                        setReportForm(prev => ({
                          ...prev,
                          timelinessScore: parseInt(e.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      {[1, 2, 3, 4, 5].map(score => (
                        <option key={score} value={score}>
                          {score}/5
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      İletişim
                    </label>
                    <select
                      value={reportForm.communicationScore}
                      onChange={e =>
                        setReportForm(prev => ({
                          ...prev,
                          communicationScore: parseInt(e.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      {[1, 2, 3, 4, 5].map(score => (
                        <option key={score} value={score}>
                          {score}/5
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Güçlü Yönler */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Güçlü Yönler
                  </label>
                  <textarea
                    value={reportForm.strengths}
                    onChange={e =>
                      setReportForm(prev => ({
                        ...prev,
                        strengths: e.target.value,
                      }))
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Firmanın güçlü yönlerini yazın...'
                  />
                </div>

                {/* Geliştirilmesi Gereken Alanlar */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Geliştirilmesi Gereken Alanlar
                  </label>
                  <textarea
                    value={reportForm.areasForImprovement}
                    onChange={e =>
                      setReportForm(prev => ({
                        ...prev,
                        areasForImprovement: e.target.value,
                      }))
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Geliştirilmesi gereken alanları yazın...'
                  />
                </div>

                {/* Öneriler */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Öneriler
                  </label>
                  <textarea
                    value={reportForm.recommendations}
                    onChange={e =>
                      setReportForm(prev => ({
                        ...prev,
                        recommendations: e.target.value,
                      }))
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Gelecek projeler için önerilerinizi yazın...'
                  />
                </div>

                {/* Genel Geri Bildirim */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Genel Geri Bildirim
                  </label>
                  <textarea
                    value={reportForm.generalFeedback}
                    onChange={e =>
                      setReportForm(prev => ({
                        ...prev,
                        generalFeedback: e.target.value,
                      }))
                    }
                    rows={4}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Genel değerlendirme ve geri bildiriminizi yazın...'
                  />
                </div>

                {/* Modal Footer */}
                <div className='flex justify-end space-x-3 pt-4 border-t border-gray-200'>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateReport}
                    className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Raporu Oluştur
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Firma seçin...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
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
                    id='startDate'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Bitiş Tarihi
                  </label>
                  <input
                    type='date'
                    id='endDate'
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
      </div>
    </AdminLayout>
  );
}
