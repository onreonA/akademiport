/**
 * Unit Tests for SupabaseCustomReportRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseCustomReportRepository } from './SupabaseCustomReportRepository';
import { Result } from '@/6-core/result/Result';
import { createClient, getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
  getSupabaseAdminClient: vi.fn(),
}));

describe('SupabaseCustomReportRepository', () => {
  let repository: SupabaseCustomReportRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new SupabaseCustomReportRepository();

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

  describe('findById', () => {
    it('should return custom report when found', async () => {
      const mockReport = {
        id: 'report-1',
        name: 'Test Report',
        user_id: 'user-1',
        report_type: 'progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockReport,
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('report-1');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value?.id).toBe('report-1');
      }
    });

    it('should return null when custom report not found', async () => {
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

  describe('create', () => {
    it('should create custom report successfully', async () => {
      const createDto = {
        name: 'New Report',
        reportType: 'progress',
        dateRangeType: 'month',
      };

      const mockCreatedReport = {
        id: 'report-new',
        ...createDto,
        report_type: createDto.reportType,
        date_range_type: createDto.dateRangeType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCreatedReport,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValue({ insert: insertMock });

      const result = await repository.create(createDto, 'user-1');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.name).toBe('New Report');
      }
    });
  });
});
