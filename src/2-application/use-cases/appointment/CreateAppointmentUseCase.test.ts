/**
 * Unit Tests for CreateAppointmentUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateAppointmentUseCase } from './CreateAppointmentUseCase';
import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import { Appointment } from '@/domain/entities/Appointment';

describe('CreateAppointmentUseCase', () => {
  let mockAppointmentRepository: IAppointmentRepository;
  let useCase: CreateAppointmentUseCase;

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
    };

    useCase = new CreateAppointmentUseCase(mockAppointmentRepository);
  });

  it('should create an appointment successfully when consultant is available', async () => {
    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    const appointmentData = {
      title: 'Test Appointment',
      consultantId: 'consultant-1',
      companyId: 'company-1',
      programId: 'program-1',
      startTime: startTime,
      endTime: endTime,
      requestedBy: 'company-user-1',
    };

    const createdAppointment: Appointment = {
      id: 'appointment-1',
      ...appointmentData,
      status: 'pending',
      notes: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomPassword: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock conflict check - no conflicts
    vi.mocked(mockAppointmentRepository.findConflictingAppointments).mockResolvedValue([]);
    vi.mocked(mockAppointmentRepository.create).mockResolvedValue(createdAppointment);

    const result = await useCase.execute(appointmentData);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value?.id).toBe('appointment-1');
    expect(mockAppointmentRepository.create).toHaveBeenCalledWith(appointmentData);
  });

  it('should fail when there is a conflicting appointment', async () => {
    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    const appointmentData = {
      title: 'Test Appointment',
      consultantId: 'consultant-1',
      companyId: 'company-1',
      programId: 'program-1',
      startTime: startTime,
      endTime: endTime,
      requestedBy: 'company-user-1',
    };

    const conflictingStartTime = new Date(futureDate);
    conflictingStartTime.setHours(10, 30, 0, 0);
    const conflictingEndTime = new Date(futureDate);
    conflictingEndTime.setHours(11, 30, 0, 0);

    const conflictingAppointment: Appointment = {
      id: 'existing-appointment',
      title: 'Existing Appointment',
      consultantId: 'consultant-1',
      companyId: 'company-2',
      programId: 'program-1',
      startTime: conflictingStartTime,
      endTime: conflictingEndTime,
      status: 'approved',
      requestedBy: 'company-user-2',
      notes: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomPassword: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock conflict check - conflict found
    vi.mocked(mockAppointmentRepository.findConflictingAppointments).mockResolvedValue([
      conflictingAppointment,
    ]);

    const result = await useCase.execute(appointmentData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('randevusu bulunmaktadır');
    expect(mockAppointmentRepository.create).not.toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const invalidData = {
      title: '',
      consultantId: 'consultant-1',
      // Missing required fields
    } as any;

    const result = await useCase.execute(invalidData);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeDefined();
  });

  it('should handle repository error', async () => {
    // Use future dates to avoid validation errors
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const startTime = new Date(futureDate);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(futureDate);
    endTime.setHours(11, 0, 0, 0);

    const appointmentData = {
      title: 'Test Appointment',
      consultantId: 'consultant-1',
      companyId: 'company-1',
      programId: 'program-1',
      startTime: startTime,
      endTime: endTime,
      requestedBy: 'company-user-1',
    };

    vi.mocked(mockAppointmentRepository.findConflictingAppointments).mockResolvedValue([]);
    vi.mocked(mockAppointmentRepository.create).mockRejectedValue(new Error('Database error'));

    const result = await useCase.execute(appointmentData);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Database error');
  });
});
