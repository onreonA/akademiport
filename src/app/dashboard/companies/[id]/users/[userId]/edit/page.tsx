/**
 * Edit Company User Page
 * Sprint 7.5: Company User Management
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { UserForm, type UserFormData } from '@/presentation/components/features/users/UserForm';
import type { Company } from '@/domain/entities/Company';
import type { User } from '@/domain/entities/User';
import { toast } from 'sonner';

export default function EditCompanyUserPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  const userId = params.userId as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch company and user in parallel
      const [companyRes, userRes] = await Promise.all([
        fetch(`/api/companies/${companyId}`),
        fetch(`/api/users/${userId}`),
      ]);

      const [companyData, userData] = await Promise.all([companyRes.json(), userRes.json()]);

      if (companyData.success) {
        setCompany(companyData.data);
      }

      if (userData.success) {
        setUser(userData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kullanıcı başarıyla güncellendi');
        router.push(`/dashboard/companies/${companyId}/users`);
      } else {
        toast.error(result.error || 'Kullanıcı güncellenemedi');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Kullanıcı güncellenemedi');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company || !user) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Veri bulunamadı</p>
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
              Kullanıcı Düzenle
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              {company.name} - {user.fullName}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Kullanıcı Bilgileri
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">Kullanıcı bilgilerini güncelleyin</p>
          </CardHeader>
          <CardContent className="p-8">
            <UserForm
              initialData={{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                companyId: user.companyId,
                // isActive: user.isActive, // Not in UpdateUserDto
              }}
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
