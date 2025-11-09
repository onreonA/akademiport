'use client';

import { BarChart3, Users, CheckCircle2, Clock, TrendingUp, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Loader2 } from 'lucide-react';
import { useEventStatistics } from '@/shared/hooks/api/useEventStatistics';
import type { EventStatisticsDto } from '@/application/dto/event/EventStatisticsDto';

interface EventStatisticsProps {
  eventId: string;
}

export function EventStatistics({ eventId }: EventStatisticsProps) {
  const { data, isLoading, error } = useEventStatistics(eventId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.statistics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message || 'İstatistikler yüklenemedi'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = data.statistics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Kayıt</p>
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Katılan</p>
                <p className="text-2xl font-bold">{stats.totalAttended}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Katılım Oranı</p>
                <p className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Katılımcı Firma</p>
                <p className="text-2xl font-bold">{stats.companiesCount}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Utilization */}
      {stats.capacityUtilization !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Kapasite Kullanımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dolu / Maksimum</span>
                <span className="font-medium">
                  {stats.currentAttendees} / {stats.maxAttendees}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.capacityUtilization, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                %{stats.capacityUtilization.toFixed(1)} dolu
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Durum Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Katılan</span>
              </div>
              <Badge variant="default">{stats.statusDistribution.attended}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm">Kayıtlı (Katılmadı)</span>
              </div>
              <Badge variant="secondary">{stats.statusDistribution.registered}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Attendance */}
      {stats.companyAttendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Firma Bazlı Katılım</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.companyAttendance
                .sort((a, b) => b.attended - a.attended)
                .slice(0, 10)
                .map((company) => (
                  <div key={company.companyId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{company.companyName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {company.attended}/{company.registrations}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          %{company.attendanceRate.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(company.attendanceRate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
