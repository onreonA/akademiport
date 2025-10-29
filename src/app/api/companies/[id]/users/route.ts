/**
 * API Route: Company Users
 * Sprint 6: Company Management
 *
 * GET /api/companies/[id]/users - List company users
 * POST /api/companies/[id]/users - Add user to company
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { ListCompanyUsersUseCase, AddCompanyUserUseCase } from '@/application/use-cases/company';
import { AddCompanyUserSchema } from '@/application/dto/company';
import { requireAuth } from '@/infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const companyRepository = new CompanyRepository();
const listCompanyUsersUseCase = new ListCompanyUsersUseCase(companyRepository);
const addCompanyUserUseCase = new AddCompanyUserUseCase(companyRepository);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;
    const userCompanyId = user.companyId;

    // Execute use case
    const result = await listCompanyUsersUseCase.execute(id, userId, userRole, userCompanyId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
      count: result.value!.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Kullanıcılar alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;
    const userCompanyId = user.companyId;

    // Parse and validate body
    const body = await request.json();
    const validation = AddCompanyUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Execute use case
    const result = await addCompanyUserUseCase.execute(
      id,
      validation.data.userId,
      userId,
      userRole,
      userCompanyId
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla eklendi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Kullanıcı eklenemedi' },
      { status: 500 }
    );
  }
}
