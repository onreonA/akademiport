import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/shared/utils/logger';

export class MarkEventAttendanceAsAttendedUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(attendanceId: string, eventId: string, consultantId: string): Promise<Result<any>> {
    try {
      if (!attendanceId || attendanceId.trim().length === 0) {
        return Result.fail(new AppError('Attendance ID is required', 400));
      }

      if (!eventId || eventId.trim().length === 0) {
        return Result.fail(new AppError('Event ID is required', 400));
      }

      if (!consultantId || consultantId.trim().length === 0) {
        return Result.fail(new AppError('Consultant ID is required', 400));
      }

      // Get event to verify consultant ownership
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        return Result.fail(new AppError('Event not found', 404));
      }

      // Verify consultant owns this event
      if (event.consultantId !== consultantId) {
        return Result.fail(new AppError('You can only mark attendance for your own events', 403));
      }

      // Get attendees to find the attendance record
      const attendees = await this.eventRepository.getAttendees(eventId);
      const attendance = attendees.find((a) => a.id === attendanceId);

      if (!attendance) {
        return Result.fail(new AppError('Attendance record not found', 404));
      }

      // Check if already marked as attended
      if (attendance.attendedAt) {
        return Result.fail(new AppError('Attendance already marked as attended', 400));
      }

      // Mark as attended
      const updatedAttendance = await this.eventRepository.markAttendanceAsAttended(attendanceId);

      return Result.ok(updatedAttendance);
    } catch (error) {
      logger.error('Error marking attendance as attended:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to mark attendance as attended',
          500
        )
      );
    }
  }
}
