'use client';

/**
 * Company Dashboard - Users Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { CompanyUsersList } from '@/presentation/components/features/companies';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <div className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Firma Bilgisi Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Firma bilgisi bulunamadı</p>
          </div>
        </div>
      </div>
    );
  }

  const canManage = currentUser?.role === 'COMPANY_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              {company.name}
            </p>
          </div>
        </div>

        {/* Users List */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Firma Kullanıcıları</CardTitle>
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
    </div>
  );
}
