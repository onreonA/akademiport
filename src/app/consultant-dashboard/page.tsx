/**
 * Consultant Dashboard Page
 * Sprint 7: Consultant Management
 *
 * Ana dashboard sayfası - Consultant rolü için
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { StatCard } from '@/presentation/components/ui/atoms/stat-card';
import { MetricCard } from '@/presentation/components/ui/atoms/metric-card';
import { ConsultantProgramProvider } from '@/shared/contexts/ConsultantProgramContext';
import {
  ProgramSelector,
  ConsultantStats,
  ConsultantCompanyList,
} from '@/presentation/components/features/consultant';
import type { ConsultantDashboardData } from '@/application/dto/consultant';
import {
  Loader2,
  TrendingUp,
  Users,
  Building2,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
} from 'lucide-react';

// =====================================================
// MAIN COMPONENT (WITH PROVIDER)
// =====================================================

export default function ConsultantDashboardPage() {
  return (
    <ConsultantProgramProvider>
      <ConsultantDashboardContent />
    </ConsultantProgramProvider>
  );
}

// =====================================================
// CONTENT COMPONENT
// =====================================================

function ConsultantDashboardContent() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/consultant/dashboard');
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Dashboard verileri yüklenemedi');
      }
    } catch (err) {
      setError('Dashboard yüklenirken bir hata oluştu');
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyClick = (companyId: string) => {
    router.push(`/consultant-dashboard/companies/${companyId}`);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
            <CardDescription>Dashboard yüklenirken bir hata oluştu</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Tekrar Dene</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Danışman Paneli
          </h1>
          <p className="text-muted-foreground text-lg">
            Atandığınız programları ve firmaları yönetin
          </p>
        </div>

        {/* Program Selector - Enhanced */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Program Seçin
            </CardTitle>
            <CardDescription>
              Firma ve görevleri görüntülemek için bir program seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgramSelector />
          </CardContent>
        </Card>

        {/* Stats */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <div className="text-lg text-muted-foreground">Veriler yükleniyor...</div>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Toplam Program"
                value={dashboardData.stats.totalPrograms}
                subtitle={`${dashboardData.stats.activePrograms} aktif`}
                icon={BarChart3}
                trend={{
                  value: 12.5,
                  direction: 'up',
                  period: 'bu ay',
                }}
                color="blue"
              />
              <StatCard
                title="Atandığım Firmalar"
                value={dashboardData.stats.totalCompanies}
                subtitle="Tüm programlarda"
                icon={Building2}
                trend={{
                  value: 8.3,
                  direction: 'up',
                  period: 'bu hafta',
                }}
                color="green"
              />
              <StatCard
                title="Tamamlanan Görevler"
                value={dashboardData.stats.completedTasks || 0}
                subtitle={`${dashboardData.stats.totalTasks || 0} görevden`}
                icon={CheckCircle}
                trend={{
                  value: 5.7,
                  direction: 'up',
                  period: 'bu hafta',
                }}
                color="purple"
              />
              <StatCard
                title="Bekleyen Görevler"
                value={dashboardData.stats.pendingTasks || 0}
                subtitle="Sprint 8'de aktif"
                icon={Clock}
                trend={{
                  value: -2.1,
                  direction: 'down',
                  period: 'bu hafta',
                }}
                color="orange"
              />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricCard
                label="Program İlerlemesi"
                value="85%"
                icon={TrendingUp}
                progress={85}
                color="blue"
                size="lg"
              />
              <MetricCard
                label="Firma Memnuniyeti"
                value="4.7/5"
                icon={Users}
                progress={94}
                color="green"
                size="lg"
              />
              <MetricCard
                label="Aktif Görevler"
                value="18"
                icon={Activity}
                progress={75}
                color="purple"
                size="lg"
              />
            </div>

            {/* Quick Actions */}
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Hızlı İşlemler
                </CardTitle>
                <CardDescription>Sık kullanılan işlemler için kısayollar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:bg-primary/5 hover:border-primary transition-all"
                    onClick={() => alert('Görev atama özelliği Sprint 8\'de eklenecek')}
                  >
                    <CheckCircle className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Görev Ata</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Firmaya yeni görev oluştur
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:bg-primary/5 hover:border-primary transition-all"
                    onClick={() => alert('Randevu oluşturma özelliği Sprint 11\'de eklenecek')}
                  >
                    <Clock className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Randevu Oluştur</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Firma ile görüşme planla
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:bg-primary/5 hover:border-primary transition-all"
                    onClick={() => alert('Eğitim atama özelliği Sprint 9\'da eklenecek')}
                  >
                    <Users className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Eğitim Ata</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Firmaya eğitim içeriği paylaş
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Companies List */}
            <ConsultantCompanyList onCompanyClick={handleCompanyClick} />

            {/* Recent Programs */}
            {dashboardData.recentPrograms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Son Programlar
                  </CardTitle>
                  <CardDescription>
                    Son güncellenen {dashboardData.recentPrograms.length} program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData.recentPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{program.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {program.city} • {program.status}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/programs/${program.id}`)}
                        >
                          Detay
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Program Seçin</h3>
                  <p className="text-muted-foreground">
                    Verilerinizi görüntülemek için yukarıdan bir program seçin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
