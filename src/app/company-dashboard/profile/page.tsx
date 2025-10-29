'use client';

/**
 * Company Dashboard - Profile Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { CompanyProfileCard } from '@/presentation/components/features/companies';
import type { Company } from '@/domain/entities/Company';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
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

  const handleEdit = () => {
    alert('Firma bilgilerini düzenlemek için yöneticinizle iletişime geçin');
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Firma Profili</h1>
          <p className="text-muted-foreground">{company.name}</p>
        </div>
      </div>

      {/* Profile */}
      <CompanyProfileCard company={company} onEdit={handleEdit} canEdit={false} />
    </div>
  );
}
