'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
interface AssignmentHistory {
  id: string;
  company_name: string;
  company_email: string;
  set_name: string;
  set_category: string;
  status: string;
  progress_percentage: number;
  assigned_by: string;
  assigned_at: string;
  completed_at: string | null;
  notes: string;
}
interface Pagination {
  limit: number;
  offset: number;
  total: number;
}
export default function AssignmentHistoryPage() {
  const [assignments, setAssignments] = useState<AssignmentHistory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    limit: 50,
    offset: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Filters
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    []
  );
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    fetchCompanies();
    fetchSets();
    fetchAssignments();
  }, [fetchAssignments]);
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompanies(result.companies || []);
        }
      }
    } catch (err) {}
  };
  const fetchSets = async () => {
    try {
      const response = await fetch('/api/education-sets', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSets(result.data || []);
        }
      }
    } catch (err) {}
  };
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCompany) params.append('company_id', selectedCompany);
      if (selectedSet) params.append('set_id', selectedSet);
      if (selectedStatus) params.append('status', selectedStatus);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());
      const response = await fetch(`/api/admin/assignment-history?${params}`, {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAssignments(result.data || []);
          setPagination(
            result.pagination || { limit: 50, offset: 0, total: 0 }
          );
        } else {
          setError(result.error || 'Atama geçmişi getirilemedi');
        }
      } else {
        setError('Atama geçmişi getirilirken hata oluştu');
      }
    } catch (err) {
      setError('Atama geçmişi getirilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [
    selectedCompany,
    selectedSet,
    selectedStatus,
    startDate,
    endDate,
    pagination.offset,
    pagination.limit,
  ]);
  const handleFilterReset = () => {
    setSelectedCompany('');
    setSelectedSet('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setPagination({ ...pagination, offset: 0 });
  };
  const handlePageChange = (newOffset: number) => {
    setPagination({ ...pagination, offset: newOffset });
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link
                href='/admin/egitim-yonetimi/raporlar'
                className='flex items-center gap-2 text-gray-600 hover:text-blue-600'
              >
                <i className='ri-arrow-left-line'></i>
                <span>Geri Dön</span>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <Link
                  href='/admin/egitim-yonetimi/raporlar'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Raporlar
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>Atama Geçmişi</span>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Atama Geçmişi
              </h1>
              <p className='text-gray-600'>
                Tüm eğitim atamalarının detaylı geçmişi
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={fetchAssignments}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              >
                <i className='ri-refresh-line mr-2'></i>
                Yenile
              </button>
              <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                <i className='ri-download-line mr-2'></i>
                Excel İndir
              </button>
            </div>
          </div>
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <i className='ri-error-warning-line text-red-600'></i>
                <p className='text-red-800'>{error}</p>
              </div>
            </div>
          )}
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Filtreler
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Firma
                </label>
                <select
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Tüm Firmalar</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Eğitim Seti
                </label>
                <select
                  value={selectedSet}
                  onChange={e => setSelectedSet(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Tüm Setler</option>
                  {sets.map(set => (
                    <option key={set.id} value={set.id}>
                      {set.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Tüm Durumlar</option>
                  <option value='active'>Aktif</option>
                  <option value='completed'>Tamamlandı</option>
                  <option value='pending'>Beklemede</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Başlangıç Tarihi
                </label>
                <input
                  type='date'
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div className='flex items-end'>
                <button
                  onClick={handleFilterReset}
                  className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
          {/* Results Summary */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6'>
            <div className='flex justify-between items-center'>
              <div className='text-sm text-gray-600'>
                Toplam{' '}
                <span className='font-medium text-gray-900'>
                  {pagination.total}
                </span>{' '}
                atama bulundu
              </div>
              <div className='text-sm text-gray-600'>
                Sayfa {Math.floor(pagination.offset / pagination.limit) + 1} /{' '}
                {totalPages}
              </div>
            </div>
          </div>
          {/* Assignments Table */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            {loading ? (
              <div className='p-8 text-center'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Atama geçmişi yükleniyor...</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        Firma
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        Eğitim Seti
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        Kategori
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        Durum
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        İlerleme
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        Atayan
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        Atama Tarihi
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        Tamamlanma
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(assignment => (
                      <tr
                        key={assignment.id}
                        className='border-b border-gray-100 hover:bg-gray-50'
                      >
                        <td className='py-3 px-4'>
                          <div>
                            <div className='font-medium text-gray-900'>
                              {assignment.company_name}
                            </div>
                            <div className='text-sm text-gray-600'>
                              {assignment.company_email}
                            </div>
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='font-medium text-gray-900'>
                            {assignment.set_name}
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {assignment.set_category}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}
                          >
                            {assignment.status === 'completed'
                              ? 'Tamamlandı'
                              : assignment.status === 'active'
                                ? 'Aktif'
                                : 'Beklemede'}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-2'>
                            <div className='w-16 bg-gray-200 rounded-full h-2'>
                              <div
                                className={`h-2 rounded-full ${getProgressColor(assignment.progress_percentage)}`}
                                style={{
                                  width: `${assignment.progress_percentage}%`,
                                }}
                              ></div>
                            </div>
                            <span className='text-sm font-medium text-gray-900'>
                              {assignment.progress_percentage}%
                            </span>
                          </div>
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-600'>
                          {assignment.assigned_by}
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-600'>
                          {new Date(assignment.assigned_at).toLocaleDateString(
                            'tr-TR'
                          )}
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-600'>
                          {assignment.completed_at
                            ? new Date(
                                assignment.completed_at
                              ).toLocaleDateString('tr-TR')
                            : '-'}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-2'>
                            <Link
                              href={`/admin/egitim-yonetimi/raporlar/firma-detay/${assignment.company_name}`}
                              className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                            >
                              Detay
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-2 mt-6'>
              <button
                onClick={() =>
                  handlePageChange(
                    Math.max(0, pagination.offset - pagination.limit)
                  )
                }
                disabled={pagination.offset === 0}
                className='px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Önceki
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page =
                  Math.floor(pagination.offset / pagination.limit) + 1;
                const startPage = Math.max(1, page - 2);
                const pageNum = startPage + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      handlePageChange((pageNum - 1) * pagination.limit)
                    }
                    className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                      pageNum === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  handlePageChange(pagination.offset + pagination.limit)
                }
                disabled={
                  pagination.offset + pagination.limit >= pagination.total
                }
                className='px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
