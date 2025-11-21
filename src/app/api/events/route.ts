import { NextRequest, NextResponse } from 'next/server';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CreateEventUseCase, ListEventsUseCase } from '@/2-application/use-cases/event';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { logger } from '@/5-shared/utils/logger';
import { CreateEventDtoSchema, EventFilterDtoSchema } from '@/2-application/dto/event';
import { EventFilterDto } from '@/2-application/dto/event';
import { UserRole } from '@/3-domain/enums/UserRole';
import { AppError } from '@/6-core/errors/AppError';
import type { z } from 'zod';

const eventRepository = new EventRepository();
const userRepository = new UserRepository();

/**
 * GET /api/events
 * List all events with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId') || undefined;
    const consultantId = searchParams.get('consultantId') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Authorization: Consultants can see events from their assigned programs
    let finalConsultantId = consultantId;
    let finalProgramId = programId;

    if (user.role === UserRole.CONSULTANT) {
      // Consultant can see events from their assigned programs
      // Get consultant's programs first
      const programsResult = await userRepository.getPrograms(user.id);
      const consultantPrograms = programsResult.isSuccess ? programsResult.value || [] : [];

      logger.info('Consultant events request', {
        userId: user.id,
        requestedProgramId: programId,
        consultantProgramIds: consultantPrograms.map((p) => p.id),
      });

      if (programId) {
        // If programId is provided, verify consultant has access to that program
        const hasAccess = consultantPrograms.some((p) => p.id === programId);
        if (!hasAccess) {
          logger.warn('Consultant access denied', {
            userId: user.id,
            requestedProgramId: programId,
            consultantProgramIds: consultantPrograms.map((p) => p.id),
          });
          return NextResponse.json({ error: 'Bu programa erişim yetkiniz yok' }, { status: 403 });
        }
        // Consultant can see all events in their assigned programs (not just their own)
        finalConsultantId = undefined; // Don't filter by consultantId
        finalProgramId = programId;
      } else {
        // If no programId provided, consultant should select a program first
        // Return empty result with a helpful message
        if (consultantPrograms.length === 0) {
          logger.info('Consultant has no programs assigned', { userId: user.id });
          return NextResponse.json({
            success: true,
            events: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          });
        }
        // If consultant has programs but didn't select one, return empty
        // They should select a program from the dropdown
        logger.info('Consultant did not select a program', {
          userId: user.id,
          availablePrograms: consultantPrograms.map((p) => ({ id: p.id, name: p.name })),
        });
        finalConsultantId = undefined; // Don't filter by consultantId
        // Don't set finalProgramId - let it be undefined so no events are returned
        // This forces the consultant to select a program
      }
    }

    // Prepare filters for validation (schema expects nullable strings for UUIDs, optional for others)
    const filtersForValidation: z.infer<typeof EventFilterDtoSchema> = {
      programId: finalProgramId || null,
      consultantId: finalConsultantId || null,
      category: category || undefined, // optional() accepts undefined, not null
      status: status || undefined, // optional() accepts undefined, not null
      startDate: startDate || null,
      endDate: endDate || null,
      search: search || undefined, // optional() accepts undefined, not null
      page,
      limit,
    };

    // Validate filters
    const validationResult = EventFilterDtoSchema.safeParse(filtersForValidation);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      const errorMessage = `Geçersiz filtreler: ${errorMessages.join(', ')}`;
      logger.warn('Event filter validation failed:', {
        filters: filtersForValidation,
        issues: validationResult.error.issues,
      });
      return NextResponse.json(
        { error: errorMessage, details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Convert validated data to EventFilterDto (convert string dates to Date objects)
    const filtersForUseCase = {
      ...validationResult.data,
      programId: validationResult.data.programId || undefined,
      consultantId: validationResult.data.consultantId || undefined,
      startDate: validationResult.data.startDate
        ? new Date(validationResult.data.startDate)
        : undefined,
      endDate: validationResult.data.endDate ? new Date(validationResult.data.endDate) : undefined,
    } as EventFilterDto;

    const listEventsUseCase = new ListEventsUseCase(eventRepository);
    const result = await listEventsUseCase.execute(filtersForUseCase);

    if (result.isFailure) {
      let errorMessage = 'Etkinlikler yüklenemedi';
      let statusCode = 500;

      if (result.error instanceof AppError) {
        errorMessage = result.error.message;
        statusCode = result.error.statusCode;
      } else if (result.error instanceof Error) {
        errorMessage = result.error.message;
      } else if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (typeof result.error === 'object' && result.error !== null) {
        if ('message' in result.error) {
          errorMessage = String(result.error.message);
        } else {
          errorMessage = JSON.stringify(result.error);
        }
      } else {
        errorMessage = String(result.error);
      }

      logger.error('ListEventsUseCase failed:', { error: result.error, errorMessage });
      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    return NextResponse.json({
      success: true,
      events: result.value.events,
      pagination: {
        page: result.value.page,
        limit: result.value.limit,
        total: result.value.total,
        totalPages: result.value.totalPages,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/events:', error);

    let errorMessage = 'Etkinlikler yüklenirken beklenmeyen bir hata oluştu';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin, program_manager, and consultant can create events
    if (
      user.role !== 'master_admin' &&
      user.role !== 'program_manager' &&
      user.role !== 'consultant'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Add consultantId for consultants if not provided
    const isConsultant = user.role === 'consultant';
    const bodyWithConsultantId = {
      ...body,
      consultantId: body.consultantId || (isConsultant ? user.id : undefined),
    };

    // Validate request body
    const validationResult = CreateEventDtoSchema.safeParse({
      ...bodyWithConsultantId,
      startTime: body.startTime,
      endTime: body.endTime,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const createEventUseCase = new CreateEventUseCase(eventRepository);
    const result = await createEventUseCase.execute(
      {
        ...validationResult.data,
        startTime: new Date(validationResult.data.startTime),
        endTime: new Date(validationResult.data.endTime),
        consultantId:
          validationResult.data.consultantId || (user.role === 'consultant' ? user.id : ''),
      },
      user.id,
      validationResult.data.createZoomMeeting ?? true
    );

    if (result.isFailure) {
      let errorMessage = 'Etkinlik oluşturulamadı';
      let statusCode = 500;

      if (result.error instanceof AppError) {
        errorMessage = result.error.message;
        statusCode = result.error.statusCode;
      } else if (result.error instanceof Error) {
        errorMessage = result.error.message;
      } else if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (typeof result.error === 'object' && result.error !== null) {
        if ('message' in result.error) {
          errorMessage = String(result.error.message);
        } else {
          errorMessage = JSON.stringify(result.error);
        }
      } else {
        errorMessage = String(result.error);
      }

      logger.error('CreateEventUseCase failed:', { error: result.error, errorMessage });
      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    return NextResponse.json(
      {
        success: true,
        ...result.value,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/events:', error);

    let errorMessage = 'Etkinlik oluşturulurken beklenmeyen bir hata oluştu';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
