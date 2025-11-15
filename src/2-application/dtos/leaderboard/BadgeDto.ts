import { z } from 'zod';
import { BadgeCategory, RequirementType } from '@/3-domain/enums/LeaderboardEnums';

export const CreateBadgeDtoSchema = z.object({
  name: z.string().min(1, 'Rozet adı gerekli').max(100, 'Rozet adı çok uzun'),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  category: z.nativeEnum(BadgeCategory),
  requirementType: z.nativeEnum(RequirementType),
  requirementValue: z.number().int().min(1, 'Gerekli değer en az 1 olmalı'),
  requirementActivity: z.string().optional().nullable(),
  pointsBonus: z.number().int().min(0).default(0).optional(),
  isActive: z.boolean().default(true).optional(),
  orderIndex: z.number().int().default(0).optional(),
});

export type CreateBadgeDto = z.infer<typeof CreateBadgeDtoSchema>;

export const UpdateBadgeDtoSchema = CreateBadgeDtoSchema.partial();

export type UpdateBadgeDto = z.infer<typeof UpdateBadgeDtoSchema>;



