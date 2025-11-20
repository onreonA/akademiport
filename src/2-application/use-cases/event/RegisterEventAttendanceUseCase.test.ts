/**
 * Unit Tests for RegisterEventAttendanceUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterEventAttendanceUseCase } from './RegisterEventAttendanceUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { Event, EventAttendance } from '@/3-domain/entities/Event';
import type { EventStatus, EventCategory } from '@/3-domain/entities/Event';
import { ActivityType } from '@/3-domain/enums/LeaderboardEnums';
import { AppError } from '@/6-core/errors/AppError';

// Mock EventEntity
vi.mock('@/3-domain/entities/Event', async () => {
  const actual = await vi.importActual('@/3-domain/entities/Event');
  return {
    ...actual,
    EventEntity: class {
      constructor(private event: Event) {}
      canRegister() {
        return (
          this.event.status === 'scheduled' &&
          this.event.maxAttendees &&
          this.event.currentAttendees < this.event.maxAttendees
        );
      }
    },
  };
});

describe('RegisterEventAttendanceUseCase', () => {
  let mockRepository: IEventRepository;
  let mockAddLeaderboardScore: AddLeaderboardScoreUseCase;
  let useCase: RegisterEventAttendanceUseCase;

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
      registerAttendance: vi.fn(),
      exists: vi.fn(),
      cancelAttendance: vi.fn(),
      findByUserId: vi.fn(),
      findByCompanyId: vi.fn(),
      updateAttendeeCount: vi.fn(),
    } as any;

    mockAddLeaderboardScore = {
      execute: vi.fn(),
    } as any;

    useCase = new RegisterEventAttendanceUseCase(mockRepository, mockAddLeaderboardScore);
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
      category: 'webinar' as EventCategory,
      status: 'scheduled' as EventStatus,
      attendanceRequired: true,
      maxAttendees: 50,
      currentAttendees: 0,
      organizerName: null,
      organizerEmail: null,
      isPublic: true,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      ...overrides,
    };
  };

  it('should register attendance successfully', async () => {
    const eventId = 'event-1';
    const userId = 'user-1';
    const companyId = 'company-1';
    const mockEvent = createMockEvent({
      id: eventId,
      status: 'scheduled',
      maxAttendees: 50,
      currentAttendees: 0,
    });
    const attendance: EventAttendance = {
      id: 'attendance-1',
      eventId,
      userId,
      companyId,
      userName: 'Test User',
      companyName: 'Test Company',
      registeredAt: new Date(),
      attendedAt: null,
      notes: null,
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);
    vi.mocked(mockRepository.registerAttendance).mockResolvedValue(attendance);
    vi.mocked(mockAddLeaderboardScore.execute).mockResolvedValue({
      isSuccess: true,
      value: undefined,
    } as any);

    const result = await useCase.execute(eventId, userId, companyId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(attendance);
    expect(mockRepository.findById).toHaveBeenCalledWith(eventId);
    expect(mockRepository.registerAttendance).toHaveBeenCalledWith(
      eventId,
      userId,
      companyId,
      undefined
    );
    expect(mockAddLeaderboardScore.execute).toHaveBeenCalledWith({
      companyId,
      activityType: ActivityType.EVENT_ATTENDED,
      activityId: eventId,
      metadata: {
        eventTitle: mockEvent.title,
        eventDate: mockEvent.startTime.toISOString(),
      },
    });
  });

  it('should return error when event ID is empty', async () => {
    const result = await useCase.execute('', 'user-1', 'company-1');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when user ID is empty', async () => {
    const result = await useCase.execute('event-1', '', 'company-1');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('User ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when company ID is empty', async () => {
    const result = await useCase.execute('event-1', 'user-1', '');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Company ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when event not found', async () => {
    const eventId = 'non-existent';
    const userId = 'user-1';
    const companyId = 'company-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(eventId, userId, companyId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.registerAttendance).not.toHaveBeenCalled();
  });

  it('should return error when event registration is not available', async () => {
    const eventId = 'event-1';
    const userId = 'user-1';
    const companyId = 'company-1';
    const mockEvent = createMockEvent({ id: eventId, status: 'completed' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);

    const result = await useCase.execute(eventId, userId, companyId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event registration is not available');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.registerAttendance).not.toHaveBeenCalled();
  });

  it('should return error when user already registered', async () => {
    const eventId = 'event-1';
    const userId = 'user-1';
    const companyId = 'company-1';
    const mockEvent = createMockEvent({ id: eventId, status: 'scheduled' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([
      {
        id: 'attendance-1',
        eventId: 'event-1',
        userId,
        companyId: 'company-1',
        userName: 'Test User',
        companyName: 'Test Company',
        registeredAt: new Date(),
        attendedAt: null,
        notes: null,
      },
    ]);

    const result = await useCase.execute(eventId, userId, companyId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('User is already registered');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.registerAttendance).not.toHaveBeenCalled();
  });

  it('should continue even if leaderboard score addition fails', async () => {
    const eventId = 'event-1';
    const userId = 'user-1';
    const companyId = 'company-1';
    const mockEvent = createMockEvent({ id: eventId, status: 'scheduled' });
    const attendance: EventAttendance = {
      id: 'attendance-1',
      eventId,
      userId,
      companyId,
      userName: 'Test User',
      companyName: 'Test Company',
      registeredAt: new Date(),
      attendedAt: null,
      notes: null,
    };

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);
    vi.mocked(mockRepository.registerAttendance).mockResolvedValue(attendance);
    vi.mocked(mockAddLeaderboardScore.execute).mockResolvedValue({
      isSuccess: false,
      error: 'Leaderboard error',
    } as any);

    const result = await useCase.execute(eventId, userId, companyId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.registerAttendance).toHaveBeenCalled();
  });

  it('should work without leaderboard service', async () => {
    const eventId = 'event-1';
    const userId = 'user-1';
    const companyId = 'company-1';
    const mockEvent = createMockEvent({ id: eventId, status: 'scheduled' });
    const attendance: EventAttendance = {
      id: 'attendance-1',
      eventId,
      userId,
      companyId,
      userName: 'Test User',
      companyName: 'Test Company',
      registeredAt: new Date(),
      attendedAt: null,
      notes: null,
    };
    const useCaseWithoutLeaderboard = new RegisterEventAttendanceUseCase(mockRepository);

    vi.mocked(mockRepository.findById).mockResolvedValue(mockEvent);
    vi.mocked(mockRepository.getAttendees).mockResolvedValue([]);
    vi.mocked(mockRepository.registerAttendance).mockResolvedValue(attendance);

    const result = await useCaseWithoutLeaderboard.execute(eventId, userId, companyId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.registerAttendance).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const eventId = 'event-1';
    const userId = 'user-1';
    const companyId = 'company-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(eventId, userId, companyId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
