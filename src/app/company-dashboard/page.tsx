'use client';

/**
 * Company Dashboard - Main Page
 * Sprint 6: Company Management
 * For COMPANY_ADMIN and COMPANY_USER roles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import type { Company } from '@/domain/entities/Company';
import type { User } from '@/domain/entities/User';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success && data.user.companyId) {
        fetchCompany(data.user.companyId);
        fetchUsers(data.user.companyId);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    }
  };

  const fetchUsers = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Firma bilgisi bulunamadı</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Firma Durumu',
      value: company.isActive ? 'Aktif' : 'Pasif',
      icon: Activity,
      color: company.isActive ? 'text-green-600' : 'text-gray-600',
    },
    {
      title: 'Toplam Kullanıcı',
      value: `${company.currentUsers} / ${company.maxUsers}`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Şehir',
      value: company.city || '-',
      icon: Building2,
      color: 'text-purple-600',
    },
    {
      title: 'Kuruluş Yılı',
      value: company.foundationYear || '-',
      icon: Calendar,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="text-muted-foreground">Firma Paneli</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Erişim</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20"
            onClick={() => router.push('/company-dashboard/profile')}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Firma Profili
          </Button>
          <Button
            variant="outline"
            className="h-20"
            onClick={() => router.push('/company-dashboard/users')}
          >
            <Users className="w-5 h-5 mr-2" />
            Kullanıcılar ({users.length})
          </Button>
          <Button
            variant="outline"
            className="h-20"
            onClick={() => router.push('/company-dashboard/settings')}
          >
            <Activity className="w-5 h-5 mr-2" />
            Ayarlar
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Henüz aktivite bulunmuyor
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
