/**
 * Consultant Stats Component
 * Sprint 7: Consultant Management
 *
 * Dashboard istatistik kartları
 */

'use client';

import React from 'react';
import { Building2, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import type { ConsultantDashboardStats } from '@/application/dto/consultant';

// =====================================================
// TYPES
// =====================================================

interface ConsultantStatsProps {
  stats: ConsultantDashboardStats;
  isLoading?: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

export function ConsultantStats({ stats, isLoading }: ConsultantStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Program',
      value: stats.totalPrograms,
      subtitle: `${stats.activePrograms} aktif`,
      icon: Briefcase,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Toplam Firma',
      value: stats.totalCompanies,
      subtitle: 'Tüm programlarda',
      icon: Building2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Tamamlanan Görevler',
      value: stats.completedTasks || 0,
      subtitle: `${stats.totalTasks || 0} görevden`,
      icon: CheckCircle2,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'Bekleyen Görevler',
      value: stats.pendingTasks || 0,
      subtitle: 'Sprint 8\'de aktif',
      icon: Clock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

