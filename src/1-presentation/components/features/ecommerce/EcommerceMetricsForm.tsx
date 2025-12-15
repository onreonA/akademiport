'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateEcommerceMetricsDtoSchema,
  CreateEcommerceMetricsDto,
} from '@/2-application/dtos/ecommerce';
import {
  EcommercePlatformType,
  EcommercePlatformTypeLabels,
} from '@/3-domain/enums/EcommerceEnums';
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
import { EcommerceMetrics } from '@/3-domain/entities/Ecommerce';

interface EcommerceMetricsFormProps {
  metrics?: EcommerceMetrics;
  companyId: string;
  programId: string;
  onSubmit: (data: CreateEcommerceMetricsDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function EcommerceMetricsForm({
  metrics,
  companyId,
  programId,
  onSubmit,
  onCancel,
  isSubmitting,
}: EcommerceMetricsFormProps) {
  const isEdit = !!metrics;
  const [selectedPlatform, setSelectedPlatform] = useState<EcommercePlatformType>(
    metrics?.platformType || EcommercePlatformType.ALIBABA
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    metrics?.periodYear || new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    metrics?.periodMonth || new Date().getMonth() + 1
  );

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthLabels = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    setValue,
    trigger,
  } = useForm<CreateEcommerceMetricsDto>({
    resolver: zodResolver(CreateEcommerceMetricsDtoSchema),
    mode: 'onChange',
    defaultValues: metrics
      ? {
          companyId: metrics.companyId,
          programId: metrics.programId,
          periodYear: metrics.periodYear,
          periodMonth: metrics.periodMonth,
          platformType: metrics.platformType,
          alibabaVisitors: metrics.alibabaVisitors,
          alibabaVisitorSectorAvg: metrics.alibabaVisitorSectorAvg ?? 0,
          alibabaProducts: metrics.alibabaProducts,
          alibabaRfqCount: metrics.alibabaRfqCount,
          alibabaOrders: metrics.alibabaOrders,
          alibabaRevenue: metrics.alibabaRevenue,
          alibabaMessageSectorAvg: metrics.alibabaMessageSectorAvg ?? 0,
          alibabaSeriousBuyerCount: metrics.alibabaSeriousBuyerCount ?? 0,
          b2cVisitors: metrics.b2cVisitors,
          b2cProducts: metrics.b2cProducts,
          b2cOrders: metrics.b2cOrders,
          b2cRevenue: metrics.b2cRevenue,
          notes: metrics.notes || '',
        }
      : {
          companyId: companyId || '',
          programId: programId || '',
          periodYear: currentYear,
          periodMonth: new Date().getMonth() + 1,
          platformType: EcommercePlatformType.ALIBABA,
          alibabaVisitors: 0,
          alibabaVisitorSectorAvg: 0,
          alibabaProducts: 0,
          alibabaRfqCount: 0,
          alibabaOrders: 0,
          alibabaRevenue: 0,
          alibabaMessageSectorAvg: 0,
          alibabaSeriousBuyerCount: 0,
          b2cVisitors: 0,
          b2cProducts: 0,
          b2cOrders: 0,
          b2cRevenue: 0,
        },
  });

  useEffect(() => {
    if (companyId && programId) {
      setValue('companyId', companyId, { shouldValidate: true });
      setValue('programId', programId, { shouldValidate: true });
      setValue('periodYear', selectedYear, { shouldValidate: true });
      setValue('periodMonth', selectedMonth, { shouldValidate: true });
      setValue('platformType', selectedPlatform, { shouldValidate: true });
      // Trigger validation after setting all values
      trigger();
    }
  }, [companyId, programId, selectedYear, selectedMonth, selectedPlatform, setValue, trigger]);

  const handleFormSubmit = async (data: CreateEcommerceMetricsDto) => {
    await onSubmit(data);
  };

  const isAlibaba = selectedPlatform === EcommercePlatformType.ALIBABA;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Period Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="periodYear">Yıl *</Label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => {
              setSelectedYear(parseInt(value));
              setValue('periodYear', parseInt(value));
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.periodYear && (
            <p className="text-sm text-destructive">{errors.periodYear.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodMonth">Ay *</Label>
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => {
              setSelectedMonth(parseInt(value));
              setValue('periodMonth', parseInt(value));
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {monthLabels[month - 1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.periodMonth && (
            <p className="text-sm text-destructive">{errors.periodMonth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="platformType">Platform *</Label>
          <Select
            value={selectedPlatform}
            onValueChange={(value) => {
              setSelectedPlatform(value as EcommercePlatformType);
              setValue('platformType', value as EcommercePlatformType);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(EcommercePlatformType).map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {EcommercePlatformTypeLabels[platform]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.platformType && (
            <p className="text-sm text-destructive">{errors.platformType.message}</p>
          )}
        </div>
      </div>

      {/* Alibaba Metrics (B2B) */}
      {isAlibaba && (
        <Card>
          <CardHeader>
            <CardTitle>Alibaba (B2B) Metrikleri</CardTitle>
            <CardDescription>Alibaba platformu için metrikleri giriniz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alibabaVisitors">Ziyaretçi Sayısı</Label>
                <Input
                  id="alibabaVisitors"
                  type="number"
                  min="0"
                  {...register('alibabaVisitors', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.alibabaVisitors && (
                  <p className="text-sm text-destructive">{errors.alibabaVisitors.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alibabaVisitorSectorAvg">Ziyaretçi (Sektör Ort)</Label>
                <Input
                  id="alibabaVisitorSectorAvg"
                  type="number"
                  min="0"
                  {...register('alibabaVisitorSectorAvg', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.alibabaVisitorSectorAvg && (
                  <p className="text-sm text-destructive">
                    {errors.alibabaVisitorSectorAvg.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alibabaProducts">Ürün Sayısı</Label>
                <Input
                  id="alibabaProducts"
                  type="number"
                  min="0"
                  {...register('alibabaProducts', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.alibabaProducts && (
                  <p className="text-sm text-destructive">{errors.alibabaProducts.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alibabaRfqCount">RFQ Sayısı</Label>
                <Input
                  id="alibabaRfqCount"
                  type="number"
                  min="0"
                  {...register('alibabaRfqCount', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.alibabaRfqCount && (
                  <p className="text-sm text-destructive">{errors.alibabaRfqCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alibabaOrders">Sipariş Sayısı</Label>
                <Input
                  id="alibabaOrders"
                  type="number"
                  min="0"
                  {...register('alibabaOrders', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.alibabaOrders && (
                  <p className="text-sm text-destructive">{errors.alibabaOrders.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alibabaRevenue">Gelir (TL)</Label>
                <Input
                  id="alibabaRevenue"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('alibabaRevenue', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.alibabaRevenue && (
                  <p className="text-sm text-destructive">{errors.alibabaRevenue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alibabaMessageSectorAvg">Mesaj Sektör Ortalaması</Label>
                <Input
                  id="alibabaMessageSectorAvg"
                  type="number"
                  min="0"
                  {...register('alibabaMessageSectorAvg', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.alibabaMessageSectorAvg && (
                  <p className="text-sm text-destructive">
                    {errors.alibabaMessageSectorAvg.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alibabaSeriousBuyerCount">Ciddi Alıcı Sayısı (L3-L4)</Label>
                <Input
                  id="alibabaSeriousBuyerCount"
                  type="number"
                  min="0"
                  {...register('alibabaSeriousBuyerCount', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.alibabaSeriousBuyerCount && (
                  <p className="text-sm text-destructive">
                    {errors.alibabaSeriousBuyerCount.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* B2C Platform Metrics */}
      {!isAlibaba && (
        <Card>
          <CardHeader>
            <CardTitle>{EcommercePlatformTypeLabels[selectedPlatform]} Metrikleri</CardTitle>
            <CardDescription>B2C platform metriklerini giriniz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b2cVisitors">Ziyaretçi Sayısı</Label>
                <Input
                  id="b2cVisitors"
                  type="number"
                  min="0"
                  {...register('b2cVisitors', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.b2cVisitors && (
                  <p className="text-sm text-destructive">{errors.b2cVisitors.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="b2cProducts">Ürün Sayısı</Label>
                <Input
                  id="b2cProducts"
                  type="number"
                  min="0"
                  {...register('b2cProducts', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.b2cProducts && (
                  <p className="text-sm text-destructive">{errors.b2cProducts.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="b2cOrders">Sipariş Sayısı</Label>
                <Input
                  id="b2cOrders"
                  type="number"
                  min="0"
                  {...register('b2cOrders', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.b2cOrders && (
                  <p className="text-sm text-destructive">{errors.b2cOrders.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="b2cRevenue">Gelir (TL)</Label>
                <Input
                  id="b2cRevenue"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('b2cRevenue', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.b2cRevenue && (
                  <p className="text-sm text-destructive">{errors.b2cRevenue.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notlar</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Ek notlar veya açıklamalar"
          rows={4}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || formIsSubmitting}
          >
            İptal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || formIsSubmitting}>
          {isSubmitting || formIsSubmitting ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );
}
