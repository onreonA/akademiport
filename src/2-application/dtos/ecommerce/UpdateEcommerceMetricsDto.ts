import { z } from 'zod';

export const UpdateEcommerceMetricsDtoSchema = z.object({
  // Alibaba (B2B) Metrikleri
  alibabaVisitors: z.number().int().min(0).optional(),
  alibabaVisitorSectorAvg: z.number().int().min(0).optional(),
  alibabaProducts: z.number().int().min(0).optional(),
  alibabaRfqCount: z.number().int().min(0).optional(),
  alibabaOrders: z.number().int().min(0).optional(),
  alibabaRevenue: z.number().min(0).optional(),
  alibabaMessageSectorAvg: z.number().int().min(0).optional(),
  alibabaSeriousBuyerCount: z.number().int().min(0).optional(),

  // B2C Platform Metrikleri
  b2cVisitors: z.number().int().min(0).optional(),
  b2cProducts: z.number().int().min(0).optional(),
  b2cOrders: z.number().int().min(0).optional(),
  b2cRevenue: z.number().min(0).optional(),

  // Ek bilgiler
  notes: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export type UpdateEcommerceMetricsDto = z.infer<typeof UpdateEcommerceMetricsDtoSchema>;
