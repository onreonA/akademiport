'use client';
import { useCallback, useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import DashboardCharts from '@/components/charts/DashboardCharts';
import DashboardStatsCards from '@/components/charts/DashboardStatsCards';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RecentActivity from '@/components/ui/RecentActivity';
import {
  RecentActivity as ActivityType,
  analyticsService,
  ChartData,
  DashboardStats,
} from '@/lib/analytics-service';
import { cn, tokens, spacing, typography } from '@/lib/design-tokens';
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch all data in parallel
      const [appointmentsRes, companiesRes, consultantsRes] = await Promise.all(
        [
          fetch('/api/appointments'),
          fetch('/api/companies', {
            headers: {
              'X-User-Email': 'admin@ihracatakademi.com',
            },
          }),
          fetch('/api/consultants'),
        ]
      );
      if (!appointmentsRes.ok || !companiesRes.ok || !consultantsRes.ok) {
        throw new Error('Veri yüklenirken hata oluştu');
      }
      const [appointments, companies, consultants] = await Promise.all([
        appointmentsRes.json(),
        companiesRes.json(),
        consultantsRes.json(),
      ]);
      // Calculate dashboard stats
      const dashboardStats = analyticsService.calculateDashboardStats(
        appointments.appointments || appointments,
        companies.companies || companies,
        consultants.consultants || consultants
      );
      // Generate chart data
      const charts = analyticsService.generateChartData(
        appointments.appointments || appointments,
        consultants.consultants || consultants
      );
      // Generate recent activities
      const recentActivities = analyticsService.generateRecentActivity(
        appointments.appointments || appointments,
        companies.companies || companies,
        consultants.consultants || consultants
      );
      setStats(dashboardStats);
      setChartData(charts);
      setActivities(recentActivities);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      showError('Veri Yükleme Hatası', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);
  const handleRefresh = () => {
    fetchDashboardData();
    showSuccess('Yenilendi', 'Dashboard verileri başarıyla yenilendi');
  };
  if (error) {
    return (
      <AdminLayout title='Hata' description='Dashboard yükleme hatası'>
        <ErrorBoundary>
          <div className='flex items-center justify-center min-h-screen'>
            <div className='text-center'>
              <i className='ri-error-warning-line text-6xl text-red-500 mb-4'></i>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Hata Oluştu
              </h2>
              <p className='text-gray-600 mb-4'>{error}</p>
              <button
                onClick={handleRefresh}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </ErrorBoundary>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout
      title='Dashboard'
      description='Randevu yönetimi sistemi genel bakış'
    >
      <ErrorBoundary>
        <div className={spacing(6, 'p')}>
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between',
              spacing(8, 'm', 'b')
            )}
          >
            <div>
              <h1 className={typography('heading1')}>Dashboard</h1>
              <p className={cn(typography('body'), 'mt-1')}>
                Randevu yönetimi sistemi genel bakış
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={cn(tokens.button.primary, 'flex items-center')}
            >
              <LoadingSpinner size='sm' color='white' className='mr-2' />
              Yenile
            </button>
          </div>
          {/* Stats Cards */}
          <DashboardStatsCards
            stats={
              stats || {
                totalAppointments: 0,
                pendingAppointments: 0,
                confirmedAppointments: 0,
                rejectedAppointments: 0,
                completedAppointments: 0,
                totalCompanies: 0,
                totalConsultants: 0,
                averageResponseTime: 0,
                completionRate: 0,
              }
            }
            isLoading={isLoading}
          />
          {/* Charts */}
          <DashboardCharts
            chartData={
              chartData || {
                monthlyTrends: { labels: [], data: [] },
                statusDistribution: { labels: [], data: [], colors: [] },
                consultantPerformance: { labels: [], data: [] },
                meetingTypeDistribution: { labels: [], data: [], colors: [] },
              }
            }
            isLoading={isLoading}
          />
          {/* Recent Activity */}
          <div className={tokens.layout.grid.cols3}>
            <div className='lg:col-span-2'>
              {/* Additional stats or charts can go here */}
              <div className={tokens.card.base}>
                <h3
                  className={cn(typography('heading3'), spacing(4, 'm', 'b'))}
                >
                  Hızlı İstatistikler
                </h3>
                <div
                  className={cn(
                    'grid grid-cols-2 md:grid-cols-4',
                    spacing(4, 'gap')
                  )}
                >
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {stats?.completionRate || 0}%
                    </div>
                    <div className='text-sm text-gray-600'>
                      Tamamlanma Oranı
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {stats?.confirmedAppointments || 0}
                    </div>
                    <div className='text-sm text-gray-600'>Onaylanan</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-yellow-600'>
                      {stats?.pendingAppointments || 0}
                    </div>
                    <div className='text-sm text-gray-600'>Bekleyen</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-red-600'>
                      {stats?.rejectedAppointments || 0}
                    </div>
                    <div className='text-sm text-gray-600'>Reddedilen</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <RecentActivity activities={activities} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
