import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { GetProjectTemplatesUseCase } from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

/**
 * GET /api/projects/templates
 * Get all project templates
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Templates API] Starting...');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('👤 [Templates API] User:', { id: user.id, role: user.role, email: user.email });

    // Only master_admin, program_manager, and consultant can access templates
    if (
      user.role !== 'master_admin' &&
      user.role !== 'program_manager' &&
      user.role !== 'consultant'
    ) {
      console.error('❌ [Templates API] Unauthorized role:', user.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('✅ [Templates API] Authorization passed');

    const projectRepository = new ProjectRepository();
    const getTemplatesUseCase = new GetProjectTemplatesUseCase(projectRepository);

    console.log('🔄 [Templates API] Executing use case...');
    const result = await getTemplatesUseCase.execute();

    console.log('📊 [Templates API] Use case result:', {
      isSuccess: result.isSuccess,
      hasData: result.isSuccess && !!result.value,
      dataLength: result.isSuccess ? result.value?.length : 0,
      hasError: !!result.error,
      errorMessage: result.error?.message,
    });

    if (!result.isSuccess) {
      console.error('❌ [Templates API] Use case failed:', {
        error: result.error,
        message: result.error?.message,
        stack: result.error?.stack,
      });

      // Return more detailed error for debugging
      const error =
        result.error instanceof AppError
          ? result.error
          : new AppError('Failed to get templates', 400);
      return NextResponse.json(
        {
          error: error.message,
          details: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          },
        },
        { status: error.statusCode }
      );
    }

    console.log('✅ [Templates API] Success! Found templates:', result.value?.length || 0);
    return NextResponse.json({
      success: true,
      templates: result.value,
    });
  } catch (error) {
    console.error('💥 [Templates API] Unexpected error:', error);
    console.error(
      '💥 [Templates API] Error stack:',
      error instanceof Error ? error.stack : 'No stack'
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}
