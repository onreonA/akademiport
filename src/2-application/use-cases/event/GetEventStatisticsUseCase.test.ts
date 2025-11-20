/**
 * Unit Tests for GetEventStatisticsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetEventStatisticsUseCase } from './GetEventStatisticsUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Event, EventAttendance } from '@/3-domain/entities/Event';
import { AppError } from '@/6-core/errors/AppError';

describe('GetEventStatisticsUseCase', () => {
  let mockRepository: IEventRepository;
  let useCase: GetEventStatisticsUseCase;

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

    useCase = new GetEventStatisticsUseCase(mockRepository);
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

  it('should get event statistics successfully', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId, maxAttendees: 100 });
    const mockAttendees: EventAttendance[] = [
      {
        id: 'attendance-1',
        eventId: eventId,
        userId: 'user-1',
        userName: 'User 1',
        companyId: 'company-1',
        companyName: 'Company 1',
        registeredAt: new Date('2025-01-10'),
        attendedAt: new Date('2025-01-15'),
        notes: null,
      },
      {
        id: 'attendance-2',
        eventId: eventId,
        userId: 'user-2',
        userName: 'User 2',
        companyId: 'company-1',
        companyName: 'Company 1',
        registeredAt: new Date('2025-01-11'),
        attendedAt: null,
        notes: null,
      },
    ];

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue(mockAttendees);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.totalRegistrations).toBe(2);
    expect(result.value?.totalAttended).toBe(1);
    expect(result.value?.attendanceRate).toBe(50);
    expect(result.value?.capacityUtilization).toBe(2); // 2/100 * 100
    expect(result.value?.companiesCount).toBe(1);
    expect(result.value?.companyAttendance).toHaveLength(1);
    expect(result.value?.companyAttendance[0].registrations).toBe(2);
    expect(result.value?.companyAttendance[0].attended).toBe(1);
    expect(mockRepository.findById).toHaveBeenCalledWith(eventId);
    expect(mockRepository.getAttendees).toHaveBeenCalledWith(eventId);
  });

  it('should calculate statistics correctly with multiple companies', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId, maxAttendees: 50 });
    const mockAttendees: EventAttendance[] = [
      {
        id: 'attendance-1',
        eventId: eventId,
        userId: 'user-1',
        userName: 'User 1',
        companyId: 'company-1',
        companyName: 'Company 1',
        registeredAt: new Date('2025-01-10'),
        attendedAt: new Date('2025-01-15'),
        notes: null,
      },
      {
        id: 'attendance-2',
        eventId: eventId,
        userId: 'user-2',
        userName: 'User 2',
        companyId: 'company-2',
        companyName: 'Company 2',
        registeredAt: new Date('2025-01-11'),
        attendedAt: new Date('2025-01-15'),
        notes: null,
      },
    ];

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue(mockAttendees);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.companiesCount).toBe(2);
    expect(result.value?.companyAttendance).toHaveLength(2);
    expect(result.value?.attendanceRate).toBe(100); // 2 attended out of 2 registered
  });

  it('should handle event without max attendees', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId, maxAttendees: null });
    const mockAttendees: EventAttendance[] = [
      {
        id: 'attendance-1',
        eventId: eventId,
        userId: 'user-1',
        userName: 'User 1',
        companyId: 'company-1',
        companyName: 'Company 1',
        registeredAt: new Date('2025-01-10'),
        attendedAt: null,
        notes: null,
      },
    ];

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue(mockAttendees);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.capacityUtilization).toBeNull();
  });

  it('should return zero statistics when no attendees', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.totalRegistrations).toBe(0);
    expect(result.value?.totalAttended).toBe(0);
    expect(result.value?.attendanceRate).toBe(0);
    expect(result.value?.companiesCount).toBe(0);
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
});
