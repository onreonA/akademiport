/**
 * Event Entity
 * Etkinlik entity'si - Program bazlı toplu etkinlikler
 */

export type EventCategory = 'webinar' | 'workshop' | 'networking' | 'announcement' | 'other';
export type EventStatus = 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  programId: string;
  consultantId: string;
  title: string;
  description: string | null;
  category: EventCategory;
  status: EventStatus;

  // Tarih/Saat bilgileri
  startTime: Date;
  endTime: Date;
  timezone: string;

  // Zoom entegrasyonu
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomPassword: string | null;

  // Katılım yönetimi
  attendanceRequired: boolean;
  maxAttendees: number | null;
  currentAttendees: number;

  // Organizatör bilgileri
  organizerName: string | null;
  organizerEmail: string | null;

  // Metadata
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}

export interface CreateEventDto {
  programId: string;
  consultantId: string;
  title: string;
  description?: string | null;
  category?: EventCategory;
  status?: EventStatus;
  startTime: Date;
  endTime: Date;
  timezone?: string;
  attendanceRequired?: boolean;
  maxAttendees?: number | null;
  organizerName?: string | null;
  organizerEmail?: string | null;
  isPublic?: boolean;
  createZoomMeeting?: boolean; // Zoom meeting otomatik oluşturulsun mu?
}

export interface UpdateEventDto {
  title?: string;
  description?: string | null;
  category?: EventCategory;
  status?: EventStatus;
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  attendanceRequired?: boolean;
  maxAttendees?: number | null;
  organizerName?: string | null;
  organizerEmail?: string | null;
  isPublic?: boolean;
  updateZoomMeeting?: boolean; // Zoom meeting güncellensin mi?
}

export interface EventFilterDto {
  programId?: string | null;
  consultantId?: string | null;
  category?: EventCategory;
  status?: EventStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  companyId: string;
  userName: string;
  companyName: string;
  registeredAt: Date;
  attendedAt: Date | null;
  notes: string | null;
}

/**
 * Event Business Logic
 */
export class EventEntity implements Event {
  id: string;
  programId: string;
  consultantId: string;
  title: string;
  description: string | null;
  category: EventCategory;
  status: EventStatus;
  startTime: Date;
  endTime: Date;
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
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;

  constructor(data: Event) {
    this.id = data.id;
    this.programId = data.programId;
    this.consultantId = data.consultantId;
    this.title = data.title;
    this.description = data.description ?? null;
    this.category = data.category;
    this.status = data.status;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.timezone = data.timezone;
    this.zoomMeetingId = data.zoomMeetingId ?? null;
    this.zoomJoinUrl = data.zoomJoinUrl ?? null;
    this.zoomStartUrl = data.zoomStartUrl ?? null;
    this.zoomPassword = data.zoomPassword ?? null;
    this.attendanceRequired = data.attendanceRequired;
    this.maxAttendees = data.maxAttendees ?? null;
    this.currentAttendees = data.currentAttendees;
    this.organizerName = data.organizerName ?? null;
    this.organizerEmail = data.organizerEmail ?? null;
    this.isPublic = data.isPublic;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdBy = data.createdBy ?? null;
  }

  /**
   * Etkinlik başlamış mı?
   */
  hasStarted(): boolean {
    return this.startTime.getTime() <= Date.now();
  }

  /**
   * Etkinlik bitmiş mi?
   */
  hasEnded(): boolean {
    return this.endTime.getTime() <= Date.now();
  }

  /**
   * Etkinlik devam ediyor mu?
   */
  isOngoing(): boolean {
    const now = Date.now();
    return this.startTime.getTime() <= now && this.endTime.getTime() > now;
  }

  /**
   * Etkinlik gelecekte mi?
   */
  isUpcoming(): boolean {
    return this.startTime.getTime() > Date.now();
  }

  /**
   * Katılım kapasitesi dolu mu?
   */
  isFull(): boolean {
    if (this.maxAttendees === null) {
      return false;
    }
    return this.currentAttendees >= this.maxAttendees;
  }

  /**
   * Katılım kaydı yapılabilir mi?
   */
  canRegister(): boolean {
    if (this.status !== 'scheduled') {
      return false;
    }
    if (this.hasEnded()) {
      return false;
    }
    if (this.isFull()) {
      return false;
    }
    return true;
  }

  /**
   * Zoom meeting var mı?
   */
  hasZoomMeeting(): boolean {
    return !!this.zoomMeetingId && !!this.zoomJoinUrl;
  }

  /**
   * Etkinlik durumunu güncelle (otomatik)
   */
  updateStatus(): void {
    if (this.status === 'cancelled') {
      return; // İptal edilmiş etkinlik durumu değişmez
    }

    if (this.hasEnded()) {
      this.status = 'completed';
    } else if (this.isOngoing()) {
      this.status = 'ongoing';
    } else if (this.isUpcoming()) {
      this.status = 'scheduled';
    }

    this.touch();
  }

  /**
   * Katılımcı sayısını artır
   */
  incrementAttendees(): void {
    if (this.maxAttendees !== null && this.currentAttendees >= this.maxAttendees) {
      throw new Error('Etkinlik kapasitesi dolu');
    }
    this.currentAttendees++;
    this.touch();
  }

  /**
   * Katılımcı sayısını azalt
   */
  decrementAttendees(): void {
    if (this.currentAttendees > 0) {
      this.currentAttendees--;
      this.touch();
    }
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
   * Etkinliği iptal et
   */
  cancel(): void {
    this.status = 'cancelled';
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
  static validate(data: CreateEventDto): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Etkinlik başlığı gereklidir');
    }

    if (!data.programId || data.programId.trim().length === 0) {
      errors.push('Program ID gereklidir');
    }

    if (!data.consultantId || data.consultantId.trim().length === 0) {
      errors.push('Danışman ID gereklidir');
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

    if (data.maxAttendees !== null && data.maxAttendees < 1) {
      errors.push("Maksimum katılımcı sayısı 1'den küçük olamaz");
    }

    return errors;
  }
}
