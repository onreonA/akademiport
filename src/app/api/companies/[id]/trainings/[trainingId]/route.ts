import { NextRequest, NextResponse } from 'next/server';
import { CompanyTrainingRepository } from '@/infrastructure/database/repositories/CompanyTrainingRepository';
import { RemoveTrainingFromCompanyUseCase } from '@/application/use-cases/company-training';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const companyTrainingRepository = new CompanyTrainingRepository();

/**
 * DELETE /api/companies/[id]/trainings/[trainingId]
 * Remove a training from a company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trainingId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can remove trainings
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, trainingId } = await params;

    const removeTrainingUseCase = new RemoveTrainingFromCompanyUseCase(companyTrainingRepository);
    const result = await removeTrainingUseCase.execute(id, trainingId);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/companies/[id]/trainings/[trainingId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
