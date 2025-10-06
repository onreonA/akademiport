'use client';

import { useState } from 'react';

interface AdvancedBulkDateManagerProps {
  level: 'project' | 'sub-project' | 'task';
  items: Array<{ id: string; name: string }>;
  companies: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

interface DateData {
  companyId: string;
  startDate: string;
  endDate: string;
  isFlexible: boolean;
}

interface BulkOperation {
  id: string;
  name: string;
  companyId: string;
  startDate: string;
  endDate: string;
  isFlexible: boolean;
}

export default function AdvancedBulkDateManager({
  level,
  items,
  companies,
  onClose,
  onSuccess,
}: AdvancedBulkDateManagerProps) {
  const [operation, setOperation] = useState<'assign_dates' | 'remove_dates'>(
    'assign_dates'
  );
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Çoklu firma seçimi için
  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  // Tüm firmaları seç/seçme
  const handleSelectAllCompanies = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(companies.map(c => c.id));
    }
  };

  // Toplu işlem hazırlama
  const prepareBulkOperations = () => {
    if (operation === 'remove_dates') {
      return items.map(item => ({
        id: item.id,
        name: item.name,
        companyId: '',
        startDate: '',
        endDate: '',
        isFlexible: false,
      }));
    }

    return items.flatMap(item =>
      selectedCompanies.map(companyId => ({
        id: item.id,
        name: item.name,
        companyId,
        startDate: '',
        endDate: '',
        isFlexible: false,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const operations = prepareBulkOperations();

      if (operation === 'assign_dates' && selectedCompanies.length === 0) {
        throw new Error('En az bir firma seçmelisiniz');
      }

      const response = await fetch('/api/admin/bulk-date-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          operation,
          level,
          items,
          selectedCompanies,
          operations,
        }),
      });

      if (!response.ok) {
        throw new Error('Toplu işlem başarısız');
      }

      const data = await response.json();
      setResult(data);

      if (data.summary.failed === 0) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const getLevelTitle = () => {
    switch (level) {
      case 'project':
        return 'Proje';
      case 'sub-project':
        return 'Alt Proje';
      case 'task':
        return 'Görev';
      default:
        return 'Öğe';
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-lg font-semibold'>
              Gelişmiş Toplu {getLevelTitle()} Tarih Yönetimi
            </h3>
            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700'
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

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* İşlem Seçimi */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                İşlem Türü
              </label>
              <div className='flex space-x-4'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='assign_dates'
                    checked={operation === 'assign_dates'}
                    onChange={e =>
                      setOperation(e.target.value as 'assign_dates')
                    }
                    className='mr-2'
                  />
                  Tarih Ata
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='remove_dates'
                    checked={operation === 'remove_dates'}
                    onChange={e =>
                      setOperation(e.target.value as 'remove_dates')
                    }
                    className='mr-2'
                  />
                  Tarihleri Kaldır
                </label>
              </div>
            </div>

            {/* Çoklu Firma Seçimi (sadece assign_dates için) */}
            {operation === 'assign_dates' && (
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Firmalar ({selectedCompanies.length}/{companies.length}{' '}
                    seçili)
                  </label>
                  <button
                    type='button'
                    onClick={handleSelectAllCompanies}
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    {selectedCompanies.length === companies.length
                      ? 'Tümünü Kaldır'
                      : 'Tümünü Seç'}
                  </button>
                </div>
                <div className='max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3'>
                  {companies.map(company => (
                    <label key={company.id} className='flex items-center py-1'>
                      <input
                        type='checkbox'
                        checked={selectedCompanies.includes(company.id)}
                        onChange={() => handleCompanyToggle(company.id)}
                        className='mr-2'
                      />
                      <span className='text-sm'>{company.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Seçilen Öğeler */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Seçilen {getLevelTitle()}ler ({items.length} adet)
              </label>
              <div className='max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2'>
                {items.map(item => (
                  <div key={item.id} className='text-sm text-gray-600 py-1'>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* İşlem Özeti */}
            {operation === 'assign_dates' && selectedCompanies.length > 0 && (
              <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
                <h4 className='text-sm font-medium text-blue-800 mb-2'>
                  İşlem Özeti:
                </h4>
                <p className='text-sm text-blue-700'>
                  {items.length} {getLevelTitle().toLowerCase()} ×{' '}
                  {selectedCompanies.length} firma ={' '}
                  {items.length * selectedCompanies.length} toplu işlem
                </p>
              </div>
            )}

            {/* Hata Mesajı */}
            {error && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                {error}
              </div>
            )}

            {/* Sonuç */}
            {result && (
              <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded'>
                <h4 className='font-medium mb-2'>İşlem Sonucu:</h4>
                <p>Toplam: {result.summary.total}</p>
                <p>Başarılı: {result.summary.successful}</p>
                <p>Başarısız: {result.summary.failed}</p>
                {result.errors.length > 0 && (
                  <div className='mt-2'>
                    <p className='font-medium'>Hatalar:</p>
                    {result.errors.map((error: any, index: number) => (
                      <p key={index} className='text-sm'>
                        {error.itemId}: {error.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Butonlar */}
            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={
                  loading ||
                  (operation === 'assign_dates' &&
                    selectedCompanies.length === 0)
                }
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
              >
                {loading ? 'İşleniyor...' : 'Uygula'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
