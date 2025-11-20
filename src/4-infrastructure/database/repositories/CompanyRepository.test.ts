/**
 * Unit Tests for CompanyRepository
 *
 * NOTE: These tests mock Supabase client to test repository logic
 * without requiring a real database connection.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyRepository } from './CompanyRepository';
import { Result } from '@/6-core/result/Result';
import { createClient } from '@/4-infrastructure/database/supabase-server';

// Mock Supabase client
vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
}));

describe('CompanyRepository', () => {
  let repository: CompanyRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new CompanyRepository();

    // Mock Supabase client
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
    it('should return company when found', async () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        program_id: 'program-1',
        city: 'Istanbul',
        sector: 'Technology',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCompany,
        error: null,
      });

      const result = await repository.findById('company-1');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeDefined();
        expect(result.value?.id).toBe('company-1');
      }
    });

    it('should return null when company not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await repository.findById('non-existent');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeNull();
      }
    });

    it('should return error on database error', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await repository.findById('company-1');

      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error?.message).toContain('Database error');
      }
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const mockCompanies = [
        {
          id: 'company-1',
          name: 'Company 1',
          program_id: 'program-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'company-2',
          name: 'Company 2',
          program_id: 'program-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Mock the chain: from().select().order()
      const orderMock = vi.fn().mockResolvedValue({
        data: mockCompanies,
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

    it('should return error on database error', async () => {
      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findAll();

      expect(result.isSuccess).toBe(false);
    });
  });

  describe('create', () => {
    it('should create company successfully', async () => {
      const createDto = {
        name: 'New Company',
        programId: 'program-1',
        city: 'Istanbul',
        sector: 'Technology',
      };

      const mockCreatedCompany = {
        id: 'company-new',
        ...createDto,
        program_id: createDto.programId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.select.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: mockCreatedCompany,
        error: null,
      });

      const result = await repository.create(createDto);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.name).toBe('New Company');
      }
    });

    it('should return error on creation failure', async () => {
      const createDto = {
        name: 'New Company',
        programId: 'program-1',
      };

      mockSupabase.select.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' },
      });

      const result = await repository.create(createDto);

      expect(result.isSuccess).toBe(false);
    });
  });
});
