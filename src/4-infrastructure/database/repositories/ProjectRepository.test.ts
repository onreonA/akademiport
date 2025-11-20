/**
 * Unit Tests for ProjectRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectRepository } from './ProjectRepository';
import { createClient } from '@/infrastructure/database/supabase-server';

vi.mock('@/infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
}));

describe('ProjectRepository', () => {
  let repository: ProjectRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new ProjectRepository();

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
    it('should return project when found', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        company_id: 'company-1',
        consultant_id: 'consultant-1',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockProject,
        error: null,
      });
      const isMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('project-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('project-1');
    });

    it('should return null when project not found', async () => {
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
    it('should create project successfully', async () => {
      const createDto = {
        name: 'New Project',
        companyId: 'company-1',
        status: 'active',
      };

      const mockCreatedProject = {
        id: 'project-new',
        ...createDto,
        company_id: createDto.companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCreatedProject,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValue({ insert: insertMock });

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Project');
    });
  });
});
