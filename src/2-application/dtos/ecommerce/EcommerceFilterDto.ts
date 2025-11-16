import { z } from 'zod';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';

export const EcommerceMetricsFilterDtoSchema = z.object({
  companyId: z.string().uuid().optional(),
  programId: z.string().uuid().optional(),
  periodYear: z.number().int().min(2020).max(2100).optional(),
  periodMonth: z.number().int().min(1).max(12).optional(),
  platformType: z.nativeEnum(EcommercePlatformType).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type EcommerceMetricsFilterDto = z.infer<typeof EcommerceMetricsFilterDtoSchema>;

export const EcommercePerformanceFilterDtoSchema = z.object({
  programId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  minRevenue: z.number().min(0).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type EcommercePerformanceFilterDto = z.infer<typeof EcommercePerformanceFilterDtoSchema>;
