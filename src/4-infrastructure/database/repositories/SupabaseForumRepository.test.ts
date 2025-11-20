/**
 * Unit Tests for SupabaseForumRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseForumRepository } from './SupabaseForumRepository';
import { Result } from '@/6-core/result/Result';
import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
  getSupabaseAdminClient: vi.fn(),
}));

describe('SupabaseForumRepository', () => {
  let repository: SupabaseForumRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new SupabaseForumRepository();

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
    vi.mocked(getSupabaseAdminClient).mockReturnValue(mockSupabase as any);
  });

  describe('findCategoryById', () => {
    it('should return category when found', async () => {
      const mockCategory = {
        id: 'category-1',
        name: 'Test Category',
        program_id: 'program-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCategory,
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findCategoryById('category-1');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value?.id).toBe('category-1');
      }
    });

    it('should return null when category not found', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findCategoryById('non-existent');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        programId: 'program-1',
        name: 'New Category',
        slug: 'new-category',
        createdBy: 'user-1',
      };

      const mockCreatedCategory = {
        id: 'category-new',
        ...categoryData,
        program_id: categoryData.programId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCreatedCategory,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValue({ insert: insertMock });

      const result = await repository.createCategory(categoryData as any);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.name).toBe('New Category');
      }
    });
  });
});
