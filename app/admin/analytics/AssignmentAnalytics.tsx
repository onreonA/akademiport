'use client';
import {
  ChartBarIcon,
  UsersIcon,
  FolderIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface AssignmentMetrics {
  totalAssignments: number;
  activeAssignments: number;
  lockedAssignments: number;
  revokedAssignments: number;
  averageProjectDuration: string;
  mostActiveCompanies: string[];
  projectCompletionRate: string;
  totalProjects: number;
  totalSubProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

interface CompanyStats {
  id: string;
  name: string;
  activeProjects: number;
  lockedProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
}

export default function AssignmentAnalytics() {
  const [metrics, setMetrics] = useState<AssignmentMetrics | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch assignment summary report
      const reportResponse = await fetch('/api/admin/bulk-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          operation: 'generate_assignment_report',
          data: {
            type: 'assignment_summary',
            filters: { timeRange },
          },
        }),
      });

      if (reportResponse.ok) {
        const reportData = await reportResponse.json();

        // Fetch company projects report
        const companyResponse = await fetch('/api/admin/bulk-operations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            operation: 'generate_assignment_report',
            data: {
              type: 'company_projects',
              filters: { timeRange },
            },
          }),
        });

        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          processAnalyticsData(reportData, companyData);
        }
      }
    } catch (error) {
      setError('Analytics verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (reportData: any, companyData: any) => {
    // Process assignment summary
    const assignmentSummary = reportData.results.find(
      (r: any) => r.action === 'report_generated'
    )?.data;
    const companyProjects = companyData.results.find(
      (r: any) => r.action === 'report_generated'
    )?.data;

    if (assignmentSummary) {
      const metrics: AssignmentMetrics = {
        totalAssignments: assignmentSummary.total,
        activeAssignments: assignmentSummary.summary.active || 0,
        lockedAssignments: assignmentSummary.summary.locked || 0,
        revokedAssignments: assignmentSummary.summary.revoked || 0,
        averageProjectDuration: '45 gün', // Mock data
        mostActiveCompanies: ['Mundo', 'ABS Door', 'Milenyum'], // Mock data
        projectCompletionRate: '85%', // Mock data
        totalProjects: companyProjects?.total || 0,
        totalSubProjects: 0, // Calculate from data
        totalTasks: 0, // Calculate from data
        completedTasks: 0, // Calculate from data
        pendingTasks: 0, // Calculate from data
      };

      setMetrics(metrics);
    }

    // Process company stats
    if (companyProjects?.assignments) {
      const stats = calculateCompanyStats(companyProjects.assignments);
      setCompanyStats(stats);
    }
  };

  const calculateCompanyStats = (assignments: any[]): CompanyStats[] => {
    const companyMap = new Map<string, CompanyStats>();

    assignments.forEach(assignment => {
      const companyId = assignment.company_id;
      const companyName = assignment.companies?.name || 'Unknown';

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          id: companyId,
          name: companyName,
          activeProjects: 0,
          lockedProjects: 0,
          completedProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
        });
      }

      const stats = companyMap.get(companyId)!;

      if (assignment.status === 'active') {
        stats.activeProjects++;
      } else if (assignment.status === 'locked') {
        stats.lockedProjects++;
      } else if (assignment.status === 'completed') {
        stats.completedProjects++;
      }
    });

    return Array.from(companyMap.values()).sort(
      (a, b) =>
        b.activeProjects +
        b.lockedProjects +
        b.completedProjects -
        (a.activeProjects + a.lockedProjects + a.completedProjects)
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-red-600'>{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <p className='text-gray-600'>Analytics verileri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>
            Atama Analitikleri
          </h2>
          <p className='text-gray-600'>
            Proje atama performansını ve istatistiklerini görüntüleyin
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='7d'>Son 7 Gün</option>
            <option value='30d'>Son 30 Gün</option>
            <option value='90d'>Son 90 Gün</option>
            <option value='1y'>Son 1 Yıl</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <MetricCard
          title='Toplam Atama'
          value={metrics.totalAssignments}
          icon={ChartBarIcon}
          color='blue'
          change='+12%'
        />

        <MetricCard
          title='Aktif Projeler'
          value={metrics.activeAssignments}
          icon={CheckCircleIcon}
          color='green'
          change='+8%'
        />

        <MetricCard
          title='Kilitli Projeler'
          value={metrics.lockedAssignments}
          icon={ExclamationTriangleIcon}
          color='yellow'
          change='+3%'
        />

        <MetricCard
          title='Tamamlanma Oranı'
          value={metrics.projectCompletionRate}
          icon={ClockIcon}
          color='purple'
          change='+5%'
        />
      </div>

      {/* Project Statistics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Proje Dağılımı
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Toplam Projeler</span>
              <span className='font-semibold'>{metrics.totalProjects}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Aktif Projeler</span>
              <span className='font-semibold text-green-600'>
                {metrics.activeAssignments}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Kilitli Projeler</span>
              <span className='font-semibold text-yellow-600'>
                {metrics.lockedAssignments}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Kaldırılan Projeler</span>
              <span className='font-semibold text-red-600'>
                {metrics.revokedAssignments}
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            En Aktif Firmalar
          </h3>
          <div className='space-y-3'>
            {metrics.mostActiveCompanies.map((company, index) => (
              <div key={company} className='flex items-center justify-between'>
                <span className='text-gray-600'>
                  #{index + 1} {company}
                </span>
                <span className='font-semibold text-blue-600'>
                  {Math.floor(Math.random() * 20) + 5} proje
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Statistics */}
      <div className='bg-white rounded-lg shadow'>
        <div className='p-6 border-b'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Firma İstatistikleri
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Firma
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Aktif
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Kilitli
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Tamamlanan
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Toplam
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {companyStats.map(company => (
                <tr key={company.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {company.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600'>
                    {company.activeProjects}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-yellow-600'>
                    {company.lockedProjects}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-blue-600'>
                    {company.completedProjects}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {company.activeProjects +
                      company.lockedProjects +
                      company.completedProjects}
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

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  change?: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  change,
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <div className='flex items-center'>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className='w-6 h-6' />
        </div>
        <div className='ml-4'>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-semibold text-gray-900'>{value}</p>
          {change && (
            <p className='text-sm text-green-600'>
              {change} önceki döneme göre
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
