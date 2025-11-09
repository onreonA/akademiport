/**
 * Appointment Entity
 * Randevu entity'si - Consultant-Company birebir randevular
 */

import type { AppointmentStatus } from '../enums/AppointmentStatus';

export interface Appointment {
  id: string;
  consultantId: string;
  companyId: string;
  programId: string | null; // Optional: Program bazlı randevular için
  title: string;
  description: string | null;
  status: AppointmentStatus;

  // Tarih/Saat bilgileri
  startTime: Date;
  endTime: Date;
  timezone: string;

  // Talep bilgileri
  requestedBy: string; // Company user ID
  requestedAt: Date;

  // Onay bilgileri
  approvedAt: Date | null;
  approvedBy: string | null; // Consultant ID

  // Red bilgileri
  rejectedAt: Date | null;
  rejectedBy: string | null; // Consultant ID
  rejectionReason: string | null;

  // Revize (Reschedule) bilgileri
  rescheduledFrom: string | null; // Eski appointment ID (reschedule chain)
  rescheduledAt: Date | null;
  rescheduledBy: string | null; // Consultant veya Company user ID

  // Zoom entegrasyonu
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomPassword: string | null;

  // Notlar
  notes: string | null; // Consultant notları
  companyNotes: string | null; // Company notları

  // Katılım takibi
  attendedAt: Date | null;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateAppointmentDto {
  consultantId: string;
  companyId: string;
  programId?: string | null;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
  timezone?: string;
  requestedBy: string; // Company user ID
  companyNotes?: string | null;
}

export interface UpdateAppointmentDto {
  title?: string;
  description?: string | null;
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  notes?: string | null; // Consultant notları
  companyNotes?: string | null; // Company notları
}

export interface AppointmentFilterDto {
  consultantId?: string | null;
  companyId?: string | null;
  programId?: string | null;
  status?: AppointmentStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Appointment Business Logic
 */
export class AppointmentEntity implements Appointment {
  id: string;
  consultantId: string;
  companyId: string;
  programId: string | null;
  title: string;
  description: string | null;
  status: AppointmentStatus;
  startTime: Date;
  endTime: Date;
  timezone: string;
  requestedBy: string;
  requestedAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  rescheduledFrom: string | null;
  rescheduledAt: Date | null;
  rescheduledBy: string | null;
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomPassword: string | null;
  notes: string | null;
  companyNotes: string | null;
  attendedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: Appointment) {
    this.id = data.id;
    this.consultantId = data.consultantId;
    this.companyId = data.companyId;
    this.programId = data.programId ?? null;
    this.title = data.title;
    this.description = data.description ?? null;
    this.status = data.status;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.timezone = data.timezone;
    this.requestedBy = data.requestedBy;
    this.requestedAt = data.requestedAt;
    this.approvedAt = data.approvedAt ?? null;
    this.approvedBy = data.approvedBy ?? null;
    this.rejectedAt = data.rejectedAt ?? null;
    this.rejectedBy = data.rejectedBy ?? null;
    this.rejectionReason = data.rejectionReason ?? null;
    this.rescheduledFrom = data.rescheduledFrom ?? null;
    this.rescheduledAt = data.rescheduledAt ?? null;
    this.rescheduledBy = data.rescheduledBy ?? null;
    this.zoomMeetingId = data.zoomMeetingId ?? null;
    this.zoomJoinUrl = data.zoomJoinUrl ?? null;
    this.zoomStartUrl = data.zoomStartUrl ?? null;
    this.zoomPassword = data.zoomPassword ?? null;
    this.notes = data.notes ?? null;
    this.companyNotes = data.companyNotes ?? null;
    this.attendedAt = data.attendedAt ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt ?? null;
  }

  /**
   * Randevu başlamış mı?
   */
  hasStarted(): boolean {
    return this.startTime.getTime() <= Date.now();
  }

  /**
   * Randevu bitmiş mi?
   */
  hasEnded(): boolean {
    return this.endTime.getTime() <= Date.now();
  }

  /**
   * Randevu devam ediyor mu?
   */
  isOngoing(): boolean {
    const now = Date.now();
    return this.startTime.getTime() <= now && this.endTime.getTime() > now;
  }

  /**
   * Randevu gelecekte mi?
   */
  isUpcoming(): boolean {
    return this.startTime.getTime() > Date.now();
  }

  /**
   * Randevu onaylanabilir mi?
   */
  canApprove(): boolean {
    return this.status === 'pending';
  }

  /**
   * Randevu reddedilebilir mi?
   */
  canReject(): boolean {
    return this.status === 'pending';
  }

  /**
   * Randevu revize edilebilir mi?
   */
  canReschedule(): boolean {
    return this.status === 'pending' || this.status === 'approved';
  }

  /**
   * Randevu iptal edilebilir mi?
   */
  canCancel(): boolean {
    return this.status === 'pending' || this.status === 'approved';
  }

