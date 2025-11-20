/**
 * Unit Tests for RescheduleAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RescheduleAppointmentUseCase } from './RescheduleAppointmentUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { NotificationService } from '@/5-shared/services/notification';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { Appointment } from '@/3-domain/entities/Appointment';
import { AppointmentStatus } from '@/3-domain/enums/AppointmentStatus';
import { AppError } from '@/6-core/errors/AppError';

describe('RescheduleAppointmentUseCase', () => {
  let mockRepository: IAppointmentRepository;
  let mockNotificationService: NotificationService;
  let mockUserRepository: IUserRepository;
  let useCase: RescheduleAppointmentUseCase;

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

    useCase = new RescheduleAppointmentUseCase(
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

  it('should reschedule appointment successfully', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const oldAppointment = createMockAppointment({ id: appointmentId, status: 'cancelled' });
    const newAppointment = createMockAppointment({
      id: 'appointment-2',
      status: 'pending',
      startTime: newStartTime,
      endTime: newEndTime,
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.findConflictingAppointments).mockResolvedValue([]);
    vi.mocked(mockRepository.reschedule).mockResolvedValue({
      old: oldAppointment,
      new: newAppointment,
    });
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.oldId).toBe(appointmentId);
    expect(result.value?.newId).toBe('appointment-2');
    expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
    expect(mockRepository.findConflictingAppointments).toHaveBeenCalled();
    expect(mockRepository.reschedule).toHaveBeenCalled();
  });

  it('should send notifications to both parties', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    const mockAppointment = createMockAppointment({
      id: appointmentId,
      status: 'pending',
      consultantId: 'consultant-1',
      requestedBy: 'user-1',
    });
    const oldAppointment = createMockAppointment({ id: appointmentId, status: 'cancelled' });
    const newAppointment = createMockAppointment({
      id: 'appointment-2',
      status: 'pending',
      startTime: newStartTime,
      endTime: newEndTime,
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.findConflictingAppointments).mockResolvedValue([]);
    vi.mocked(mockRepository.reschedule).mockResolvedValue({
      old: oldAppointment,
      new: newAppointment,
    });
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isSuccess).toBe(true);
    expect(mockNotificationService.sendAppointmentRescheduled).toHaveBeenCalledTimes(2);
  });

  it('should return error when appointment ID is empty', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    const result = await useCase.execute('', newStartTime, newEndTime, 'consultant-1');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when rescheduledBy is empty', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    const result = await useCase.execute('appointment-1', newStartTime, newEndTime, '');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Rescheduler ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when appointment not found', async () => {
    const appointmentId = 'non-existent';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.reschedule).not.toHaveBeenCalled();
  });

  it('should return error when appointment cannot be rescheduled', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'rejected' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment cannot be rescheduled');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.reschedule).not.toHaveBeenCalled();
  });

  it('should return error when new start time is in the past', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    const newStartTime = new Date(pastDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(pastDate);
    newEndTime.setHours(15, 0, 0, 0);
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('geçmişte olamaz');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.reschedule).not.toHaveBeenCalled();
  });

  it('should return error when start time is after end time', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(15, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(14, 0, 0, 0);
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Başlangıç tarihi bitiş tarihinden önce olmalıdır');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.reschedule).not.toHaveBeenCalled();
  });

  it('should return error when duration is less than 15 minutes', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(14, 10, 0, 0); // Only 10 minutes
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('en az 15 dakika');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.reschedule).not.toHaveBeenCalled();
  });

  it('should return error when there are conflicting appointments', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const conflictingAppointment = createMockAppointment({ id: 'appointment-2' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.findConflictingAppointments).mockResolvedValue([
      conflictingAppointment,
    ]);

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('başka bir randevusu bulunmaktadır');
    expect((result.error as AppError)?.statusCode).toBe(409);
    expect(mockRepository.reschedule).not.toHaveBeenCalled();
  });

  it('should continue even if notification fails', async () => {
    const appointmentId = 'appointment-1';
    const rescheduledBy = 'consultant-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const oldAppointment = createMockAppointment({ id: appointmentId, status: 'cancelled' });
    const newAppointment = createMockAppointment({
      id: 'appointment-2',
      status: 'pending',
      startTime: newStartTime,
      endTime: newEndTime,
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.findConflictingAppointments).mockResolvedValue([]);
    vi.mocked(mockRepository.reschedule).mockResolvedValue({
      old: oldAppointment,
      new: newAppointment,
    });
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);
    vi.mocked(mockNotificationService.sendAppointmentRescheduled).mockRejectedValue(
      new Error('Notification failed')
    );

    const result = await useCase.execute(appointmentId, newStartTime, newEndTime, rescheduledBy);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.reschedule).toHaveBeenCalled();
  });
});
