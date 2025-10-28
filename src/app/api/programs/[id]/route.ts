/**
 * API Route: Program by ID
 *
 * GET /api/programs/[id] - Get program by ID
 * PATCH /api/programs/[id] - Update program
 * DELETE /api/programs/[id] - Delete program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import {
  GetProgramUseCase,
  UpdateProgramUseCase,
  DeleteProgramUseCase,
} from '@/application/use-cases/program';
import { UserRole } from '@/domain/enums/UserRole';
import { requireAuth } from '@/infrastructure/api/helpers/auth';

const programRepository = new ProgramRepository();
const companyRepository = new CompanyRepository();
const getProgramUseCase = new GetProgramUseCase(programRepository);
const updateProgramUseCase = new UpdateProgramUseCase(programRepository);
const deleteProgramUseCase = new DeleteProgramUseCase(programRepository, companyRepository);

/**
 * GET /api/programs/[id]
 * Get a program by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Execute use case
    const result = await getProgramUseCase.execute({ id });

    if (result.isFailure) {
      const errorMessage = result.error?.message || 'Program alınamadı';
      const isNotFound = errorMessage.includes('bulunamadı');
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: isNotFound ? 404 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get program error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Program alınamadı',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/programs/[id]
 * Update a program
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get authenticated user
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Convert dates if provided
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    // Execute use case
    const result = await updateProgramUseCase.execute({
      id,
      userId,
      userRole,
      updatedBy: userId,
      ...body,
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
        message: 'Program başarıyla güncellendi',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update program error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Program güncellenemedi',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/programs/[id]
 * Delete a program
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authenticated user
    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Execute use case
    const result = await deleteProgramUseCase.execute({
      id,
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
        message: 'Program başarıyla silindi',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete program error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Program silinemedi',
      },
      { status: 500 }
    );
  }
}
