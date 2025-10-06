'use client';

import { useEffect, useState } from 'react';

interface CompletionData {
  subProject: {
    id: string;
    name: string;
    description: string;
    projectName: string;
  };
  company: {
    id: string;
    name: string;
  };
  assignment: {
    id: string;
    status: string;
    completionStatus: string;
    allTasksCompleted: boolean;
  };
  statistics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    allCompleted: boolean;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    completed_at: string;
  }>;
  canCreateReport: boolean;
}

interface SubProjectCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subProjectId: string;
  companyId?: string; // Artık opsiyonel
  onReportCreated?: () => void;
}

export default function SubProjectCompletionModal({
  isOpen,
  onClose,
  subProjectId,
  companyId: initialCompanyId,
  onReportCreated,
}: SubProjectCompletionModalProps) {
  const [completionData, setCompletionData] = useState<CompletionData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    initialCompanyId || null
  );
  const [availableCompanies, setAvailableCompanies] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [ratings, setRatings] = useState({
    overall: 5,
    quality: 5,
    timeliness: 5,
    communication: 5,
  });

  const [feedback, setFeedback] = useState({
    strengths: '',
    areasForImprovement: '',
    recommendations: '',
    generalFeedback: '',
  });

  // Load available companies when modal opens
  useEffect(() => {
    if (isOpen && subProjectId) {
      fetchAvailableCompanies();
    }
  }, [isOpen, subProjectId]);

  // Load completion data when company is selected
  useEffect(() => {
    if (isOpen && subProjectId && selectedCompanyId) {
      fetchCompletionData();
    }
  }, [isOpen, subProjectId, selectedCompanyId]);

  const fetchAvailableCompanies = async () => {
    try {
      const response = await fetch(
        `/api/admin/projects/${subProjectId}/sub-project-assignments`
      );
      if (!response.ok) {
        throw new Error('Firma listesi yüklenemedi');
      }
      const data = await response.json();
      setAvailableCompanies(data.sub_projects || []);
    } catch (error) {}
  };

  const fetchCompletionData = async () => {
    if (!selectedCompanyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/sub-projects/${subProjectId}/completion-status/${selectedCompanyId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Tamamlama bilgileri yüklenirken hata oluştu');
      }

      const data = await response.json();
      setCompletionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!completionData?.canCreateReport) {
      setError('Bu alt proje için henüz rapor oluşturulamaz');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/consultant/sub-project-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subProjectId,
          companyId: selectedCompanyId,
          overallRating: ratings.overall,
          qualityScore: ratings.quality,
          timelinessScore: ratings.timeliness,
          communicationScore: ratings.communication,
          strengths: feedback.strengths,
          areasForImprovement: feedback.areasForImprovement,
          recommendations: feedback.recommendations,
          generalFeedback: feedback.generalFeedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rapor oluşturulurken hata oluştu');
      }

      const result = await response.json();

      if (onReportCreated) {
        onReportCreated();
      }

      onClose();

      // Success notification could be added here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (type: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [type]: value }));
  };

  const handleFeedbackChange = (type: keyof typeof feedback, value: string) => {
    setFeedback(prev => ({ ...prev, [type]: value }));
  };

  const resetForm = () => {
    setRatings({ overall: 5, quality: 5, timeliness: 5, communication: 5 });
    setFeedback({
      strengths: '',
      areasForImprovement: '',
      recommendations: '',
      generalFeedback: '',
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Alt Proje Tamamlama Raporu
            </h2>
            <button
              onClick={handleClose}
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
          {/* Firma Seçimi */}
          {!selectedCompanyId && (
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Firma Seçin
              </label>
              <select
                value={selectedCompanyId || ''}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Firma seçin...</option>
                {availableCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : error ? (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          ) : completionData ? (
            <>
              {/* Proje Bilgileri */}
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Proje Bilgileri
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Ana Proje
                    </p>
                    <p className='text-gray-900'>
                      {completionData.subProject.projectName}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Alt Proje
                    </p>
                    <p className='text-gray-900'>
                      {completionData.subProject.name}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Firma</p>
                    <p className='text-gray-900'>
                      {completionData.company.name}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Tamamlama Oranı
                    </p>
                    <p className='text-gray-900'>
                      {completionData.statistics.completedTasks}/
                      {completionData.statistics.totalTasks}(
                      {completionData.statistics.completionRate}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Görevler Listesi */}
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                  Tamamlanan Görevler
                </h3>
                <div className='space-y-2'>
                  {completionData.tasks.map(task => (
                    <div
                      key={task.id}
                      className='flex items-center justify-between p-3 bg-green-50 rounded-lg'
                    >
                      <span className='font-medium text-green-800'>
                        {task.title}
                      </span>
                      <div className='flex items-center text-green-600'>
                        <svg
                          className='w-4 h-4 mr-1'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span className='text-sm'>Tamamlandı</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {completionData.canCreateReport ? (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Değerlendirme Puanları */}
                  <div>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Değerlendirme Puanları
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {[
                        {
                          key: 'overall',
                          label: 'Genel Performans',
                          value: ratings.overall,
                        },
                        {
                          key: 'quality',
                          label: 'Kalite',
                          value: ratings.quality,
                        },
                        {
                          key: 'timeliness',
                          label: 'Zamanında Teslim',
                          value: ratings.timeliness,
                        },
                        {
                          key: 'communication',
                          label: 'İletişim',
                          value: ratings.communication,
                        },
                      ].map(rating => (
                        <div key={rating.key}>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            {rating.label}
                          </label>
                          <div className='flex items-center space-x-2'>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type='button'
                                onClick={() =>
                                  handleRatingChange(
                                    rating.key as keyof typeof ratings,
                                    star
                                  )
                                }
                                className={`text-2xl ${
                                  star <= rating.value
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                              >
                                ★
                              </button>
                            ))}
                            <span className='ml-2 text-sm text-gray-600'>
                              ({rating.value}/5)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Geri Bildirim */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Değerlendirme Yorumları
                    </h3>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Güçlü Yönler
                      </label>
                      <textarea
                        value={feedback.strengths}
                        onChange={e =>
                          handleFeedbackChange('strengths', e.target.value)
                        }
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Firmanın bu alt projede başarılı olduğu alanları belirtin...'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Gelişim Alanları
                      </label>
                      <textarea
                        value={feedback.areasForImprovement}
                        onChange={e =>
                          handleFeedbackChange(
                            'areasForImprovement',
                            e.target.value
                          )
                        }
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='İyileştirilebilir konuları belirtin...'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Öneriler
                      </label>
                      <textarea
                        value={feedback.recommendations}
                        onChange={e =>
                          handleFeedbackChange(
                            'recommendations',
                            e.target.value
                          )
                        }
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Gelecek projeler için önerilerinizi yazın...'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Genel Değerlendirme
                      </label>
                      <textarea
                        value={feedback.generalFeedback}
                        onChange={e =>
                          handleFeedbackChange(
                            'generalFeedback',
                            e.target.value
                          )
                        }
                        rows={4}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Genel değerlendirmenizi ve geri bildirimlerinizi yazın...'
                        required
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={handleClose}
                      className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      İptal
                    </button>
                    <button
                      type='submit'
                      disabled={submitting}
                      className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
                    >
                      {submitting ? 'Kaydediliyor...' : 'Raporu Kaydet'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className='text-center py-8'>
                  <div className='text-yellow-600 mb-2'>
                    <svg
                      className='w-12 h-12 mx-auto'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Rapor Oluşturulamıyor
                  </h3>
                  <p className='text-gray-600'>
                    Bu alt proje için rapor oluşturmak için tüm görevlerin
                    tamamlanmış olması gerekir.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
