/**
 * Consultant Dashboard API Route
 * Sprint 7: Consultant Management
 *
 * GET /api/consultant/dashboard
 * Returns dashboard data for the authenticated consultant
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { GetConsultantDashboardUseCase } from '@/application/use-cases/consultant';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const getConsultantDashboardUseCase = new GetConsultantDashboardUseCase(
  userRepository,
  companyRepository
);

/**
 * GET /api/consultant/dashboard
 * Get consultant dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Execute use case
    const result = await getConsultantDashboardUseCase.execute(userId, userRole);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    console.error('Consultant dashboard error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Dashboard verileri alınamadı' },
      { status: 500 }
    );
  }
}

