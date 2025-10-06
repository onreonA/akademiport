'use client';
import { useState, useEffect } from 'react';
interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
}
interface MultiCompanyAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (companyIds: string[]) => void;
  title: string;
  description: string;
  type: 'project' | 'sub-project' | 'task';
  assignedCompanyIds?: string[];
}
export default function MultiCompanyAssignmentModal({
  isOpen,
  onClose,
  onAssign,
  title,
  description,
  type,
  assignedCompanyIds = [],
}: MultiCompanyAssignmentModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      setSelectedCompanies(assignedCompanyIds);
    }
  }, [isOpen, assignedCompanyIds]);
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      } else {
        setError('Firmalar yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('Firmalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompanies.length === 0) {
      setError('Lütfen en az bir firma seçin');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Call the onAssign function which should handle the API call
      await onAssign(selectedCompanies);
      // Only close if assignment was successful
      onClose();
    } catch (error) {
      setError('Firma ataması yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-800'>
              {type === 'project' && 'Projeyi Firmalara Ata'}
              {type === 'sub-project' && 'Alt Projeyi Firmalara Ata'}
              {type === 'task' && 'Görevi Firmalara Ata'}
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
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
          {/* Assignment Info */}
          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <h3 className='font-semibold text-gray-800 mb-2'>
              {type === 'project' && 'Proje Bilgileri'}
              {type === 'sub-project' && 'Alt Proje Bilgileri'}
              {type === 'task' && 'Görev Bilgileri'}
            </h3>
            <p className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Başlık:</span> {title}
            </p>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Açıklama:</span> {description}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                Firmaları Seçin (Çoklu Seçim)
              </label>
              {loading ? (
                <div className='text-center py-4'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto'></div>
                  <p className='text-sm text-gray-500 mt-2'>
                    Firmalar yükleniyor...
                  </p>
                </div>
              ) : (
                <div className='space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3'>
                  {companies.map(company => (
                    <label
                      key={company.id}
                      className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={selectedCompanies.includes(company.id)}
                        onChange={() => handleCompanyToggle(company.id)}
                        className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                      />
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900'>
                          {company.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {company.email}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.status === 'Aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {company.status === 'Aktif' ? 'Aktif' : 'Pasif'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {error && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            )}
            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={selectedCompanies.length === 0}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {selectedCompanies.length > 0
                  ? `${selectedCompanies.length} Firmaya Ata`
                  : 'Firma Seçin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
