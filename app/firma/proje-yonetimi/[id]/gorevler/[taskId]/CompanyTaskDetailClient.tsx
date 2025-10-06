'use client';
import Link from 'next/link';
import { useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import Breadcrumb from '@/components/ui/Breadcrumb';
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
  notes: string;
  assignedTo: string;
  subProjectName: string;
  projectName: string;
  created_at: string;
  completed_at?: string;
}
interface CompanyTaskDetailClientProps {
  params: { id: string; taskId: string };
  task: Task;
}
export default function CompanyTaskDetailClient({
  params,
  task: initialTask,
}: CompanyTaskDetailClientProps) {
  const [task, setTask] = useState<Task>(initialTask);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: initialTask.status,
    progress: initialTask.progress,
    notes: initialTask.notes,
  });
  const handleUpdateTask = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTask(updatedTask);
        setError(null);
      } else {
        setError('Görev güncellenirken hata oluştu');
      }
    } catch (err) {
      setError('Görev güncellenirken hata oluştu');
    } finally {
      setUpdating(false);
    }
  };
  const getStatusColor = (status: string) => {
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  return (
    <FirmaLayout
      title={`${task.title} - Görev Detayı`}
      description='Görev detaylarını görüntüleyin ve güncelleyin'
    >
      <div className='space-y-6'>
        {/* Breadcrumb */}
        <Breadcrumb className='mb-4' />
        {/* Görev Başlığı */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                {task.title}
              </h1>
              <div className='flex items-center gap-3 mb-3'>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}
                >
                  {task.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}
                >
                  {task.priority} Öncelik
                </span>
                <span className='text-sm text-gray-500'>
                  <i className='ri-user-line mr-1'></i>
                  {task.assignedTo}
                </span>
              </div>
              <p className='text-gray-600 mb-4'>{task.description}</p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-blue-600 mb-1'>
                {task.progress}%
              </div>
              <div className='text-sm text-gray-500'>İlerleme</div>
            </div>
          </div>
          {/* İlerleme Çubuğu */}
          <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
            <div
              className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
          {/* Görev Bilgileri */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='font-medium text-gray-700'>Proje:</span>
              <p className='text-gray-600'>{task.projectName}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Alt Proje:</span>
              <p className='text-gray-600'>{task.subProjectName}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Teslim Tarihi:</span>
              <p className='text-gray-600'>{formatDate(task.dueDate)}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Oluşturulma:</span>
              <p className='text-gray-600'>{formatDate(task.created_at)}</p>
            </div>
            {task.completed_at && (
              <div>
                <span className='font-medium text-gray-700'>Tamamlanma:</span>
                <p className='text-gray-600'>{formatDate(task.completed_at)}</p>
              </div>
            )}
          </div>
        </div>
        {/* Görev Güncelleme */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Görev Güncelle
          </h2>
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <i className='ri-error-warning-line text-red-400'></i>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-red-800'>Hata</h3>
                  <div className='mt-2 text-sm text-red-700'>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Durum
              </label>
              <select
                value={updateData.status}
                onChange={e =>
                  setUpdateData({ ...updateData, status: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='Bekliyor'>Bekliyor</option>
                <option value='İncelemede'>İncelemede</option>
                <option value='Tamamlandı'>Tamamlandı</option>
                <option value='İptal Edildi'>İptal Edildi</option>
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
                value={updateData.progress}
                onChange={e =>
                  setUpdateData({
                    ...updateData,
                    progress: parseInt(e.target.value) || 0,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Notlar
              </label>
              <textarea
                value={updateData.notes}
                onChange={e =>
                  setUpdateData({ ...updateData, notes: e.target.value })
                }
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Görev hakkında notlarınızı yazın...'
              />
            </div>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() =>
                  setUpdateData({
                    status: task.status,
                    progress: task.progress,
                    notes: task.notes,
                  })
                }
                className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
              >
                Sıfırla
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={updating}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors'
              >
                {updating ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
        {/* Görev Geçmişi */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Görev Geçmişi
          </h2>
          <div className='space-y-3'>
            <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>
                  Görev oluşturuldu
                </p>
                <p className='text-xs text-gray-500'>
                  {formatDate(task.created_at)}
                </p>
              </div>
            </div>
            {task.completed_at && (
              <div className='flex items-start gap-3 p-3 bg-green-50 rounded-lg'>
                <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900'>
                    Görev tamamlandı
                  </p>
                  <p className='text-xs text-gray-500'>
                    {formatDate(task.completed_at)}
                  </p>
                </div>
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
            <Link
              href={`/firma/proje-yonetimi/${params.id}`}
              className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'
            >
              <div className='text-center'>
                <i className='ri-arrow-left-line text-2xl text-gray-400 mb-2'></i>
                <div className='text-sm font-medium text-gray-600'>
                  Projeye Dön
                </div>
              </div>
            </Link>
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
