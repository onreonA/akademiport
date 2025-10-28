/**
 * API Route: Companies
 * Sprint 6: Updated with Use Cases
 *
 * GET /api/companies - List all companies (with filters)
 * POST /api/companies - Create new company
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { CreateCompanyUseCase, ListCompaniesUseCase } from '@/application/use-cases/company';
import { CreateCompanySchema, parseCompanyFilterParams } from '@/application/dto/company';
import { requireAuth } from '@/infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';

const companyRepository = new CompanyRepository();
const listCompaniesUseCase = new ListCompaniesUseCase(companyRepository);
const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;
    const userCompanyId = user.companyId;

    // Parse filter params
    const { searchParams } = request.nextUrl;
    const filter = parseCompanyFilterParams(searchParams);

    // Execute use case
    const result = await listCompaniesUseCase.execute(filter, userId, userRole, userCompanyId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value!.companies,
      total: result.value!.total,
      page: filter.page,
      limit: filter.limit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Firmalar alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Parse and validate body
    const body = await request.json();
    const validation = CreateCompanySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Execute use case
    const result = await createCompanyUseCase.execute(validation.data, userId, userRole);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
        message: 'Firma başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Firma oluşturulamadı' },
      { status: 500 }
    );
  }
}
