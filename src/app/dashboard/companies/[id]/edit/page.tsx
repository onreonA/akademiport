'use client';

/**
 * Edit Company Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Firma Düzenle</h1>
          <p className="text-muted-foreground">{company.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Firma Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
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
  );
}

