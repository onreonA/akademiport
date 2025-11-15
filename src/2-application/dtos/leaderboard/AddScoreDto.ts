import { z } from 'zod';

export const AddScoreDtoSchema = z.object({
  companyId: z.string().uuid('Geçersiz firma ID'),
  activityType: z.string().min(1, 'Aktivite tipi gerekli'),
  activityId: z.string().uuid().optional().nullable(),
  points: z.number().int().min(0).optional(),
  multiplier: z.number().min(0).max(10).default(1.0).optional(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export type AddScoreDto = z.infer<typeof AddScoreDtoSchema>;
