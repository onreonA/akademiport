/**
 * Edit Custom Report Page
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { CustomReportBuilder } from '@/1-presentation/components/features/reports/CustomReportBuilder';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditCustomReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/custom-reports/${reportId}`);
      if (!response.ok) {
        throw new Error('Rapor yüklenemedi');
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      toast.error('Rapor yüklenemedi');
      router.push('/dashboard/reports/custom');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/custom-reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Rapor güncellenemedi');
      }

      toast.success('Rapor başarıyla güncellendi');
      router.push('/dashboard/reports/custom');
    } catch (error: any) {
      toast.error(error.message || 'Rapor güncellenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Raporu Düzenle</h1>
          <p className="text-muted-foreground mt-1">{reportData.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapor Ayarları</CardTitle>
          <CardDescription>Raporunuzun ayarlarını düzenleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomReportBuilder
            initialData={{
              name: reportData.name,
              description: reportData.description,
              reportType: reportData.reportType,
              selectedMetrics: reportData.selectedMetrics,
              dateRangeType: reportData.dateRangeType,
              dateRangeStart: reportData.dateRangeStart
                ? new Date(reportData.dateRangeStart)
                : undefined,
              dateRangeEnd: reportData.dateRangeEnd ? new Date(reportData.dateRangeEnd) : undefined,
              isScheduled: reportData.isScheduled,
              scheduleCron: reportData.scheduleCron,
              scheduleTimezone: reportData.scheduleTimezone,
            }}
            onSubmit={handleUpdate}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
