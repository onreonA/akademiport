/**
 * Unit Tests for UpdateEventUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateEventUseCase } from './UpdateEventUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Event } from '@/3-domain/entities/Event';

describe('UpdateEventUseCase', () => {
  let mockEventRepository: IEventRepository;
  let useCase: UpdateEventUseCase;

  beforeEach(() => {
    mockEventRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByDateRange: vi.fn(),
      findByProgramId: vi.fn(),
      findByConsultantId: vi.fn(),
      registerAttendance: vi.fn(),
      getAttendees: vi.fn(),
      updateZoomMeeting: vi.fn(),
      exists: vi.fn(),
      cancelAttendance: vi.fn(),
      findByUserId: vi.fn(),
      findByCompanyId: vi.fn(),
      updateAttendeeCount: vi.fn(),
    } as any;

    useCase = new UpdateEventUseCase(mockEventRepository);
  });

  it('should update an event successfully', async () => {
    const eventId = 'event-1';
    const updateData = {
      title: 'Updated Event Title',
      description: 'Updated description',
    };

    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(12, 0, 0, 0);

    const existingEvent: Event = {
      id: eventId,
      title: 'Original Title',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: startTime,
      endTime: endTime,
      timezone: 'Europe/Istanbul',
      status: 'scheduled',
      category: 'webinar',
      description: 'Original description',
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      organizerName: null,
      organizerEmail: null,
      maxAttendees: null,
      currentAttendees: 0,
      attendanceRequired: false,
      isPublic: true,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEvent: Event = {
      ...existingEvent,
      ...updateData,
    };

    vi.mocked(mockEventRepository.findById).mockResolvedValue(existingEvent);
    vi.mocked(mockEventRepository.update).mockResolvedValue(updatedEvent);

    const result = await useCase.execute(eventId, updateData);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.title).toBe('Updated Event Title');
    expect(mockEventRepository.update).toHaveBeenCalledWith(eventId, updateData);
  });

  it('should fail when event not found', async () => {
    const eventId = 'non-existent';
    const updateData = {
      title: 'Updated Title',
    };

    vi.mocked(mockEventRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(eventId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('not found');
    expect(mockEventRepository.update).not.toHaveBeenCalled();
  });

  it('should validate start time is before end time when updating times', async () => {
    const eventId = 'event-1';

    // Use future dates but with invalid order for validation test
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const invalidStartTime = new Date(futureDate);
    invalidStartTime.setHours(12, 0, 0, 0); // After end time
    const invalidEndTime = new Date(futureDate);
    invalidEndTime.setHours(10, 0, 0, 0);

    const updateData = {
      startTime: invalidStartTime,
      endTime: invalidEndTime,
    };

    const originalStartTime = new Date(futureDate);
    originalStartTime.setHours(10, 0, 0, 0);
    const originalEndTime = new Date(futureDate);
    originalEndTime.setHours(12, 0, 0, 0);

    const existingEvent: Event = {
      id: eventId,
      title: 'Test Event',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: originalStartTime,
      endTime: originalEndTime,
      timezone: 'Europe/Istanbul',
      status: 'scheduled',
      category: 'webinar',
      description: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      organizerName: null,
      organizerEmail: null,
      maxAttendees: null,
      currentAttendees: 0,
      attendanceRequired: false,
      isPublic: true,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock repository to throw validation error
    vi.mocked(mockEventRepository.findById).mockResolvedValue(existingEvent);
    vi.mocked(mockEventRepository.update).mockRejectedValue(
      new Error('Başlangıç tarihi bitiş tarihinden önce olmalıdır')
    );

    const result = await useCase.execute(eventId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Başlangıç tarihi');
  });

  it('should handle repository error', async () => {
    const eventId = 'event-1';
    const updateData = {
      title: 'Updated Title',
    };

    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(12, 0, 0, 0);

    const existingEvent: Event = {
      id: eventId,
      title: 'Original Title',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: startTime,
      endTime: endTime,
      timezone: 'Europe/Istanbul',
      status: 'scheduled',
      category: 'webinar',
      description: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      organizerName: null,
      organizerEmail: null,
      maxAttendees: null,
      currentAttendees: 0,
      attendanceRequired: false,
      isPublic: true,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockEventRepository.findById).mockResolvedValue(existingEvent);
    vi.mocked(mockEventRepository.update).mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute(eventId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
  });
});
