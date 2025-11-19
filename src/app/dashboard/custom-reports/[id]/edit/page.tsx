/**
 * Edit Custom Report Page
 *
 * Özel rapor düzenleme sayfası
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CustomReportBuilder } from '@/1-presentation/components/features/reports/CustomReportBuilder';
import type { ReportFormValues } from '@/1-presentation/components/features/reports/CustomReportBuilder';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';

interface CustomReport {
  id: string;
  name: string;
  description?: string | null;
  reportType: 'dashboard' | 'company' | 'program' | 'custom';
  status: 'draft' | 'saved' | 'scheduled' | 'archived';
  selectedMetrics: string[];
  dateRangeType: string;
  dateRangeStart?: string | null;
  dateRangeEnd?: string | null;
  isScheduled: boolean;
  scheduleCron?: string | null;
  scheduleTimezone?: string | null;
}

export default function EditCustomReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [report, setReport] = useState<CustomReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((p) => setReportId(p.id));
  }, [params]);

  useEffect(() => {
    if (!reportId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/custom-reports/${reportId}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Rapor yüklenemedi');
        }

        const data = await response.json();
        setReport(data);
      } catch (error: any) {
        toast.error(error.message || 'Rapor yüklenemedi');
        router.push('/dashboard/custom-reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, router]);

  const handleSubmit = async (data: ReportFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/custom-reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          reportType: data.reportType,
          selectedMetrics: data.selectedMetrics,
          dateRangeType: data.dateRangeType,
          dateRangeStart: data.dateRangeStart?.toISOString() || null,
          dateRangeEnd: data.dateRangeEnd?.toISOString() || null,
          isScheduled: data.isScheduled,
          scheduleCron: data.scheduleCron || null,
          scheduleTimezone: data.scheduleTimezone || 'Europe/Istanbul',
          status: report?.status || 'saved',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rapor güncellenemedi');
      }

      toast.success('Rapor başarıyla güncellendi');
      router.push(`/dashboard/custom-reports/${reportId}`);
    } catch (error: any) {
      toast.error(error.message || 'Rapor güncellenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/custom-reports/${reportId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Rapor bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              Aradığınız rapor bulunamadı veya silinmiş olabilir.
            </p>
            <Link href="/dashboard/custom-reports">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Raporlara Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/custom-reports/${reportId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporu Düzenle</h1>
          <p className="text-muted-foreground mt-2">Rapor bilgilerini güncelleyin</p>
        </div>
      </div>

      {/* Form */}
      <CustomReportBuilder
        initialData={{
          name: report.name,
          description: report.description || undefined,
          reportType: report.reportType,
          selectedMetrics: report.selectedMetrics,
          dateRangeType: report.dateRangeType as any,
          dateRangeStart: report.dateRangeStart ? new Date(report.dateRangeStart) : undefined,
          dateRangeEnd: report.dateRangeEnd ? new Date(report.dateRangeEnd) : undefined,
          isScheduled: report.isScheduled,
          scheduleCron: report.scheduleCron || undefined,
          scheduleTimezone: report.scheduleTimezone || undefined,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
