'use client';

import { AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Company {
  id: string;
  name: string;
  email: string;
}

interface ProjectDate {
  id?: string;
  company_id: string;
  start_date: string;
  end_date: string;
  is_flexible: boolean;
  companies?: Company;
}

interface ProjectDateSelectorProps {
  projectId: string;
  level: 'project' | 'sub-project' | 'task';
  parentDates?: { start: string; end: string };
  parentProjectId?: string;
  onDatesChange: (dates: { start: string; end: string }) => void;
  onSave: (
    companyId: string,
    startDate: string,
    endDate: string,
    isFlexible: boolean
  ) => Promise<void>;
}

export default function ProjectDateSelector({
  projectId,
  level,
  parentDates,
  parentProjectId,
  onDatesChange,
  onSave,
}: ProjectDateSelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projectDates, setProjectDates] = useState<ProjectDate[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isFlexible, setIsFlexible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [dynamicParentDates, setDynamicParentDates] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // Companies'ı yükle
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        }
      } catch (error) {}
    };

    fetchCompanies();
  }, []);

  // Proje tarihlerini yükle
  useEffect(() => {
    const fetchProjectDates = async () => {
      try {
        const endpoint =
          level === 'project'
            ? `/api/admin/projects/${projectId}/dates`
            : level === 'sub-project'
              ? `/api/admin/sub-projects/${projectId}/dates`
              : `/api/admin/tasks/${projectId}/dates`;

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setProjectDates(data.data || []);
        }
      } catch (error) {}
    };

    fetchProjectDates();
  }, [projectId, level]);

  // Firma seçildiğinde üst seviye (parent) tarihlerini getir
  useEffect(() => {
    const fetchParentDates = async () => {
      if (
        selectedCompany &&
        (level === 'sub-project' || level === 'task') &&
        parentProjectId
      ) {
        try {
          const endpoint =
            level === 'sub-project'
              ? `/api/admin/projects/${parentProjectId}/dates`
              : `/api/admin/sub-projects/${parentProjectId}/dates`;
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            const companyDates = data.data?.find(
              (date: any) => date.company_id === selectedCompany
            );
            if (companyDates) {
              setDynamicParentDates({
                start: companyDates.start_date,
                end: companyDates.end_date,
              });
            } else {
              setDynamicParentDates(null);
            }
          }
        } catch (error) {
          setDynamicParentDates(null);
        }
      } else {
        setDynamicParentDates(null);
      }
    };

    fetchParentDates();
  }, [selectedCompany, level, parentProjectId]);

  // Hangi parent dates'i kullanacağımızı belirle
  const currentParentDates = dynamicParentDates || parentDates;

  // Tarih validasyonu
  const validateDates = async (
    companyId: string,
    start: string,
    end: string
  ) => {
    if (level === 'sub-project' || level === 'task') {
      try {
        const response = await fetch('/api/admin/validate-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            parentId: parentProjectId || projectId,
            companyId,
            startDate: start,
            endDate: end,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {}
    }
    return { isValid: true, message: '' };
  };

  // Kaydet
  const handleSave = async () => {
    if (!selectedCompany || !startDate || !endDate) {
      setError('Tüm alanları doldurun');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Tarih validasyonu
      const validation = await validateDates(
        selectedCompany,
        startDate,
        endDate
      );
      if (!validation.isValid) {
        setError(validation.message);
        if (validation.suggestedDates) {
          setStartDate(validation.suggestedDates.start);
          setEndDate(validation.suggestedDates.end);
        }
        return;
      }

      // Kaydet
      await onSave(selectedCompany, startDate, endDate, isFlexible);

      setSuccess('Tarih başarıyla kaydedildi');

      // Formu temizle
      setSelectedCompany('');
      setStartDate('');
      setEndDate('');
      setIsFlexible(false);

      // Proje tarihlerini yenile
      const endpoint =
        level === 'project'
          ? `/api/admin/projects/${projectId}/dates`
          : level === 'sub-project'
            ? `/api/admin/sub-projects/${projectId}/dates`
            : `/api/admin/tasks/${projectId}/dates`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setProjectDates(data.data || []);
      }
    } catch (error) {
      setError('Kaydetme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Mevcut tarih kaydını düzenle
  const handleEdit = (date: ProjectDate) => {
    setSelectedCompany(date.company_id);
    setStartDate(date.start_date);
    setEndDate(date.end_date);
    setIsFlexible(date.is_flexible);
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border p-6'>
      <div className='flex items-center gap-2 mb-6'>
        <Calendar className='h-5 w-5 text-blue-600' />
        <h3 className='text-lg font-semibold text-gray-900'>
          {level === 'project'
            ? 'Ana Proje'
            : level === 'sub-project'
              ? 'Alt Proje'
              : 'Görev'}{' '}
          Tarih Yönetimi
        </h3>
      </div>

      {/* Parent dates info */}
      {currentParentDates && (
        <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
          <div className='flex items-center gap-2 text-sm text-blue-700'>
            <Clock className='h-4 w-4' />
            <span className='font-medium'>Üst Seviye Tarihler:</span>
            <span>
              {currentParentDates.start} - {currentParentDates.end}
            </span>
          </div>
        </div>
      )}

      {/* Firma seçilmediğinde uyarı */}
      {!selectedCompany && (level === 'sub-project' || level === 'task') && (
        <div className='mb-4 p-3 bg-yellow-50 rounded-lg'>
          <div className='flex items-center gap-2 text-sm text-yellow-700'>
            <AlertCircle className='h-4 w-4' />
            <span>
              Önce firma seçin, böylece üst seviye tarihleri görebilirsiniz.
            </span>
          </div>
        </div>
      )}

      {/* Firma seçildi ama ana proje tarihi yok */}
      {selectedCompany &&
        (level === 'sub-project' || level === 'task') &&
        !currentParentDates && (
          <div className='mb-4 p-3 bg-red-50 rounded-lg'>
            <div className='flex items-center gap-2 text-sm text-red-700'>
              <AlertCircle className='h-4 w-4' />
              <span>
                Bu firmaya ana proje tarihi atanmamış. Önce ana projeye tarih
                ataması yapın.
              </span>
            </div>
          </div>
        )}

      {/* Form */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Firma Seçin
          </label>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Firma seçin...</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center gap-4'>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={isFlexible}
              onChange={e => setIsFlexible(e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <span className='text-sm text-gray-700'>Esnek Tarih</span>
          </label>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Başlangıç Tarihi
          </label>
          <input
            type='date'
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            min={currentParentDates?.start}
            max={currentParentDates?.end}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Bitiş Tarihi
          </label>
          <input
            type='date'
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={currentParentDates?.start}
            max={currentParentDates?.end}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <span className='text-sm text-red-700'>{error}</span>
        </div>
      )}

      {success && (
        <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <span className='text-sm text-green-700'>{success}</span>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={
          loading ||
          !selectedCompany ||
          !startDate ||
          !endDate ||
          ((level === 'sub-project' || level === 'task') && !currentParentDates)
        }
        className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? 'Kaydediliyor...' : 'Tarih Kaydet'}
      </button>

      {/* Existing dates */}
      {projectDates.length > 0 && (
        <div className='mt-8'>
          <h4 className='text-md font-semibold text-gray-900 mb-4'>
            Mevcut Tarih Kayıtları
          </h4>
          <div className='space-y-3'>
            {projectDates.map(date => (
              <div
                key={date.id}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center gap-4'>
                  <div>
                    <span className='font-medium text-gray-900'>
                      {date.companies?.name || 'Bilinmiyor'}
                    </span>
                    <div className='text-sm text-gray-600'>
                      {date.start_date} - {date.end_date}
                      {date.is_flexible && (
                        <span className='ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded'>
                          Esnek
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(date)}
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                  Düzenle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
