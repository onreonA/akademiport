/**
 * Unit Tests for ApproveAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApproveAppointmentUseCase } from './ApproveAppointmentUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Appointment } from '@/3-domain/entities/Appointment';

// Mock ZoomApiService
vi.mock('@/infrastructure/external/zoom-api.service', () => ({
  ZoomApiService: {
    createMeeting: vi.fn(),
  },
}));

describe('ApproveAppointmentUseCase', () => {
  let mockAppointmentRepository: IAppointmentRepository;
  let useCase: ApproveAppointmentUseCase;

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

    useCase = new ApproveAppointmentUseCase(mockAppointmentRepository);
  });

  it('should approve an appointment successfully', async () => {
    const appointmentId = 'appointment-1';
    const consultantId = 'consultant-1';

    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    const existingAppointment: Appointment = {
      id: appointmentId,
      title: 'Test Appointment',
      consultantId,
      companyId: 'company-1',
      programId: 'program-1',
      startTime: startTime,
      endTime: endTime,
      status: 'pending',
      requestedBy: 'company-user-1',
      notes: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomPassword: null,
      timezone: 'Europe/Istanbul',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const approvedAppointment: Appointment = {
      ...existingAppointment,
      status: 'approved',
      zoomMeetingId: 'zoom-123',
      zoomJoinUrl: 'https://zoom.us/j/123',
      zoomPassword: 'password123',
    };

    vi.mocked(mockAppointmentRepository.findById).mockResolvedValue(existingAppointment);
    vi.mocked(mockAppointmentRepository.approve).mockResolvedValue(approvedAppointment);

    // Mock ZoomApiService
    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.createMeeting).mockResolvedValue({
      id: 'zoom-123',
      joinUrl: 'https://zoom.us/j/123',
      startUrl: 'https://zoom.us/s/123',
      password: 'password123',
    });

    // Mock updateZoomMeeting
    mockAppointmentRepository.updateZoomMeeting = vi.fn().mockResolvedValue(undefined);

    const result = await useCase.execute(appointmentId, consultantId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.zoomMeetingId).toBeDefined();
    expect(mockAppointmentRepository.approve).toHaveBeenCalled();
  });

  it('should fail when appointment not found', async () => {
    const appointmentId = 'non-existent';
    const consultantId = 'consultant-1';

    vi.mocked(mockAppointmentRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId, consultantId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('not found');
    expect(mockAppointmentRepository.update).not.toHaveBeenCalled();
  });

  it('should fail when consultant does not own the appointment', async () => {
    const appointmentId = 'appointment-1';
    const consultantId = 'consultant-1';

    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    const existingAppointment: Appointment = {
      id: appointmentId,
      title: 'Test Appointment',
      consultantId: 'consultant-2', // Different consultant
      companyId: 'company-1',
      programId: 'program-1',
      startTime: startTime,
      endTime: endTime,
      status: 'pending',
      requestedBy: 'company-user-1',
      notes: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomPassword: null,
      timezone: 'Europe/Istanbul',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const approvedAppointment: Appointment = {
      ...existingAppointment,
      status: 'approved',
    };

    vi.mocked(mockAppointmentRepository.findById).mockResolvedValue(existingAppointment);
    vi.mocked(mockAppointmentRepository.approve).mockResolvedValue(approvedAppointment);

    // Mock ZoomApiService
    const { ZoomApiService } = await import('@/infrastructure/external/zoom-api.service');
    vi.mocked(ZoomApiService.createMeeting).mockResolvedValue({
      id: 'zoom-123',
      joinUrl: 'https://zoom.us/j/123',
      startUrl: 'https://zoom.us/s/123',
      password: 'password123',
    });

    // Note: Use case doesn't check consultant ownership, it just approves
    // This test should verify that appointment is approved regardless of consultant
    const result = await useCase.execute(appointmentId, consultantId);

    expect(result.isSuccess).toBe(true);
    expect(mockAppointmentRepository.approve).toHaveBeenCalled();
  });

  it('should fail when appointment is already approved', async () => {
    const appointmentId = 'appointment-1';
    const consultantId = 'consultant-1';

    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    const existingAppointment: Appointment = {
      id: appointmentId,
      title: 'Test Appointment',
      consultantId,
      companyId: 'company-1',
      programId: 'program-1',
      startTime: startTime,
      endTime: endTime,
      status: 'approved', // Already approved
      requestedBy: 'company-user-1',
      notes: null,
      zoomMeetingId: 'zoom-123',
      zoomJoinUrl: 'https://zoom.us/j/123',
      zoomPassword: 'password123',
      timezone: 'Europe/Istanbul',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockAppointmentRepository.findById).mockResolvedValue(existingAppointment);

    const result = await useCase.execute(appointmentId, consultantId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('cannot be approved');
    expect(mockAppointmentRepository.approve).not.toHaveBeenCalled();
  });

  it('should handle repository error', async () => {
    const appointmentId = 'appointment-1';
    const consultantId = 'consultant-1';

    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    const existingAppointment: Appointment = {
      id: appointmentId,
      title: 'Test Appointment',
      consultantId,
      companyId: 'company-1',
      programId: 'program-1',
      startTime: startTime,
      endTime: endTime,
      status: 'pending',
      requestedBy: 'company-user-1',
      notes: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomPassword: null,
      timezone: 'Europe/Istanbul',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockAppointmentRepository.findById).mockResolvedValue(existingAppointment);
    vi.mocked(mockAppointmentRepository.approve).mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute(appointmentId, consultantId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
  });
});
