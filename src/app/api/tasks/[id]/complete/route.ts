import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/4-infrastructure/database/repositories/TaskRepository';
import { CompleteTaskUseCase } from '@/2-application/use-cases/task';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';

const taskRepository = new TaskRepository();
const leaderboardRepository = new SupabaseLeaderboardRepository();
const companyRepository = new CompanyRepository();
const addLeaderboardScore = new AddLeaderboardScoreUseCase(
  leaderboardRepository,
  companyRepository
);

/**
 * POST /api/tasks/[id]/complete
 * Complete a task (company user)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get company to find programId
    const companyResult = await companyRepository.findById(user.companyId);
    if (companyResult.isFailure || !companyResult.value) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const programId = companyResult.value.programId;

    const completeTaskUseCase = new CompleteTaskUseCase(taskRepository, addLeaderboardScore);
    const result = await completeTaskUseCase.execute(id, user.companyId, programId);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task marked as completed and sent for review',
    });
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
