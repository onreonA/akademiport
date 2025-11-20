/**
 * Unit Tests for TaskRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskRepository } from './TaskRepository';
import { createClient } from '@/infrastructure/database/supabase-server';

vi.mock('@/infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
}));

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new TaskRepository();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
  });

  describe('findById', () => {
    it('should return task when found', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        sub_project_id: 'subproject-1',
        status: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockTask,
        error: null,
      });
      const isMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('task-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('task-1');
    });

    it('should return null when task not found', async () => {
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
    it('should create task successfully', async () => {
      const createDto = {
        subProjectId: 'subproject-1',
        title: 'New Task',
        status: 'todo',
      };

      const mockCreatedTask = {
        id: 'task-new',
        ...createDto,
        sub_project_id: createDto.subProjectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCreatedTask,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValue({ insert: insertMock });

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
      expect(result.title).toBe('New Task');
    });
  });
});
