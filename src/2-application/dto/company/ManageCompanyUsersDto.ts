/**
 * Manage Company Users DTO
 * Sprint 6: Company Management
 */

import { z } from 'zod';
import { UserRole } from '@/domain/enums/UserRole';

// Add Company User Schema
export const AddCompanyUserSchema = z.object({
  userId: z.string().uuid('User ID geçerli bir UUID olmalıdır'),
  role: z
    .nativeEnum(UserRole)
    .refine((val) => val === UserRole.COMPANY_ADMIN || val === UserRole.COMPANY_USER, {
      message: 'Rol COMPANY_ADMIN veya COMPANY_USER olmalıdır',
    }),
});

// TypeScript Type
export type AddCompanyUserDto = z.infer<typeof AddCompanyUserSchema>;

// Remove Company User Schema
export const RemoveCompanyUserSchema = z.object({
  userId: z.string().uuid('User ID geçerli bir UUID olmalıdır'),
});

// TypeScript Type
export type RemoveCompanyUserDto = z.infer<typeof RemoveCompanyUserSchema>;
