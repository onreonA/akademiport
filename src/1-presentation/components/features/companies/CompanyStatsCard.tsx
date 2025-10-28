'use client';

/**
 * Company Stats Card Component
 * Sprint 6: Company Management
 */

import React from 'react';
import { Users, Calendar, Building2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import type { Company } from '@/domain/entities/Company';

interface CompanyStatsCardProps {
  company: Company;
}

export function CompanyStatsCard({ company }: CompanyStatsCardProps) {
  const stats = [
    {
      title: 'Aktif Kullanıcı',
      value: `${company.currentUsers} / ${company.maxUsers}`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Durum',
      value: company.isActive ? 'Aktif' : 'Pasif',
      icon: Activity,
      color: company.isActive ? 'text-green-600' : 'text-gray-600',
    },
    {
      title: 'Kuruluş Yılı',
      value: company.foundationYear || '-',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Çalışan Sayısı',
      value: company.employeeCount || '-',
      icon: Building2,
      color: 'text-orange-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>İstatistikler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.title}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

