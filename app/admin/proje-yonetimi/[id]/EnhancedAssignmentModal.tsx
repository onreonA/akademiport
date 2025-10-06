'use client';
import { useState, useEffect, useCallback } from 'react';

interface Company {
  id: string;
  name: string;
  email: string;
  city: string;
  industry: string;
}

interface Assignment {
  id: string;
  company_id: string;
  status: string;
  assigned_at: string;
  assigned_by: string;
  companies: Company;
}

interface EnhancedAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignments: { companyId: string; status: string }[]) => void;
  title: string;
  type: 'project' | 'sub-project';
  projectId: string;
  subProjectId?: string;
  currentAssignments: Assignment[];
  allCompanies: Company[];
}

export default function EnhancedAssignmentModal({
  isOpen,
  onClose,
  onSave,
  title,
  type,
  projectId,
  subProjectId,
  currentAssignments,
  allCompanies,
}: EnhancedAssignmentModalProps) {
  const [assignments, setAssignments] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'locked' | 'revoked'
  >('all');
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize assignments from current assignments
  useEffect(() => {
    const initialAssignments: { [key: string]: string } = {};
    currentAssignments.forEach(assignment => {
      initialAssignments[assignment.company_id] = assignment.status;
    });
    setAssignments(initialAssignments);
  }, [currentAssignments]);

  // Filter companies based on search and status
  const filteredCompanies = allCompanies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.city.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = assignments[company.id] || 'revoked';
    const matchesStatus =
      statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle company selection
  const handleCompanySelection = useCallback(
    (companyId: string, status: string) => {
      setAssignments(prev => ({
        ...prev,
        [companyId]: status,
      }));
    },
    []
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (status: string) => {
      const newAssignments: { [key: string]: string } = {};
      filteredCompanies.forEach(company => {
        newAssignments[company.id] = status;
      });
      setAssignments(prev => ({ ...prev, ...newAssignments }));
      setSelectAll(status !== 'revoked');
    },
    [filteredCompanies]
  );

  // Handle bulk status change
  const handleBulkStatusChange = useCallback(
    (newStatus: string) => {
      const selectedCompanies = filteredCompanies.filter(
        company =>
          assignments[company.id] && assignments[company.id] !== 'revoked'
      );

      const newAssignments: { [key: string]: string } = { ...assignments };
      selectedCompanies.forEach(company => {
        newAssignments[company.id] = newStatus;
      });
      setAssignments(newAssignments);
    },
    [filteredCompanies, assignments]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const assignmentArray = Object.entries(assignments).map(
        ([companyId, status]) => ({
          companyId,
          status,
        })
      );

      await onSave(assignmentArray);
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [assignments, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-2xl font-bold text-gray-800'>{title}</h2>
            <p className='text-sm text-gray-600 mt-1'>
              {type === 'project' ? 'Ana Proje' : 'Alt Proje'} atamalarını
              yönetin
            </p>
          </div>
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

        {/* Controls */}
        <div className='p-6 border-b bg-gray-50'>
          <div className='flex flex-wrap gap-4 items-center'>
            {/* Search */}
            <div className='flex-1 min-w-64'>
              <input
                type='text'
                placeholder='Firma ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Tüm Durumlar</option>
              <option value='active'>Aktif</option>
              <option value='locked'>Kilitli</option>
              <option value='revoked'>Kaldırılmış</option>
            </select>

            {/* Bulk Actions */}
            <div className='flex gap-2'>
              <button
                onClick={() => handleSelectAll('active')}
                className='px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm'
              >
                Tümünü Aktif Yap
              </button>
              <button
                onClick={() => handleSelectAll('locked')}
                className='px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm'
              >
                Tümünü Kilitle
              </button>
              <button
                onClick={() => handleSelectAll('revoked')}
                className='px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm'
              >
                Tümünü Kaldır
              </button>
            </div>
          </div>

          {/* Selected Companies Bulk Action */}
          <div className='mt-4 flex items-center gap-4'>
            <span className='text-sm text-gray-600'>
              Seçili firmaların durumunu değiştir:
            </span>
            <select
              onChange={e => handleBulkStatusChange(e.target.value)}
              className='px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
            >
              <option value=''>Durum seçin</option>
              <option value='active'>Aktif</option>
              <option value='locked'>Kilitli</option>
              <option value='revoked'>Kaldır</option>
            </select>
          </div>
        </div>

        {/* Companies List */}
        <div className='flex-1 overflow-y-auto p-6'>
          <div className='space-y-3'>
            {filteredCompanies.map(company => (
              <CompanyAssignmentRow
                key={company.id}
                company={company}
                currentStatus={assignments[company.id] || 'revoked'}
                onStatusChange={newStatus =>
                  handleCompanySelection(company.id, newStatus)
                }
              />
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <svg
                className='w-12 h-12 mx-auto mb-4 text-gray-300'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
              <p>Filtre kriterlerinize uygun firma bulunamadı</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t bg-gray-50'>
          <div className='text-sm text-gray-600'>
            {filteredCompanies.length} firma gösteriliyor
          </div>
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Company Assignment Row Component
interface CompanyAssignmentRowProps {
  company: Company;
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

function CompanyAssignmentRow({
  company,
  currentStatus,
  onStatusChange,
}: CompanyAssignmentRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'locked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'locked':
        return 'Kilitli';
      case 'revoked':
        return 'Kaldırılmış';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
      <div className='flex-1'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
            <span className='text-blue-600 font-semibold text-sm'>
              {company.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className='font-semibold text-gray-800'>{company.name}</h3>
            <p className='text-sm text-gray-600'>{company.email}</p>
            <p className='text-xs text-gray-500'>
              {company.city} • {company.industry}
            </p>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentStatus)}`}
        >
          {getStatusText(currentStatus)}
        </span>

        <select
          value={currentStatus}
          onChange={e => onStatusChange(e.target.value)}
          className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
        >
          <option value='revoked'>Kaldır</option>
          <option value='active'>Aktif</option>
          <option value='locked'>Kilitli</option>
        </select>
      </div>
    </div>
  );
}
