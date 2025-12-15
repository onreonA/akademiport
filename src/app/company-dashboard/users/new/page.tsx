/**
 * Company Dashboard - Add User Page
 * Allows company admin to add new users with role selection
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { UserForm, type UserFormData } from '@/presentation/components/features/users/UserForm';
import type { Company } from '@/domain/entities/Company';
import { toast } from 'sonner';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { UserRole } from '@/domain/enums/UserRole';

export default function AddCompanyUserPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        if (data.user.companyId) {
          fetchCompany(data.user.companyId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const fetchCompany = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
      toast.error('Firma bilgileri yüklenemedi');
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      // Create user with selected role and link to company
      const userData = {
        ...data,
        role: data.role || UserRole.COMPANY_USER,
        companyId: company?.id,
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kullanıcı başarıyla oluşturuldu');
        router.push('/company-dashboard/users');
      } else {
        toast.error(result.error || 'Kullanıcı oluşturulamadı');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Kullanıcı oluşturulamadı');
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Firma Bilgisi Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Firma bilgisi bulunamadı</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is company admin
  const isCompanyAdmin = currentUser?.role === UserRole.COMPANY_ADMIN;

  if (!isCompanyAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yetkiniz Yok</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Kullanıcı eklemek için firma yöneticisi yetkisine sahip olmalısınız.
            </p>
            <Button onClick={() => router.back()}>Geri Dön</Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if company has reached max users
  if (company.currentUsers >= company.maxUsers) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Kullanıcı Limiti Aşıldı
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Firma kullanıcı limitine ulaştı ({company.currentUsers} / {company.maxUsers}). Yeni
              kullanıcı ekleyemezsiniz.
            </p>
            <Button onClick={() => router.back()}>Geri Dön</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
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
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Yeni Kullanıcı Ekle
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              {company.name} - {company.currentUsers} / {company.maxUsers} kullanıcı
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              Kullanıcı Bilgileri
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Firma kullanıcısı oluşturun. Kullanıcı rolünü seçebilirsiniz (Firma Kullanıcısı veya
              Firma Yöneticisi).
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <UserForm
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              hideCompanySelection={true}
              // Role selection is visible, but filtered in handleSubmit
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
