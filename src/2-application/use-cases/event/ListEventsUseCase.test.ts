/**
 * Unit Tests for ListEventsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListEventsUseCase } from './ListEventsUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Event } from '@/3-domain/entities/Event';
import type { EventStatus, EventCategory } from '@/3-domain/entities/Event';
import { AppError } from '@/6-core/errors/AppError';

describe('ListEventsUseCase', () => {
  let mockEventRepository: IEventRepository;
  let useCase: ListEventsUseCase;

  beforeEach(() => {
    mockEventRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByProgramId: vi.fn(),
      findByConsultantId: vi.fn(),
      findByDateRange: vi.fn(),
      registerAttendance: vi.fn(),
      getAttendees: vi.fn(),
      updateZoomMeeting: vi.fn(),
      exists: vi.fn(),
      cancelAttendance: vi.fn(),
      findByUserId: vi.fn(),
      findByCompanyId: vi.fn(),
      updateAttendeeCount: vi.fn(),
    } as any;

    useCase = new ListEventsUseCase(mockEventRepository);
  });

  const createMockEvent = (overrides?: Partial<Event>): Event => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(12, 0, 0, 0);

    return {
      id: 'event-1',
      programId: 'program-1',
      consultantId: 'consultant-1',
      title: 'Test Event',
      description: 'Test Description',
      category: 'webinar' as EventCategory,
      status: 'scheduled' as EventStatus,
      startTime,
      endTime,
      timezone: 'Europe/Istanbul',
      attendanceRequired: true,
      isPublic: true,
      maxAttendees: 100,
      currentAttendees: 0,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      organizerName: null,
      organizerEmail: null,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should list events successfully without filters', async () => {
    const mockEvents = [createMockEvent({ id: 'event-1' }), createMockEvent({ id: 'event-2' })];

    vi.mocked(mockEventRepository.findAll).mockResolvedValue({
      data: mockEvents,
      total: 2,
    });

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value?.events).toEqual(mockEvents);
    expect(result.value?.total).toBe(2);
    expect(result.value?.page).toBe(1);
    expect(result.value?.limit).toBe(12);
    expect(result.value?.totalPages).toBe(1);
  });

  it('should list events with filters and pagination', async () => {
    const mockEvents = [createMockEvent({ id: 'event-1' })];

    const filters = {
      programId: 'program-1',
      status: 'scheduled' as EventStatus,
      page: 2,
      limit: 10,
    };

    vi.mocked(mockEventRepository.findAll).mockResolvedValue({
      data: mockEvents,
      total: 15,
    });

    const result = await useCase.execute(filters);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.events).toEqual(mockEvents);
    expect(result.value?.total).toBe(15);
    expect(result.value?.page).toBe(2);
    expect(result.value?.limit).toBe(10);
    expect(result.value?.totalPages).toBe(2); // Math.ceil(15/10) = 2
  });

  it('should calculate totalPages correctly', async () => {
    const mockEvents = Array.from({ length: 10 }, (_, i) =>
      createMockEvent({ id: `event-${i + 1}` })
    );

    const filters = {
      page: 1,
      limit: 5,
    };

    vi.mocked(mockEventRepository.findAll).mockResolvedValue({
      data: mockEvents,
      total: 23,
    });

    const result = await useCase.execute(filters);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.totalPages).toBe(5); // Math.ceil(23/5) = 5
  });

  it('should use default pagination values when not provided', async () => {
    const mockEvents = [createMockEvent()];

    vi.mocked(mockEventRepository.findAll).mockResolvedValue({
      data: mockEvents,
      total: 1,
    });

    const result = await useCase.execute({ programId: 'program-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.value?.page).toBe(1);
    expect(result.value?.limit).toBe(12);
  });

  it('should handle repository errors', async () => {
    const errorMessage = 'Database error';

    vi.mocked(mockEventRepository.findAll).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
