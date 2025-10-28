/**
 * Assign Company Program DTO
 * Sprint 6: Company Management
 */

import { z } from 'zod';

// Zod Schema
export const AssignCompanyProgramSchema = z.object({
  programId: z.string().uuid('Program ID geçerli bir UUID olmalıdır'),
});

// TypeScript Type
export type AssignCompanyProgramDto = z.infer<typeof AssignCompanyProgramSchema>;

