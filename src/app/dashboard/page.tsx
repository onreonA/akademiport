/**
 * Dashboard Page
 *
 * Professional dashboard with rich statistics and quick actions
 */

'use client';

import * as React from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { StatCard } from '@/presentation/components/ui/atoms/stat-card';
import { MetricCard } from '@/presentation/components/ui/atoms/metric-card';
import { ModernStatCard } from '@/presentation/components/ui/atoms/modern-stat-card';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { EmptyState } from '@/presentation/components/ui/atoms/empty-state';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { UserRoleLabels } from '@/domain/enums/UserRole';
import {
  Users,
  Building2,
  FolderKanban,
  CheckCircle,
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  ArrowRight,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [stats, setStats] = React.useState({
    totalPrograms: 12,
    activeCompanies: 48,
    totalUsers: 156,
    completedTasks: 89,
    pendingTasks: 23,
    monthlyGrowth: 15.2,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={Users}
        title="Kullanıcı bulunamadı"
        description="Lütfen tekrar giriş yapın"
        action={{
          label: 'Giriş Yap',
          onClick: () => (window.location.href = '/login'),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Flat Header */}
        <GradientHeader
          title="Dashboard"
          subtitle={`Hoş geldiniz, ${user.fullName}! 👋`}
          icon={BarChart3}
          progress={75}
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Badge variant="secondary" className="text-center">
                {UserRoleLabels[user.role]}
              </Badge>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="w-full sm:w-auto">
                Çıkış Yap
              </Button>
            </div>
          }
        />

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatCard
            title="Toplam Program"
            value={stats.totalPrograms}
            icon={FolderKanban}
            color="blue"
            trend={{ value: 12.5, direction: 'up' }}
            progress={75}
          />
          <ModernStatCard
            title="Aktif Firmalar"
            value={stats.activeCompanies}
            icon={Building2}
            color="green"
            trend={{ value: 8.3, direction: 'up' }}
            progress={85}
          />
          <ModernStatCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers}
            icon={Users}
            color="purple"
            trend={{ value: 15.2, direction: 'up' }}
            progress={92}
          />
          <ModernStatCard
            title="Tamamlanan Görev"
            value={`${Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100)}%`}
            icon={CheckCircle}
            color="orange"
            trend={{ value: 5.7, direction: 'up' }}
            progress={Math.round(
              (stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100
            )}
          />
        </div>

        {/* Enhanced Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EnhancedCard variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  +{stats.monthlyGrowth}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aylık Büyüme</div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(stats.monthlyGrowth, 100)}%` }}
              />
            </div>
          </EnhancedCard>

          <EnhancedCard variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sistem Sağlığı</div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: '99.9%' }}
              />
            </div>
          </EnhancedCard>

          <EnhancedCard variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.8/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Kullanıcı Memnuniyeti
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-1000"
                style={{ width: '96%' }}
              />
            </div>
          </EnhancedCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Quick Actions */}
          <EnhancedCard variant="default" className="lg:col-span-1 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-primary" />
                Hızlı İşlemler
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">En sık kullanılan işlemler</p>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Yeni Program</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Program oluştur</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400 dark:text-gray-500" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Firma Ekle</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Yeni firma kaydet
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400 dark:text-gray-500" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Kullanıcı Ekle</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Yeni kullanıcı oluştur
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400 dark:text-gray-500" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Raporlar</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Detaylı analizler
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400 dark:text-gray-500" />
                </div>
              </Button>
            </div>
          </EnhancedCard>

          {/* Enhanced Recent Activity */}
          <EnhancedCard variant="default" className="lg:col-span-2 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                <Activity className="h-5 w-5 text-primary" />
                Son Aktiviteler
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Son 24 saatteki sistem aktiviteleri
              </p>
            </div>
            <div>
              <div className="space-y-4">
                {[
                  {
                    action: 'Yeni program oluşturuldu',
                    user: 'Ahmet Yılmaz',
                    time: '2 saat önce',
                    type: 'success',
                  },
                  {
                    action: 'Firma kaydı güncellendi',
                    user: 'Mehmet Kaya',
                    time: '4 saat önce',
                    type: 'info',
                  },
                  {
                    action: 'Kullanıcı eklendi',
                    user: 'Ayşe Demir',
                    time: '6 saat önce',
                    type: 'success',
                  },
                  {
                    action: 'Program durumu değiştirildi',
                    user: 'Ali Veli',
                    time: '8 saat önce',
                    type: 'warning',
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === 'success'
                          ? 'bg-green-600'
                          : activity.type === 'warning'
                            ? 'bg-orange-600'
                            : 'bg-blue-600'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Enhanced User Info Card */}
        <EnhancedCard variant="default" className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Hesap Bilgileri
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Kullanıcı hesap detayları</p>
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ad Soyad</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{user.fullName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Rol</p>
                <Badge variant="secondary" className="text-sm">
                  {UserRoleLabels[user.role]}
                </Badge>
              </div>
            </div>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
