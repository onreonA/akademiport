'use client';

import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SubProjectCompletion {
  id: string;
  completed_at: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  status: string;
  sub_projects: {
    id: string;
    name: string;
    description: string;
    project_id: string;
    projects: {
      id: string;
      name: string;
    };
  };
  companies: {
    id: string;
    name: string;
    industry: string;
  };
  company_users: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface EvaluationReport {
  id: string;
  title: string;
  content: string;
  evaluation_score: number;
  report_status: string;
  created_at: string;
  sub_project_completions: {
    sub_projects: {
      name: string;
      projects: {
        name: string;
      };
    };
    companies: {
      name: string;
    };
  };
  users: {
    full_name: string;
  };
}

export default function AltProjeDegerlendirme() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>(
    'pending'
  );
  const [pendingCompletions, setPendingCompletions] = useState<
    SubProjectCompletion[]
  >([]);
  const [completedReports, setCompletedReports] = useState<EvaluationReport[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedCompletion, setSelectedCompletion] =
    useState<SubProjectCompletion | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'pending') {
        const response = await fetch('/api/admin/sub-project-completions', {
          headers: {
            'X-User-Email':
              document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-user-email='))
                ?.split('=')[1] || '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingCompletions(data.completions || []);
        }
      } else {
        const response = await fetch(
          '/api/admin/sub-project-evaluations?status=published',
          {
            headers: {
              'X-User-Email':
                document.cookie
                  .split('; ')
                  .find(row => row.startsWith('auth-user-email='))
                  ?.split('=')[1] || '',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCompletedReports(data.reports || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateCompletion = (completion: SubProjectCompletion) => {
    setSelectedCompletion(completion);
    setShowReportModal(true);
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
      <AdminLayout title='Alt Proje Değerlendirme Raporları'>
        <div className='flex items-center justify-center h-64'>
          <LoadingSpinner size='lg' />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title='Alt Proje Değerlendirme Raporları'>
      <div className='space-y-6'>
        {/* Tab Navigation */}
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bekleyen Değerlendirmeler ({pendingCompletions.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tamamlanan Raporlar ({completedReports.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'pending' ? (
          <div className='space-y-4'>
            {pendingCompletions.length === 0 ? (
              <div className='text-center py-12'>
                <div className='text-gray-500 text-lg'>
                  Bekleyen değerlendirme bulunmuyor
                </div>
                <p className='text-gray-400 mt-2'>
                  Firmalar alt projelerini tamamladığında burada görünecek
                </p>
              </div>
            ) : (
              <div className='grid gap-6'>
                {pendingCompletions.map(completion => (
                  <div
                    key={completion.id}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {completion.sub_projects.name}
                          </h3>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                            Bekliyor
                          </span>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Proje
                            </label>
                            <p className='text-sm text-gray-900'>
                              {completion.sub_projects.projects.name}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Firma
                            </label>
                            <p className='text-sm text-gray-900'>
                              {completion.companies.name}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Tamamlanan Görevler
                            </label>
                            <p className='text-sm text-gray-900'>
                              {completion.completed_tasks} /{' '}
                              {completion.total_tasks}(
                              {completion.completion_percentage}%)
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='text-sm text-gray-500'>
                            Tamamlayan: {completion.company_users.full_name} (
                            {completion.company_users.email})
                            <br />
                            Tarih: {formatDate(completion.completed_at)}
                          </div>

                          <button
                            onClick={() => handleEvaluateCompletion(completion)}
                            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          >
                            <svg
                              className='w-4 h-4 mr-2'
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
                            Rapor Yaz
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {completedReports.length === 0 ? (
              <div className='text-center py-12'>
                <div className='text-gray-500 text-lg'>
                  Tamamlanan rapor bulunmuyor
                </div>
                <p className='text-gray-400 mt-2'>
                  Değerlendirme raporları burada görünecek
                </p>
              </div>
            ) : (
              <div className='grid gap-6'>
                {completedReports.map(report => (
                  <div
                    key={report.id}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {report.title}
                          </h3>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            Tamamlandı
                          </span>
                          {report.evaluation_score && (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              {report.evaluation_score}/10
                            </span>
                          )}
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Alt Proje
                            </label>
                            <p className='text-sm text-gray-900'>
                              {report.sub_project_completions.sub_projects.name}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Ana Proje
                            </label>
                            <p className='text-sm text-gray-900'>
                              {
                                report.sub_project_completions.sub_projects
                                  .projects.name
                              }
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-gray-500'>
                              Firma
                            </label>
                            <p className='text-sm text-gray-900'>
                              {report.sub_project_completions.companies.name}
                            </p>
                          </div>
                        </div>

                        <div className='text-sm text-gray-600 mb-4'>
                          {report.content.length > 200
                            ? `${report.content.substring(0, 200)}...`
                            : report.content}
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='text-sm text-gray-500'>
                            Danışman: {report.users.full_name}
                            <br />
                            Tarih: {formatDate(report.created_at)}
                          </div>

                          <button className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                            <svg
                              className='w-4 h-4 mr-2'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                              />
                            </svg>
                            Detayları Gör
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && selectedCompletion && (
        <EvaluationReportModal
          completion={selectedCompletion}
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedCompletion(null);
          }}
          onSuccess={() => {
            setShowReportModal(false);
            setSelectedCompletion(null);
            fetchData();
          }}
        />
      )}
    </AdminLayout>
  );
}

// Evaluation Report Modal Component
function EvaluationReportModal({
  completion,
  isOpen,
  onClose,
  onSuccess,
}: {
  completion: SubProjectCompletion;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    evaluation_score: 5,
    strengths: [] as string[],
    weaknesses: [] as string[],
    recommendations: [] as string[],
    next_steps: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [activeList, setActiveList] = useState<
    'strengths' | 'weaknesses' | 'recommendations' | 'next_steps'
  >('strengths');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Başlık ve içerik alanları zorunludur');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/sub-project-evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email':
            document.cookie
              .split('; ')
              .find(row => row.startsWith('auth-user-email='))
              ?.split('=')[1] || '',
        },
        body: JSON.stringify({
          completionId: completion.id,
          ...formData,
        }),
      });

      if (response.ok) {
        alert('Değerlendirme raporu başarıyla oluşturuldu!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Rapor oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Rapor oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addToList = () => {
    if (!newItem.trim()) return;

    setFormData(prev => ({
      ...prev,
      [activeList]: [...prev[activeList], newItem.trim()],
    }));
    setNewItem('');
  };

  const removeFromList = (index: number) => {
    setFormData(prev => ({
      ...prev,
      [activeList]: prev[activeList].filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Alt Proje Değerlendirme Raporu
          </h3>

          <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
            <h4 className='font-medium text-gray-900 mb-2'>Proje Bilgileri</h4>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-500'>Alt Proje:</span>{' '}
                {completion.sub_projects.name}
              </div>
              <div>
                <span className='text-gray-500'>Ana Proje:</span>{' '}
                {completion.sub_projects.projects.name}
              </div>
              <div>
                <span className='text-gray-500'>Firma:</span>{' '}
                {completion.companies.name}
              </div>
              <div>
                <span className='text-gray-500'>Tamamlanan Görevler:</span>{' '}
                {completion.completed_tasks}/{completion.total_tasks}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Rapor Başlığı *
              </label>
              <input
                type='text'
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Değerlendirme raporu başlığı'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Değerlendirme Skoru (1-10)
              </label>
              <input
                type='number'
                min='1'
                max='10'
                value={formData.evaluation_score}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    evaluation_score: parseInt(e.target.value),
                  }))
                }
                className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Rapor İçeriği *
              </label>
              <textarea
                value={formData.content}
                onChange={e =>
                  setFormData(prev => ({ ...prev, content: e.target.value }))
                }
                rows={6}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Alt projenin detaylı değerlendirmesi...'
                required
              />
            </div>

            {/* List Management */}
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Güçlü Yönler
                </label>
                <div className='space-y-2'>
                  {formData.strengths.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-green-50 px-3 py-2 rounded'
                    >
                      <span className='text-sm'>{item}</span>
                      <button
                        type='button'
                        onClick={() => removeFromList(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className='flex'>
                    <input
                      type='text'
                      value={activeList === 'strengths' ? newItem : ''}
                      onChange={e => setNewItem(e.target.value)}
                      onFocus={() => setActiveList('strengths')}
                      placeholder='Güçlü yön ekle...'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      type='button'
                      onClick={addToList}
                      className='px-3 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600'
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Gelişim Alanları
                </label>
                <div className='space-y-2'>
                  {formData.weaknesses.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-red-50 px-3 py-2 rounded'
                    >
                      <span className='text-sm'>{item}</span>
                      <button
                        type='button'
                        onClick={() => removeFromList(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className='flex'>
                    <input
                      type='text'
                      value={activeList === 'weaknesses' ? newItem : ''}
                      onChange={e => setNewItem(e.target.value)}
                      onFocus={() => setActiveList('weaknesses')}
                      placeholder='Gelişim alanı ekle...'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      type='button'
                      onClick={addToList}
                      className='px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600'
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Öneriler
                </label>
                <div className='space-y-2'>
                  {formData.recommendations.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-blue-50 px-3 py-2 rounded'
                    >
                      <span className='text-sm'>{item}</span>
                      <button
                        type='button'
                        onClick={() => removeFromList(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className='flex'>
                    <input
                      type='text'
                      value={activeList === 'recommendations' ? newItem : ''}
                      onChange={e => setNewItem(e.target.value)}
                      onFocus={() => setActiveList('recommendations')}
                      placeholder='Öneri ekle...'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      type='button'
                      onClick={addToList}
                      className='px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600'
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sonraki Adımlar
                </label>
                <div className='space-y-2'>
                  {formData.next_steps.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-yellow-50 px-3 py-2 rounded'
                    >
                      <span className='text-sm'>{item}</span>
                      <button
                        type='button'
                        onClick={() => removeFromList(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className='flex'>
                    <input
                      type='text'
                      value={activeList === 'next_steps' ? newItem : ''}
                      onChange={e => setNewItem(e.target.value)}
                      onFocus={() => setActiveList('next_steps')}
                      placeholder='Sonraki adım ekle...'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      type='button'
                      onClick={addToList}
                      className='px-3 py-2 bg-yellow-500 text-white rounded-r-md hover:bg-yellow-600'
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end space-x-3 pt-4 border-t'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
              >
                {loading ? 'Kaydediliyor...' : 'Raporu Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
