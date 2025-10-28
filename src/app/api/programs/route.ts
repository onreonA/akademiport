/**
 * API Route: Programs
 *
 * GET /api/programs - List all programs (with filters and pagination)
 * POST /api/programs - Create new program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { CreateProgramUseCase, ListProgramsUseCase } from '@/application/use-cases/program';
import { UserRole } from '@/domain/enums/UserRole';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';
import type { ProgramSortField } from '@/application/dto/program/ProgramFilterDto';
import { requireAuth } from '@/infrastructure/api/helpers/auth';

const programRepository = new ProgramRepository();
const createProgramUseCase = new CreateProgramUseCase(programRepository);
const listProgramsUseCase = new ListProgramsUseCase(programRepository);

/**
 * GET /api/programs
 * List programs with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Get authenticated user
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Parse query parameters
    const status = searchParams.get('status') as ProgramStatus | undefined;
    const city = searchParams.get('city') || undefined;
    const region = searchParams.get('region') || undefined;
    const search = searchParams.get('search') || undefined;
    const managerId = searchParams.get('managerId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as ProgramSortField;
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Execute use case
    const result = await listProgramsUseCase.execute({
      userId,
      userRole,
      status,
      city,
      region,
      search,
      managerId,
      page,
      limit,
      sortBy,
      sortOrder,
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
        data: result.value?.programs,
        pagination: {
          total: result.value?.total,
          page: result.value?.page,
          limit: result.value?.limit,
          totalPages: result.value?.totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List programs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Programlar alınamadı',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/programs
 * Create a new program
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get authenticated user
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Convert dates
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    // Execute use case
    const result = await createProgramUseCase.execute({
      ...body,
      createdBy: userId,
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
        data: result.value,
        message: 'Program başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create program error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Program oluşturulamadı',
      },
      { status: 500 }
    );
  }
}
