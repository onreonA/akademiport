/**
 * Company Dashboard Page
 * Sprint 7.5: Company User Management
 */

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { StatCard } from '@/presentation/components/ui/atoms/stat-card';
import { MetricCard } from '@/presentation/components/ui/atoms/metric-card';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
import {
  Building2,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  FolderKanban,
  GraduationCap,
} from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
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
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Modern Gradient Header */}
        <GradientHeader
          title="Firma Paneli"
          subtitle={`${mockData.company.name} - ${mockData.company.programName}`}
          icon={Building2}
          progress={mockData.stats.completionRate}
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="text-center sm:text-right">
                <div className="text-sm text-white/80">Tamamlanma Oranı</div>
                <div className="text-lg font-bold text-white">{mockData.stats.completionRate}%</div>
              </div>
            </div>
          }
        />

        {/* Modern Stats Cards */}
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
            showGlow
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
            showGlow
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
            showGlow
          />
          <ModernStatCard
            title="Kullanıcılar"
            value={mockData.stats.totalUsers}
            icon={Users}
            color="orange"
            trend={{ value: 2, direction: 'up' }}
            progress={100}
            showGlow
          />
        </div>

        {/* Enhanced Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedCard variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockData.stats.completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">Proje Tamamlanma</div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${mockData.stats.completionRate}%` }}
              />
            </div>
          </EnhancedCard>

          <EnhancedCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(
                    (mockData.stats.completedTrainings / mockData.stats.totalTrainings) * 100
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Eğitim Tamamlanma</div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.round((mockData.stats.completedTrainings / mockData.stats.totalTrainings) * 100)}%`,
                }}
              />
            </div>
          </EnhancedCard>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EnhancedCard variant="glass" hover className="cursor-pointer">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Projelerim</h3>
                  <p className="text-sm text-muted-foreground">Proje listesi ve detayları</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {mockData.stats.activeProjects} aktif proje
              </p>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="gradient" hover className="cursor-pointer">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Eğitimlerim</h3>
                  <p className="text-sm text-muted-foreground">Eğitim materyalleri</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {mockData.stats.totalTrainings - mockData.stats.completedTrainings} eğitim devam
                ediyor
              </p>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="neon" hover glow className="cursor-pointer">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ekibim</h3>
                  <p className="text-sm text-muted-foreground">Firma kullanıcıları</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{mockData.stats.totalUsers} kullanıcı</p>
            </div>
          </EnhancedCard>
        </div>

        {/* Enhanced Info Card */}
        <EnhancedCard variant="glass" className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Firma Bilgileri
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">Firma Adı</p>
              <p className="font-semibold text-lg">{mockData.company.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">Yasal Ünvan</p>
              <p className="font-semibold text-lg">{mockData.company.legalName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">Program</p>
              <p className="font-semibold text-lg">{mockData.company.programName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">Durum</p>
              <p className="font-semibold text-lg text-green-600">Aktif</p>
            </div>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
