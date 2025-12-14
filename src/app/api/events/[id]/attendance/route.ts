import { NextRequest, NextResponse } from 'next/server';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
import {
  RegisterEventAttendanceUseCase,
  GetEventAttendeesUseCase,
} from '@/2-application/use-cases/event';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { RegisterAttendanceDtoSchema } from '@/2-application/dtos/event/RegisterAttendanceDto';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

// Create repositories - can be mocked in tests
const eventRepository = new EventRepository();
const leaderboardRepository = new SupabaseLeaderboardRepository();
const companyRepository = new CompanyRepository();
const addLeaderboardScore = new AddLeaderboardScoreUseCase(
  leaderboardRepository,
  companyRepository
);

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

    // Authorization: Check if user has access to this event's attendees
    const event = await eventRepository.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Company users can only see attendees for events in their program
    if (user.role === 'company_admin' || user.role === 'company_user') {
      if (!user.companyId) {
        return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
      }

      const companyResult = await companyRepository.findById(user.companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const company = companyResult.value;
      if (company.programId !== event.programId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const getAttendeesUseCase = new GetEventAttendeesUseCase(eventRepository);
    const result = await getAttendeesUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
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

    // Parse body if present, otherwise use empty object
    let body = {};
    try {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        body = await request.json().catch(() => ({}));
      }
    } catch (error) {
      // Body is optional, continue with empty object
      body = {};
    }

    // Validate request body
    const validationResult = RegisterAttendanceDtoSchema.safeParse({
      eventId: id,
      userId: user.id,
      companyId: user.companyId,
      notes: (body as { notes?: string }).notes,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const registerAttendanceUseCase = new RegisterEventAttendanceUseCase(
      eventRepository,
      addLeaderboardScore
    );
    const result = await registerAttendanceUseCase.execute(
      validationResult.data.eventId,
      validationResult.data.userId,
      validationResult.data.companyId,
      validationResult.data.notes || undefined
    );

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
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
