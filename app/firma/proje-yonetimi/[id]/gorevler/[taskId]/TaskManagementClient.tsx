'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiDownloadLine,
  RiEyeLine,
  RiFileLine,
  RiFlagLine,
  RiMessageLine,
  RiTimeLine,
  RiUploadLine,
  RiUserLine,
} from 'react-icons/ri';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  assignmentStatus?: string;
  project: {
    id: string;
    name: string;
    companies: {
      name: string;
      city: string;
      industry: string;
    };
  };
  subProject?: {
    id: string;
    name: string;
  };
  comments: Array<{
    id: string;
    comment: string;
    commentType: string;
    userType: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      type: string;
    };
  }>;
  files: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    description: string;
    fileTypeCategory: string;
    uploadedAt: string;
    uploadedBy: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  history: Array<{
    id: string;
    action: string;
    oldValue: string;
    newValue: string;
    notes?: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      type: string;
    };
  }>;
}

interface TaskManagementClientProps {
  taskId: string;
}

export default function TaskManagementClient({
  taskId,
}: TaskManagementClientProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'details' | 'comments' | 'files' | 'history'
  >('details');

  // Form states
  const [completing, setCompleting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [completionForm, setCompletionForm] = useState({
    completionNote: '',
    completionDate: new Date().toISOString().split('T')[0],
    actualHours: '',
  });

  const [commentForm, setCommentForm] = useState({
    comment: '',
    commentType: 'general',
  });

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    description: '',
    fileType: 'attachment',
  });

  // Fetch task data
  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/firma/tasks/${taskId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Görev verileri yüklenirken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        setTask(data.task);
      } else {
        throw new Error(data.error || 'Görev bulunamadı');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Görev yüklenirken hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Complete task
  const handleCompleteTask = async () => {
    if (!task || completing) return;

    try {
      setCompleting(true);

      const response = await fetch(`/api/firma/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(completionForm),
      });

      if (!response.ok) {
        throw new Error('Görev tamamlanırken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        alert('Görev başarıyla tamamlandı ve onay için gönderildi!');
        setCompletionForm({
          completionNote: '',
          completionDate: new Date().toISOString().split('T')[0],
          actualHours: '',
        });
        fetchTask(); // Refresh task data
      } else {
        throw new Error(data.error || 'Görev tamamlanırken hata oluştu');
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Görev tamamlanırken hata oluştu'
      );
    } finally {
      setCompleting(false);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!commentForm.comment.trim() || commenting) return;

    try {
      setCommenting(true);

      const response = await fetch(`/api/firma/tasks/${taskId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commentForm),
      });

      if (!response.ok) {
        throw new Error('Yorum eklenirken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        setCommentForm({ comment: '', commentType: 'general' });
        fetchTask(); // Refresh task data
      } else {
        throw new Error(data.error || 'Yorum eklenirken hata oluştu');
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Yorum eklenirken hata oluştu'
      );
    } finally {
      setCommenting(false);
    }
  };

  // Upload file
  const handleUploadFile = async () => {
    if (!uploadForm.file || uploading) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('description', uploadForm.description);
      formData.append('fileType', uploadForm.fileType);

      const response = await fetch(`/api/firma/tasks/${taskId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Dosya yüklenirken hata oluştu');
      }

      const data = await response.json();
      if (data.success) {
        setUploadForm({ file: null, description: '', fileType: 'attachment' });
        fetchTask(); // Refresh task data
      } else {
        throw new Error(data.error || 'Dosya yüklenirken hata oluştu');
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Dosya yüklenirken hata oluştu'
      );
    } finally {
      setUploading(false);
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <RiCloseLine className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Hata</h2>
          <p className='text-gray-600'>{error || 'Görev bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => window.history.back()}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <RiArrowLeftLine className='w-5 h-5 text-gray-600' />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>{task.title}</h1>
              <p className='text-gray-600'>{task.project.name}</p>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
            >
              {task.status === 'pending'
                ? 'Beklemede'
                : task.status === 'in_progress'
                  ? 'Devam Ediyor'
                  : task.status === 'completed'
                    ? 'Tamamlandı'
                    : 'İptal Edildi'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}
            >
              {task.priority === 'low'
                ? 'Düşük'
                : task.priority === 'medium'
                  ? 'Orta'
                  : task.priority === 'high'
                    ? 'Yüksek'
                    : 'Acil'}
            </span>
          </div>
        </div>

        <p className='text-gray-700 mb-4'>{task.description}</p>

        {/* Progress Bar */}
        <div className='mb-4'>
          <div className='flex items-center justify-between text-sm mb-2'>
            <span className='text-gray-600'>İlerleme</span>
            <span className='font-semibold text-gray-900'>
              {task.progress}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            {[
              { id: 'details', label: 'Detaylar', icon: RiEyeLine },
              {
                id: 'comments',
                label: 'Yorumlar',
                icon: RiMessageLine,
                count: task.comments.length,
              },
              {
                id: 'files',
                label: 'Dosyalar',
                icon: RiFileLine,
                count: task.files.length,
              },
              {
                id: 'history',
                label: 'Geçmiş',
                icon: RiTimeLine,
                count: task.history.length,
              },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className='bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs'>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className='space-y-6'>
              {/* Task Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <RiCalendarLine className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm text-gray-600'>Başlangıç Tarihi</p>
                      <p className='font-medium'>
                        {task.startDate
                          ? formatDate(task.startDate)
                          : 'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <RiTimeLine className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm text-gray-600'>Bitiş Tarihi</p>
                      <p className='font-medium'>
                        {task.dueDate
                          ? formatDate(task.dueDate)
                          : 'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <RiUserLine className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm text-gray-600'>Firma</p>
                      <p className='font-medium'>
                        {task.project.companies.name}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <RiFlagLine className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm text-gray-600'>Alt Proje</p>
                      <p className='font-medium'>
                        {task.subProject?.name || 'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Task Form */}
              {task.status !== 'completed' && (
                <div className='bg-blue-50 rounded-xl p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Görevi Tamamla
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Tamamlama Notu
                      </label>
                      <textarea
                        value={completionForm.completionNote}
                        onChange={e =>
                          setCompletionForm(prev => ({
                            ...prev,
                            completionNote: e.target.value,
                          }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        rows={3}
                        placeholder='Görev tamamlama detaylarını yazın...'
                      />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Tamamlama Tarihi
                        </label>
                        <input
                          type='date'
                          value={completionForm.completionDate}
                          onChange={e =>
                            setCompletionForm(prev => ({
                              ...prev,
                              completionDate: e.target.value,
                            }))
                          }
                          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Harcanan Saat
                        </label>
                        <input
                          type='number'
                          value={completionForm.actualHours}
                          onChange={e =>
                            setCompletionForm(prev => ({
                              ...prev,
                              actualHours: e.target.value,
                            }))
                          }
                          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='0'
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCompleteTask}
                      disabled={
                        completing || !completionForm.completionNote.trim()
                      }
                      className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                    >
                      <RiCheckLine className='w-4 h-4' />
                      <span>
                        {completing ? 'Tamamlanıyor...' : 'Görevi Tamamla'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className='space-y-6'>
              {/* Add Comment Form */}
              <div className='bg-gray-50 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Yorum Ekle
                </h3>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Yorum Türü
                    </label>
                    <select
                      value={commentForm.commentType}
                      onChange={e =>
                        setCommentForm(prev => ({
                          ...prev,
                          commentType: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='general'>Genel</option>
                      <option value='question'>Soru</option>
                      <option value='issue'>Sorun</option>
                      <option value='update'>Güncelleme</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Yorum
                    </label>
                    <textarea
                      value={commentForm.comment}
                      onChange={e =>
                        setCommentForm(prev => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={4}
                      placeholder='Yorumunuzu yazın...'
                    />
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={commenting || !commentForm.comment.trim()}
                    className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                  >
                    <RiMessageLine className='w-4 h-4' />
                    <span>{commenting ? 'Ekleniyor...' : 'Yorum Ekle'}</span>
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className='space-y-4'>
                {task.comments.map(comment => (
                  <div
                    key={comment.id}
                    className='bg-white border border-gray-200 rounded-xl p-4'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                          <RiUserLine className='w-4 h-4 text-blue-600' />
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {comment.user.name}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {comment.user.email}
                          </p>
                        </div>
                      </div>
                      <span className='text-xs text-gray-500'>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className='text-gray-700 mb-2'>{comment.comment}</p>
                    <span className='inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                      {comment.commentType}
                    </span>
                  </div>
                ))}
                {task.comments.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    <RiMessageLine className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                    <p>Henüz yorum yok</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className='space-y-6'>
              {/* Upload File Form */}
              <div className='bg-gray-50 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Dosya Yükle
                </h3>
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Dosya Türü
                      </label>
                      <select
                        value={uploadForm.fileType}
                        onChange={e =>
                          setUploadForm(prev => ({
                            ...prev,
                            fileType: e.target.value,
                          }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value='attachment'>Ek</option>
                        <option value='document'>Doküman</option>
                        <option value='image'>Görsel</option>
                        <option value='report'>Rapor</option>
                        <option value='other'>Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Dosya
                      </label>
                      <input
                        type='file'
                        onChange={e =>
                          setUploadForm(prev => ({
                            ...prev,
                            file: e.target.files?.[0] || null,
                          }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Açıklama
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={e =>
                        setUploadForm(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={2}
                      placeholder='Dosya açıklaması...'
                    />
                  </div>
                  <button
                    onClick={handleUploadFile}
                    disabled={uploading || !uploadForm.file}
                    className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                  >
                    <RiUploadLine className='w-4 h-4' />
                    <span>{uploading ? 'Yükleniyor...' : 'Dosya Yükle'}</span>
                  </button>
                </div>
              </div>

              {/* Files List */}
              <div className='space-y-4'>
                {task.files.map(file => (
                  <div
                    key={file.id}
                    className='bg-white border border-gray-200 rounded-xl p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                          <RiFileLine className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {file.fileName}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {formatFileSize(file.fileSize)} •{' '}
                            {formatDate(file.uploadedAt)}
                          </p>
                          {file.description && (
                            <p className='text-sm text-gray-600 mt-1'>
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                          {file.fileTypeCategory}
                        </span>
                        <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                          <RiDownloadLine className='w-4 h-4 text-gray-600' />
                        </button>
                        <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                          <RiEyeLine className='w-4 h-4 text-gray-600' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {task.files.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    <RiFileLine className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                    <p>Henüz dosya yok</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className='space-y-4'>
              {task.history.map(item => (
                <div
                  key={item.id}
                  className='bg-white border border-gray-200 rounded-xl p-4'
                >
                  <div className='flex items-start space-x-4'>
                    <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                      <RiTimeLine className='w-4 h-4 text-gray-600' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-2'>
                        <p className='font-medium text-gray-900'>
                          {item.action}
                        </p>
                        <span className='text-xs text-gray-500'>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      {item.oldValue && item.newValue && (
                        <div className='text-sm text-gray-600 mb-2'>
                          <span className='bg-red-100 text-red-800 px-2 py-1 rounded mr-2'>
                            {item.oldValue}
                          </span>
                          →
                          <span className='bg-green-100 text-green-800 px-2 py-1 rounded ml-2'>
                            {item.newValue}
                          </span>
                        </div>
                      )}
                      {item.notes && (
                        <p className='text-sm text-gray-600'>{item.notes}</p>
                      )}
                      <p className='text-xs text-gray-500 mt-2'>
                        by {item.user.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {task.history.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <RiTimeLine className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                  <p>Henüz geçmiş kaydı yok</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
