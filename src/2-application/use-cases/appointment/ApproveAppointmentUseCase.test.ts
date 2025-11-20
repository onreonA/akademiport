/**
 * Unit Tests for ApproveAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApproveAppointmentUseCase } from './ApproveAppointmentUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { NotificationService } from '@/5-shared/services/notification';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { Appointment } from '@/3-domain/entities/Appointment';
import { AppointmentStatus } from '@/3-domain/enums/AppointmentStatus';
import { AppError } from '@/6-core/errors/AppError';

// Mock ZoomApiService
vi.mock('@/infrastructure/external/zoom-api.service', () => ({
  ZoomApiService: {
    createMeeting: vi.fn(),
  },
}));

describe('ApproveAppointmentUseCase', () => {
  let mockRepository: IAppointmentRepository;
  let mockNotificationService: NotificationService;
  let mockUserRepository: IUserRepository;
  let useCase: ApproveAppointmentUseCase;

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

    useCase = new ApproveAppointmentUseCase(
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

  it('should approve appointment successfully', async () => {
    const appointmentId = 'appointment-1';
    const approvedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const approvedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.approve).mockResolvedValue(approvedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.createMeeting).mockResolvedValue(null); // No Zoom meeting

    const result = await useCase.execute(appointmentId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.id).toBe(appointmentId);
    expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
    expect(mockRepository.approve).toHaveBeenCalledWith(appointmentId, approvedBy, undefined);
  });

  it('should create Zoom meeting when approving', async () => {
    const appointmentId = 'appointment-1';
    const approvedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const approvedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });
    const zoomMeeting = {
      id: 'zoom-123',
      joinUrl: 'https://zoom.us/j/123',
      startUrl: 'https://zoom.us/s/123',
      password: 'pass123',
    } as any;

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.approve).mockResolvedValue(approvedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.createMeeting).mockResolvedValue(zoomMeeting);
    vi.mocked(mockRepository.updateZoomMeeting).mockResolvedValue(undefined);

    const result = await useCase.execute(appointmentId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.zoomMeetingId).toBe('zoom-123');
    expect(ZoomApiService.createMeeting).toHaveBeenCalled();
    expect(mockRepository.updateZoomMeeting).toHaveBeenCalledWith(
      appointmentId,
      zoomMeeting.id,
      zoomMeeting.joinUrl,
      zoomMeeting.startUrl,
      zoomMeeting.password
    );
  });

  it('should continue even if Zoom meeting creation fails', async () => {
    const appointmentId = 'appointment-1';
    const approvedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const approvedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.approve).mockResolvedValue(approvedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.createMeeting).mockRejectedValue(new Error('Zoom API error'));

    const result = await useCase.execute(appointmentId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.approve).toHaveBeenCalled();
  });

  it('should send notification when approving', async () => {
    const appointmentId = 'appointment-1';
    const approvedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const approvedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.approve).mockResolvedValue(approvedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);

    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.createMeeting).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockNotificationService.sendAppointmentConfirmed).toHaveBeenCalled();
  });

  it('should return error when appointment ID is empty', async () => {
    const result = await useCase.execute('', 'consultant-1');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when approvedBy is empty', async () => {
    const result = await useCase.execute('appointment-1', '');

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Approver ID is required');
    expect((result.error as AppError)?.statusCode).toBe(400);
  });

  it('should return error when appointment not found', async () => {
    const appointmentId = 'non-existent';
    const approvedBy = 'consultant-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId, approvedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment not found');
    expect((result.error as AppError)?.statusCode).toBe(404);
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });

  it('should return error when appointment is not pending', async () => {
    const appointmentId = 'appointment-1';
    const approvedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'approved' });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);

    const result = await useCase.execute(appointmentId, approvedBy);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment cannot be approved');
    expect((result.error as AppError)?.statusCode).toBe(400);
    expect(mockRepository.approve).not.toHaveBeenCalled();
  });

  it('should continue even if notification fails', async () => {
    const appointmentId = 'appointment-1';
    const approvedBy = 'consultant-1';
    const mockAppointment = createMockAppointment({ id: appointmentId, status: 'pending' });
    const approvedAppointment = createMockAppointment({
      id: appointmentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(mockAppointment);
    vi.mocked(mockRepository.approve).mockResolvedValue(approvedAppointment);
    vi.mocked(mockUserRepository.findById).mockResolvedValue({
      isSuccess: true,
      value: { id: 'consultant-1', fullName: 'Test Consultant' },
    } as any);
    vi.mocked(mockNotificationService.sendAppointmentConfirmed).mockRejectedValue(
      new Error('Notification failed')
    );

    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.createMeeting).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId, approvedBy);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.approve).toHaveBeenCalled();
  });
});
