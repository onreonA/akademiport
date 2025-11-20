/**
 * Unit Tests for GetAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAppointmentUseCase } from './GetAppointmentUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Appointment } from '@/3-domain/entities/Appointment';
import { AppointmentStatus } from '@/3-domain/enums/AppointmentStatus';
import { AppError } from '@/6-core/errors/AppError';

describe('GetAppointmentUseCase', () => {
  let mockAppointmentRepository: IAppointmentRepository;
  let useCase: GetAppointmentUseCase;

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
      findByProgramId: vi.fn(),
      findByStatus: vi.fn(),
      findConflictingAppointments: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      reschedule: vi.fn(),
      updateZoomMeeting: vi.fn(),
      exists: vi.fn(),
      markAsCompleted: vi.fn(),
      markAsAttended: vi.fn(),
    } as any;

    useCase = new GetAppointmentUseCase(mockAppointmentRepository);
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

  it('should get appointment successfully', async () => {
    const appointmentId = 'appointment-1';
    const mockAppointment = createMockAppointment({ id: appointmentId });

    vi.mocked(mockAppointmentRepository.findById).mockResolvedValue(mockAppointment);

    const result = await useCase.execute(appointmentId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockAppointment);
    expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(appointmentId);
  });

  it('should return error when appointment ID is empty', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockAppointmentRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when appointment ID is whitespace', async () => {
    const result = await useCase.execute('   ');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockAppointmentRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when appointment not found', async () => {
    const appointmentId = 'non-existent';

    vi.mocked(mockAppointmentRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(appointmentId);
  });

  it('should handle repository errors', async () => {
    const appointmentId = 'appointment-1';
    const errorMessage = 'Database error';

    vi.mocked(mockAppointmentRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(appointmentId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect((result.error as AppError)?.statusCode).toBe(500);
  });
});