  /**
   * Randevu onayla
   */
  approve(approvedBy: string, notes?: string): void {
    if (!this.canApprove()) {
      throw new Error(`Randevu onaylanamaz. Mevcut durum: ${this.status}`);
    }

    this.status = 'approved';
    this.approvedAt = new Date();
    this.approvedBy = approvedBy;
    this.notes = notes ?? this.notes;
    this.touch();
  }

  /**
   * Randevu reddet
   */
  reject(rejectedBy: string, reason?: string): void {
    if (!this.canReject()) {
      throw new Error(`Randevu reddedilemez. Mevcut durum: ${this.status}`);
    }

    this.status = 'rejected';
    this.rejectedAt = new Date();
    this.rejectedBy = rejectedBy;
    this.rejectionReason = reason ?? null;
    this.touch();
  }

  /**
   * Randevu iptal et
   */
  cancel(cancelledBy: string): void {
    if (!this.canCancel()) {
      throw new Error(`Randevu iptal edilemez. Mevcut durum: ${this.status}`);
    }

    this.status = 'cancelled';
    this.touch();
  }

  /**
   * Randevu tamamlandı olarak işaretle
   */
  complete(): void {
    if (this.status !== 'approved') {
      throw new Error(`Sadece onaylanmış randevular tamamlanabilir. Mevcut durum: ${this.status}`);
    }

    this.status = 'completed';
    this.touch();
  }

  /**
   * Katılım kaydı yap
   */
  markAsAttended(): void {
    if (this.status !== 'approved' && this.status !== 'completed') {
      throw new Error('Sadece onaylanmış randevular için katılım kaydı yapılabilir');
    }

    if (this.attendedAt) {
      throw new Error('Bu randevu için zaten katılım kaydı yapılmış');
    }

    this.attendedAt = new Date();
    this.touch();
  }

  /**
   * Zoom meeting var mı?
   */
  hasZoomMeeting(): boolean {
    return !!this.zoomMeetingId && !!this.zoomJoinUrl;
  }

  /**
   * Zoom meeting bilgilerini güncelle
   */
  setZoomMeeting(meetingId: string, joinUrl: string, startUrl: string, password?: string): void {
    this.zoomMeetingId = meetingId;
    this.zoomJoinUrl = joinUrl;
    this.zoomStartUrl = startUrl;
    this.zoomPassword = password ?? null;
    this.touch();
  }

  /**
   * Zoom meeting bilgilerini temizle
   */
  clearZoomMeeting(): void {
    this.zoomMeetingId = null;
    this.zoomJoinUrl = null;
    this.zoomStartUrl = null;
    this.zoomPassword = null;
    this.touch();
  }

  /**
   * Reschedule chain'i var mı?
   */
  isRescheduled(): boolean {
    return !!this.rescheduledFrom;
  }

  /**
   * Reschedule chain'i başlat (yeni appointment için)
   */
  setRescheduledFrom(oldAppointmentId: string, rescheduledBy: string): void {
    this.rescheduledFrom = oldAppointmentId;
    this.rescheduledAt = new Date();
    this.rescheduledBy = rescheduledBy;
    this.touch();
  }

  /**
   * Randevu durumunu güncelle (otomatik - completed için)
   */
  updateStatus(): void {
    if (this.status === 'cancelled' || this.status === 'rejected') {
      return; // İptal edilmiş veya reddedilmiş randevu durumu değişmez
    }

    if (this.hasEnded() && this.status === 'approved') {
      // Otomatik olarak completed yapmıyoruz, manuel olarak işaretlenmeli
      // Ama burada bir hook olarak kullanılabilir
    }

    this.touch();
  }

  /**
   * updatedAt'i güncelle
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validation
   */
  static validate(data: CreateAppointmentDto): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Randevu başlığı gereklidir');
    }

    if (!data.consultantId || data.consultantId.trim().length === 0) {
      errors.push('Danışman ID gereklidir');
    }

    if (!data.companyId || data.companyId.trim().length === 0) {
      errors.push('Firma ID gereklidir');
    }

    if (!data.requestedBy || data.requestedBy.trim().length === 0) {
      errors.push('Talep eden kullanıcı ID gereklidir');
    }

    if (!data.startTime) {
      errors.push('Başlangıç tarihi gereklidir');
    }

    if (!data.endTime) {
      errors.push('Bitiş tarihi gereklidir');
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.push('Başlangıç tarihi bitiş tarihinden önce olmalıdır');
    }

    if (data.startTime && data.startTime.getTime() < Date.now()) {
      errors.push('Başlangıç tarihi geçmişte olamaz');
    }

    // Randevu süresi en az 15 dakika olmalı
    if (data.startTime && data.endTime) {
      const durationMinutes = (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60);
      if (durationMinutes < 15) {
        errors.push('Randevu süresi en az 15 dakika olmalıdır');
      }
    }

    return errors;
  }
}
