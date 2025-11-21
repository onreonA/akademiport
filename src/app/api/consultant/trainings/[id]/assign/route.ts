import { NextRequest, NextResponse } from 'next/server';
import { CompanyTrainingRepository } from '@/infrastructure/database/repositories/CompanyTrainingRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import { AssignTrainingToCompanyUseCase } from '@/application/use-cases/company-training';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const companyTrainingRepository = new CompanyTrainingRepository();
const companyRepository = new CompanyRepository();
const trainingRepository = new TrainingRepository();

/**
 * POST /api/consultant/trainings/[id]/assign
 * Assign a training to a company (by consultant)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultants can assign trainings
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const assignTrainingUseCase = new AssignTrainingToCompanyUseCase(
      companyTrainingRepository,
      companyRepository,
      trainingRepository
    );
    const result = await assignTrainingUseCase.execute(
      {
        companyId: body.companyId,
        trainingId: id,
        status: body.status || 'assigned',
      },
      user.id
    );

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/consultant/trainings/[id]/assign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
