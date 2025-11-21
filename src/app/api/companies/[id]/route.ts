/**
 * API Route: Company by ID
 * Sprint 6: Updated with Use Cases
 *
 * GET /api/companies/[id] - Get company by ID
 * PATCH /api/companies/[id] - Update company
 * DELETE /api/companies/[id] - Delete company
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import {
  GetCompanyUseCase,
  UpdateCompanyUseCase,
  DeleteCompanyUseCase,
} from '@/application/use-cases/company';
import { UpdateCompanySchema } from '@/application/dto/company';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const companyRepository = new CompanyRepository();
const getCompanyUseCase = new GetCompanyUseCase(companyRepository);
const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;
    const userCompanyId = user.companyId;

    // Execute use case
    const result = await getCompanyUseCase.execute(id, userId, userRole, userCompanyId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Firma alınamadı' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;
    const userCompanyId = user.companyId;

    // Parse and validate body
    const body = await request.json();
    const validation = UpdateCompanySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Execute use case
    const result = await updateCompanyUseCase.execute(
      id,
      validation.data,
      userId,
      userRole,
      userCompanyId
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
      message: 'Firma başarıyla güncellendi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Firma güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Execute use case
    const result = await deleteCompanyUseCase.execute(id, userId, userRole);

    if (result.isFailure) {
      // Extract error message properly
      let errorMessage = 'Firma silinemedi';

      if (result.error) {
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error instanceof Error) {
          errorMessage = result.error.message;
        } else if (typeof result.error === 'object' && 'message' in result.error) {
          errorMessage = String(result.error.message);
        } else {
          errorMessage = String(result.error);
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Firma başarıyla silindi',
    });
  } catch (error) {
    let errorMessage = 'Firma silinirken beklenmeyen bir hata oluştu';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
