import { NextRequest, NextResponse } from 'next/server';
import { EventRepository } from '@/infrastructure/database/repositories/EventRepository';
import {
  RegisterEventAttendanceUseCase,
  GetEventAttendeesUseCase,
} from '@/application/use-cases/event';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import { RegisterAttendanceDtoSchema } from '@/application/dto/event';

const eventRepository = new EventRepository();

/**
 * GET /api/events/[id]/attendance
 * Get event attendees
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const getAttendeesUseCase = new GetEventAttendeesUseCase(eventRepository);
    const result = await getAttendeesUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      attendees: result.value,
    });
  } catch (error) {
    logger.error('Error in GET /api/events/[id]/attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/events/[id]/attendance
 * Register attendance for an event
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only company users can register attendance
    if (user.role !== 'company_admin' && user.role !== 'company_user') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = RegisterAttendanceDtoSchema.safeParse({
      eventId: id,
      userId: user.id,
      companyId: user.companyId,
      notes: body.notes,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const registerAttendanceUseCase = new RegisterEventAttendanceUseCase(eventRepository);
    const result = await registerAttendanceUseCase.execute(
      validationResult.data.eventId,
      validationResult.data.userId,
      validationResult.data.companyId,
      validationResult.data.notes || undefined
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
        attendance: result.value,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/events/[id]/attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
