import { NextRequest, NextResponse } from 'next/server';
import { CompanyTrainingRepository } from '@/4-infrastructure/database/repositories/CompanyTrainingRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { TrainingVideoRepository } from '@/4-infrastructure/database/repositories/TrainingVideoRepository';
import { TrainingDocumentRepository } from '@/4-infrastructure/database/repositories/TrainingDocumentRepository';
import {
  AssignTrainingToCompanyUseCase,
  ListCompanyTrainingsUseCase,
} from '@/2-application/use-cases/company-training';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

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

    logger.info('📋 [GET /api/companies/[id]/trainings] Request:', {
      companyId: id,
      userId: user.id,
      userRole: user.role,
      userCompanyId: user.companyId,
    });

    // Authorization: Company users can only see their own company's trainings
    if (user.role === 'company_user' || user.role === 'company_admin') {
      if (user.companyId !== id) {
        logger.warn('🚫 [GET /api/companies/[id]/trainings] Forbidden:', {
          requestedCompanyId: id,
          userCompanyId: user.companyId,
        });
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
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      logger.error('❌ [GET /api/companies/[id]/trainings] Use case failed:', {
        error: error.message,
        statusCode: error.statusCode,
      });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    logger.info('✅ [GET /api/companies/[id]/trainings] Success:', {
      trainingsCount: result.value?.length || 0,
    });

    // Get debug info from use case
    const debugInfo = listCompanyTrainingsUseCase.getDebugInfo?.();

    // Include debug info in response for development
    const response = {
      trainings: result.value,
      _debug:
        process.env.NODE_ENV === 'development'
          ? {
              companyId: id,
              trainingsCount: result.value?.length || 0,
              timestamp: new Date().toISOString(),
              useCaseDebug: debugInfo,
            }
          : undefined,
    };

    return NextResponse.json(response);
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
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/companies/[id]/trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
