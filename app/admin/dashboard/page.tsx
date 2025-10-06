'use client';
import { useCallback, useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import DashboardCharts from '@/components/charts/DashboardCharts';
import DashboardStatsCards from '@/components/charts/DashboardStatsCards';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RecentActivity from '@/components/ui/RecentActivity';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import {
  RecentActivity as ActivityType,
  analyticsService,
  ChartData,
  DashboardStats,
} from '@/lib/analytics-service';
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
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
          <ToastContainer toasts={toasts} onRemove={removeToast} />
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
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
              <p className='text-gray-600 mt-1'>
                Randevu yönetimi sistemi genel bakış
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
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
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              {/* Additional stats or charts can go here */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Hızlı İstatistikler
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
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
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </ErrorBoundary>
    </AdminLayout>
  );
}
