/**
 * Appointment DTOs
 * Application layer data transfer objects for Appointment module
 */

import { z } from 'zod';
import type { AppointmentStatus } from '@/domain/enums/AppointmentStatus';

/**
 * Create Appointment DTO Schema
 */
export const CreateAppointmentDtoSchema = z
  .object({
    consultantId: z.string().uuid('Geçerli bir danışman ID giriniz'),
    companyId: z.string().uuid('Geçerli bir firma ID giriniz'),
    programId: z.union([z.string().uuid('Geçerli bir program ID giriniz'), z.null()]).optional(),
    title: z
      .string()
      .min(1, 'Randevu başlığı gereklidir')
      .max(255, 'Randevu başlığı en fazla 255 karakter olabilir'),
    description: z
      .union([z.string().max(5000, 'Açıklama en fazla 5000 karakter olabilir'), z.null()])
      .optional(),
    startTime: z.string().datetime('Geçerli bir başlangıç tarihi giriniz'),
    endTime: z.string().datetime('Geçerli bir bitiş tarihi giriniz'),
    timezone: z.string().default('Europe/Istanbul'),
    requestedBy: z.string().uuid('Geçerli bir kullanıcı ID giriniz'),
    companyNotes: z
      .union([z.string().max(1000, 'Notlar en fazla 1000 karakter olabilir'), z.null()])
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return start < end;
    },
    {
      message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return durationMinutes >= 15;
    },
    {
      message: 'Randevu süresi en az 15 dakika olmalıdır',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      return start.getTime() > Date.now();
    },
    {
      message: 'Başlangıç tarihi geçmişte olamaz',
      path: ['startTime'],
    }
  );

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentDtoSchema>;

/**
 * Update Appointment DTO Schema
 */
export const UpdateAppointmentDtoSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).nullable().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    timezone: z.string().optional(),
    notes: z.string().max(1000).nullable().optional(), // Consultant notları
    companyNotes: z.string().max(1000).nullable().optional(), // Company notları
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        return start < end;
      }
      return true;
    },
    {
      message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        return durationMinutes >= 15;
      }
      return true;
    },
    {
      message: 'Randevu süresi en az 15 dakika olmalıdır',
      path: ['endTime'],
    }
  );

export type UpdateAppointmentDto = z.infer<typeof UpdateAppointmentDtoSchema>;

/**
 * Appointment Filter DTO Schema
 */
export const AppointmentFilterDtoSchema = z.object({
  consultantId: z.string().uuid().nullable().optional(),
  companyId: z.string().uuid().nullable().optional(),
  programId: z.string().uuid().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  search: z.string().max(255).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type AppointmentFilterDto = z.infer<typeof AppointmentFilterDtoSchema>;

/**
 * Approve Appointment DTO Schema
 */
export const ApproveAppointmentDtoSchema = z.object({
  notes: z.string().max(1000, 'Notlar en fazla 1000 karakter olabilir').nullable().optional(),
});

export type ApproveAppointmentDto = z.infer<typeof ApproveAppointmentDtoSchema>;

/**
 * Reject Appointment DTO Schema
 */
export const RejectAppointmentDtoSchema = z.object({
  reason: z
    .string()
    .min(1, 'Red nedeni gereklidir')
    .max(500, 'Red nedeni en fazla 500 karakter olabilir'),
});

export type RejectAppointmentDto = z.infer<typeof RejectAppointmentDtoSchema>;

/**
 * Reschedule Appointment DTO Schema
 */
export const RescheduleAppointmentDtoSchema = z
  .object({
    newStartTime: z.string().datetime('Geçerli bir başlangıç tarihi giriniz'),
    newEndTime: z.string().datetime('Geçerli bir bitiş tarihi giriniz'),
  })
  .refine(
    (data) => {
      const start = new Date(data.newStartTime);
      const end = new Date(data.newEndTime);
      return start < end;
    },
    {
      message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
      path: ['newEndTime'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.newStartTime);
      const end = new Date(data.newEndTime);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return durationMinutes >= 15;
    },
    {
      message: 'Randevu süresi en az 15 dakika olmalıdır',
      path: ['newEndTime'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.newStartTime);
      return start.getTime() > Date.now();
    },
    {
      message: 'Başlangıç tarihi geçmişte olamaz',
      path: ['newStartTime'],
    }
  );

export type RescheduleAppointmentDto = z.infer<typeof RescheduleAppointmentDtoSchema>;

/**
 * Appointment Response DTO (API response)
 */
export interface AppointmentResponseDto {
  id: string;
  consultantId: string;
  companyId: string;
  programId: string | null;
  title: string;
  description: string | null;
  status: AppointmentStatus;
  startTime: string; // ISO string
  endTime: string; // ISO string
  timezone: string;
  requestedBy: string;
  requestedAt: string; // ISO string
  approvedAt: string | null; // ISO string
  approvedBy: string | null;
  rejectedAt: string | null; // ISO string
  rejectedBy: string | null;
  rejectionReason: string | null;
  rescheduledFrom: string | null;
  rescheduledAt: string | null; // ISO string
  rescheduledBy: string | null;
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomPassword: string | null;
  notes: string | null; // Consultant notları (deprecated, use consultantNotes)
  consultantNotes: string | null; // Consultant notları
  companyNotes: string | null; // Company notları
  attendedAt: string | null; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Appointment List Response DTO
 */
export interface AppointmentListResponseDto {
  appointments: AppointmentResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
