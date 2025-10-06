'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  subProject: {
    id: string;
    name: string;
    projectName: string;
  };
}

interface CompanyProgress {
  id: string;
  company_id: string;
  status: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string;
  progress_notes: string;
  completion_notes: string;
  assigned_at: string;
  updated_at: string;
  companies: {
    id: string;
    name: string;
    email: string;
  };
}

interface CompanyProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onProgressUpdated?: () => void;
}

export default function CompanyProgressModal({
  isOpen,
  onClose,
  taskId,
  onProgressUpdated,
}: CompanyProgressModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [companyProgress, setCompanyProgress] = useState<CompanyProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskProgress();
    }
  }, [isOpen, taskId]);

  const fetchTaskProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/tasks/${taskId}/company-progress`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        // Eğer 404 hatası alırsak, boş veri döndür
        if (response.status === 404) {
          setTask({
            id: taskId,
            title: 'Görev Bilgisi',
            description: 'Görev açıklaması',
            status: 'Aktif',
            priority: 'Orta',
            deadline: null,
            subProject: {
              id: 'sub-project-id',
              name: 'Alt Proje',
              projectName: 'Ana Proje',
            },
          });
          setCompanyProgress([]);
          return;
        }
        throw new Error('Görev ilerlemesi yüklenirken hata oluştu');
      }

      const data = await response.json();
      setTask(data.task);
      setCompanyProgress(data.companyProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (
    companyId: string,
    status: string,
    progressPercentage: number,
    notes: string
  ) => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(
        `/api/admin/tasks/${taskId}/company-progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            companyId,
            status,
            progressPercentage,
            progressNotes: notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'İlerleme güncellenirken hata oluştu'
        );
      }

      // Başarılı güncelleme sonrası verileri yenile
      await fetchTaskProgress();
      setEditingProgress(null);

      if (onProgressUpdated) {
        onProgressUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'pending':
        return 'Beklemede';
      case 'on_hold':
        return 'Duraklatıldı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Firma İlerleme Durumu
              </h2>
              {task && (
                <p className='text-sm text-gray-600 mt-1'>
                  {task.title} - {task.subProject.projectName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
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
        </div>

        <div className='p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : error ? (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          ) : companyProgress.length === 0 ? (
            <div className='text-center py-8'>
              <div className='text-gray-400 mb-4'>
                <svg
                  className='w-12 h-12 mx-auto'
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
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Henüz Firma İlerlemesi Yok
              </h3>
              <p className='text-gray-600'>
                Bu görev için henüz firma-spesifik ilerleme kaydı bulunmuyor.
              </p>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* İstatistikler */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='bg-blue-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {companyProgress.length}
                  </div>
                  <div className='text-sm text-blue-800'>Toplam Firma</div>
                </div>
                <div className='bg-green-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-green-600'>
                    {
                      companyProgress.filter(p => p.status === 'completed')
                        .length
                    }
                  </div>
                  <div className='text-sm text-green-800'>Tamamlandı</div>
                </div>
                <div className='bg-yellow-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {
                      companyProgress.filter(p => p.status === 'in_progress')
                        .length
                    }
                  </div>
                  <div className='text-sm text-yellow-800'>Devam Ediyor</div>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-gray-600'>
                    {companyProgress.filter(p => p.status === 'pending').length}
                  </div>
                  <div className='text-sm text-gray-800'>Beklemede</div>
                </div>
              </div>

              {/* Firma Listesi */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Firma İlerlemeleri
                </h3>
                {companyProgress.map(progress => (
                  <div
                    key={progress.company_id}
                    className='bg-gray-50 rounded-lg p-4'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center space-x-3'>
                        <h4 className='font-medium text-gray-900'>
                          {progress.companies?.name}
                        </h4>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(progress.status)}`}
                        >
                          {getStatusText(progress.status)}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm text-gray-600'>
                          {progress.progress_percentage}%
                        </span>
                        <button
                          onClick={() =>
                            setEditingProgress(progress.company_id)
                          }
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
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='w-full bg-gray-200 rounded-full h-2 mb-3'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${progress.progress_percentage}%` }}
                      ></div>
                    </div>

                    {/* Detaylar */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                      <div>
                        <span className='font-medium'>Başlangıç:</span>{' '}
                        {formatDate(progress.started_at)}
                      </div>
                      <div>
                        <span className='font-medium'>Tamamlanma:</span>{' '}
                        {formatDate(progress.completed_at)}
                      </div>
                      <div>
                        <span className='font-medium'>Son Güncelleme:</span>{' '}
                        {formatDate(progress.updated_at)}
                      </div>
                    </div>

                    {/* Notlar */}
                    {progress.progress_notes && (
                      <div className='mt-3 p-3 bg-white rounded border'>
                        <div className='text-sm font-medium text-gray-700 mb-1'>
                          İlerleme Notları:
                        </div>
                        <div className='text-sm text-gray-600'>
                          {progress.progress_notes}
                        </div>
                      </div>
                    )}

                    {/* Düzenleme Formu */}
                    {editingProgress === progress.company_id && (
                      <EditProgressForm
                        progress={progress}
                        onSave={(status, percentage, notes) => {
                          handleUpdateProgress(
                            progress.company_id,
                            status,
                            percentage,
                            notes
                          );
                        }}
                        onCancel={() => setEditingProgress(null)}
                        updating={updating}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Düzenleme Formu Component'i
function EditProgressForm({
  progress,
  onSave,
  onCancel,
  updating,
}: {
  progress: CompanyProgress;
  onSave: (status: string, percentage: number, notes: string) => void;
  onCancel: () => void;
  updating: boolean;
}) {
  const [status, setStatus] = useState(progress.status);
  const [percentage, setPercentage] = useState(progress.progress_percentage);
  const [notes, setNotes] = useState(progress.progress_notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(status, percentage, notes);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='mt-4 p-4 bg-white rounded border space-y-4'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Durum
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='pending'>Beklemede</option>
            <option value='in_progress'>Devam Ediyor</option>
            <option value='completed'>Tamamlandı</option>
            <option value='on_hold'>Duraklatıldı</option>
            <option value='cancelled'>İptal Edildi</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            İlerleme Yüzdesi
          </label>
          <input
            type='number'
            min='0'
            max='100'
            value={percentage}
            onChange={e => setPercentage(parseInt(e.target.value))}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Notlar
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='İlerleme notları...'
        />
      </div>
      <div className='flex justify-end space-x-3'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-gray-600 hover:text-gray-800'
        >
          İptal
        </button>
        <button
          type='submit'
          disabled={updating}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50'
        >
          {updating ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
