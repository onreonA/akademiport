import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

/**
 * GET /api/companies/[id]/users
 * Get all users for a company
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
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

    // Get users by company_id
    const result = await userRepository.findAll({
      company_id: companyId,
      role: 'company_user',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      users: result.data,
    });
  } catch (error) {
    console.error('Error in GET /api/companies/[id]/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
