import { NextRequest, NextResponse } from 'next/server';
import { CompanyTrainingRepository } from '@/infrastructure/database/repositories/CompanyTrainingRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import { TrainingVideoRepository } from '@/infrastructure/database/repositories/TrainingVideoRepository';
import { TrainingDocumentRepository } from '@/infrastructure/database/repositories/TrainingDocumentRepository';
import {
  AssignTrainingToCompanyUseCase,
  ListCompanyTrainingsUseCase,
} from '@/application/use-cases/company-training';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';

const companyTrainingRepository = new CompanyTrainingRepository();
const companyRepository = new CompanyRepository();
const trainingRepository = new TrainingRepository();
const trainingVideoRepository = new TrainingVideoRepository();
const trainingDocumentRepository = new TrainingDocumentRepository();

/**
 * GET /api/companies/[id]/trainings
 * List all trainings assigned to a company
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Authorization: Company users can only see their own company's trainings
    if (user.role === 'company_user' || user.role === 'company_admin') {
      if (user.companyId !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const listCompanyTrainingsUseCase = new ListCompanyTrainingsUseCase(
      companyTrainingRepository,
      companyRepository,
      trainingRepository,
      trainingVideoRepository,
      trainingDocumentRepository
    );
    const result = await listCompanyTrainingsUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ trainings: result.value });
  } catch (error) {
    logger.error('Error in GET /api/companies/[id]/trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/companies/[id]/trainings
 * Assign a training to a company
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can assign trainings
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const assignTrainingUseCase = new AssignTrainingToCompanyUseCase(
      companyTrainingRepository,
      companyRepository,
      trainingRepository
    );

    const result = await assignTrainingUseCase.execute(
      {
        companyId: id,
        trainingId: body.trainingId,
      },
      user.id
    );

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/companies/[id]/trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
