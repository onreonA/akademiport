/**
 * Unit Tests for ProgramRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgramRepository } from './ProgramRepository';
import { Result } from '@/core/result/Result';
import { createClient } from '@/infrastructure/database/supabase-server';

vi.mock('@/infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
  getSupabaseAdminClient: vi.fn(),
}));

describe('ProgramRepository', () => {
  let repository: ProgramRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new ProgramRepository();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
  });

  describe('findById', () => {
    it('should return program when found', async () => {
      const mockProgram = {
        id: 'program-1',
        name: 'Test Program',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockProgram,
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('program-1');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value?.id).toBe('program-1');
      }
    });

    it('should return null when program not found', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('non-existent');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe('findAll', () => {
    it('should return all programs', async () => {
      const mockPrograms = [
        {
          id: 'program-1',
          name: 'Program 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'program-2',
          name: 'Program 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const orderMock = vi.fn().mockResolvedValue({
        data: mockPrograms,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findAll();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBe(2);
      }
    });
  });
});
