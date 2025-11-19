/**
 * Unit Tests for GetEventUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetEventUseCase } from './GetEventUseCase';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { Event } from '@/3-domain/entities/Event';
// EventStatus and EventCategory are types, not enums - use string literals

describe('GetEventUseCase', () => {
  let mockEventRepository: IEventRepository;
  let useCase: GetEventUseCase;

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
      getStatistics: vi.fn(),
    };

    useCase = new GetEventUseCase(mockEventRepository);
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
      category: 'webinar' as const,
      status: 'scheduled' as const,
      startTime,
      endTime,
      timezone: 'Europe/Istanbul',
      attendanceRequired: true,
      maxAttendees: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should get event successfully', async () => {
    const eventId = 'event-1';
    const mockEvent = createMockEvent({ id: eventId });

    vi.mocked(mockEventRepository.findById).mockResolvedValue(mockEvent);

    const result = await useCase.execute(eventId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockEvent);
    expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
  });

  it('should return error when event ID is empty', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event ID is required');
    expect(result.error?.statusCode).toBe(400);
    expect(mockEventRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when event ID is whitespace', async () => {
    const result = await useCase.execute('   ');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event ID is required');
    expect(result.error?.statusCode).toBe(400);
    expect(mockEventRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when event not found', async () => {
    const eventId = 'non-existent';

    vi.mocked(mockEventRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Event not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
  });

  it('should handle repository errors', async () => {
    const eventId = 'event-1';
    const errorMessage = 'Database error';

    vi.mocked(mockEventRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(eventId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
