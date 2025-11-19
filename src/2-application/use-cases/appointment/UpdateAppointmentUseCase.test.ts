/**
 * Unit Tests for UpdateAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateAppointmentUseCase } from './UpdateAppointmentUseCase';
import { IAppointmentRepository } from '@/3-domain/interfaces/repositories/IAppointmentRepository';
import { Appointment } from '@/3-domain/entities/Appointment';
import type { AppointmentStatus } from '@/3-domain/enums/AppointmentStatus';

describe('UpdateAppointmentUseCase', () => {
  let mockRepository: IAppointmentRepository;
  let useCase: UpdateAppointmentUseCase;

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

    useCase = new UpdateAppointmentUseCase(mockRepository);
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

  it('should update appointment successfully', async () => {
    const appointmentId = 'appointment-1';
    const updateData = { title: 'Updated Title', description: 'Updated Description' };
    const existingAppointment = createMockAppointment({ id: appointmentId });
    const updatedAppointment = createMockAppointment({ id: appointmentId, ...updateData });

    vi.mocked(mockRepository.findById).mockResolvedValue(existingAppointment);
    vi.mocked(mockRepository.update).mockResolvedValue(updatedAppointment);

    const result = await useCase.execute(appointmentId, updateData);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedAppointment);
    expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should return error when appointment ID is empty', async () => {
    const updateData = { title: 'Updated Title' };

    const result = await useCase.execute('', updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment ID is required');
    expect(result.error?.statusCode).toBe(400);
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when appointment not found', async () => {
    const appointmentId = 'non-existent';
    const updateData = { title: 'Updated Title' };

    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(appointmentId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Appointment not found');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should check for conflicts when updating time', async () => {
    const appointmentId = 'appointment-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    const updateData = { startTime: newStartTime, endTime: newEndTime };
    const existingAppointment = createMockAppointment({ id: appointmentId });
    const updatedAppointment = createMockAppointment({ id: appointmentId, ...updateData });

    vi.mocked(mockRepository.findById).mockResolvedValue(existingAppointment);
    vi.mocked(mockRepository.findConflictingAppointments).mockResolvedValue([]);
    vi.mocked(mockRepository.update).mockResolvedValue(updatedAppointment);

    const result = await useCase.execute(appointmentId, updateData);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findConflictingAppointments).toHaveBeenCalled();
  });

  it('should return error when there are conflicting appointments', async () => {
    const appointmentId = 'appointment-1';
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const newStartTime = new Date(futureDate);
    newStartTime.setHours(14, 0, 0, 0);
    const newEndTime = new Date(futureDate);
    newEndTime.setHours(15, 0, 0, 0);

    const updateData = { startTime: newStartTime, endTime: newEndTime };
    const existingAppointment = createMockAppointment({ id: appointmentId });
    const conflictingAppointment = createMockAppointment({
      id: 'appointment-2',
      startTime: newStartTime,
      endTime: newEndTime,
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(existingAppointment);
    vi.mocked(mockRepository.findConflictingAppointments).mockResolvedValue([
      conflictingAppointment,
    ]);

    const result = await useCase.execute(appointmentId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('başka bir randevusu bulunmaktadır');
    expect(result.error?.statusCode).toBe(409);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should convert string dates to Date objects', async () => {
    const appointmentId = 'appointment-1';
    const updateData = {
      startTime: '2025-06-01T10:00:00Z' as any,
      endTime: '2025-06-01T11:00:00Z' as any,
    };
    const existingAppointment = createMockAppointment({ id: appointmentId });
    const updatedAppointment = createMockAppointment({ id: appointmentId });

    vi.mocked(mockRepository.findById).mockResolvedValue(existingAppointment);
    vi.mocked(mockRepository.findConflictingAppointments).mockResolvedValue([]);
    vi.mocked(mockRepository.update).mockResolvedValue(updatedAppointment);

    const result = await useCase.execute(appointmentId, updateData);

    expect(result.isSuccess).toBe(true);
    const updateCall = vi.mocked(mockRepository.update).mock.calls[0][1];
    expect(updateCall.startTime).toBeInstanceOf(Date);
    expect(updateCall.endTime).toBeInstanceOf(Date);
  });

  it('should handle repository errors', async () => {
    const appointmentId = 'appointment-1';
    const updateData = { title: 'Updated Title' };
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(appointmentId, updateData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
    expect(result.error?.statusCode).toBe(500);
  });
});
