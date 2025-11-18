/**
 * Company Dashboard Page
 * Sprint 7.5: Company User Management
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
import {
  Building2,
  Users,
  BookOpen,
  CheckCircle,
  TrendingUp,
  FolderKanban,
  GraduationCap,
} from 'lucide-react';
import { useCompanyDashboardStats } from '@/1-presentation/hooks/useDashboard';
import {
  ProjectProgressChart,
  EcommerceMetricsChart,
  AIInsightsWidget,
} from '@/1-presentation/components/features/analytics';
import { ExportButton } from '@/1-presentation/components/features/export';
import { analyticsService } from '@/5-shared/services/analytics';

interface CompanyDashboardData {
  company: {
    id: string;
    name: string;
    legalName: string;
    programName: string;
  };
  stats: {
    totalProjects: number;
    completedProjects: number;
    activeProjects: number;
    totalTrainings: number;
    completedTrainings: number;
    totalUsers: number;
    completionRate: number;
  };
}

export default function CompanyDashboardPage() {
  const [data, setData] = React.useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const companyId = data?.company?.id;
  const { data: statsData, isLoading: isLoadingStats } = useCompanyDashboardStats(companyId);

  // Track dashboard view
  React.useEffect(() => {
    if (!loading) {
      analyticsService.trackDashboardView('company');
    }
  }, [loading]);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/company-dashboard');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <div className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  // Mock data for now (API will be implemented later)
  const mockData: CompanyDashboardData = data || {
    company: {
      id: '1',
      name: 'Demo Firma',
      legalName: 'Demo Firma A.Ş.',
      programName: 'E-İhracat Dönüşüm Programı',
    },
    stats: {
      totalProjects: 8,
      completedProjects: 3,
      activeProjects: 5,
      totalTrainings: 12,
      completedTrainings: 7,
      totalUsers: 5,
      completionRate: 58,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Firma Paneli
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
                {mockData.company.name} - {mockData.company.programName}
              </p>
            </div>
            <ExportButton
              exportUrl="/api/company-dashboard/export"
              filename="company-dashboard"
              variant="outline"
              size="sm"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatCard
            title="Toplam Projeler"
            value={mockData.stats.totalProjects}
            icon={FolderKanban}
            color="blue"
            trend={{ value: mockData.stats.activeProjects, direction: 'up' }}
            progress={Math.round(
              (mockData.stats.completedProjects / mockData.stats.totalProjects) * 100
            )}
          />
          <ModernStatCard
            title="Tamamlanan Projeler"
            value={mockData.stats.completedProjects}
            icon={CheckCircle}
            color="green"
            trend={{ value: 15, direction: 'up' }}
            progress={Math.round(
              (mockData.stats.completedProjects / mockData.stats.totalProjects) * 100
            )}
          />
          <ModernStatCard
            title="Eğitimler"
            value={`${mockData.stats.completedTrainings}/${mockData.stats.totalTrainings}`}
            icon={GraduationCap}
            color="purple"
            trend={{ value: 8, direction: 'up' }}
            progress={Math.round(
              (mockData.stats.completedTrainings / mockData.stats.totalTrainings) * 100
            )}
          />
          <ModernStatCard
            title="Kullanıcılar"
            value={mockData.stats.totalUsers}
            icon={Users}
            color="orange"
            trend={{ value: 2, direction: 'up' }}
            progress={100}
          />
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockData.stats.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Proje Tamamlanma</div>
                </div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${mockData.stats.completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(
                      (mockData.stats.completedTrainings / mockData.stats.totalTrainings) * 100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Eğitim Tamamlanma</div>
                </div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.round((mockData.stats.completedTrainings / mockData.stats.totalTrainings) * 100)}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Projelerim
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Proje listesi ve detayları
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mockData.stats.activeProjects} aktif proje
              </p>
            </CardContent>
          </Card>

          <Link href="/company-dashboard/trainings">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Eğitimlerim
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Eğitim materyalleri</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mockData.stats.totalTrainings - mockData.stats.completedTrainings} eğitim devam
                  ediyor
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ekibim</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Firma kullanıcıları</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mockData.stats.totalUsers} kullanıcı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights and Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AIInsightsWidget dashboardType="company" companyId={companyId} />
          </div>
          <div className="lg:col-span-2">
            {statsData?.data && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {statsData.data.projectProgress && statsData.data.projectProgress.length > 0 && (
                  <ProjectProgressChart data={statsData.data.projectProgress} />
                )}
                {statsData.data.ecommerceMetrics && statsData.data.ecommerceMetrics.length > 0 && (
                  <EcommerceMetricsChart data={statsData.data.ecommerceMetrics} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Building2 className="w-5 h-5 text-primary" />
              Firma Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Firma Adı</p>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">
                  {mockData.company.name}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Yasal Ünvan</p>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">
                  {mockData.company.legalName}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Program</p>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">
                  {mockData.company.programName}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Durum</p>
                <p className="font-semibold text-lg text-green-600 dark:text-green-400">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
