/**
 * Unit Tests for CreateEventUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateEventUseCase } from './CreateEventUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Event } from '@/3-domain/entities/Event';

describe('CreateEventUseCase', () => {
  let mockEventRepository: IEventRepository;
  let useCase: CreateEventUseCase;

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

    useCase = new CreateEventUseCase(mockEventRepository);
  });

  it('should create an event successfully', async () => {
    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(12, 0, 0, 0);

    const eventData = {
      title: 'Test Event',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: startTime,
      endTime: endTime,
      timezone: 'Europe/Istanbul',
      description: 'Test event description',
      category: 'webinar' as const,
    };

    const createdEvent: Event = {
      id: 'event-1',
      ...eventData,
      status: 'scheduled',
      attendanceRequired: false,
      isPublic: true,
      maxAttendees: null,
      currentAttendees: 0,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      organizerName: null,
      organizerEmail: null,
      createdBy: 'consultant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockEventRepository.create).mockResolvedValue(createdEvent);

    const result = await useCase.execute(eventData, 'consultant-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.id).toBe('event-1');
    expect(mockEventRepository.create).toHaveBeenCalledWith({
      ...eventData,
      createdBy: 'consultant-1',
    });
  });

  it('should validate required fields', async () => {
    const invalidData = {
      title: '',
      programId: 'program-1',
      // Missing required fields
    } as any;

    const result = await useCase.execute(invalidData, 'consultant-1');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeDefined();
  });

  it('should validate start time is before end time', async () => {
    // Use future dates but with invalid order
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(12, 0, 0, 0); // After end time
    const endTime = new Date(futureDate);
    endTime.setHours(10, 0, 0, 0);

    const invalidData = {
      title: 'Test Event',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: startTime,
      endTime: endTime,
      timezone: 'Europe/Istanbul',
    };

    const result = await useCase.execute(invalidData, 'consultant-1');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Başlangıç tarihi');
  });

  it('should handle repository error', async () => {
    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(12, 0, 0, 0);

    const eventData = {
      title: 'Test Event',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: startTime,
      endTime: endTime,
      timezone: 'Europe/Istanbul',
    };

    vi.mocked(mockEventRepository.create).mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute(eventData, 'consultant-1');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
  });
});
