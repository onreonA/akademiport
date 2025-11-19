/**
 * POST /api/reports/templates
 *
 * Yeni rapor şablonu oluşturur
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';
import type { AppError } from '@/6-core/errors/AppError';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Skip execution during build time
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      (process.env.NODE_ENV === 'production' && !process.env.VERCEL)
    ) {
      return NextResponse.json({ error: 'Skipped during build' }, { status: 200 });
    }

    // Lazy import to avoid build-time execution
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { CreateReportTemplateUseCase } = await import('@/2-application/use-cases/report');
    const { SupabaseReportTemplateRepository } = await import(
      '@/4-infrastructure/database/repositories/SupabaseReportTemplateRepository'
    );
    const { AppError } = await import('@/6-core/errors/AppError');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can create templates
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'name is required and must be a string' }, { status: 400 });
    }

    if (!body.reportType || typeof body.reportType !== 'string') {
      return NextResponse.json(
        { error: 'reportType is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize repository
    const templateRepository = new SupabaseReportTemplateRepository();

    // Create use case
    const useCase = new CreateReportTemplateUseCase(templateRepository);

    // Execute
    const result = await useCase.execute({
      name: body.name,
      description: body.description,
      reportType: body.reportType,
      templateContent: body.templateContent,
      sections: body.sections,
      aiEnabled: body.aiEnabled,
      aiUseCase: body.aiUseCase,
      metadata: body.metadata,
    });

    if (result.isFailure) {
      logger.error('Failed to create template:', result.error);
      return NextResponse.json(
        {
          error:
            result.error instanceof AppError ? result.error.message : 'Failed to create template',
        },
        { status: result.error instanceof AppError ? result.error.statusCode : 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: result.value.id },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/reports/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
