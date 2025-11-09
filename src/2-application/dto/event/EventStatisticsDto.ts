/**
 * Event Statistics DTO
 * Sprint 10: Etkinlik Yönetimi
 *
 * Etkinlik katılım istatistikleri için DTO'lar
 */

import { z } from 'zod';

/**
 * Event Statistics Response
 */
export interface EventStatisticsDto {
  eventId: string;
  eventTitle: string;

  // Katılım istatistikleri
  totalRegistrations: number;
  totalAttended: number;
  attendanceRate: number; // percentage (0-100)

  // Kapasite bilgileri
  maxAttendees: number | null;
  currentAttendees: number;
  capacityUtilization: number | null; // percentage (0-100) if maxAttendees exists

  // Firma bazlı katılım
  companiesCount: number;
  companyAttendance: Array<{
    companyId: string;
    companyName: string;
    registrations: number;
    attended: number;
    attendanceRate: number;
  }>;

  // Zaman bazlı istatistikler
  registrationsByDate: Array<{
    date: string; // YYYY-MM-DD
    count: number;
  }>;

  // Durum dağılımı
  statusDistribution: {
    registered: number; // Kayıtlı ama katılmadı
    attended: number; // Katıldı
    cancelled: number; // İptal edildi (gelecekte)
  };
}

/**
 * Program Statistics Response
 */
export interface ProgramEventStatisticsDto {
  programId: string;
  programName: string;

  // Etkinlik istatistikleri
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;

  // Katılım istatistikleri
  totalRegistrations: number;
  totalAttended: number;
  averageAttendanceRate: number;

  // Firma bazlı katılım
  companiesParticipated: number;
  topParticipatingCompanies: Array<{
    companyId: string;
    companyName: string;
    eventsAttended: number;
    attendanceRate: number;
  }>;
}

/**
 * Consultant Statistics Response
 */
export interface ConsultantEventStatisticsDto {
  consultantId: string;
  consultantName: string;

  // Etkinlik istatistikleri
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;

  // Katılım istatistikleri
  totalRegistrations: number;
  totalAttended: number;
  averageAttendanceRate: number;

  // Program bazlı dağılım
  eventsByProgram: Array<{
    programId: string;
    programName: string;
    eventsCount: number;
    averageAttendanceRate: number;
  }>;
}

// Zod Schemas
export const EventStatisticsDtoSchema = z.object({
  eventId: z.string().uuid(),
});

export const ProgramEventStatisticsDtoSchema = z.object({
  programId: z.string().uuid(),
});

export const ConsultantEventStatisticsDtoSchema = z.object({
  consultantId: z.string().uuid(),
});
