/**
 * Unit Tests for DeleteAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteAppointmentUseCase } from './DeleteAppointmentUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { NotificationService } from '@/5-shared/services/notification';
import { Appointment } from '@/3-domain/entities/Appointment';
import type { AppointmentStatus } from '@/3-domain/enums/AppointmentStatus';
import { Result } from '@/6-core/result/Result';

describe('DeleteAppointmentUseCase', () => {
  let mockRepository: IAppointmentRepository;
  let mockNotificationService: NotificationService;
  let mockUserRepository: IUserRepository;
  let useCase: DeleteAppointmentUseCase;

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
      findConflictingAppointments: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      reschedule: vi.fn(),
      updateZoomMeeting: vi.fn(),
    };

    mockNotificationService = {
      sendAppointmentCancelled: vi.fn(),
      sendTaskApproved: vi.fn(),
      sendTaskRejected: vi.fn(),
      sendTaskCompleted: vi.fn(),
      sendEventUpdated: vi.fn(),
      sendEventCancelled: vi.fn(),
    } as any;

    mockUserRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByEmail: vi.fn(),
      findByCompanyId: vi.fn(),
      findByProgramId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    useCase = new DeleteAppointmentUseCase(
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

  it('should delete appointment successfully', async () => {
    const appointmentId = 'appointment-1';
    const mockAppointment = createMockAppointment({ id: appointmentId });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockUserRepository.findById).mockResolvedValue(Result.fail('Not found'));
    vi.mocked(mockNotificationService.sendAppointmentCancelled).mockResolvedValue(undefined);

    const result = await useCase.execute(appointmentId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
    expect(mockRepository.delete).toHaveBeenCalledWith(appointmentId);
    expect(mockNotificationService.sendAppointmentCancelled).toHaveBeenCalledTimes(2);
  });

  it('should return error when appointment ID is empty', async () => {
    const result = await useCase.execute('');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment ID is required');
    expect(result.error?.statusCode).toBe(400);
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when appointment not found', async () => {
    const appointmentId = 'non-existent';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should get consultant name from userRepository when available', async () => {
    const appointmentId = 'appointment-1';
    const mockAppointment = createMockAppointment({ id: appointmentId });
    const mockUser = { id: 'consultant-1', fullName: 'John Consultant' };

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockUserRepository.findById).mockResolvedValue(Result.ok(mockUser as any));
    vi.mocked(mockNotificationService.sendAppointmentCancelled).mockResolvedValue(undefined);

    const result = await useCase.execute(appointmentId);

    expect(result.isSuccess).toBe(true);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockAppointment.consultantId);
    expect(mockNotificationService.sendAppointmentCancelled).toHaveBeenCalledWith(
      expect.any(String),
      appointmentId,
      'John Consultant',
      mockAppointment.startTime,
      'company'
    );
  });

  it('should continue even if notification fails', async () => {
    const appointmentId = 'appointment-1';
    const mockAppointment = createMockAppointment({ id: appointmentId });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockUserRepository.findById).mockResolvedValue(Result.fail('Not found'));
    vi.mocked(mockNotificationService.sendAppointmentCancelled).mockRejectedValue(
      new Error('Notification failed')
    );

    const result = await useCase.execute(appointmentId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const appointmentId = 'appointment-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(appointmentId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
