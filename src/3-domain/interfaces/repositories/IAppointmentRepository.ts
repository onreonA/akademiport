import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilterDto,
} from '../../entities/Appointment';
import type { AppointmentStatus } from '../../enums/AppointmentStatus';

export interface IAppointmentRepository {
  /**
   * Randevu oluştur
   */
  create(data: CreateAppointmentDto): Promise<Appointment>;

  /**
   * ID ile randevu getir
   */
  findById(id: string): Promise<Appointment | null>;

  /**
   * Tüm randevuları listele (filtreleme ile)
   */
  findAll(filters?: AppointmentFilterDto): Promise<{ data: Appointment[]; total: number }>;

  /**
   * Danışmana ait randevuları getir
   */
  findByConsultantId(
    consultantId: string,
    filters?: { status?: AppointmentStatus; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]>;

  /**
   * Firmaya ait randevuları getir
   */
  findByCompanyId(
    companyId: string,
    filters?: { status?: AppointmentStatus; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]>;

  /**
   * Programa ait randevuları getir
   */
  findByProgramId(
    programId: string,
    filters?: { status?: AppointmentStatus; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]>;

  /**
   * Duruma göre randevuları getir
   */
  findByStatus(
    status: AppointmentStatus,
    filters?: { consultantId?: string; companyId?: string; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]>;

  /**
   * Tarih aralığındaki randevuları getir
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: { consultantId?: string; companyId?: string; programId?: string }
  ): Promise<Appointment[]>;

  /**
   * Çakışan randevuları bul (müsaitlik kontrolü için)
   * Belirtilen tarih/saat aralığında consultant'ın başka randevusu var mı?
   */
  findConflictingAppointments(
    consultantId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string // Bu ID'yi hariç tut (update/reschedule için)
  ): Promise<Appointment[]>;

  /**
   * Randevu güncelle
   */
  update(id: string, data: UpdateAppointmentDto): Promise<Appointment>;

  /**
   * Randevu sil (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Randevu var mı kontrol et
   */
  exists(id: string): Promise<boolean>;

  /**
   * Randevu onayla
   */
  approve(id: string, approvedBy: string, notes?: string): Promise<Appointment>;

  /**
   * Randevu reddet
   */
  reject(id: string, rejectedBy: string, reason?: string): Promise<Appointment>;

  /**
   * Randevu revize et (reschedule)
   * Eski randevuyu cancelled yapar, yeni randevu oluşturur
   */
  reschedule(
    id: string,
    newStartTime: Date,
    newEndTime: Date,
    rescheduledBy: string
  ): Promise<{ old: Appointment; new: Appointment }>;

  /**
   * Randevu tamamlandı olarak işaretle
   */
  markAsCompleted(id: string): Promise<Appointment>;

  /**
   * Katılım kaydı yap
   */
  markAsAttended(id: string): Promise<Appointment>;

  /**
   * Zoom meeting bilgilerini güncelle
   */
  updateZoomMeeting(
    appointmentId: string,
    meetingId: string,
    joinUrl: string,
    startUrl: string,
    password?: string
  ): Promise<void>;
}
