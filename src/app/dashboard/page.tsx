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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Hoş geldiniz, <span className="font-semibold text-foreground">{user.fullName}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {UserRoleLabels[user.role]}
              </Badge>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                Son giriş: {new Date().toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </Button>
            <Button onClick={signOut} variant="outline" size="sm">
              Çıkış Yap
            </Button>
          </div>
        </div>

        {/* Stats Grid - 4 Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Program"
            value={stats.totalPrograms}
            subtitle={`${stats.totalPrograms - 2} aktif`}
            icon={FolderKanban}
            trend={{
              value: 12.5,
              direction: 'up',
              period: 'bu ay',
            }}
            color="blue"
          />
          <StatCard
            title="Aktif Firmalar"
            value={stats.activeCompanies}
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
            title="Toplam Kullanıcı"
            value={stats.totalUsers}
            subtitle="Sistem genelinde"
            icon={Users}
            trend={{
              value: 15.2,
              direction: 'up',
              period: 'bu ay',
            }}
            color="purple"
          />
          <StatCard
            title="Tamamlanan Görev"
            value={`${Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100)}%`}
            subtitle={`${stats.completedTasks} / ${stats.completedTasks + stats.pendingTasks} görev`}
            icon={CheckCircle}
            trend={{
              value: 5.7,
              direction: 'up',
              period: 'bu hafta',
            }}
            color="orange"
          />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MetricCard
            label="Aylık Büyüme"
            value={`+${stats.monthlyGrowth}%`}
            icon={TrendingUp}
            progress={stats.monthlyGrowth}
            color="green"
            size="lg"
          />
          <MetricCard
            label="Sistem Sağlığı"
            value="99.9%"
            icon={Activity}
            progress={99.9}
            color="blue"
            size="lg"
          />
          <MetricCard
            label="Kullanıcı Memnuniyeti"
            value="4.8/5"
            icon={CheckCircle}
            progress={96}
            color="purple"
            size="lg"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hızlı İşlemler
              </CardTitle>
              <CardDescription>En sık kullanılan işlemler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Yeni Program</div>
                    <div className="text-xs text-muted-foreground">Program oluştur</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                    <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Firma Ekle</div>
                    <div className="text-xs text-muted-foreground">Yeni firma kaydet</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Kullanıcı Ekle</div>
                    <div className="text-xs text-muted-foreground">Yeni kullanıcı oluştur</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Raporlar</div>
                    <div className="text-xs text-muted-foreground">Detaylı analizler</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Son Aktiviteler
              </CardTitle>
              <CardDescription>Son 24 saatteki sistem aktiviteleri</CardDescription>
            </CardHeader>
            <CardContent>
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
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === 'success'
                          ? 'bg-green-500'
                          : activity.type === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card - Compact */}
        <Card>
          <CardHeader>
            <CardTitle>Hesap Bilgileri</CardTitle>
            <CardDescription>Kullanıcı hesap detayları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ad Soyad</p>
                <p className="text-lg font-medium">{user.fullName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rol</p>
                <Badge variant="secondary" className="text-sm">
                  {UserRoleLabels[user.role]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
