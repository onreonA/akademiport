'use client';

import { useEffect, useState } from 'react';

interface ComplianceStats {
  totalProjects: number;
  compliantProjects: number;
  nonCompliantProjects: number;
  complianceRate: number;
  averageDelay: number;
  criticalProjects: number;
}

interface ProjectCompliance {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  delayDays: number;
  complianceStatus: 'compliant' | 'delayed' | 'critical' | 'no-date';
  companyCount: number;
  progress: number;
}

interface CompanyCompliance {
  id: string;
  name: string;
  totalProjects: number;
  compliantProjects: number;
  delayedProjects: number;
  criticalProjects: number;
  averageDelay: number;
  complianceRate: number;
}

export default function DateComplianceReport() {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [projects, setProjects] = useState<ProjectCompliance[]>([]);
  const [companies, setCompanies] = useState<CompanyCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchComplianceData();
  }, [dateRange]);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);

      // Uyumluluk istatistiklerini al
      const statsResponse = await fetch(
        `/api/admin/date-compliance-stats?start=${dateRange.start}&end=${dateRange.end}`
      );
      if (!statsResponse.ok) throw new Error('Stats fetch failed');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Proje uyumluluk bilgilerini al
      const projectsResponse = await fetch(
        `/api/admin/project-compliance?start=${dateRange.start}&end=${dateRange.end}`
      );
      if (!projectsResponse.ok) throw new Error('Projects fetch failed');
      const projectsData = await projectsResponse.json();
      setProjects(projectsData);

      // Firma uyumluluk bilgilerini al
      const companiesResponse = await fetch(
        `/api/admin/company-compliance?start=${dateRange.start}&end=${dateRange.end}`
      );
      if (!companiesResponse.ok) throw new Error('Companies fetch failed');
      const companiesData = await companiesResponse.json();
      setCompanies(companiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100';
      case 'delayed':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'no-date':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceText = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Uyumlu';
      case 'delayed':
        return 'Gecikmiş';
      case 'critical':
        return 'Kritik';
      case 'no-date':
        return 'Tarih Yok';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDelay = (days: number) => {
    if (days === 0) return 'Gününde';
    if (days > 0) return `${days} gün gecikmiş`;
    return `${Math.abs(days)} gün erken`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
        Hata: {error}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Tarih Aralığı Seçici */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Rapor Tarih Aralığı
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Başlangıç Tarihi
            </label>
            <input
              type='date'
              value={dateRange.start}
              onChange={e =>
                setDateRange(prev => ({ ...prev, start: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Bitiş Tarihi
            </label>
            <input
              type='date'
              value={dateRange.end}
              onChange={e =>
                setDateRange(prev => ({ ...prev, end: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>

      {/* Uyumluluk İstatistikleri */}
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
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Toplam Proje</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats?.totalProjects || 0}
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
                Uyumlu Projeler
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats?.compliantProjects || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 rounded-lg'>
              <svg
                className='w-6 h-6 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Uyumluluk Oranı
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats?.complianceRate || 0}%
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
                Kritik Projeler
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {stats?.criticalProjects || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proje Uyumluluk Durumu */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>
            Proje Uyumluluk Durumu
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Proje
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Planlanan Başlangıç
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Planlanan Bitiş
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Gecikme
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Durum
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  İlerleme
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {projects.map(project => (
                <tr key={project.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {project.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDelay(project.delayDays)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(project.complianceStatus)}`}
                    >
                      {getComplianceText(project.complianceStatus)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Firma Uyumluluk Durumu */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900'>
            Firma Uyumluluk Durumu
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
                  Toplam Proje
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Uyumlu
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Gecikmiş
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Kritik
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Uyumluluk Oranı
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {companies.map(company => (
                <tr key={company.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {company.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {company.totalProjects}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {company.compliantProjects}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {company.delayedProjects}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {company.criticalProjects}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
                        <div
                          className={`h-2 rounded-full ${
                            company.complianceRate >= 80
                              ? 'bg-green-600'
                              : company.complianceRate >= 60
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                          }`}
                          style={{ width: `${company.complianceRate}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {company.complianceRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
