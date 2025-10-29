/**
 * Consultant Dashboard DTO
 * Sprint 7: Consultant Management
 *
 * Consultant dashboard için gerekli istatistik ve veri yapıları
 */

import { z } from 'zod';
import type { Program } from '@/domain/entities/Program';

// =====================================================
// CONSULTANT DASHBOARD STATS
// =====================================================

/**
 * Consultant Dashboard İstatistikleri
 */
export interface ConsultantDashboardStats {
  // Program istatistikleri
  totalPrograms: number;
  activePrograms: number;

  // Firma istatistikleri
  totalCompanies: number;
  companiesByProgram: Record<string, number>; // programId -> company count

  // Görev istatistikleri (Sprint 8'de kullanılacak)
  totalTasks?: number;
  pendingTasks?: number;
  completedTasks?: number;

  // Eğitim istatistikleri (Sprint 9'da kullanılacak)
  totalTrainings?: number;
  activeTrainings?: number;
}

// Zod Schema
export const ConsultantDashboardStatsSchema = z.object({
  totalPrograms: z.number().int().min(0),
  activePrograms: z.number().int().min(0),
  totalCompanies: z.number().int().min(0),
  companiesByProgram: z.record(z.string().uuid(), z.number().int().min(0)),
  totalTasks: z.number().int().min(0).optional(),
  pendingTasks: z.number().int().min(0).optional(),
  completedTasks: z.number().int().min(0).optional(),
  totalTrainings: z.number().int().min(0).optional(),
  activeTrainings: z.number().int().min(0).optional(),
});

// =====================================================
// CONSULTANT DASHBOARD DATA
// =====================================================

/**
 * Consultant Dashboard Tam Veri
 * İstatistikler + Son aktiviteler
 */
export interface ConsultantDashboardData {
  stats: ConsultantDashboardStats;
  recentPrograms: Program[];
  recentCompanies: Array<{
    id: string;
    name: string;
    programId: string;
    programName: string;
    city?: string;
    sector?: string;
    updatedAt: Date;
  }>;
}

// Zod Schema
export const ConsultantDashboardDataSchema = z.object({
  stats: ConsultantDashboardStatsSchema,
  recentPrograms: z.array(z.any()), // Program entity
  recentCompanies: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      programId: z.string().uuid(),
      programName: z.string(),
      city: z.string().optional(),
      sector: z.string().optional(),
      updatedAt: z.date(),
    })
  ),
});

// TypeScript Type
export type ConsultantDashboardDto = z.infer<typeof ConsultantDashboardDataSchema>;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Boş dashboard stats oluştur
 */
export function createEmptyDashboardStats(): ConsultantDashboardStats {
  return {
    totalPrograms: 0,
    activePrograms: 0,
    totalCompanies: 0,
    companiesByProgram: {},
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalTrainings: 0,
    activeTrainings: 0,
  };
}

/**
 * Dashboard stats validation
 */
export function validateDashboardStats(stats: unknown): {
  valid: boolean;
  data?: ConsultantDashboardStats;
  errors?: string[];
} {
  const result = ConsultantDashboardStatsSchema.safeParse(stats);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return {
    valid: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
}
