import { NextRequest, NextResponse } from 'next/server';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
import { MarkEventAttendanceAsAttendedUseCase } from '@/2-application/use-cases/event';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

const eventRepository = new EventRepository();

/**
 * PATCH /api/events/[id]/attendance/[attendanceId]
 * Mark attendance as attended (Consultant/Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attendanceId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and admin can mark attendance
    if (user.role !== 'consultant' && user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: eventId, attendanceId } = await params;

    // Get event to verify ownership (for consultants) or get consultantId (for admins)
    const event = await eventRepository.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // For consultants, verify they own the event
    if (user.role === 'consultant') {
      if (!user.id || event.consultantId !== user.id) {
        return NextResponse.json(
          { error: 'You can only mark attendance for your own events' },
          { status: 403 }
        );
      }
    }

    // Use event's consultantId for admin/master_admin, or user.id for consultant
    const consultantId = user.role === 'consultant' ? user.id : event.consultantId || user.id;

    const markAttendanceUseCase = new MarkEventAttendanceAsAttendedUseCase(eventRepository);
    const result = await markAttendanceUseCase.execute(attendanceId, eventId, consultantId);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({
      success: true,
      attendance: result.value,
    });
  } catch (error) {
    logger.error('Error in PATCH /api/events/[id]/attendance/[attendanceId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
