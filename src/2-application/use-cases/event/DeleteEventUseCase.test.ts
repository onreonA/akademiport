/**
 * Unit Tests for DeleteEventUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteEventUseCase } from './DeleteEventUseCase';
import { IEventRepository } from '@/domain/interfaces/repositories/IEventRepository';
import { Event } from '@/domain/entities/Event';

describe('DeleteEventUseCase', () => {
  let mockEventRepository: IEventRepository;
  let useCase: DeleteEventUseCase;

  beforeEach(() => {
    mockEventRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByDateRange: vi.fn(),
      getAttendees: vi.fn(),
      getStatistics: vi.fn(),
    };

    useCase = new DeleteEventUseCase(mockEventRepository);
  });

  it('should delete an event successfully', async () => {
    const eventId = 'event-1';

    const existingEvent: Event = {
      id: eventId,
      title: 'Test Event',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: new Date('2025-02-01T10:00:00Z'),
      endTime: new Date('2025-02-01T12:00:00Z'),
      timezone: 'Europe/Istanbul',
      status: 'scheduled',
      category: 'webinar',
      description: null,
      zoomMeetingId: 'zoom-123',
      zoomJoinUrl: 'https://zoom.us/j/123',
      zoomStartUrl: 'https://zoom.us/s/123',
      zoomPassword: 'password123',
      organizerName: null,
      maxAttendees: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockEventRepository.findById).mockResolvedValue(existingEvent);
    vi.mocked(mockEventRepository.delete).mockResolvedValue(undefined);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(mockEventRepository.delete).toHaveBeenCalledWith(eventId);
  });

  it('should fail when event not found', async () => {
    const eventId = 'non-existent';

    vi.mocked(mockEventRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('not found');
    expect(mockEventRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository error', async () => {
    const eventId = 'event-1';

    const existingEvent: Event = {
      id: eventId,
      title: 'Test Event',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: new Date('2025-02-01T10:00:00Z'),
      endTime: new Date('2025-02-01T12:00:00Z'),
      timezone: 'Europe/Istanbul',
      status: 'scheduled',
      category: 'webinar',
      description: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      organizerName: null,
      maxAttendees: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockEventRepository.findById).mockResolvedValue(existingEvent);
    vi.mocked(mockEventRepository.delete).mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
  });
});
