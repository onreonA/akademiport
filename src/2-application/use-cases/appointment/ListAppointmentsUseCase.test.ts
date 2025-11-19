/**
 * Unit Tests for ListAppointmentsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListAppointmentsUseCase } from './ListAppointmentsUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Appointment } from '@/3-domain/entities/Appointment';
import type { AppointmentStatus } from '@/3-domain/enums/AppointmentStatus';

describe('ListAppointmentsUseCase', () => {
  let mockAppointmentRepository: IAppointmentRepository;
  let useCase: ListAppointmentsUseCase;

  beforeEach(() => {
    mockAppointmentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByDateRange: vi.fn(),
      findByConsultantId: vi.fn(),
      findByCompanyId: vi.fn(),
      findConflictingAppointments: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      reschedule: vi.fn(),
      updateZoomMeeting: vi.fn(),
    };

    useCase = new ListAppointmentsUseCase(mockAppointmentRepository);
  });

  const createMockAppointment = (overrides?: Partial<Appointment>): Appointment => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    return {
      id: 'appointment-1',
      consultantId: 'consultant-1',
      companyId: 'company-1',
      programId: 'program-1',
      title: 'Test Appointment',
      description: 'Test Description',
      startTime,
      endTime,
      timezone: 'Europe/Istanbul',
      status: 'pending' as AppointmentStatus,
      requestedBy: 'user-1',
      requestedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      rescheduledFrom: null,
      rescheduledAt: null,
      rescheduledBy: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      notes: null,
      companyNotes: null,
      attendedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  };

  it('should list appointments successfully without filters', async () => {
    const mockAppointments = [
      createMockAppointment({ id: 'appointment-1' }),
      createMockAppointment({ id: 'appointment-2' }),
    ];

    vi.mocked(mockAppointmentRepository.findAll).mockResolvedValue({
      data: mockAppointments,
      total: 2,
    });

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value?.data).toEqual(mockAppointments);
    expect(result.value?.total).toBe(2);
    expect(mockAppointmentRepository.findAll).toHaveBeenCalled();
  });

  it('should list appointments with filters', async () => {
    const mockAppointments = [createMockAppointment({ id: 'appointment-1' })];

    const filters = {
      consultantId: 'consultant-1',
      status: 'pending' as AppointmentStatus,
      page: 1,
      limit: 20,
    };

    vi.mocked(mockAppointmentRepository.findAll).mockResolvedValue({
      data: mockAppointments,
      total: 1,
    });

    const result = await useCase.execute(filters);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.data).toEqual(mockAppointments);
    expect(result.value?.total).toBe(1);
    expect(mockAppointmentRepository.findAll).toHaveBeenCalled();
  });

  it('should convert string dates to Date objects', async () => {
    const mockAppointments = [createMockAppointment()];

    const filters = {
      startDate: '2025-01-01' as any,
      endDate: '2025-12-31' as any,
    };

    vi.mocked(mockAppointmentRepository.findAll).mockResolvedValue({
      data: mockAppointments,
      total: 1,
    });

    const result = await useCase.execute(filters);

    expect(result.isSuccess).toBe(true);
    const callArgs = vi.mocked(mockAppointmentRepository.findAll).mock.calls[0][0];
    expect(callArgs?.startDate).toBeInstanceOf(Date);
    expect(callArgs?.endDate).toBeInstanceOf(Date);
  });

  it('should handle repository errors', async () => {
    const errorMessage = 'Database error';

    vi.mocked(mockAppointmentRepository.findAll).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
