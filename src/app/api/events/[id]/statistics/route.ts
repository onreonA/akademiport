import { NextRequest, NextResponse } from 'next/server';
import { EventRepository } from '@/infrastructure/database/repositories/EventRepository';
import { GetEventStatisticsUseCase } from '@/application/use-cases/event/GetEventStatisticsUseCase';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import { UserRole } from '@/domain/enums/UserRole';

const eventRepository = new EventRepository();

/**
 * GET /api/events/[id]/statistics
 * Get event statistics
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Authorization: Check if user has access to this event
    const event = await eventRepository.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Role-based access control
    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_USER) {
      // Company users can only see statistics for events they're registered to
      const attendees = await eventRepository.getAttendees(id);
      const userAttendance = attendees.find((a) => a.userId === user.id);
      if (!userAttendance && user.companyId !== event.programId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === UserRole.CONSULTANT) {
      // Consultants can only see statistics for their own events
      if (event.consultantId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // Admin and Program Manager can see all statistics

    const getStatisticsUseCase = new GetEventStatisticsUseCase(eventRepository);
    const result = await getStatisticsUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({
      success: true,
      statistics: result.value,
    });
  } catch (error) {
    logger.error('Error in GET /api/events/[id]/statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
