import { z } from 'zod';

export const LeaderboardFilterDtoSchema = z.object({
  programId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type LeaderboardFilterDto = z.infer<typeof LeaderboardFilterDtoSchema>;



