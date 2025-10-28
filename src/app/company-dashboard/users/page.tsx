'use client';

/**
 * Company Dashboard - Users Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { CompanyUsersList } from '@/presentation/components/features/companies';
import type { Company } from '@/domain/entities/Company';
import type { User } from '@/domain/entities/User';

export default function CompanyUsersPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        if (data.user.companyId) {
          fetchCompany(data.user.companyId);
          fetchUsers(data.user.companyId);
        }
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

  const handleAddUser = () => {
    alert('Kullanıcı ekleme özelliği yakında eklenecek');
  };

  const handleRemoveUser = async (userId: string) => {
    if (!company) return;

    if (!confirm('Bu kullanıcıyı çıkarmak istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/companies/${company.id}/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers(company.id);
        fetchCompany(company.id);
      } else {
        alert(data.error || 'Kullanıcı çıkarılamadı');
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
      alert('Kullanıcı çıkarılamadı');
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

  const canManage = currentUser?.role === 'COMPANY_ADMIN';

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">{company.name}</p>
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Firma Kullanıcıları</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyUsersList
            users={users}
            maxUsers={company.maxUsers}
            onAddUser={canManage ? handleAddUser : undefined}
            onRemoveUser={canManage ? handleRemoveUser : undefined}
            canManage={canManage}
          />
        </CardContent>
      </Card>

      {!canManage && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Kullanıcı eklemek veya çıkarmak için firma yöneticinizle iletişime geçin.
          </p>
        </div>
      )}
    </div>
  );
}

