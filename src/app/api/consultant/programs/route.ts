/**
 * Consultant Programs API Route
 * Sprint 7: Consultant Management
 *
 * GET /api/consultant/programs
 * Returns list of programs assigned to the consultant
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { ListConsultantProgramsUseCase } from '@/application/use-cases/consultant';
import { parseConsultantProgramFilterParams } from '@/application/dto/consultant';
import { requireAuth } from '@/infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const programRepository = new ProgramRepository();
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const listConsultantProgramsUseCase = new ListConsultantProgramsUseCase(
  programRepository,
  userRepository,
  companyRepository
);

/**
 * GET /api/consultant/programs
 * Get consultant's programs with filters
 *
 * Query params:
 * - status: ProgramStatus (optional)
 * - search: string (optional)
 * - sortBy: 'name' | 'startDate' | 'companiesCount' | 'assignedAt' (default: 'assignedAt')
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Parse filter params
    const { searchParams } = request.nextUrl;
    const filter = parseConsultantProgramFilterParams(searchParams);

    // Execute use case
    const result = await listConsultantProgramsUseCase.execute(userId, userRole, filter);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: result.value?.programs || [],
      total: result.value?.total || 0,
      page: filter.page,
      limit: filter.limit,
    });
  } catch (error) {
    console.error('Consultant programs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Programlar listelenemedi' },
      { status: 500 }
    );
  }
}
