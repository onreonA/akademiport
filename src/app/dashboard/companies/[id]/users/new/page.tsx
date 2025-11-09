/**
 * Add Company User Page
 * Sprint 7.5: Company User Management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { UserForm, type UserFormData } from '@/presentation/components/features/users/UserForm';
import type { Company } from '@/domain/entities/Company';
import { toast } from 'sonner';

export default function AddCompanyUserPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      // Create user with company_user role and link to company
      const userData = {
        ...data,
        role: 'company_user',
        companyId: companyId,
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kullanıcı başarıyla oluşturuldu');
        router.push(`/dashboard/companies/${companyId}/users`);
      } else {
        toast.error(result.error || 'Kullanıcı oluşturulamadı');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Kullanıcı oluşturulamadı');
      throw error;
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
        <p className="text-center text-muted-foreground">Firma bulunamadı</p>
      </div>
    );
  }

  // Check if company has reached max users
  if (company.currentUsers >= company.maxUsers) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
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
                Kullanıcı Ekle
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
                {company.name}
              </p>
            </div>
          </div>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Kullanıcı Limiti Doldu
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Bu firma maksimum kullanıcı sayısına ({company.maxUsers}) ulaştı.
                  <br />
                  Yeni kullanıcı eklemek için lütfen firma limitini artırın.
                </p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={() => router.back()} className="shadow-sm">
                    Geri Dön
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard/companies/${companyId}/edit`)}
                    className="shadow-sm"
                  >
                    Firmayı Düzenle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
              Firma kullanıcısı oluşturun. Kullanıcı, firma paneline erişim sağlayacak.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <UserForm
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              hideRoleSelection
              hideCompanySelection
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
