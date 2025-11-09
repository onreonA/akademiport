/**
 * Project Hierarchy API Route
 * GET /api/projects/[id]/hierarchy
 *
 * Returns project with all sub-projects and tasks in a single call
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { GetProjectHierarchyUseCase } from '@/application/use-cases/project/GetProjectHierarchyUseCase';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { logger } from '@/shared/utils/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    logger.info('🔍 [Hierarchy API] Request received');

    // Authentication
    const user = await getAuthenticatedUser(req);
    if (!user) {
      logger.info('❌ [Hierarchy API] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    logger.info('📋 [Hierarchy API] Project ID:', projectId);
    logger.info('👤 [Hierarchy API] User:', { id: user.id, role: user.role });

    // Initialize repositories
    const projectRepository = new ProjectRepository();
    const subProjectRepository = new SubProjectRepository();
    const taskRepository = new TaskRepository();

    // Execute use case
    const useCase = new GetProjectHierarchyUseCase(
      projectRepository,
      subProjectRepository,
      taskRepository
    );

    const result = await useCase.execute(projectId);

    if (!result.isSuccess) {
      logger.info('❌ [Hierarchy API] Use case failed:', result.error?.message);
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch project hierarchy' },
        { status: result.error?.statusCode || 500 }
      );
    }

    logger.info('✅ [Hierarchy API] Success:', {
      subProjects: result.value?.subProjects.length,
      totalTasks: result.value?.stats.totalTasks,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('❌ [Hierarchy API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
