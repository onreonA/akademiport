import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { EventStatisticsDto } from '@/application/dto/event/EventStatisticsDto';
import { logger } from '@/shared/utils/logger';

export class GetEventStatisticsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string): Promise<Result<EventStatisticsDto>> {
    try {
      if (!eventId || eventId.trim().length === 0) {
        return Result.fail(new AppError('Event ID is required', 400));
      }

      // Get event
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        return Result.fail(new AppError('Event not found', 404));
      }

      // Get attendees
      const attendees = await this.eventRepository.getAttendees(eventId);

      // Calculate statistics
      const totalRegistrations = attendees.length;
      const totalAttended = attendees.filter((a) => a.attendedAt !== null).length;
      const attendanceRate =
        totalRegistrations > 0 ? (totalAttended / totalRegistrations) * 100 : 0;

      // Capacity utilization
      const capacityUtilization =
        event.maxAttendees && event.maxAttendees > 0
          ? (totalRegistrations / event.maxAttendees) * 100
          : null;

      // Company-based statistics
      const companyMap = new Map<
        string,
        { companyName: string; registrations: number; attended: number }
      >();

      for (const attendee of attendees) {
        const existing = companyMap.get(attendee.companyId) || {
          companyName: attendee.companyName,
          registrations: 0,
          attended: 0,
        };

        existing.registrations++;
        if (attendee.attendedAt) {
          existing.attended++;
        }

        companyMap.set(attendee.companyId, existing);
      }

      const companyAttendance = Array.from(companyMap.entries()).map(([companyId, data]) => ({
        companyId,
        companyName: data.companyName,
        registrations: data.registrations,
        attended: data.attended,
        attendanceRate: data.registrations > 0 ? (data.attended / data.registrations) * 100 : 0,
      }));

      // Registrations by date
      const registrationsByDateMap = new Map<string, number>();
      for (const attendee of attendees) {
        const date = new Date(attendee.registeredAt).toISOString().split('T')[0];
        registrationsByDateMap.set(date, (registrationsByDateMap.get(date) || 0) + 1);
      }

      const registrationsByDate = Array.from(registrationsByDateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Status distribution
      const statusDistribution = {
        registered: totalRegistrations - totalAttended,
        attended: totalAttended,
        cancelled: 0, // Future: track cancellations
      };

      const statistics: EventStatisticsDto = {
        eventId: event.id,
        eventTitle: event.title,
        totalRegistrations,
        totalAttended,
        attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimals
        maxAttendees: event.maxAttendees,
        currentAttendees: totalRegistrations, // Use total registrations as current attendees for capacity
        capacityUtilization: capacityUtilization
          ? Math.round(capacityUtilization * 100) / 100
          : null,
        companiesCount: companyMap.size,
        companyAttendance,
        registrationsByDate,
        statusDistribution,
      };

      return Result.ok(statistics);
    } catch (error) {
      logger.error('Error getting event statistics:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to get event statistics', 500)
      );
    }
  }
}
