/**
 * Consultant Company DTO
 * Sprint 7: Consultant Management
 *
 * Consultant'ın görüntülediği firmalar için DTO
 */

import { z } from 'zod';
import type { Company } from '@/domain/entities/Company';

// =====================================================
// CONSULTANT COMPANY WITH STATS
// =====================================================

/**
 * Consultant Company + İstatistikler
 * Consultant'ın erişebildiği bir firma + istatistikler
 */
export interface ConsultantCompanyWithStats {
  // Firma bilgileri
  company: Company;

  // Program bilgisi
  programId: string;
  programName: string;

  // İstatistikler
  usersCount: number;
  activeUsersCount: number;

  // Görev istatistikleri (Sprint 8'de kullanılacak)
  tasksCount?: number;
  completedTasksCount?: number;

  // Eğitim istatistikleri (Sprint 9'da kullanılacak)
  trainingsCount?: number;
  completedTrainingsCount?: number;

  // Son aktivite
  lastActivityAt?: Date;
}

// Zod Schema
export const ConsultantCompanyWithStatsSchema = z.object({
  company: z.any(), // Company entity
  programId: z.string().uuid(),
  programName: z.string(),
  usersCount: z.number().int().min(0),
  activeUsersCount: z.number().int().min(0),
  tasksCount: z.number().int().min(0).optional(),
  completedTasksCount: z.number().int().min(0).optional(),
  trainingsCount: z.number().int().min(0).optional(),
  completedTrainingsCount: z.number().int().min(0).optional(),
  lastActivityAt: z.date().optional(),
});

// TypeScript Type
export type ConsultantCompanyDto = z.infer<typeof ConsultantCompanyWithStatsSchema>;

// =====================================================
// CONSULTANT COMPANY LIST FILTER
// =====================================================

/**
 * Consultant Company Listesi Filtreleme
 * Program bazlı firma listesi için
 */
export interface ConsultantCompanyFilter {
  // Program filter (required)
  programId: string;

  // Search
  search?: string;

  // Filters
  city?: string;
  sector?: string;
  isActive?: boolean;

  // Sorting
  sortBy?: 'name' | 'city' | 'sector' | 'usersCount' | 'lastActivityAt';
  sortOrder?: 'asc' | 'desc';

  // Pagination
  page?: number;
  limit?: number;
}

// Zod Schema
export const ConsultantCompanyFilterSchema = z.object({
  programId: z.string().uuid('Program ID geçerli bir UUID olmalıdır'),
  search: z.string().optional(),
  city: z.string().optional(),
  sector: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'city', 'sector', 'usersCount', 'lastActivityAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// TypeScript Type
export type ConsultantCompanyFilterDto = z.infer<typeof ConsultantCompanyFilterSchema>;

// =====================================================
// CONSULTANT COMPANY LIST RESPONSE
// =====================================================

/**
 * Consultant Company Listesi Response
 */
export interface ConsultantCompanyListResponse {
  companies: ConsultantCompanyWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  programId: string;
  programName: string;
}

// Zod Schema
export const ConsultantCompanyListResponseSchema = z.object({
  companies: z.array(ConsultantCompanyWithStatsSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
  programId: z.string().uuid(),
  programName: z.string(),
});

// TypeScript Type
export type ConsultantCompanyListDto = z.infer<typeof ConsultantCompanyListResponseSchema>;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Parse query parameters to filter
 */
export function parseConsultantCompanyFilterParams(
  programId: string,
  searchParams: URLSearchParams
): ConsultantCompanyFilterDto {
  const filter: ConsultantCompanyFilter = {
    programId,
    search: searchParams.get('search') || undefined,
    city: searchParams.get('city') || undefined,
    sector: searchParams.get('sector') || undefined,
    isActive: searchParams.get('isActive') === 'true' ? true : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'name',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  };

  const result = ConsultantCompanyFilterSchema.parse(filter);
  return result;
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Create empty company list response
 */
export function createEmptyCompanyListResponse(
  programId: string,
  programName: string
): ConsultantCompanyListResponse {
  return {
    companies: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    programId,
    programName,
  };
}
