import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { rateLimitConfigs, withSecurity } from '@/lib/security';
import { createClient } from '@/lib/supabase/server';
import { projectSchemas, validateRequest } from '@/lib/validation';

export const POST = withSecurity(rateLimitConfigs.api)(async function (
  request: NextRequest
) {
  const startTime = Date.now();
  const requestContext = logger.extractRequestContext(request);

  try {
    logger.info('Creating new project', requestContext);

    const supabase = createClient();
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(projectSchemas.create, body);
    if (!validation.success) {
      logger.warn('Project creation validation failed', {
        ...requestContext,
        errors: validation.errors,
      });

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      logger.warn(
        'Project creation failed - authentication required',
        requestContext
      );
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      logger.warn('Project creation failed - insufficient permissions', {
        ...requestContext,
        userRole,
      });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Projeyi oluştur - validated data kullan
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status || 'Aktif',
        start_date: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        end_date: validatedData.endDate
          ? new Date(validatedData.endDate)
          : null,
        progress: 0, // Yeni proje için 0
        consultant_id: validatedData.consultantId,
        admin_note: validatedData.adminNote,
      })
      .select()
      .single();

    if (error) {
      logger.error('Project creation failed - database error', {
        ...requestContext,
        error: error.message,
      });
      return NextResponse.json(
        { error: 'Failed to create project', details: error },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Project created successfully', {
      ...requestContext,
      projectId: project.id,
      duration,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Project creation failed - unexpected error', {
      ...requestContext,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Projeleri getir
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
