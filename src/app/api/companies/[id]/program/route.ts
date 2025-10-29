/**
 * API Route: Assign Company Program
 * Sprint 6: Company Management
 *
 * POST /api/companies/[id]/program - Assign program to company
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { AssignCompanyProgramUseCase } from '@/application/use-cases/company';
import { AssignCompanyProgramSchema } from '@/application/dto/company';
import { requireAuth } from '@/infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const companyRepository = new CompanyRepository();
const assignCompanyProgramUseCase = new AssignCompanyProgramUseCase(companyRepository);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Parse and validate body
    const body = await request.json();
    const validation = AssignCompanyProgramSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Execute use case
    const result = await assignCompanyProgramUseCase.execute(
      id,
      validation.data.programId,
      userId,
      userRole
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
      message: 'Program başarıyla atandı',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Program atanamadı' },
      { status: 500 }
    );
  }
}
