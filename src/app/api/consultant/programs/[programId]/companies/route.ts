/**
 * Consultant Program Companies API Route
 * Sprint 7: Consultant Management
 *
 * GET /api/consultant/programs/[programId]/companies
 * Returns list of companies in a specific program (consultant must be assigned to the program)
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';
import { ListConsultantCompaniesUseCase } from '@/application/use-cases/consultant';
import { parseConsultantCompanyFilterParams } from '@/application/dto/consultant';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const programRepository = new ProgramRepository();
const listConsultantCompaniesUseCase = new ListConsultantCompaniesUseCase(
  userRepository,
  companyRepository,
  programRepository
);

/**
 * GET /api/consultant/programs/[programId]/companies
 * Get companies in a specific program
 *
 * Query params:
 * - search: string (optional)
 * - city: string (optional)
 * - sector: string (optional)
 * - isActive: boolean (optional)
 * - sortBy: 'name' | 'city' | 'sector' | 'usersCount' | 'lastActivityAt' (default: 'name')
 * - sortOrder: 'asc' | 'desc' (default: 'asc')
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Get programId from params
    const { programId } = await params;

    // Parse filter params
    const { searchParams } = request.nextUrl;
    const filter = parseConsultantCompanyFilterParams(programId, searchParams);

    // Execute use case
    const result = await listConsultantCompaniesUseCase.execute(userId, userRole, filter);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: result.value!.companies,
      total: result.value!.total,
      page: result.value!.page,
      limit: result.value!.limit,
      totalPages: result.value!.totalPages,
      programId: result.value!.programId,
      programName: result.value!.programName,
    });
  } catch (error) {
    console.error('Consultant companies error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Firmalar listelenemedi' },
      { status: 500 }
    );
  }
}

