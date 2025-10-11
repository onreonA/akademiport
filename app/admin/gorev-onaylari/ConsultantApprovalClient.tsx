'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RiAlertLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
  RiFilterLine,
  RiFlagLine,
  RiRefreshLine,
  RiSearchLine,
  RiStarLine,
  RiTimeLine,
  RiUserLine,
} from 'react-icons/ri';

interface TaskCompletion {
  id: string;
  taskId: string;
  company_id: string;
  task: {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    progress: number;
    project: {
      id: string;
      name: string;
      company: {
        id: string;
        name: string;
        city: string;
        industry: string;
      };
    };
    subProject?: {
      id: string;
      name: string;
    };
  };
  completion: {
    id: string;
    note: string;
    date: string;
    actualHours?: number;
    status: string;
    createdAt: string;
  };
  completedBy: {
    id: string;
    name: string;
    email: string;
    companyId: string;
  };
}

interface ApprovalStats {
  pendingApproval: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
}

export default function ConsultantApprovalClient() {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    pendingApproval: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompletion, setSelectedCompletion] =
    useState<TaskCompletion | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    approvalNote: '',
    qualityScore: 5,
  });
  const [rejectionForm, setRejectionForm] = useState({
    rejectionReason: '',
    requiredActions: '',
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending_approval',
    projectId: '',
    companyId: '',
  });

  // Fetch pending tasks
  const fetchPendingTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        status: filters.status,
        limit: '20',
        offset: '0',
      });

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.projectId) queryParams.append('projectId', filters.projectId);
      if (filters.companyId) queryParams.append('companyId', filters.companyId);

      const response = await fetch(`/api/admin/task-approvals?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Onay bekleyen görevler yüklenirken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        // Admin task approvals API'si tasks döndürüyor, completions formatına çeviriyoruz
        const formattedCompletions = data.tasks.map((task: any) => ({
          id: task.id,
          taskId: task.id,
          company_id: task.company_id,
          task: {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority || 'medium',
            dueDate: task.due_date,
            progress: 0,
            project: {
              id: 'unknown',
              name: task.project_name || 'Bilinmiyor',
              company: {
                id: 'unknown',
                name: task.company_name || 'Bilinmiyor',
                city: 'Bilinmiyor',
                industry: 'Bilinmiyor',
              },
            },
            subProject: task.sub_project_name
              ? {
                  id: 'unknown',
                  name: task.sub_project_name,
                }
              : undefined,
          },
          completion: {
            id: task.id,
            note: task.notes || '',
            date: task.completed_at,
            actualHours: 0,
            status: task.status,
            createdAt: task.created_at,
          },
          assignedTo: task.assigned_to || 'Bilinmiyor',
          completedBy: {
            name: task.completed_by || 'Bilinmiyor',
            email: task.completed_by_email || '',
          },
          createdAt: task.created_at,
          updatedAt: task.updated_at,
        }));

        setCompletions(formattedCompletions);
        setStats({
          total: data.tasks.length,
          pending: data.tasks.filter((t: any) => t.status === 'Tamamlandı')
            .length,
          approved: data.tasks.filter((t: any) => t.status === 'Tamamlandı')
            .length,
          rejected: 0,
        });
      } else {
        throw new Error(data.error || 'Veri yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPendingTasks();
  }, [fetchPendingTasks]);

  // Approve task with retry mechanism
  const handleApproveTask = async (completion: TaskCompletion) => {
    if (approving || !approvalForm.approvalNote.trim()) return;

    const maxRetries = 3;
    let retryCount = 0;

    const attemptApproval = async (): Promise<Response> => {
      const response = await fetch(
        `/api/admin/task-approvals/${completion.taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            action: 'approve',
            approval_notes: approvalForm.approvalNote,
            company_id: completion.company_id,
          }),
        }
      );

      return response;
    };

    try {
      setApproving(true);

      let response;
      while (retryCount < maxRetries) {
        response = await attemptApproval();

        if (response.ok) {
          break;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }

      if (!response.ok) {
        throw new Error('Görev onaylanırken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        alert('Görev başarıyla onaylandı!');
        setApprovalForm({ approvalNote: '', qualityScore: 5 });
        setShowModal(false);
        setSelectedCompletion(null);
        fetchPendingTasks(); // Refresh data
      } else {
        throw new Error(data.error || 'Görev onaylanırken hata oluştu');
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Görev onaylanırken hata oluştu'
      );
    } finally {
      setApproving(false);
    }
  };

  // Reject task
  const handleRejectTask = async (completion: TaskCompletion) => {
    if (rejecting || !rejectionForm.rejectionReason.trim()) return;

    try {
      setRejecting(true);

      const response = await fetch(
        `/api/admin/task-approvals/${completion.taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            action: 'reject',
            approval_notes: rejectionForm.rejectionReason,
            company_id: completion.company_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Görev reddedilirken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        alert('Görev reddedildi ve firma bilgilendirildi!');
        setRejectionForm({ rejectionReason: '', requiredActions: '' });
        setShowModal(false);
        setSelectedCompletion(null);
        fetchPendingTasks(); // Refresh data
      } else {
        throw new Error(data.error || 'Görev reddedilirken hata oluştu');
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Görev reddedilirken hata oluştu'
      );
    } finally {
      setRejecting(false);
    }
  };

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours?: number) => {
    if (!hours) return 'Belirtilmemiş';
    return `${hours} saat`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <RiAlertLine className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Hata</h2>
          <p className='text-gray-600'>{error}</p>
          <button
            onClick={fetchPendingTasks}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <RiRefreshLine className='w-4 h-4 inline mr-2' />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Onay Bekleyen</p>
              <p className='text-3xl font-bold text-orange-600'>
                {stats.pendingApproval}
              </p>
            </div>
            <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center'>
              <RiTimeLine className='w-6 h-6 text-orange-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Bu Ay Onaylanan
              </p>
              <p className='text-3xl font-bold text-green-600'>
                {stats.approvedThisMonth}
              </p>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
              <RiCheckLine className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Bu Ay Reddedilen
              </p>
              <p className='text-3xl font-bold text-red-600'>
                {stats.rejectedThisMonth}
              </p>
            </div>
            <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
              <RiCloseLine className='w-6 h-6 text-red-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
        <div className='flex items-center space-x-4 mb-4'>
          <RiFilterLine className='w-5 h-5 text-gray-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Filtreler</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Arama
            </label>
            <div className='relative'>
              <RiSearchLine className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                value={filters.search}
                onChange={e =>
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                }
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Görev, firma veya proje ara...'
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Durum
            </label>
            <select
              value={filters.status}
              onChange={e =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='pending_approval'>Onay Bekleyen</option>
              <option value='completed'>Onaylanan</option>
              <option value='cancelled'>İptal Edilen</option>
            </select>
          </div>
          <div className='flex items-end'>
            <button
              onClick={fetchPendingTasks}
              className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center'
            >
              <RiRefreshLine className='w-4 h-4 mr-2' />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Task Completions List */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Görev Tamamlamaları ({completions.length})
          </h3>
        </div>
        <div className='divide-y divide-gray-200'>
          {completions.map(completion => (
            <div
              key={completion.id}
              className='p-6 hover:bg-gray-50 transition-colors'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h4 className='text-lg font-semibold text-gray-900'>
                      {completion.task.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(completion.task.priority)}`}
                    >
                      {completion.task.priority === 'low'
                        ? 'Düşük'
                        : completion.task.priority === 'medium'
                          ? 'Orta'
                          : completion.task.priority === 'high'
                            ? 'Yüksek'
                            : 'Acil'}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <RiUserLine className='w-4 h-4' />
                        <span>
                          <strong>Firma:</strong>{' '}
                          {completion.task.project?.company?.name ||
                            'Bilinmiyor'}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <RiFlagLine className='w-4 h-4' />
                        <span>
                          <strong>Proje:</strong>{' '}
                          {completion.task.project?.name || 'Bilinmiyor'}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <RiUserLine className='w-4 h-4' />
                        <span>
                          <strong>Tamamlayan:</strong>{' '}
                          {completion.completedBy?.name || 'Bilinmiyor'}
                        </span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <RiCalendarLine className='w-4 h-4' />
                        <span>
                          <strong>Tarih:</strong>{' '}
                          {formatDate(completion.completion.date)}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <RiTimeLine className='w-4 h-4' />
                        <span>
                          <strong>Süre:</strong>{' '}
                          {formatHours(completion.completion.actualHours)}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <RiStarLine className='w-4 h-4' />
                        <span>
                          <strong>İlerleme:</strong> {completion.task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {completion.completion.note && (
                    <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                      <h5 className='font-medium text-gray-900 mb-2'>
                        Tamamlama Notu:
                      </h5>
                      <p className='text-gray-700'>
                        {completion.completion.note}
                      </p>
                    </div>
                  )}
                </div>

                <div className='flex items-center space-x-2 ml-6'>
                  <button
                    onClick={() => {
                      setSelectedCompletion(completion);
                      setShowModal(true);
                    }}
                    className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                    title='Detayları Görüntüle'
                  >
                    <RiEyeLine className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {completions.length === 0 && (
            <div className='text-center py-12 text-gray-500'>
              <RiTimeLine className='w-16 h-16 mx-auto mb-4 text-gray-300' />
              <h3 className='text-lg font-medium mb-2'>
                Onay bekleyen görev yok
              </h3>
              <p>Şu anda onayınızı bekleyen görev tamamlaması bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && selectedCompletion && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Görev Onay/Red İşlemi
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCompletion(null);
                    setApprovalForm({ approvalNote: '', qualityScore: 5 });
                    setRejectionForm({
                      rejectionReason: '',
                      requiredActions: '',
                    });
                  }}
                  className='p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors'
                >
                  <RiCloseLine className='w-5 h-5' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              {/* Task Info */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-3'>
                  {selectedCompletion.task.title}
                </h4>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-600'>Firma:</span>
                    <span className='ml-2 font-medium'>
                      {selectedCompletion.task.project.company.name}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-600'>Proje:</span>
                    <span className='ml-2 font-medium'>
                      {selectedCompletion.task.project.name}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-600'>Tamamlayan:</span>
                    <span className='ml-2 font-medium'>
                      {selectedCompletion.completedBy.name}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-600'>Tarih:</span>
                    <span className='ml-2 font-medium'>
                      {formatDate(selectedCompletion.completion.date)}
                    </span>
                  </div>
                </div>
                {selectedCompletion.completion.note && (
                  <div className='mt-3'>
                    <span className='text-gray-600 text-sm'>Not:</span>
                    <p className='text-sm text-gray-700 mt-1'>
                      {selectedCompletion.completion.note}
                    </p>
                  </div>
                )}
              </div>

              {/* Approval Form */}
              <div className='border-t border-gray-200 pt-6'>
                <h5 className='font-semibold text-gray-900 mb-4 flex items-center'>
                  <RiCheckLine className='w-5 h-5 text-green-600 mr-2' />
                  Görevi Onayla
                </h5>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Onay Notu
                    </label>
                    <textarea
                      value={approvalForm.approvalNote}
                      onChange={e =>
                        setApprovalForm(prev => ({
                          ...prev,
                          approvalNote: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={3}
                      placeholder='Onay notunuzu yazın...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Kalite Puanı (1-10)
                    </label>
                    <input
                      type='range'
                      min='1'
                      max='10'
                      value={approvalForm.qualityScore}
                      onChange={e =>
                        setApprovalForm(prev => ({
                          ...prev,
                          qualityScore: parseInt(e.target.value),
                        }))
                      }
                      className='w-full'
                    />
                    <div className='flex justify-between text-sm text-gray-600 mt-1'>
                      <span>1 (Düşük)</span>
                      <span className='font-medium'>
                        {approvalForm.qualityScore}/10
                      </span>
                      <span>10 (Mükemmel)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApproveTask(selectedCompletion)}
                    disabled={approving || !approvalForm.approvalNote.trim()}
                    className='flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                  >
                    <RiCheckLine className='w-4 h-4' />
                    <span>
                      {approving ? 'Onaylanıyor...' : 'Görevi Onayla'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Rejection Form */}
              <div className='border-t border-gray-200 pt-6'>
                <h5 className='font-semibold text-gray-900 mb-4 flex items-center'>
                  <RiCloseLine className='w-5 h-5 text-red-600 mr-2' />
                  Görevi Reddet
                </h5>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Red Sebebi *
                    </label>
                    <textarea
                      value={rejectionForm.rejectionReason}
                      onChange={e =>
                        setRejectionForm(prev => ({
                          ...prev,
                          rejectionReason: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={3}
                      placeholder='Red sebebini açıklayın...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Gerekli Aksiyonlar
                    </label>
                    <textarea
                      value={rejectionForm.requiredActions}
                      onChange={e =>
                        setRejectionForm(prev => ({
                          ...prev,
                          requiredActions: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={2}
                      placeholder='Firmanın yapması gerekenler...'
                    />
                  </div>
                  <button
                    onClick={() => handleRejectTask(selectedCompletion)}
                    disabled={
                      rejecting || !rejectionForm.rejectionReason.trim()
                    }
                    className='flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                  >
                    <RiCloseLine className='w-4 h-4' />
                    <span>
                      {rejecting ? 'Reddediliyor...' : 'Görevi Reddet'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
