'use client';

import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';

interface CompanyUserStatus {
  company_id: string;
  company_name: string;
  company_email: string;
  company_status: string;
  has_user: boolean;
  user_email: string | null;
  user_role: string | null;
  user_status: string | null;
  error: string | null;
}

interface Statistics {
  total_companies: number;
  active_companies: number;
  companies_with_users: number;
  companies_without_users: number;
  coverage_percentage: number;
}

interface CreateResult {
  company_id: string;
  company_name: string;
  company_email: string;
  status: string;
  message: string;
  user_id?: string;
}

export default function FirmaKullaniciYonetimiPage() {
  const [companyUsers, setCompanyUsers] = useState<CompanyUserStatus[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultPassword, setDefaultPassword] = useState('123456');
  const [userRole, setUserRole] = useState('admin');
  const [createResults, setCreateResults] = useState<CreateResult[]>([]);

  useEffect(() => {
    checkCompanyUsers();
  }, []);

  const checkCompanyUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/check-missing-company-users', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Firma kullanıcıları kontrol edilemedi');
      }

      const data = await response.json();
      setCompanyUsers(data.companies);
      setStatistics(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const createMissingUsers = async (dryRun = false) => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/admin/create-missing-company-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          defaultPassword,
          userRole,
          dryRun,
        }),
      });

      if (!response.ok) {
        throw new Error('Kullanıcı oluşturma işlemi başarısız');
      }

      const data = await response.json();
      setCreateResults(data.results);

      if (!dryRun) {
        // Yeniden kontrol et
        await checkCompanyUsers();
      }

      // Sonucu göster
      alert(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
      case 'already_exists':
        return 'text-green-600 bg-green-100';
      case 'would_create':
        return 'text-blue-600 bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created':
        return 'Oluşturuldu';
      case 'already_exists':
        return 'Zaten Mevcut';
      case 'would_create':
        return 'Oluşturulacak';
      case 'error':
        return 'Hata';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <AdminLayout title='Firma Kullanıcı Yönetimi'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title='Firma Kullanıcı Yönetimi'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Firma Kullanıcı Yönetimi
            </h1>
            <p className='text-gray-600 mt-1'>
              Firmalar için otomatik kullanıcı hesabı oluşturma ve yönetimi
            </p>
          </div>
          <button
            onClick={checkCompanyUsers}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
          >
            Yenile
          </button>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        {/* İstatistikler */}
        {statistics && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <svg
                    className='w-6 h-6 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Toplam Firma
                  </p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {statistics.total_companies}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <svg
                    className='w-6 h-6 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Kullanıcı Hesabı Olan
                  </p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {statistics.companies_with_users}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-red-100 rounded-lg'>
                  <svg
                    className='w-6 h-6 text-red-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Kullanıcı Hesabı Olmayan
                  </p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {statistics.companies_without_users}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <svg
                    className='w-6 h-6 text-purple-600'
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
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Kapsama Oranı
                  </p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {statistics.coverage_percentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kullanıcı Oluşturma Formu */}
        {statistics && statistics.companies_without_users > 0 && (
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Eksik Kullanıcı Hesapları Oluştur
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Varsayılan Şifre
                </label>
                <input
                  type='text'
                  value={defaultPassword}
                  onChange={e => setDefaultPassword(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='123456'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kullanıcı Rolü
                </label>
                <select
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='admin'>Admin</option>
                  <option value='manager'>Manager</option>
                  <option value='operator'>Operator</option>
                </select>
              </div>
              <div className='flex items-end space-x-2'>
                <button
                  onClick={() => createMissingUsers(true)}
                  disabled={creating}
                  className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50'
                >
                  {creating ? 'Kontrol Ediliyor...' : 'Önizleme'}
                </button>
                <button
                  onClick={() => createMissingUsers(false)}
                  disabled={creating}
                  className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50'
                >
                  {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Oluşturma Sonuçları */}
        {createResults.length > 0 && (
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-medium text-gray-900'>
                İşlem Sonuçları
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Firma
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Durum
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Mesaj
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {createResults.map(result => (
                    <tr key={result.company_id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {result.company_name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {result.company_email}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}
                        >
                          {getStatusText(result.status)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {result.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Firma Listesi */}
        <div className='bg-white rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Firma Kullanıcı Durumu
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Firma
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Firma Durumu
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Kullanıcı Hesabı
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Kullanıcı Rolü
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {companyUsers.map(company => (
                  <tr key={company.company_id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {company.company_name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {company.company_email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.company_status === 'active'
                            ? 'text-green-600 bg-green-100'
                            : 'text-gray-600 bg-gray-100'
                        }`}
                      >
                        {company.company_status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.has_user
                            ? 'text-green-600 bg-green-100'
                            : 'text-red-600 bg-red-100'
                        }`}
                      >
                        {company.has_user ? 'Var' : 'Yok'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {company.user_role || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
