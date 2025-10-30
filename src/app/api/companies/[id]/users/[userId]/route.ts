/**
 * API Route: Remove Company User
 * Sprint 6: Company Management
 *
 * DELETE /api/companies/[id]/users/[userId] - Remove user from company
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { RemoveCompanyUserUseCase } from '@/application/use-cases/company';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const companyRepository = new CompanyRepository();
const removeCompanyUserUseCase = new RemoveCompanyUserUseCase(companyRepository);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId: targetUserId } = await params;

    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;
    const userCompanyId = user.companyId;

    // Execute use case
    const result = await removeCompanyUserUseCase.execute(
      id,
      targetUserId,
      userId,
      userRole,
      userCompanyId
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla çıkarıldı',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Kullanıcı çıkarılamadı' },
      { status: 500 }
    );
  }
}
