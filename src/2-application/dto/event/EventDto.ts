/**
 * Event DTOs
 * Application layer data transfer objects for Event module
 */

import { z } from 'zod';
import { EventCategory, EventStatus } from '@/domain/entities/Event';

/**
 * Create Event DTO Schema
 */
export const CreateEventDtoSchema = z
  .object({
    programId: z.string().uuid('Geçerli bir program ID giriniz'),
    consultantId: z.string().uuid('Geçerli bir danışman ID giriniz'),
    title: z
      .string()
      .min(1, 'Etkinlik başlığı gereklidir')
      .max(255, 'Etkinlik başlığı en fazla 255 karakter olabilir'),
    description: z
      .string()
      .max(5000, 'Açıklama en fazla 5000 karakter olabilir')
      .nullable()
      .optional(),
    category: z.enum(['webinar', 'workshop', 'networking', 'announcement', 'other']).optional(),
    status: z.enum(['draft', 'scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
    startTime: z.string().datetime('Geçerli bir başlangıç tarihi giriniz'),
    endTime: z.string().datetime('Geçerli bir bitiş tarihi giriniz'),
    timezone: z.string().default('Europe/Istanbul'),
    attendanceRequired: z.boolean().default(true),
    maxAttendees: z
      .number()
      .int()
      .positive('Maksimum katılımcı sayısı pozitif olmalıdır')
      .nullable()
      .optional(),
    organizerName: z.string().max(255).nullable().optional(),
    organizerEmail: z.string().email('Geçerli bir email adresi giriniz').nullable().optional(),
    isPublic: z.boolean().default(true),
    createZoomMeeting: z.boolean().default(true),
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
      return start.getTime() > Date.now();
    },
    {
      message: 'Başlangıç tarihi geçmişte olamaz',
      path: ['startTime'],
    }
  );

export type CreateEventDto = z.infer<typeof CreateEventDtoSchema>;

/**
 * Update Event DTO Schema
 */
export const UpdateEventDtoSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).nullable().optional(),
    category: z.enum(['webinar', 'workshop', 'networking', 'announcement', 'other']).optional(),
    status: z.enum(['draft', 'scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    timezone: z.string().optional(),
    attendanceRequired: z.boolean().optional(),
    maxAttendees: z.number().int().positive().nullable().optional(),
    organizerName: z.string().max(255).nullable().optional(),
    organizerEmail: z.string().email().nullable().optional(),
    isPublic: z.boolean().optional(),
    updateZoomMeeting: z.boolean().default(false),
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
  );

export type UpdateEventDto = z.infer<typeof UpdateEventDtoSchema>;

/**
 * Event Filter DTO Schema
 */
export const EventFilterDtoSchema = z.object({
  programId: z.string().uuid().nullable().optional(),
  consultantId: z.string().uuid().nullable().optional(),
  category: z.enum(['webinar', 'workshop', 'networking', 'announcement', 'other']).optional(),
  status: z.enum(['draft', 'scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  search: z.string().max(255).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
});

export type EventFilterDto = z.infer<typeof EventFilterDtoSchema>;

/**
 * Register Attendance DTO Schema
 */
export const RegisterAttendanceDtoSchema = z.object({
  eventId: z.string().uuid('Geçerli bir etkinlik ID giriniz'),
  userId: z.string().uuid('Geçerli bir kullanıcı ID giriniz'),
  companyId: z.string().uuid('Geçerli bir firma ID giriniz'),
  notes: z.string().max(1000).nullable().optional(),
});

export type RegisterAttendanceDto = z.infer<typeof RegisterAttendanceDtoSchema>;

/**
 * Event Response DTO (API response)
 */
export interface EventResponseDto {
  id: string;
  programId: string;
  consultantId: string;
  title: string;
  description: string | null;
  category: EventCategory;
  status: EventStatus;
  startTime: string; // ISO string
  endTime: string; // ISO string
  timezone: string;
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomPassword: string | null;
  attendanceRequired: boolean;
  maxAttendees: number | null;
  currentAttendees: number;
  organizerName: string | null;
  organizerEmail: string | null;
  isPublic: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdBy: string | null;
}

/**
 * Event List Response DTO
 */
export interface EventListResponseDto {
  events: EventResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Event Attendance Response DTO
 */
export interface EventAttendanceResponseDto {
  id: string;
  eventId: string;
  userId: string;
  companyId: string;
  userName: string;
  companyName: string;
  registeredAt: string; // ISO string
  attendedAt: string | null; // ISO string
  notes: string | null;
}
