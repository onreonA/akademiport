import { NextRequest, NextResponse } from 'next/server';
import { EventRepository } from '@/infrastructure/database/repositories/EventRepository';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CreateEventUseCase, ListEventsUseCase } from '@/application/use-cases/event';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import { CreateEventDtoSchema, EventFilterDtoSchema } from '@/application/dto/event';
import { UserRole } from '@/domain/enums/UserRole';

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
        finalConsultantId = null; // Don't filter by consultantId
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
        finalConsultantId = null; // Don't filter by consultantId
        // Don't set finalProgramId - let it be null so no events are returned
        // This forces the consultant to select a program
      }
    }

    // Parse dates
    const filters: any = {
      programId: finalProgramId || null,
      consultantId: finalConsultantId || null,
      category,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      search,
      page,
      limit,
    };

    // Validate filters
    const validationResult = EventFilterDtoSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const listEventsUseCase = new ListEventsUseCase(eventRepository);
    const result = await listEventsUseCase.execute(validationResult.data);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Validate request body
    const validationResult = CreateEventDtoSchema.safeParse({
      ...body,
      startTime: body.startTime,
      endTime: body.endTime,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
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
          validationResult.data.consultantId || (user.role === 'consultant' ? user.id : undefined),
        createdBy: user.id,
      },
      user.id,
      validationResult.data.createZoomMeeting ?? true
    );

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
