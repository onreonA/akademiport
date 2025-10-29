/**
 * Consultant Dashboard Page
 * Sprint 7: Consultant Management
 *
 * Ana dashboard sayfası - Consultant rolü için
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { ConsultantProgramProvider } from '@/shared/contexts/ConsultantProgramContext';
import { ProgramSelector, ConsultantStats, ConsultantCompanyList } from '@/presentation/components/features/consultant';
import type { ConsultantDashboardData } from '@/application/dto/consultant';
import { Loader2 } from 'lucide-react';

// =====================================================
// MAIN COMPONENT (WITH PROVIDER)
// =====================================================

export default function ConsultantDashboardPage() {
  return (
    <ConsultantProgramProvider>
      <ConsultantDashboardContent />
    </ConsultantProgramProvider>
  );
}

// =====================================================
// CONTENT COMPONENT
// =====================================================

function ConsultantDashboardContent() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/consultant/dashboard');
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Dashboard verileri yüklenemedi');
      }
    } catch (err) {
      setError('Dashboard yüklenirken bir hata oluştu');
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyClick = (companyId: string) => {
    router.push(`/consultant-dashboard/companies/${companyId}`);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
            <CardDescription>Dashboard yüklenirken bir hata oluştu</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Tekrar Dene</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danışman Paneli</h1>
        <p className="text-muted-foreground mt-2">
          Atandığınız programları ve firmaları yönetin
        </p>
      </div>

      {/* Program Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Program Seçin</CardTitle>
          <CardDescription>
            Firma ve görevleri görüntülemek için bir program seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramSelector />
        </CardContent>
      </Card>

      {/* Stats */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : dashboardData ? (
        <>
          <ConsultantStats stats={dashboardData.stats} />

          {/* Companies List */}
          <ConsultantCompanyList onCompanyClick={handleCompanyClick} />

          {/* Recent Programs */}
          {dashboardData.recentPrograms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Son Programlar</CardTitle>
                <CardDescription>
                  Son güncellenen {dashboardData.recentPrograms.length} program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData.recentPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {program.city} • {program.status}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/programs/${program.id}`)}
                      >
                        Detay
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

