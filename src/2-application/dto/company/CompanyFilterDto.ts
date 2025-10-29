/**
 * Company Filter DTO
 * Sprint 6: Company Management
 */

import { z } from 'zod';

// Sort fields
export type CompanySortField =
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'city'
  | 'sector'
  | 'employeeCount';

// Zod Schema
export const CompanyFilterSchema = z.object({
  // Search
  search: z.string().optional(),

  // Filters
  programId: z.string().uuid().optional(),
  city: z.string().optional(),
  sector: z.string().optional(),
  isActive: z.boolean().optional(),

  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'city', 'sector', 'employeeCount'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// TypeScript Type
export type CompanyFilterDto = z.infer<typeof CompanyFilterSchema>;

// Helper: Parse query params to filter DTO
export function parseCompanyFilterParams(params: URLSearchParams): CompanyFilterDto {
  return {
    search: params.get('search') || undefined,
    programId: params.get('programId') || undefined,
    city: params.get('city') || undefined,
    sector: params.get('sector') || undefined,
    isActive: params.get('isActive') ? params.get('isActive') === 'true' : undefined,
    page: params.get('page') ? parseInt(params.get('page')!) : 1,
    limit: params.get('limit') ? parseInt(params.get('limit')!) : 10,
    sortBy: (params.get('sortBy') as CompanySortField) || 'createdAt',
    sortOrder: (params.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}
