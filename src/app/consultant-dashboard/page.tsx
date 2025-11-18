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
  HelpCircle,
} from 'lucide-react';
import { useConsultantDashboardStats } from '@/1-presentation/hooks/useDashboard';
import {
  CompanyPerformanceChart,
  ProjectProgressChart,
  TrainingCompletionChart,
} from '@/1-presentation/components/features/analytics';
import { ExportButton } from '@/1-presentation/components/features/export';

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
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState<number>(0);
  const { data: statsData, isLoading: isLoadingStats } = useConsultantDashboardStats();

  useEffect(() => {
    fetchDashboardData();
    fetchPendingQuestionsCount();

    // Polling: Her 30 saniyede bir soru sayısını güncelle
    const interval = setInterval(() => {
      fetchPendingQuestionsCount();
    }, 30000); // 30 saniye

    return () => clearInterval(interval);
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

  const fetchPendingQuestionsCount = async () => {
    try {
      const response = await fetch('/api/consultant/tasks/questions/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingQuestionsCount(data.questions?.length || 0);
      }
    } catch (err) {
      // Silently fail - don't show error for background polling
      console.error('Failed to fetch pending questions count:', err);
    }
  };

  const handleCompanyClick = (companyId: string) => {
    router.push(`/consultant-dashboard/companies/${companyId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Hata</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Dashboard yüklenirken bir hata oluştu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={fetchDashboardData} className="shadow-sm">
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Danışman Paneli
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
                Atandığınız programları ve firmaları yönetin
              </p>
            </div>
            <ExportButton
              exportUrl="/api/consultant-dashboard/export"
              filename="consultant-dashboard"
              variant="outline"
              size="sm"
            />
          </div>
        </div>

        {/* Program Selector */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-primary" />
              Program Seçin
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Veriler yükleniyor...</div>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <ModernStatCard
                title="Toplam Program"
                value={dashboardData.stats.totalPrograms}
                icon={BarChart3}
                color="blue"
                trend={{ value: 12.5, direction: 'up' }}
                progress={85}
              />
              <ModernStatCard
                title="Atandığım Firmalar"
                value={dashboardData.stats.totalCompanies}
                icon={Building2}
                color="green"
                trend={{ value: 8.3, direction: 'up' }}
                progress={92}
              />
              <ModernStatCard
                title="Tamamlanan Görevler"
                value={dashboardData.stats.completedTasks || 0}
                icon={CheckCircle}
                color="purple"
                trend={{ value: 5.7, direction: 'up' }}
                progress={75}
              />
              <ModernStatCard
                title="Bekleyen Görevler"
                value={dashboardData.stats.pendingTasks || 0}
                icon={Clock}
                color="orange"
                trend={{ value: -2.1, direction: 'down' }}
                progress={45}
              />
              <ModernStatCard
                title="Cevap Bekleyen Sorular"
                value={pendingQuestionsCount}
                icon={HelpCircle}
                color="cyan"
                onClick={() => router.push('/consultant-dashboard/tasks/questions')}
                className="cursor-pointer hover:scale-105 transition-transform"
              />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">85%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Program İlerlemesi
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: '85%' }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">4.7/5</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Firma Memnuniyeti
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-1000"
                      style={{ width: '94%' }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">18</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Aktif Görevler</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: '75%' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Activity className="h-5 w-5 text-primary" />
                  Hızlı İşlemler
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Sık kullanılan işlemler için kısayollar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary transition-all duration-200"
                    onClick={() => alert("Görev atama özelliği Sprint 8'de eklenecek")}
                  >
                    <CheckCircle className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">Görev Ata</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Firmaya yeni görev oluştur
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary transition-all duration-200"
                    onClick={() => alert("Randevu oluşturma özelliği Sprint 11'de eklenecek")}
                  >
                    <Clock className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Randevu Oluştur
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Firma ile görüşme planla
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary transition-all duration-200"
                    onClick={() => alert("Eğitim atama özelliği Sprint 9'da eklenecek")}
                  >
                    <Users className="h-6 w-6 mb-2 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">Eğitim Ata</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Firmaya eğitim içeriği paylaş
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            {statsData?.data && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {statsData.data.companyPerformance &&
                  statsData.data.companyPerformance.length > 0 && (
                    <CompanyPerformanceChart data={statsData.data.companyPerformance} />
                  )}
                {statsData.data.projectProgress && statsData.data.projectProgress.length > 0 && (
                  <ProjectProgressChart data={statsData.data.projectProgress} />
                )}
                {statsData.data.trainingCompletion &&
                  statsData.data.trainingCompletion.length > 0 && (
                    <TrainingCompletionChart data={statsData.data.trainingCompletion} />
                  )}
              </div>
            )}

            {/* Companies List */}
            <ConsultantCompanyList onCompanyClick={handleCompanyClick} />

            {/* Recent Programs */}
            {dashboardData.recentPrograms.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Activity className="h-5 w-5" />
                    Son Programlar
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Son güncellenen {dashboardData.recentPrograms.length} program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData.recentPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {program.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {program.city} • {program.status}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/consultant-dashboard/programs/${program.id}`)
                          }
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
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Program Seçin
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
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
