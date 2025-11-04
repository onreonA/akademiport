'use client';

/**
 * Edit Company Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { CompanyForm } from '@/presentation/components/features/companies';
import type { Company } from '@/domain/entities/Company';
import type { CreateCompanyDto } from '@/application/dto/company';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [programs, setPrograms] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
    fetchPrograms();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${id}`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      const data = await response.json();

      if (data.success) {
        setPrograms(data.data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const handleSubmit = async (data: CreateCompanyDto) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/companies/${id}`);
      } else {
        alert(result.error || 'Firma güncellenemedi');
      }
    } catch (error) {
      console.error('Failed to update company:', error);
      alert('Firma güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Firma Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Firma bilgileri yüklenemedi</p>
            <Button onClick={() => router.push('/dashboard/companies')} variant="outline">
              Firmalara Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-4xl">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Firma Düzenle</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {company.name} - Firma bilgilerini güncelleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Firma Bilgileri
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Firma bilgilerini güncelleyin ve değişiklikleri kaydedin
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <CompanyForm
              initialData={{
                programId: company.programId,
                name: company.name,
                legalName: company.legalName,
                taxNumber: company.taxNumber,
                tradeRegistryNumber: company.tradeRegistryNumber,
                email: company.email,
                phone: company.phone,
                website: company.website,
                address: company.address,
                city: company.city,
                district: company.district,
                postalCode: company.postalCode,
                country: company.country,
                sector: company.sector,
                subSector: company.subSector,
                employeeCount: company.employeeCount,
                foundationYear: company.foundationYear,
                maxUsers: company.maxUsers,
              }}
              programs={programs}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
