'use client';

/**
 * Create Company Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Yeni Firma
            </h1>
            <p className="text-muted-foreground text-lg">
              Yeni bir firma oluşturun ve sisteme ekleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              Firma Bilgileri
            </CardTitle>
            <p className="text-muted-foreground">Lütfen firma bilgilerini eksiksiz doldurun</p>
          </CardHeader>
          <CardContent className="p-8">
            <CompanyForm
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
