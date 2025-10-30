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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Firma Paneli
          </h1>
          <p className="text-muted-foreground text-lg">
            {mockData.company.name} - {mockData.company.programName}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Projeler"
            value={mockData.stats.totalProjects.toString()}
            description="Tüm projeler"
            icon={FolderKanban}
            color="blue"
            trend={{
              value: mockData.stats.activeProjects,
              direction: 'up',
              period: 'aktif',
            }}
          />
          <StatCard
            title="Tamamlanan Projeler"
            value={mockData.stats.completedProjects.toString()}
            description="Başarıyla tamamlandı"
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Eğitimler"
            value={`${mockData.stats.completedTrainings}/${mockData.stats.totalTrainings}`}
            description="Tamamlanan eğitimler"
            icon={GraduationCap}
            color="purple"
          />
          <StatCard
            title="Kullanıcılar"
            value={mockData.stats.totalUsers.toString()}
            description="Aktif kullanıcı"
            icon={Users}
            color="orange"
          />
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Proje Tamamlanma"
            value={mockData.stats.completionRate}
            description="Genel ilerleme oranı"
            icon={TrendingUp}
            color="blue"
            showProgress
          />
          <MetricCard
            title="Eğitim Tamamlanma"
            value={Math.round(
              (mockData.stats.completedTrainings / mockData.stats.totalTrainings) * 100
            )}
            description="Eğitim ilerleme oranı"
            icon={BookOpen}
            color="green"
            showProgress
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover-lift border-border/50 cursor-pointer transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FolderKanban className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Projelerim</CardTitle>
                  <CardDescription>Proje listesi ve detayları</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {mockData.stats.activeProjects} aktif proje
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-border/50 cursor-pointer transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <GraduationCap className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Eğitimlerim</CardTitle>
                  <CardDescription>Eğitim materyalleri</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {mockData.stats.totalTrainings - mockData.stats.completedTrainings} eğitim devam
                ediyor
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-border/50 cursor-pointer transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ekibim</CardTitle>
                  <CardDescription>Firma kullanıcıları</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{mockData.stats.totalUsers} kullanıcı</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Firma Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Firma Adı</p>
                <p className="font-medium">{mockData.company.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Yasal Ünvan</p>
                <p className="font-medium">{mockData.company.legalName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Program</p>
                <p className="font-medium">{mockData.company.programName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Durum</p>
                <p className="font-medium text-green-600">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
