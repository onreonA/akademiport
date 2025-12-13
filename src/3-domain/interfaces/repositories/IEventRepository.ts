import {
  Event,
  CreateEventDto,
  UpdateEventDto,
  EventFilterDto,
  EventAttendance,
} from '../../entities/Event';

export interface IEventRepository {
  /**
   * Etkinlik oluştur
   */
  create(data: CreateEventDto): Promise<Event>;

  /**
   * ID ile etkinlik getir
   */
  findById(id: string): Promise<Event | null>;

  /**
   * Tüm etkinlikleri listele (filtreleme ile)
   */
  findAll(filters?: EventFilterDto): Promise<{ data: Event[]; total: number }>;

  /**
   * Programa ait etkinlikleri getir
   */
  findByProgramId(
    programId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]>;

  /**
   * Danışmana ait etkinlikleri getir
   */
  findByConsultantId(
    consultantId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]>;

  /**
   * Tarih aralığındaki etkinlikleri getir
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: { programId?: string; consultantId?: string }
  ): Promise<Event[]>;

  /**
   * Etkinlik güncelle
   */
  update(id: string, data: UpdateEventDto): Promise<Event>;

  /**
   * Etkinlik sil (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Etkinlik var mı kontrol et
   */
  exists(id: string): Promise<boolean>;

  /**
   * Katılım kaydı oluştur
   */
  registerAttendance(
    eventId: string,
    userId: string,
    companyId: string,
    notes?: string
  ): Promise<EventAttendance>;

  /**
   * Katılım kaydını iptal et
   */
  cancelAttendance(eventId: string, userId: string): Promise<void>;

  /**
   * Katılım kaydını "katıldı" olarak işaretle (danışman için)
   */
  markAttendanceAsAttended(attendanceId: string): Promise<EventAttendance>;

  /**
   * Etkinlik katılımcılarını getir
   */
  getAttendees(eventId: string): Promise<EventAttendance[]>;

  /**
   * Kullanıcının katıldığı etkinlikleri getir
   */
  findByUserId(
    userId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]>;

  /**
   * Firmaya ait katılımcıların katıldığı etkinlikleri getir
   */
  findByCompanyId(
    companyId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]>;

  /**
   * Katılımcı sayısını güncelle
   */
  updateAttendeeCount(eventId: string, count: number): Promise<void>;

  /**
   * Zoom meeting bilgilerini güncelle
   */
  updateZoomMeeting(
    eventId: string,
    meetingId: string,
    joinUrl: string,
    startUrl: string,
    password?: string
  ): Promise<void>;
}
