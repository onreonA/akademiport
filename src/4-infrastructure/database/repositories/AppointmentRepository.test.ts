/**
 * Unit Tests for AppointmentRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentRepository } from './AppointmentRepository';
import { createClient } from '@/infrastructure/database/supabase-server';

vi.mock('@/infrastructure/database/supabase-server', () => ({
  createClient: vi.fn(),
}));

describe('AppointmentRepository', () => {
  let repository: AppointmentRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new AppointmentRepository();

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
    it('should return appointment when found', async () => {
      const mockAppointment = {
        id: 'appointment-1',
        title: 'Test Appointment',
        consultant_id: 'consultant-1',
        company_id: 'company-1',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockAppointment,
        error: null,
      });
      const isMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await repository.findById('appointment-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('appointment-1');
    });

    it('should return null when appointment not found', async () => {
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
    it('should create appointment successfully', async () => {
      const createDto = {
        consultantId: 'consultant-1',
        companyId: 'company-1',
        title: 'New Appointment',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        requestedBy: 'user-1',
      };

      const mockCreatedAppointment = {
        id: 'appointment-new',
        ...createDto,
        consultant_id: createDto.consultantId,
        company_id: createDto.companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockCreatedAppointment,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValue({ insert: insertMock });

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
      expect(result.title).toBe('New Appointment');
    });
  });
});
