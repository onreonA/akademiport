'use client';
import { ClipboardList } from 'lucide-react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import Breadcrumb from '@/components/ui/Breadcrumb';
interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'Bekliyor' | 'İncelemede' | 'Tamamlandı' | 'İptal Edildi';
  priority: 'Düşük' | 'Orta' | 'Yüksek';
  due_date: string;
  created_at: string;
  completed_at?: string;
}
interface SubProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  project_id: string;
}
interface CompanyProjectTasksClientProps {
  projectId: string;
  subProjectId: string;
  subProject: SubProject;
  tasks: TaskItem[];
}
export default function CompanyProjectTasksClient({
  projectId,
  subProjectId,
  subProject,
  tasks,
}: CompanyProjectTasksClientProps) {
  // Görev durumu renkleri
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'İncelemede':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Bekliyor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'İptal Edildi':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  // Öncelik renkleri
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
  // Tarih formatı
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  // İlerleme hesaplama
  const completedTasks = tasks.filter(
    task => task.status === 'Tamamlandı'
  ).length;
  const totalTasks = tasks.length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return (
    <FirmaLayout
      title={`${subProject.name} - Görevler`}
      description='Alt proje görevlerini yönetin ve takip edin'
    >
      <div className='space-y-6'>
        {/* Breadcrumb */}
        <Breadcrumb className='mb-4' />
        {/* Alt Proje Bilgileri */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                {subProject.name}
              </h1>
              <p className='text-gray-600 mb-4'>{subProject.description}</p>
              <div className='flex items-center gap-6 text-sm text-gray-500'>
                <span>
                  <i className='ri-calendar-line mr-1'></i>
                  Başlangıç: {formatDate(subProject.start_date)}
                </span>
                <span>
                  <i className='ri-calendar-check-line mr-1'></i>
                  Bitiş: {formatDate(subProject.end_date)}
                </span>
                <span>
                  <i className='ri-folder-line mr-1'></i>
                  Proje ID: {projectId}
                </span>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-blue-600 mb-1'>
                {progressPercentage}%
              </div>
              <div className='text-sm text-gray-500'>İlerleme</div>
            </div>
          </div>
          {/* İlerleme Çubuğu */}
          <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
            <div
              className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {/* İstatistikler */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>
                {totalTasks}
              </div>
              <div className='text-sm text-gray-500'>Toplam Görev</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {completedTasks}
              </div>
              <div className='text-sm text-gray-500'>Tamamlanan</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {tasks.filter(task => task.status === 'İncelemede').length}
              </div>
              <div className='text-sm text-gray-500'>İncelemede</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {tasks.filter(task => task.status === 'Bekliyor').length}
              </div>
              <div className='text-sm text-gray-500'>Bekleyen</div>
            </div>
          </div>
        </div>
        {/* Görevler */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                <ClipboardList className='w-5 h-5 mr-2' />
                Görevler ({totalTasks})
              </h2>
              <div className='flex items-center gap-2'>
                <select className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='all'>Tüm Durumlar</option>
                  <option value='Bekliyor'>Bekliyor</option>
                  <option value='İncelemede'>İncelemede</option>
                  <option value='Tamamlandı'>Tamamlandı</option>
                  <option value='İptal Edildi'>İptal Edildi</option>
                </select>
                <select className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='all'>Tüm Öncelikler</option>
                  <option value='Yüksek'>Yüksek</option>
                  <option value='Orta'>Orta</option>
                  <option value='Düşük'>Düşük</option>
                </select>
              </div>
            </div>
          </div>
          <div className='divide-y divide-gray-200'>
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div
                  key={`subproject-tasks-${task.id}`}
                  className='p-6 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='text-lg font-medium text-gray-900'>
                          {task.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(task.status)}`}
                        >
                          {task.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-3'>{task.description}</p>
                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <span>
                          <i className='ri-calendar-line mr-1'></i>
                          Teslim: {formatDate(task.due_date)}
                        </span>
                        <span>
                          <i className='ri-time-line mr-1'></i>
                          Oluşturulma: {formatDate(task.created_at)}
                        </span>
                        {task.completed_at && (
                          <span>
                            <i className='ri-check-line mr-1'></i>
                            Tamamlanma: {formatDate(task.completed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      <button className='p-2 text-gray-400 hover:text-blue-600 transition-colors'>
                        <i className='ri-edit-line'></i>
                      </button>
                      <button className='p-2 text-gray-400 hover:text-green-600 transition-colors'>
                        <i className='ri-eye-line'></i>
                      </button>
                      <button className='p-2 text-gray-400 hover:text-red-600 transition-colors'>
                        <i className='ri-delete-bin-line'></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <ClipboardList className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Henüz Görev Yok
                </h3>
                <p className='text-gray-500 mb-4'>
                  Bu alt proje için henüz görev eklenmemiş.
                </p>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  İlk Görevi Ekle
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Hızlı İşlemler */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Hızlı İşlemler
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'>
              <div className='text-center'>
                <i className='ri-add-line text-2xl text-gray-400 mb-2'></i>
                <div className='text-sm font-medium text-gray-600'>
                  Yeni Görev Ekle
                </div>
              </div>
            </button>
            <button className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors'>
              <div className='text-center'>
                <i className='ri-file-download-line text-2xl text-gray-400 mb-2'></i>
                <div className='text-sm font-medium text-gray-600'>
                  Rapor İndir
                </div>
              </div>
            </button>
            <button className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors'>
              <div className='text-center'>
                <i className='ri-share-line text-2xl text-gray-400 mb-2'></i>
                <div className='text-sm font-medium text-gray-600'>Paylaş</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
