/**
 * Unit Tests for GetEventAttendeesUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetEventAttendeesUseCase } from './GetEventAttendeesUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Event, EventAttendance } from '@/3-domain/entities/Event';
import { AppError } from '@/6-core/errors/AppError';

describe('GetEventAttendeesUseCase', () => {
  let mockRepository: IEventRepository;
  let useCase: GetEventAttendeesUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getAttendees: vi.fn(),
      exists: vi.fn(),
      registerAttendance: vi.fn(),
      cancelAttendance: vi.fn(),
      findByUserId: vi.fn(),
      findByCompanyId: vi.fn(),
      updateAttendeeCount: vi.fn(),
      findByDateRange: vi.fn(),
      findByConsultantId: vi.fn(),
      findByProgramId: vi.fn(),
      updateZoomMeeting: vi.fn(),
    } as any;

    useCase = new GetEventAttendeesUseCase(mockRepository);
  });

  const createMockEvent = (overrides?: Partial<Event>): Event => {
    const startTime = new Date('2025-01-15T10:00:00Z');
    const endTime = new Date('2025-01-15T12:00:00Z');

    return {
      id: 'event-1',
      programId: 'program-1',
      consultantId: 'consultant-1',
      title: 'Test Event',
      description: 'Test Description',
      category: 'webinar' as const,
      status: 'scheduled' as const,
      startTime,
      endTime,
      timezone: 'Europe/Istanbul',
      attendanceRequired: true,
      maxAttendees: 100,
      currentAttendees: 0,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      organizerName: null,
      organizerEmail: null,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      ...overrides,
    };
  };

  it('should get event attendees successfully', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });
    const mockAttendees: EventAttendance[] = [
      {
        id: 'attendance-1',
        eventId: eventId,
        userId: 'user-1',
        userName: 'User 1',
        companyId: 'company-1',
        companyName: 'Company 1',
        registeredAt: new Date(),
        attendedAt: null,
        notes: null,
      },
      {
        id: 'attendance-2',
        eventId: eventId,
        userId: 'user-2',
        userName: 'User 2',
        companyId: 'company-2',
        companyName: 'Company 2',
        registeredAt: new Date(),
        attendedAt: null,
        notes: null,
      },
    ];

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue(mockAttendees);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockAttendees);
    expect(mockRepository.findById).toHaveBeenCalledWith(eventId);
    expect(mockRepository.getAttendees).toHaveBeenCalledWith(eventId);
  });

  it('should return empty array when no attendees', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
  });

  it('should fail when event ID is empty', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should fail when event not found', async () => {
    const eventId = 'non-existent';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.getAttendees).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const eventId = 'event-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });

  it('should handle getAttendees errors', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });
    const errorMessage = 'Failed to get attendees';

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
