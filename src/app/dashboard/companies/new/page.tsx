'use client';

/**
 * Create Company Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { CompanyForm } from '@/presentation/components/features/companies';
import type { CreateCompanyDto } from '@/application/dto/company';

export default function NewCompanyPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

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
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/companies/${result.data.id}`);
      } else {
        alert(result.error || 'Firma oluşturulamadı');
      }
    } catch (error) {
      console.error('Failed to create company:', error);
      alert('Firma oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Yeni Firma</h1>
          <p className="text-muted-foreground">Yeni bir firma oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Firma Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm
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
