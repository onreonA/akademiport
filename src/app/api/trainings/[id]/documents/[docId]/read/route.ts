import { NextRequest, NextResponse } from 'next/server';
import { TrainingProgressRepository } from '@/infrastructure/database/repositories/TrainingProgressRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import { UpdateTrainingProgressUseCase } from '@/application/use-cases/training-progress';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const trainingProgressRepository = new TrainingProgressRepository();
const companyRepository = new CompanyRepository();
const trainingRepository = new TrainingRepository();

/**
 * POST /api/trainings/[id]/documents/[docId]/read
 * Mark a document as read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only company users can mark documents as read
    if (user.role !== 'company_user' && user.role !== 'company_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 403 });
    }

    const { id, docId } = await params;
    const body = await request.json();

    const updateProgressUseCase = new UpdateTrainingProgressUseCase(
      trainingProgressRepository,
      companyRepository,
      trainingRepository
    );

    const progressPercentage = body.progressPercentage || 100;
    const result = await updateProgressUseCase.execute(user.companyId, id, {
      companyId: user.companyId,
      trainingId: id,
      documentId: docId,
      progressPercentage,
      readAt: new Date(),
      completedAt: progressPercentage === 100 ? new Date() : null,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/trainings/[id]/documents/[docId]/read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
