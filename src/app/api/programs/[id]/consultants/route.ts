/**
 * API Route: Program Consultants
 *
 * POST /api/programs/[id]/consultants - Add consultant to program
 * GET /api/programs/[id]/consultants - Get all consultants for program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/4-infrastructure/database/repositories/ProgramRepository';
import { ManageConsultantsUseCase } from '@/application/use-cases/program';
import { UserRole } from '@/domain/enums/UserRole';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';

const programRepository = new ProgramRepository();
const manageConsultantsUseCase = new ManageConsultantsUseCase(programRepository);

/**
 * POST /api/programs/[id]/consultants
 * Add a consultant to a program
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: programId } = await params;
    const body = await request.json();

    // Get authenticated user
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Validate request body
    if (!body.consultantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Danışman ID zorunludur',
        },
        { status: 400 }
      );
    }

    // Execute use case
    const result = await manageConsultantsUseCase.addConsultant({
      programId,
      consultantId: body.consultantId,
      userId,
      userRole,
    });

    if (result.isFailure) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Danışman başarıyla eklendi',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add consultant error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Danışman eklenirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/programs/[id]/consultants
 * Get all consultants for a program
 *
 * Authorization:
 * - Master Admin, Program Manager: Can see all consultants
 * - Consultant: Can see consultants in their assigned programs
 * - Company Admin/User: Can see consultants in their company's program
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: programId } = await params;

    // Get authenticated user
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    console.log(
      '🔍 [GET /api/programs/[id]/consultants] Fetching consultants for program:',
      programId,
      'User:',
      { id: user.id, role: userRole, companyId: user.companyId }
    );

    // For company users, verify they can access this program
    if (userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.COMPANY_USER) {
      if (!user.companyId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Firma bilgisi bulunamadı',
          },
          { status: 403 }
        );
      }

      // Get company to verify program access
      const { CompanyRepository } = await import(
        '@/4-infrastructure/database/repositories/CompanyRepository'
      );
      const { GetCompanyUseCase } = await import('@/application/use-cases/company');
      const companyRepository = new CompanyRepository();
      const getCompanyUseCase = new GetCompanyUseCase(companyRepository);

      const companyResult = await getCompanyUseCase.execute(
        user.companyId,
        user.id,
        userRole,
        user.companyId
      );

      if (companyResult.isFailure || !companyResult.value) {
        return NextResponse.json(
          {
            success: false,
            error: 'Firma bilgisi alınamadı',
          },
          { status: 403 }
        );
      }

      // Verify company's program matches requested program
      if (companyResult.value.programId !== programId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bu programa erişim yetkiniz yok',
          },
          { status: 403 }
        );
      }

      console.log(
        '✅ [GET /api/programs/[id]/consultants] Company user authorized for program:',
        programId
      );
    }

    // Execute use case
    // Skip program check for company users (already authorized above)
    const result = await manageConsultantsUseCase.getConsultants({
      programId,
      skipProgramCheck: userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.COMPANY_USER,
    });

    if (result.isFailure) {
      const errorMessage =
        result.error instanceof Error ? (result.error as any)?.message || "Unknown error" : result.error || 'Bilinmeyen hata';
      console.error('🔴 [GET /api/programs/[id]/consultants] Error:', errorMessage);
      console.error('🔴 [GET /api/programs/[id]/consultants] Full error object:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    console.log(
      '🟢 [GET /api/programs/[id]/consultants] Success, found consultants:',
      result.value?.length || 0
    );

    return NextResponse.json(
      {
        success: true,
        data: result.value || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('🔴 [GET /api/programs/[id]/consultants] Exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Danışmanlar getirilirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}
