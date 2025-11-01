import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AddCompanyUserUseCase } from '@/application/use-cases/company';
import { AddCompanyUserSchema } from '@/application/dto/company/ManageCompanyUsersDto';
import { UserRole } from '@/domain/enums/UserRole';

const companyRepository = new CompanyRepository();
const addCompanyUserUseCase = new AddCompanyUserUseCase(companyRepository);

/**
 * GET /api/companies/[id]/users
 * Get all users for a company
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: companyId } = await params;

    // Check authorization
    if (
      user.role !== 'master_admin' &&
      user.role !== 'program_manager' &&
      user.role !== 'consultant'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const userRepository = new UserRepository();

    // Get users by company_id using findByCompanyId
    const result = await userRepository.findByCompanyId(companyId);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch users' },
        { status: 400 }
      );
    }

    // Filter by role if needed (company_user)
    const users = result.value?.filter((u) => u.role === 'company_user') || [];

    return NextResponse.json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.error('Error in GET /api/companies/[id]/users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies/[id]/users
 * Add a user to a company
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: companyId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = AddCompanyUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { userId: targetUserId, role } = validation.data;

    // Execute use case
    const result = await addCompanyUserUseCase.execute(
      companyId,
      targetUserId,
      user.id,
      user.role as UserRole,
      user.companyId
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla firmaya eklendi',
    });
  } catch (error) {
    console.error('Error in POST /api/companies/[id]/users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
