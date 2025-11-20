/**
 * Unit Tests for TrainingRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrainingRepository } from './TrainingRepository';
import { createClient } from '@/infrastructure/database/supabase-server';

vi.mock('@/infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
  getSupabaseAdminClient: vi.fn(),
}));

describe('TrainingRepository', () => {
  let repository: TrainingRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new TrainingRepository();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
  });

  describe('findById', () => {
    it('should return training when found', async () => {
      const mockTraining = {
        id: 'training-1',
        name: 'Test Training',
        program_id: 'program-1',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockTraining,
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('training-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('training-1');
    });

    it('should return null when training not found', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create training successfully', async () => {
      const createDto = {
        name: 'New Training',
        programId: 'program-1',
        status: 'active',
      };

      const mockCreatedTraining = {
        id: 'training-new',
        ...createDto,
        program_id: createDto.programId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCreatedTraining,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValue({ insert: insertMock });

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Training');
    });
  });
});
