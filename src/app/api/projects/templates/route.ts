import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { GetProjectTemplatesUseCase } from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

/**
 * GET /api/projects/templates
 * Get all project templates
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Templates API] Starting...');

    const user = await getAuthenticatedUser();
    console.log('👤 [Templates API] User:', { id: user.id, role: user.role, email: user.email });

    // Only master_admin and program_manager can access templates
    if (user.role !== 'master_admin' && user.role !== 'program_manager') {
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
      return NextResponse.json(
        {
          error: result.error?.message || 'Failed to get templates',
          details: {
            message: result.error?.message,
            code: result.error?.code,
            statusCode: result.error?.statusCode,
          },
        },
        { status: 400 }
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
