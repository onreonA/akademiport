import { z } from 'zod';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';

export const CreateEcommerceMetricsDtoSchema = z
  .object({
    companyId: z.string().uuid('Geçersiz firma ID'),
    programId: z.string().uuid('Geçersiz program ID'),
    periodYear: z.number().int().min(2020).max(2100, 'Geçerli bir yıl giriniz (2020-2100)'),
    periodMonth: z.number().int().min(1).max(12, 'Geçerli bir ay giriniz (1-12)'),
    platformType: z.nativeEnum(EcommercePlatformType, {
      message: 'Geçerli bir platform tipi seçiniz',
    }),

    // Alibaba (B2B) Metrikleri
    alibabaVisitors: z.number().int().min(0).default(0).optional(),
    alibabaProducts: z.number().int().min(0).default(0).optional(),
    alibabaRfqCount: z.number().int().min(0).default(0).optional(),
    alibabaOrders: z.number().int().min(0).default(0).optional(),
    alibabaRevenue: z.number().min(0).default(0).optional(),

    // B2C Platform Metrikleri
    b2cVisitors: z.number().int().min(0).default(0).optional(),
    b2cProducts: z.number().int().min(0).default(0).optional(),
    b2cOrders: z.number().int().min(0).default(0).optional(),
    b2cRevenue: z.number().min(0).default(0).optional(),

    // Ek bilgiler
    notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional().nullable(),
    metadata: z.record(z.string(), z.any()).optional().nullable(),
  })
  .refine(
    (data) => {
      // Alibaba platformu için Alibaba metrikleri gerekli
      if (data.platformType === EcommercePlatformType.ALIBABA) {
        return (
          (data.alibabaVisitors ?? 0) >= 0 &&
          (data.alibabaProducts ?? 0) >= 0 &&
          (data.alibabaOrders ?? 0) >= 0 &&
          (data.alibabaRevenue ?? 0) >= 0
        );
      }
      // B2C platformlar için B2C metrikleri gerekli
      return (
        (data.b2cVisitors ?? 0) >= 0 &&
        (data.b2cProducts ?? 0) >= 0 &&
        (data.b2cOrders ?? 0) >= 0 &&
        (data.b2cRevenue ?? 0) >= 0
      );
    },
    {
      message: 'Platform tipine uygun metrikler girilmelidir',
    }
  );

export type CreateEcommerceMetricsDto = z.infer<typeof CreateEcommerceMetricsDtoSchema>;
