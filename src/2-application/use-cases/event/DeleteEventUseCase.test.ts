/**
 * Unit Tests for DeleteEventUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteEventUseCase } from './DeleteEventUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { NotificationService } from '@/5-shared/services/notification';
import { Event } from '@/3-domain/entities/Event';
import type { EventStatus, EventCategory } from '@/3-domain/entities/Event';

// Mock ZoomApiService
vi.mock('@/infrastructure/external/zoom-api.service', () => ({
  ZoomApiService: {
    deleteMeeting: vi.fn(),
  },
}));

describe('DeleteEventUseCase', () => {
  let mockRepository: IEventRepository;
  let mockNotificationService: NotificationService;
  let useCase: DeleteEventUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByDateRange: vi.fn(),
      findByConsultantId: vi.fn(),
      findByProgramId: vi.fn(),
      getAttendees: vi.fn(),
      updateZoomMeeting: vi.fn(),
    };

    mockNotificationService = {
      sendEventCancelled: vi.fn(),
      sendEventUpdated: vi.fn(),
      sendAppointmentCancelled: vi.fn(),
      sendTaskApproved: vi.fn(),
      sendTaskRejected: vi.fn(),
      sendTaskCompleted: vi.fn(),
    } as any;

    useCase = new DeleteEventUseCase(mockRepository, mockNotificationService);
  });

  const createMockEvent = (overrides?: Partial<Event>): Event => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    return {
      id: 'event-1',
      programId: 'program-1',
      consultantId: 'consultant-1',
      title: 'Test Event',
      description: 'Test Description',
      startTime,
      endTime,
      timezone: 'Europe/Istanbul',
      location: null,
      category: 'training' as EventCategory,
      status: 'scheduled' as EventStatus,
      maxAttendees: 50,
      currentAttendees: 0,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should delete event successfully', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(eventId);
    expect(mockRepository.delete).toHaveBeenCalledWith(eventId);
  });

  it('should delete Zoom meeting when event has zoomMeetingId', async () => {
    const eventId = 'event-1';
    const zoomMeetingId = 'zoom-123';
    const mockEvent = createMockEvent({ id: eventId, zoomMeetingId });

    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.deleteMeeting).mockResolvedValue(undefined);

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(ZoomApiService.deleteMeeting).toHaveBeenCalledWith(zoomMeetingId);
  });

  it('should continue even if Zoom deletion fails', async () => {
    const eventId = 'event-1';
    const zoomMeetingId = 'zoom-123';
    const mockEvent = createMockEvent({ id: eventId, zoomMeetingId });

    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.deleteMeeting).mockRejectedValue(new Error('Zoom API error'));

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalled();
  });

  it('should send notifications to attendees', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });
    const attendees = [{ userId: 'user-1' }, { userId: 'user-2' }];

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue(attendees);
    vi.mocked(mockNotificationService.sendEventCancelled).mockResolvedValue(undefined);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(mockNotificationService.sendEventCancelled).toHaveBeenCalledTimes(2);
  });

  it('should continue even if notification fails', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });
    const attendees = [{ userId: 'user-1' }];

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue(attendees);
    vi.mocked(mockNotificationService.sendEventCancelled).mockRejectedValue(
      new Error('Notification failed')
    );

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalled();
  });

  it('should return error when event ID is empty', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event ID is required');
    expect(result.error?.statusCode).toBe(400);
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when event not found', async () => {
    const eventId = 'non-existent';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const eventId = 'event-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
