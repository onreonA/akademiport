/**
 * Unit Tests for EventRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventRepository } from './EventRepository';
import { createClient } from '@/4-infrastructure/database/supabase-server';

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
}));

describe('EventRepository', () => {
  let repository: EventRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new EventRepository();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
  });

  describe('findById', () => {
    it('should return event when found', async () => {
      const mockEvent = {
        id: 'event-1',
        title: 'Test Event',
        program_id: 'program-1',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockEvent,
        error: null,
      });
      const isMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('event-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('event-1');
    });

    it('should return null when event not found', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      const isMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create event successfully', async () => {
      const createDto = {
        programId: 'program-1',
        consultantId: 'consultant-1',
        title: 'New Event',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        category: 'webinar',
      };

      const mockCreatedEvent = {
        id: 'event-new',
        ...createDto,
        program_id: createDto.programId,
        consultant_id: createDto.consultantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCreatedEvent,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValue({ insert: insertMock });

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
      expect(result.title).toBe('New Event');
    });
  });
});
