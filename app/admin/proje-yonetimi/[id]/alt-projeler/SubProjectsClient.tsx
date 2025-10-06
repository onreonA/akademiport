'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
interface SubProject {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Planlandı' | 'Aktif' | 'Tamamlandı';
  taskCount: number;
  progress: number;
  assignedCompanies: string[];
}
interface MainProject {
  id: string;
  name: string;
  description: string;
  type: 'B2B' | 'B2C';
  status: 'Planlandı' | 'Aktif' | 'Tamamlandı';
  startDate: string;
  endDate: string;
  progress: number;
  subProjectCount: number;
  assignedCompanies: number;
  consultantName: string;
  companyName: string;
}
const SubProjectCard = ({
  subProject,
  onEdit,
  onDelete,
  onAssignCompanies,
  onManageTasks,
  projectId,
}: {
  subProject: SubProject;
  onEdit: (subProject: SubProject) => void;
  onDelete: (id: string) => void;
  onAssignCompanies: (id: string) => void;
  onManageTasks: (id: string) => void;
  projectId: string;
}) => {
  const [showActions, setShowActions] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Tamamlandı':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 relative'>
      {/* Actions Menu */}
      <div className='absolute top-4 right-4'>
        <button
          onClick={() => setShowActions(!showActions)}
          className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors'
        >
          <i className='ri-more-2-fill text-lg'></i>
        </button>
        {showActions && (
          <div className='absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px] z-10'>
            <button
              onClick={() => {
                onEdit(subProject);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-edit-line'></i>
              Düzenle
            </button>
            <button
              onClick={() => {
                onAssignCompanies(subProject.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-building-line'></i>
              Firma Ata
            </button>
            <button
              onClick={() => {
                onManageTasks(subProject.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-task-line'></i>
              Görevleri Yönet
            </button>
            <hr className='my-1' />
            <button
              onClick={() => {
                onDelete(subProject.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'
            >
              <i className='ri-delete-bin-line'></i>
              Sil
            </button>
          </div>
        )}
      </div>
      {/* Header */}
      <div className='mb-4'>
        <div className='flex items-start justify-between mb-2'>
          <h3 className='text-lg font-semibold text-gray-900 pr-8'>
            {subProject.name}
          </h3>
        </div>
        <p className='text-gray-600 text-sm mb-3'>{subProject.description}</p>
        <div className='flex items-center gap-2'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subProject.status)}`}
          >
            {subProject.status}
          </span>
          <span className='text-xs text-gray-500'>
            {new Date(subProject.startDate).toLocaleDateString('tr-TR')} -{' '}
            {new Date(subProject.endDate).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>
      {/* Statistics */}
      <div className='grid grid-cols-3 gap-3 mb-4'>
        <div className='text-center p-2 bg-gray-50 rounded-lg'>
          <div className='text-sm font-medium text-gray-900'>
            {subProject.assignedCompanies.length}
          </div>
          <div className='text-xs text-gray-500'>Atanmış Firma</div>
        </div>
        <div className='text-center p-2 bg-gray-50 rounded-lg'>
          <div className='text-sm font-medium text-gray-900'>
            {subProject.taskCount}
          </div>
          <div className='text-xs text-gray-500'>Görev Sayısı</div>
        </div>
        <div className='text-center p-2 bg-gray-50 rounded-lg'>
          <div className='text-sm font-medium text-gray-900'>
            {subProject.progress}%
          </div>
          <div className='text-xs text-gray-500'>İlerleme</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className='mb-4'>
        <div className='flex justify-between items-center mb-1'>
          <span className='text-xs text-gray-500'>İlerleme</span>
          <span className='text-xs font-medium text-gray-900'>
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
      {/* Assigned Companies */}
      {subProject.assignedCompanies.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-sm font-medium text-gray-900 mb-2'>
            Atanan Firmalar
          </h4>
          <div className='flex flex-wrap gap-1'>
            {subProject.assignedCompanies.slice(0, 2).map((company, index) => (
              <span
                key={index}
                className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
              >
                {company}
              </span>
            ))}
            {subProject.assignedCompanies.length > 2 && (
              <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                +{subProject.assignedCompanies.length - 2} daha
              </span>
            )}
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className='flex gap-2'>
        <Link
          href={`/admin/proje-yonetimi/${projectId}/alt-projeler/${subProject.id}`}
          className='flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors'
        >
          Detayları Gör
        </Link>
        <Link
          href={`/admin/proje-yonetimi/${projectId}/alt-projeler/${subProject.id}`}
          className='flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors'
        >
          Görevleri Yönet
        </Link>
      </div>
    </div>
  );
};
export default function SubProjectsClient({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<MainProject | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateSubProject, setShowCreateSubProject] = useState(false);
  // Alt projeleri yükle
  useEffect(() => {
    fetchProjectAndSubProjects();
  }, [fetchProjectAndSubProjects]);
  const fetchProjectAndSubProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Proje detaylarını al
      const projectResponse = await fetch(`/api/projects/${params.id}`, {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        const project = projectData.project;
        const formattedProject: MainProject = {
          id: project.id,
          name: project.name,
          description: project.description,
          type: project.type,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          progress: project.progress,
          subProjectCount: project.subProjects?.length || 0,
          assignedCompanies: project.assignedCompanies?.length || 0,
          consultantName: project.consultantName,
          companyName: project.companyName,
        };
        setProject(formattedProject);
      }
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
        const formattedSubProjects: SubProject[] =
          subProjectsData.subProjects?.map((sp: any) => ({
            id: sp.id,
            name: sp.name,
            description: sp.description,
            startDate: sp.startDate,
            endDate: sp.endDate,
            status: sp.status,
            taskCount: sp.taskCount,
            progress: sp.progress,
            assignedCompanies: [], // API'den gelmiyor, şimdilik boş
          })) || [];
        setSubProjects(formattedSubProjects);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  }, [params.id]);
  const handleEditSubProject = (subProject: SubProject) => {
    // TODO: Implement edit sub project
  };
  const handleDeleteSubProject = async (id: string) => {
    if (confirm('Bu alt projeyi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/sub-projects/${id}`, {
          method: 'DELETE',
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        if (response.ok) {
          setSubProjects(subProjects.filter(sp => sp.id !== id));
        } else {
          throw new Error('Alt proje silinirken hata oluştu');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Alt proje silinirken hata oluştu'
        );
      }
    }
  };
  const handleAssignCompanies = (id: string) => {
    // TODO: Implement assign companies
  };
  const handleManageTasks = (id: string) => {
    // TODO: Navigate to tasks page
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Alt projeler yükleniyor...</p>
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
          <p className='text-gray-500 mb-4'>{error || 'Proje bulunamadı'}</p>
          <Link href='/admin/proje-yonetimi'>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'>
              Proje Listesine Dön
            </button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link
                href={`/admin/proje-yonetimi/${params.id}`}
                className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
              >
                <i className='ri-arrow-left-line text-lg'></i>
                <span>Proje Detayı</span>
              </Link>
              <div className='flex flex-col'>
                <h1 className='text-xl font-bold text-gray-900'>
                  {project.name}
                </h1>
                <p className='text-sm text-gray-500'>Alt Projeler</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setShowCreateSubProject(true)}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
              >
                + Yeni Alt Proje Oluştur
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className='pt-20 px-4 sm:px-6 lg:px-8 py-8'>
        {/* Project Overview */}
        <div className='mb-8'>
          <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white'>
            <div className='flex justify-between items-start'>
              <div className='flex-1'>
                <h2 className='text-2xl font-bold mb-2'>{project.name}</h2>
                <div className='flex items-center gap-4 mb-4'>
                  <span className='px-2 py-1 bg-white bg-opacity-20 rounded-full text-sm'>
                    {project.type}
                  </span>
                  <span className='text-sm opacity-90'>
                    {new Date(project.startDate).toLocaleDateString('tr-TR')} -{' '}
                    {new Date(project.endDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className='text-blue-100'>{project.description}</p>
              </div>
              <div className='text-right'>
                <div className='text-4xl font-bold'>{project.progress}%</div>
                <div className='text-blue-100'>Genel İlerleme</div>
              </div>
            </div>
          </div>
        </div>
        {/* Sub Projects Section */}
        <div>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h3 className='text-2xl font-bold text-gray-900'>Alt Projeler</h3>
              <p className='text-gray-500'>
                Bu ana projeye ait alt projeleri yönetin
              </p>
            </div>
            <button
              onClick={() => setShowCreateSubProject(true)}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
            >
              + Yeni Alt Proje Oluştur
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
                Bu proje için alt proje oluşturarak çalışmaya başlayabilirsiniz.
              </p>
              <button
                onClick={() => setShowCreateSubProject(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
              >
                İlk Alt Projeyi Oluştur
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {subProjects.map(subProject => (
                <SubProjectCard
                  key={subProject.id}
                  subProject={subProject}
                  onEdit={handleEditSubProject}
                  onDelete={handleDeleteSubProject}
                  onAssignCompanies={handleAssignCompanies}
                  onManageTasks={handleManageTasks}
                  projectId={params.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
