/**
 * New Custom Report Page
 *
 * Yeni özel rapor oluşturma sayfası
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CustomReportBuilder } from '@/1-presentation/components/features/reports/CustomReportBuilder';
import type { ReportFormValues } from '@/1-presentation/components/features/reports/CustomReportBuilder';

export default function NewCustomReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ReportFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/custom-reports', {
        method: 'POST',
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rapor oluşturulamadı');
      }

      const result = await response.json();
      toast.success('Rapor başarıyla oluşturuldu');
      router.push(`/dashboard/custom-reports/${result.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Rapor oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/custom-reports');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/custom-reports">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Özel Rapor Oluştur</h1>
          <p className="text-muted-foreground mt-2">
            Özel raporunuzu oluşturmak için aşağıdaki formu doldurun
          </p>
        </div>
      </div>

      {/* Form */}
      <CustomReportBuilder
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
