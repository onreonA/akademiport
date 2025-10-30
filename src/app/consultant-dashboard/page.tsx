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
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
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
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Modern Gradient Header */}
        <GradientHeader
          title="Danışman Paneli"
          subtitle="Atandığınız programları ve firmaları yönetin"
          icon={BarChart3}
          progress={75}
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
              >
                <Activity className="h-4 w-4 mr-2" />
                Aktivite
              </Button>
            </div>
          }
        />

        {/* Enhanced Program Selector */}
        <EnhancedCard variant="glass" className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Program Seçin
            </h3>
            <p className="text-sm text-muted-foreground">
              Firma ve görevleri görüntülemek için bir program seçin
            </p>
          </div>
          <ProgramSelector />
        </EnhancedCard>

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
            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ModernStatCard
                title="Toplam Program"
                value={dashboardData.stats.totalPrograms}
                icon={BarChart3}
                color="blue"
                trend={{ value: 12.5, direction: 'up' }}
                progress={85}
                showGlow
              />
              <ModernStatCard
                title="Atandığım Firmalar"
                value={dashboardData.stats.totalCompanies}
                icon={Building2}
                color="green"
                trend={{ value: 8.3, direction: 'up' }}
                progress={92}
                showGlow
              />
              <ModernStatCard
                title="Tamamlanan Görevler"
                value={dashboardData.stats.completedTasks || 0}
                icon={CheckCircle}
                color="purple"
                trend={{ value: 5.7, direction: 'up' }}
                progress={75}
                showGlow
              />
              <ModernStatCard
                title="Bekleyen Görevler"
                value={dashboardData.stats.pendingTasks || 0}
                icon={Clock}
                color="orange"
                trend={{ value: -2.1, direction: 'down' }}
                progress={45}
                showGlow
              />
            </div>

            {/* Enhanced Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <EnhancedCard variant="gradient" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">85%</div>
                    <div className="text-sm text-muted-foreground">Program İlerlemesi</div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: '85%' }}
                  />
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      4.7/5
                    </div>
                    <div className="text-sm text-muted-foreground">Firma Memnuniyeti</div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: '94%' }}
                  />
                </div>
              </EnhancedCard>

              <EnhancedCard variant="neon" className="p-6 glow-primary">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      18
                    </div>
                    <div className="text-sm text-muted-foreground">Aktif Görevler</div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: '75%' }}
                  />
                </div>
              </EnhancedCard>
            </div>

            {/* Enhanced Quick Actions */}
            <EnhancedCard variant="glass" className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Hızlı İşlemler
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sık kullanılan işlemler için kısayollar
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4 hover:bg-primary/5 hover:border-primary hover:scale-[1.02] transition-all duration-200"
                  onClick={() => alert("Görev atama özelliği Sprint 8'de eklenecek")}
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
                  className="h-auto flex-col items-start p-4 hover:bg-primary/5 hover:border-primary hover:scale-[1.02] transition-all duration-200"
                  onClick={() => alert("Randevu oluşturma özelliği Sprint 11'de eklenecek")}
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
                  className="h-auto flex-col items-start p-4 hover:bg-primary/5 hover:border-primary hover:scale-[1.02] transition-all duration-200"
                  onClick={() => alert("Eğitim atama özelliği Sprint 9'da eklenecek")}
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
            </EnhancedCard>

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
