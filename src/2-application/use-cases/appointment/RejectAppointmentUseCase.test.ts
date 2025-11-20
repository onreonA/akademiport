/**
 * Unit Tests for RejectAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RejectAppointmentUseCase } from './RejectAppointmentUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { NotificationService } from '@/5-shared/services/notification';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { Appointment } from '@/3-domain/entities/Appointment';
import { AppointmentStatus } from '@/3-domain/enums/AppointmentStatus';
import { AppError } from '@/6-core/errors/AppError';
import { Result } from '@/6-core/result/Result';

describe('RejectAppointmentUseCase', () => {
  let mockRepository: IAppointmentRepository;
  let mockNotificationService: NotificationService;
  let mockUserRepository: IUserRepository;
  let useCase: RejectAppointmentUseCase;

  beforeEach(() => {
    mockRepository = {
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

    mockNotificationService = {
      sendAppointmentConfirmed: vi.fn(),
      sendAppointmentCancelled: vi.fn(),
      sendAppointmentRescheduled: vi.fn(),
      sendEventCancelled: vi.fn(),
      sendEventUpdated: vi.fn(),
      sendTaskApproved: vi.fn(),
      sendTaskRejected: vi.fn(),
      sendTaskCompleted: vi.fn(),
    } as any;

    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    } as any;

    useCase = new RejectAppointmentUseCase(
      mockRepository,
      mockNotificationService,
      mockUserRepository
    );
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

  it('should reject appointment successfully', async () => {
    const appointmentId = 'appointment-1';
    const rejectedBy = 'consultant-1';
    const reason = 'Not available';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const rejectedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date(),
      rejectionReason: reason,
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.reject).mockResolvedValue(rejectedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const result = await useCase.execute(appointmentId, rejectedBy, reason);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.id).toBe(appointmentId);
    expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
    expect(mockRepository.reject).toHaveBeenCalledWith(appointmentId, rejectedBy, reason);
  });

  it('should send notification to company user when consultant rejects', async () => {
    const appointmentId = 'appointment-1';
    const rejectedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({
      id: appointmentId,
      status: 'pending',
      consultantId: 'consultant-1',
      requestedBy: 'user-1',
    });
    const rejectedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date(),
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.reject).mockResolvedValue(rejectedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const result = await useCase.execute(appointmentId, rejectedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockNotificationService.sendAppointmentCancelled).toHaveBeenCalledWith(
      'user-1',
      appointmentId,
      'Test Consultant',
      expect.any(Date),
      'consultant'
    );
  });

  it('should send notification to consultant when company rejects', async () => {
    const appointmentId = 'appointment-1';
    const rejectedBy = 'user-1';
    const mockAppointment = createMockAppointment({
      id: appointmentId,
      status: 'pending',
      consultantId: 'consultant-1',
      requestedBy: 'user-1',
    });
    const rejectedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date(),
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.reject).mockResolvedValue(rejectedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const result = await useCase.execute(appointmentId, rejectedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockNotificationService.sendAppointmentCancelled).toHaveBeenCalledWith(
      'consultant-1',
      appointmentId,
      'Test Consultant',
      expect.any(Date),
      'company'
    );
  });

  it('should return error when appointment ID is empty', async () => {
    const result = await useCase.execute('', 'consultant-1');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when rejectedBy is empty', async () => {
    const result = await useCase.execute('appointment-1', '');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Rejector ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when appointment not found', async () => {
    const appointmentId = 'non-existent';
    const rejectedBy = 'consultant-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId, rejectedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.reject).not.toHaveBeenCalled();
  });

  it('should return error when appointment is not pending', async () => {
    const appointmentId = 'appointment-1';
    const rejectedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'approved' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);

    const result = await useCase.execute(appointmentId, rejectedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment cannot be rejected');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.reject).not.toHaveBeenCalled();
  });

  it('should continue even if notification fails', async () => {
    const appointmentId = 'appointment-1';
    const rejectedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const rejectedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date(),
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.reject).mockResolvedValue(rejectedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);
    vi.mocked(mockNotificationService.sendAppointmentCancelled).mockRejectedValue(
      new Error('Notification failed')
    );

    const result = await useCase.execute(appointmentId, rejectedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.reject).toHaveBeenCalled();
  });
});
