'use client';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import ProjectCard from '@/components/admin/ProjectCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import ExportImport from '@/components/ui/ExportImport';
interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'B2B' | 'B2C';
  status: 'Planlandı' | 'Aktif' | 'Tamamlandı';
  adminNote: string;
  subProjectCount: number;
  assignedCompanies: number;
  progress: number;
}
// ProjectCard component moved to separate file - components/admin/ProjectCard.tsx
export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  // Firma atama modal state'leri
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningProject, setAssigningProject] = useState<Project | null>(
    null
  );
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Enhanced modal states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyAssignments, setCompanyAssignments] = useState<{
    [key: string]: string;
  }>({});
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'B2B' as 'B2B' | 'B2C',
    status: 'Planlandı' as 'Planlandı' | 'Aktif' | 'Tamamlandı',
    adminNote: '',
  });
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/projects', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const data = await response.json(); // Debug için
        // API'den gelen veriyi frontend formatına çevir
        const formattedProjects = (data.projects || []).map((project: any) => {
          // Debug için
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            startDate: project.start_date || project.startDate,
            endDate: project.end_date || project.endDate,
            type: 'B2B' as 'B2B' | 'B2C', // Varsayılan değer
            status:
              project.status === 'Aktif'
                ? 'Aktif'
                : project.status === 'Tamamlandı'
                  ? 'Tamamlandı'
                  : project.status === 'Planlandı'
                    ? 'Planlandı'
                    : 'Planlandı', // Default
            adminNote: project.admin_note || project.adminNote || '',
            subProjectCount: project.sub_projects?.length || 0,
            assignedCompanies: project.company_id ? 1 : 0, // Eski sistem: 1:1 ilişki
            progress: project.progress || 0,
            companyName: project.companies?.name || 'Atanmamış',
          };
        });
        setProjects(formattedProjects);
        setError(null); // Clear any previous errors
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.error ||
            `HTTP ${response.status}: Projeler yüklenirken hata oluştu`
        );
      }
    } catch (error) {
      setError(
        'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleEdit = (project: Project) => {
    // Debug için
    setEditingProject(project);
    setShowEditModal(true);
  };
  const handleDelete = async (id: string) => {
    if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Projeyi listeden kaldır
            setProjects(prev => prev.filter(project => project.id !== id));
            alert('Proje başarıyla silindi!');
          } else {
            alert(data.error || 'Proje silinirken hata oluştu');
          }
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Proje silinirken hata oluştu');
        }
      } catch (error) {
        alert('Proje silinirken hata oluştu');
      }
    }
  };
  const handleAssign = async (project: Project) => {
    setAssigningProject(project);
    setSelectedCompanyIds([]);
    setCompanyAssignments({});
    setSearchTerm('');
    setStatusFilter('all');
    setShowAssignModal(true);

    // Mevcut firmaları ve atamaları yükle
    try {
      // Tüm firmaları getir
      const companiesResponse = await fetch('/api/companies', {
        credentials: 'include',
      });
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setAvailableCompanies(companiesData.companies || []);
      }

      // Mevcut atamaları getir
      const assignmentsResponse = await fetch(
        `/api/admin/projects/${project.id}/assignments`,
        {
          credentials: 'include',
        }
      );
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        const assignmentsMap: { [key: string]: string } = {};
        assignmentsData.assignments?.forEach((assignment: any) => {
          assignmentsMap[assignment.company_id] =
            assignment.status || 'revoked';
        });
        setCompanyAssignments(assignmentsMap);
      }
    } catch (error) {
      alert('Veriler yüklenirken hata oluştu');
    }
  };
  const handleUpdateProject = async () => {
    if (
      !editingProject ||
      !editingProject.name ||
      !editingProject.description
    ) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }
    setIsEditing(true);
    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          name: editingProject.name,
          description: editingProject.description,
          type: editingProject.type,
          status: editingProject.status,
          adminNote: editingProject.adminNote,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.project) {
          // Projeyi listede güncelle
          setProjects(prev =>
            prev.map(project =>
              project.id === editingProject.id
                ? {
                    ...project,
                    name: editingProject.name,
                    description: editingProject.description,
                    type: editingProject.type,
                    status: editingProject.status,
                    adminNote: editingProject.adminNote,
                  }
                : project
            )
          );
          // Modal'ı kapat
          setShowEditModal(false);
          setEditingProject(null);
          alert('Proje başarıyla güncellendi!');
        } else {
          alert(data.error || 'Proje güncellenirken hata oluştu');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Proje güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Proje güncellenirken hata oluştu');
    } finally {
      setIsEditing(false);
    }
  };
  // Enhanced modal functions
  const filteredCompanies = availableCompanies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = companyAssignments[company.id] || 'revoked';
    const matchesStatus =
      statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCompanyStatusChange = (companyId: string, status: string) => {
    setCompanyAssignments(prev => ({
      ...prev,
      [companyId]: status,
    }));
  };

  const handleBulkAction = (status: string) => {
    const newAssignments: { [key: string]: string } = {};
    filteredCompanies.forEach(company => {
      newAssignments[company.id] = status;
    });
    setCompanyAssignments(prev => ({ ...prev, ...newAssignments }));
  };

  const handleSelectedBulkAction = (status: string) => {
    if (!status) return;

    const selectedCompanies = filteredCompanies.filter(
      company =>
        companyAssignments[company.id] &&
        companyAssignments[company.id] !== 'revoked'
    );

    const newAssignments: { [key: string]: string } = { ...companyAssignments };
    selectedCompanies.forEach(company => {
      newAssignments[company.id] = status;
    });
    setCompanyAssignments(newAssignments);
  };

  const handleSaveAssignments = async () => {
    if (!assigningProject) return;

    setIsAssigning(true);
    try {
      const assignmentArray = Object.entries(companyAssignments).map(
        ([companyId, status]) => ({ companyId, status })
      );

      const response = await fetch(
        `/api/admin/projects/${assigningProject.id}/assignments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            assignments: assignmentArray,
          }),
        }
      );

      if (response.ok) {
        alert('Firma atamaları başarıyla kaydedildi');
        setShowAssignModal(false);
        fetchProjects();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Firma atama işlemi başarısız');
      }
    } catch (error) {
      alert('Firma atama işlemi sırasında hata oluştu');
    } finally {
      setIsAssigning(false);
    }
  };
  const handleDeleteProject = async (project: Project) => {
    if (
      !confirm(
        'Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        // Projeyi listeden kaldır
        setProjects(prev => prev.filter(p => p.id !== project.id));
        alert('Proje başarıyla silindi!');
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
  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.description) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          type: newProject.type,
          status: newProject.status,
          adminNote: newProject.adminNote,
        }),
      });
      if (response.ok) {
        const data = await response.json(); // Debug için
        if (data.project) {
          // API'den gelen veriyi frontend formatına çevir
          const formattedProject = {
            id: data.project.id,
            name: data.project.name,
            description: data.project.description,
            startDate: data.project.start_date || data.project.startDate,
            endDate: data.project.end_date || data.project.endDate,
            type: 'B2B' as 'B2B' | 'B2C',
            status:
              data.project.status === 'active'
                ? 'Aktif'
                : data.project.status === 'completed'
                  ? 'Tamamlandı'
                  : 'Planlandı',
            adminNote: data.project.admin_note || data.project.adminNote || '',
            subProjectCount: 0,
            assignedCompanies: 0,
            progress: data.project.progress || 0,
          };
          // Modal'ı kapat ve formu temizle
          setShowCreateModal(false);
          setNewProject({
            name: '',
            description: '',
            type: 'B2B',
            status: 'Planlandı',
            adminNote: '',
          });
          // Proje listesini yeniden yükle (yeni proje dahil)
          fetchProjects();
          alert('Proje başarıyla oluşturuldu!');
        } else {
          alert(data.error || 'Proje oluşturulurken hata oluştu');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Proje oluşturulurken hata oluştu');
      }
    } catch (error) {
      alert('Proje oluşturulurken hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };
  if (loading) {
    return (
      <AdminLayout
        title='Proje Yönetimi'
        description='Tüm projelerinizi buradan yönetebilir ve takip edebilirsiniz'
      >
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-8 h-8 bg-blue-600 rounded-full animate-pulse'></div>
              </div>
            </div>
            <h3 className='mt-6 text-lg font-semibold text-gray-900'>
              Projeler Yükleniyor
            </h3>
            <p className='mt-2 text-gray-600'>
              Proje verileriniz hazırlanıyor...
            </p>
            <div className='mt-4 flex justify-center space-x-1'>
              <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'></div>
              <div
                className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout
        title='Proje Yönetimi'
        description='Tüm projelerinizi buradan yönetebilir ve takip edebilirsiniz'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-red-600 text-3xl'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Hata Oluştu
            </h3>
            <p className='text-gray-500 mb-6'>{error}</p>
            <button
              onClick={fetchProjects}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout
      title='Proje Yönetimi'
      description='Tüm projelerinizi buradan yönetebilir ve takip edebilirsiniz'
    >
      {/* Breadcrumb */}
      <Breadcrumb className='mb-6' />

      {/* Header Actions */}
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Proje Yönetimi</h2>
          <p className='text-gray-600 mt-1'>
            Tüm projelerinizi buradan yönetebilir ve takip edebilirsiniz
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-3'>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant='primary'
            size='lg'
            icon='ri-add-line'
          >
            Yeni Proje Oluştur
          </Button>
          <ExportImport type='projects' />
        </div>
      </div>
      {/* Filters */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Proje ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
            </div>
          </div>
          <div className='sm:w-48'>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='all'>Tüm Durumlar</option>
              <option value='Planlandı'>Planlandı</option>
              <option value='Aktif'>Aktif</option>
              <option value='Tamamlandı'>Tamamlandı</option>
            </select>
          </div>
        </div>
      </div>
      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-folder-line text-gray-400 text-3xl'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Henüz proje bulunmuyor
          </h3>
          <p className='text-gray-500 mb-6'>
            İlk projenizi oluşturarak çalışmaya başlayabilirsiniz.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
          >
            İlk Projeyi Oluştur
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDeleteProject}
              onAssign={handleAssign}
              onViewDetails={project => {
                window.location.href = `/admin/proje-yonetimi/${project.id}`;
              }}
              onExport={project => {
                // Export functionality will be implemented
                // TODO: Implement export functionality
                alert(
                  `Export functionality for ${project.name} will be implemented`
                );
              }}
            />
          ))}
        </div>
      )}
      {/* Create Project Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Yeni Proje Oluştur
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
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
                  handleCreateProject();
                }}
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Proje Adı */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Proje Adı <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={newProject.name}
                      onChange={e =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Proje adını girin'
                      required
                    />
                  </div>
                  {/* Açıklama */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Açıklama <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={e =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Proje açıklamasını girin'
                      required
                    />
                  </div>
                  {/* Proje Türü */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Proje Türü <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={newProject.type}
                      onChange={e =>
                        setNewProject({
                          ...newProject,
                          type: e.target.value as 'B2B' | 'B2C',
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      <option value='B2B'>B2B (İşletmeden İşletmeye)</option>
                      <option value='B2C'>B2C (İşletmeden Tüketiciye)</option>
                    </select>
                  </div>
                  {/* Durum */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Durum <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={newProject.status}
                      onChange={e =>
                        setNewProject({
                          ...newProject,
                          status: e.target.value as
                            | 'Planlandı'
                            | 'Aktif'
                            | 'Tamamlandı',
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      <option value='Planlandı'>Planlandı</option>
                      <option value='Aktif'>Aktif</option>
                      <option value='Tamamlandı'>Tamamlandı</option>
                    </select>
                  </div>
                  {/* Admin Notu */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Admin Notu
                    </label>
                    <textarea
                      value={newProject.adminNote}
                      onChange={e =>
                        setNewProject({
                          ...newProject,
                          adminNote: e.target.value,
                        })
                      }
                      rows={2}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Proje hakkında özel notlarınızı buraya yazabilirsiniz...'
                    />
                  </div>
                </div>
                <div className='flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200'>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
                    disabled={isCreating}
                  >
                    İptal
                  </button>
                  <button
                    type='submit'
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Oluşturuluyor...
                      </>
                    ) : (
                      'Proje Oluştur'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Proje Düzenle
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
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
                  handleUpdateProject();
                }}
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Proje Adı */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Proje Adı <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={editingProject.name}
                      onChange={e =>
                        setEditingProject({
                          ...editingProject,
                          name: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Proje adını girin'
                      required
                    />
                  </div>
                  {/* Açıklama */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Açıklama <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      value={editingProject.description}
                      onChange={e =>
                        setEditingProject({
                          ...editingProject,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Proje açıklamasını girin'
                      required
                    />
                  </div>
                  {/* Proje Türü */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Proje Türü <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={editingProject.type}
                      onChange={e =>
                        setEditingProject({
                          ...editingProject,
                          type: e.target.value as 'B2B' | 'B2C',
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      <option value='B2B'>B2B (İşletmeden İşletmeye)</option>
                      <option value='B2C'>B2C (İşletmeden Tüketiciye)</option>
                    </select>
                  </div>
                  {/* Durum */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Durum <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={editingProject.status}
                      onChange={e =>
                        setEditingProject({
                          ...editingProject,
                          status: e.target.value as
                            | 'Planlandı'
                            | 'Aktif'
                            | 'Tamamlandı',
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      <option value='Planlandı'>Planlandı</option>
                      <option value='Aktif'>Aktif</option>
                      <option value='Tamamlandı'>Tamamlandı</option>
                    </select>
                  </div>
                  {/* Admin Notu */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Admin Notu
                    </label>
                    <textarea
                      value={editingProject.adminNote || ''}
                      onChange={e =>
                        setEditingProject({
                          ...editingProject,
                          adminNote: e.target.value,
                        })
                      }
                      rows={2}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Proje hakkında özel notlarınızı buraya yazabilirsiniz...'
                    />
                  </div>
                </div>
                <div className='flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200'>
                  <button
                    type='button'
                    onClick={() => setShowEditModal(false)}
                    className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
                    disabled={isEditing}
                  >
                    İptal
                  </button>
                  <button
                    type='submit'
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
                    disabled={isEditing}
                  >
                    {isEditing ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Güncelleniyor...
                      </>
                    ) : (
                      'Proje Güncelle'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Enhanced Firma Atama Modal */}
      {showAssignModal && assigningProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b'>
              <div>
                <h2 className='text-2xl font-bold text-gray-800'>
                  {assigningProject.name} - Firma Atamaları
                </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  Ana Proje atamalarını yönetin
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
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

            {/* Controls */}
            <div className='p-6 border-b bg-gray-50'>
              <div className='flex flex-wrap gap-4 items-center'>
                {/* Search */}
                <div className='flex-1 min-w-64'>
                  <input
                    type='text'
                    placeholder='Firma ara...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='all'>Tüm Durumlar</option>
                  <option value='active'>Aktif</option>
                  <option value='locked'>Kilitli</option>
                  <option value='revoked'>Kaldırılmış</option>
                </select>

                {/* Bulk Actions */}
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleBulkAction('active')}
                    className='px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm'
                  >
                    Tümünü Aktif Yap
                  </button>
                  <button
                    onClick={() => handleBulkAction('locked')}
                    className='px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm'
                  >
                    Tümünü Kilitle
                  </button>
                  <button
                    onClick={() => handleBulkAction('revoked')}
                    className='px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm'
                  >
                    Tümünü Kaldır
                  </button>
                </div>
              </div>

              {/* Selected Companies Bulk Action */}
              <div className='mt-4 flex items-center gap-4'>
                <span className='text-sm text-gray-600'>
                  Seçili firmaların durumunu değiştir:
                </span>
                <select
                  onChange={e => handleSelectedBulkAction(e.target.value)}
                  className='px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                >
                  <option value=''>Durum seçin</option>
                  <option value='active'>Aktif</option>
                  <option value='locked'>Kilitli</option>
                  <option value='revoked'>Kaldır</option>
                </select>
              </div>
            </div>

            {/* Companies List */}
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='space-y-3'>
                {filteredCompanies.map(company => (
                  <CompanyAssignmentRow
                    key={company.id}
                    company={company}
                    currentStatus={companyAssignments[company.id] || 'revoked'}
                    onStatusChange={newStatus =>
                      handleCompanyStatusChange(company.id, newStatus)
                    }
                  />
                ))}
              </div>

              {filteredCompanies.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <svg
                    className='w-12 h-12 mx-auto mb-4 text-gray-300'
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
                  <p>Filtre kriterlerinize uygun firma bulunamadı</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='flex items-center justify-between p-6 border-t bg-gray-50'>
              <div className='text-sm text-gray-600'>
                {filteredCompanies.length} firma gösteriliyor
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveAssignments}
                  disabled={isAssigning}
                  className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isAssigning ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Company Assignment Row Component
interface CompanyAssignmentRowProps {
  company: any;
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

function CompanyAssignmentRow({
  company,
  currentStatus,
  onStatusChange,
}: CompanyAssignmentRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'locked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'locked':
        return 'Kilitli';
      case 'revoked':
        return 'Kaldırılmış';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
      <div className='flex-1'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
            <span className='text-blue-600 font-semibold text-sm'>
              {company.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className='font-semibold text-gray-800'>{company.name}</h3>
            <p className='text-sm text-gray-600'>{company.email}</p>
            <p className='text-xs text-gray-500'>
              {company.city || 'Bilinmiyor'} • {company.industry || 'Diğer'}
            </p>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentStatus)}`}
        >
          {getStatusText(currentStatus)}
        </span>

        <select
          value={currentStatus}
          onChange={e => onStatusChange(e.target.value)}
          className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
        >
          <option value='revoked'>Kaldır</option>
          <option value='active'>Aktif</option>
          <option value='locked'>Kilitli</option>
        </select>
      </div>
    </div>
  );
}
