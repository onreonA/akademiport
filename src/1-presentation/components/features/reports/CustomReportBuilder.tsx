/**
 * Custom Report Builder Component
 *
 * Kullanıcıların özel raporlar oluşturması için form component'i
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Checkbox } from '@/presentation/components/ui/atoms/checkbox';
import { CalendarIcon, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

// Available metrics based on dashboard stats
const AVAILABLE_METRICS = [
  { id: 'user_growth', label: 'Kullanıcı Büyümesi', category: 'dashboard' },
  { id: 'program_activity', label: 'Program Aktivitesi', category: 'dashboard' },
  { id: 'company_distribution', label: 'Firma Dağılımı', category: 'dashboard' },
  { id: 'task_completion', label: 'Görev Tamamlanma', category: 'dashboard' },
  { id: 'company_performance', label: 'Firma Performansı', category: 'consultant' },
  { id: 'project_progress', label: 'Proje İlerlemesi', category: 'consultant' },
  { id: 'training_completion', label: 'Eğitim Tamamlanma', category: 'consultant' },
  { id: 'ecommerce_metrics', label: 'E-Ticaret Metrikleri', category: 'company' },
];

const REPORT_TYPES = [
  { value: 'dashboard', label: 'Dashboard Raporu' },
  { value: 'company', label: 'Firma Raporu' },
  { value: 'program', label: 'Program Raporu' },
  { value: 'custom', label: 'Özel Rapor' },
];

const DATE_RANGE_TYPES = [
  { value: 'last_7_days', label: 'Son 7 Gün' },
  { value: 'last_30_days', label: 'Son 30 Gün' },
  { value: 'last_90_days', label: 'Son 90 Gün' },
  { value: 'last_year', label: 'Son 1 Yıl' },
  { value: 'all_time', label: 'Tüm Zamanlar' },
  { value: 'custom', label: 'Özel Tarih Aralığı' },
];

const reportFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Rapor adı gereklidir')
      .max(255, 'Rapor adı en fazla 255 karakter olabilir'),
    description: z.string().max(1000, 'Açıklama en fazla 1000 karakter olabilir').optional(),
    reportType: z.enum(['dashboard', 'company', 'program', 'custom']),
    selectedMetrics: z.array(z.string()).min(1, 'En az bir metrik seçilmelidir'),
    dateRangeType: z.enum([
      'custom',
      'last_7_days',
      'last_30_days',
      'last_90_days',
      'last_year',
      'all_time',
    ]),
    dateRangeStart: z.date().optional().nullable(),
    dateRangeEnd: z.date().optional().nullable(),
    isScheduled: z.boolean().default(false),
    scheduleCron: z.string().optional().nullable(),
    scheduleTimezone: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.dateRangeType === 'custom') {
        return data.dateRangeStart && data.dateRangeEnd;
      }
      return true;
    },
    {
      message: 'Özel tarih aralığı için başlangıç ve bitiş tarihi gereklidir',
      path: ['dateRangeStart'],
    }
  );

type ReportFormValues = z.infer<typeof reportFormSchema>;

export interface CustomReportBuilderProps {
  initialData?: Partial<ReportFormValues>;
  onSubmit: (data: ReportFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function CustomReportBuilder({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomReportBuilderProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    initialData?.selectedMetrics || []
  );
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(
    initialData?.dateRangeStart ? new Date(initialData.dateRangeStart) : undefined
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(
    initialData?.dateRangeEnd ? new Date(initialData.dateRangeEnd) : undefined
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      reportType: initialData?.reportType || 'dashboard',
      selectedMetrics: initialData?.selectedMetrics || [],
      dateRangeType: initialData?.dateRangeType || 'last_30_days',
      dateRangeStart: initialData?.dateRangeStart
        ? new Date(initialData.dateRangeStart)
        : undefined,
      dateRangeEnd: initialData?.dateRangeEnd ? new Date(initialData.dateRangeEnd) : undefined,
      isScheduled: initialData?.isScheduled || false,
      scheduleCron: initialData?.scheduleCron || null,
      scheduleTimezone: initialData?.scheduleTimezone || 'Europe/Istanbul',
    },
  });

  const reportType = watch('reportType');
  const dateRangeType = watch('dateRangeType');
  const isScheduled = watch('isScheduled');

  // Filter metrics based on report type
  const availableMetrics = AVAILABLE_METRICS.filter((metric) => {
    if (reportType === 'dashboard') {
      return metric.category === 'dashboard';
    }
    if (reportType === 'company') {
      return metric.category === 'company' || metric.category === 'dashboard';
    }
    if (reportType === 'program') {
      return metric.category === 'consultant' || metric.category === 'dashboard';
    }
    return true; // custom - show all
  });

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter((id) => id !== metricId)
      : [...selectedMetrics, metricId];
    setSelectedMetrics(newMetrics);
    setValue('selectedMetrics', newMetrics);
  };

  const handleFormSubmit = async (data: ReportFormValues) => {
    try {
      await onSubmit({
        ...data,
        selectedMetrics,
        dateRangeStart: dateRangeType === 'custom' ? dateRangeStart : undefined,
        dateRangeEnd: dateRangeType === 'custom' ? dateRangeEnd : undefined,
      });
    } catch (error) {
      toast.error('Rapor oluşturulamadı');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Bilgileri</CardTitle>
          <CardDescription>Raporunuz için temel bilgileri girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Rapor Adı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Örn: Aylık Performans Raporu"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Rapor hakkında açıklama..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">
              Rapor Tipi <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('reportType')}
              onValueChange={(value) => {
                setValue('reportType', value as any);
                // Reset metrics when report type changes
                setSelectedMetrics([]);
                setValue('selectedMetrics', []);
              }}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Rapor tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Metrik Seçimi</CardTitle>
          <CardDescription>Raporunuza dahil etmek istediğiniz metrikleri seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={() => handleMetricToggle(metric.id)}
                />
                <Label htmlFor={metric.id} className="cursor-pointer">
                  {metric.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.selectedMetrics && (
            <p className="text-sm text-destructive mt-2">{errors.selectedMetrics.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle>Tarih Aralığı</CardTitle>
          <CardDescription>Rapor için tarih aralığını seçin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dateRangeType">Tarih Aralığı Tipi</Label>
            <Select
              value={dateRangeType}
              onValueChange={(value) => {
                setValue('dateRangeType', value as any);
              }}
            >
              <SelectTrigger id="dateRangeType">
                <SelectValue placeholder="Tarih aralığı seçin" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dateRangeType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateRangeStart">Başlangıç Tarihi</Label>
                <Input
                  id="dateRangeStart"
                  type="date"
                  value={dateRangeStart ? dateRangeStart.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setDateRangeStart(date);
                    setValue('dateRangeStart', date);
                  }}
                  className={errors.dateRangeStart ? 'border-destructive' : ''}
                />
                {errors.dateRangeStart && (
                  <p className="text-sm text-destructive">{errors.dateRangeStart.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRangeEnd">Bitiş Tarihi</Label>
                <Input
                  id="dateRangeEnd"
                  type="date"
                  value={dateRangeEnd ? dateRangeEnd.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setDateRangeEnd(date);
                    setValue('dateRangeEnd', date);
                  }}
                  className={errors.dateRangeEnd ? 'border-destructive' : ''}
                />
                {errors.dateRangeEnd && (
                  <p className="text-sm text-destructive">{errors.dateRangeEnd.message}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Zamanlama (Opsiyonel)</CardTitle>
          <CardDescription>Raporu otomatik olarak zamanlayabilirsiniz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isScheduled"
              checked={isScheduled}
              onCheckedChange={(checked) => setValue('isScheduled', checked as boolean)}
            />
            <Label htmlFor="isScheduled" className="cursor-pointer">
              Bu raporu zamanla
            </Label>
          </div>

          {isScheduled && (
            <div className="space-y-2">
              <Label htmlFor="scheduleCron">Cron Expression</Label>
              <Input
                id="scheduleCron"
                {...register('scheduleCron')}
                placeholder="0 0 * * * (Her gün saat 00:00)"
                className={errors.scheduleCron ? 'border-destructive' : ''}
              />
              <p className="text-sm text-muted-foreground">
                Cron formatı: dakika saat gün ay hafta (örn: 0 0 * * * = Her gün saat 00:00)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
            İptal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
