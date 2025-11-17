/**
 * POST /api/reports/templates
 *
 * Yeni rapor şablonu oluşturur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { CreateReportTemplateUseCase } from '@/2-application/use-cases/report';
import { SupabaseReportTemplateRepository } from '@/4-infrastructure/database/repositories/SupabaseReportTemplateRepository';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export async function POST(request: NextRequest) {
  try {
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
