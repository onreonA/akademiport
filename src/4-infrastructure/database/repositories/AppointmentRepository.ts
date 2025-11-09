import { IAppointmentRepository } from '@/domain/interfaces/repositories/IAppointmentRepository';
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilterDto,
} from '@/domain/entities/Appointment';
import type { AppointmentStatus } from '@/domain/enums/AppointmentStatus';
import { createClient } from '@/infrastructure/database/supabase-server';

export class AppointmentRepository implements IAppointmentRepository {
  async create(data: CreateAppointmentDto): Promise<Appointment> {
    const supabase = await createClient();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        consultant_id: data.consultantId,
        company_id: data.companyId,
        program_id: data.programId || null,
        title: data.title,
        description: data.description || null,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        timezone: data.timezone || 'Europe/Istanbul',
        requested_by: data.requestedBy,
        requested_at: new Date().toISOString(),
        status: 'pending',
        company_notes: data.companyNotes || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }

    return this.mapToEntity(appointment);
  }

  async findById(id: string): Promise<Appointment | null> {
    const supabase = await createClient();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find appointment: ${error.message}`);
    }

    return this.mapToEntity(appointment);
  }

  async findAll(filters?: AppointmentFilterDto): Promise<{ data: Appointment[]; total: number }> {
    const supabase = await createClient();

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (filters?.consultantId !== undefined && filters.consultantId !== null) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    if (filters?.companyId !== undefined && filters.companyId !== null) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters?.programId !== undefined && filters.programId !== null) {
      query = query.eq('program_id', filters.programId);
    }

    if (filters?.status !== undefined) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate !== undefined && filters.startDate !== null) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters?.endDate !== undefined && filters.endDate !== null) {
      query = query.lte('end_time', filters.endDate.toISOString());
    }

    if (filters?.search !== undefined && filters.search.trim() !== '') {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('start_time', { ascending: false });

    const finalQuery = limit > 0 ? query.range(offset, offset + limit - 1) : query;

    const { data: appointments, error, count } = await finalQuery;

    if (error) {
      throw new Error(`Failed to find appointments: ${error.message}`);
    }

    return {
      data: appointments?.map((a) => this.mapToEntity(a)) || [],
      total: count || 0,
    };
  }

  async findByConsultantId(
    consultantId: string,
    filters?: { status?: AppointmentStatus; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]> {
    const supabase = await createClient();

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('consultant_id', consultantId)
      .is('deleted_at', null);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate.toISOString());
    }

    query = query.order('start_time', { ascending: false });

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to find appointments by consultant: ${error.message}`);
    }

    return appointments?.map((a) => this.mapToEntity(a)) || [];
  }

  async findByCompanyId(
    companyId: string,
    filters?: { status?: AppointmentStatus; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]> {
    const supabase = await createClient();

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate.toISOString());
    }

    query = query.order('start_time', { ascending: false });

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to find appointments by company: ${error.message}`);
    }

    return appointments?.map((a) => this.mapToEntity(a)) || [];
  }

  async findByProgramId(
    programId: string,
    filters?: { status?: AppointmentStatus; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]> {
    const supabase = await createClient();

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('program_id', programId)
      .is('deleted_at', null);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate.toISOString());
    }

    query = query.order('start_time', { ascending: false });

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to find appointments by program: ${error.message}`);
    }

    return appointments?.map((a) => this.mapToEntity(a)) || [];
  }

  async findByStatus(
    status: AppointmentStatus,
    filters?: { consultantId?: string; companyId?: string; startDate?: Date; endDate?: Date }
  ): Promise<Appointment[]> {
    const supabase = await createClient();

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('status', status)
      .is('deleted_at', null);

    if (filters?.consultantId) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate.toISOString());
    }

    query = query.order('start_time', { ascending: false });

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to find appointments by status: ${error.message}`);
    }

    return appointments?.map((a) => this.mapToEntity(a)) || [];
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: { consultantId?: string; companyId?: string; programId?: string }
  ): Promise<Appointment[]> {
    const supabase = await createClient();

    let query = supabase
      .from('appointments')
      .select('*')
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .is('deleted_at', null);

    if (filters?.consultantId) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters?.programId) {
      query = query.eq('program_id', filters.programId);
    }

    query = query.order('start_time', { ascending: true });

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to find appointments by date range: ${error.message}`);
    }

    return appointments?.map((a) => this.mapToEntity(a)) || [];
  }

  async findConflictingAppointments(
    consultantId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<Appointment[]> {
    const supabase = await createClient();

    // Conflict detection: Randevular çakışıyor mu?
    // Çakışma durumları:
    // 1. Mevcut randevu başlangıcı yeni randevu aralığında
    // 2. Mevcut randevu bitişi yeni randevu aralığında
    // 3. Yeni randevu mevcut randevuyu tamamen kapsıyor

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('consultant_id', consultantId)
      .in('status', ['pending', 'approved'])
      .is('deleted_at', null)
      .or(
        `and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`
      );

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to find conflicting appointments: ${error.message}`);
    }

    // Client-side conflict detection (daha güvenilir)
    const conflicting = (appointments || []).filter((appointment) => {
      const appStart = new Date(appointment.start_time).getTime();
      const appEnd = new Date(appointment.end_time).getTime();
      const newStart = startTime.getTime();
      const newEnd = endTime.getTime();

      // Çakışma kontrolü
      return (
        (appStart <= newStart && appEnd > newStart) || // Mevcut randevu yeni randevunun başlangıcını kapsıyor
        (appStart < newEnd && appEnd >= newEnd) || // Mevcut randevu yeni randevunun bitişini kapsıyor
        (appStart >= newStart && appEnd <= newEnd) // Yeni randevu mevcut randevuyu tamamen kapsıyor
      );
    });

    return conflicting.map((a) => this.mapToEntity(a));
  }

  async update(id: string, data: UpdateAppointmentDto): Promise<Appointment> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startTime !== undefined) updateData.start_time = data.startTime.toISOString();
    if (data.endTime !== undefined) updateData.end_time = data.endTime.toISOString();
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.companyNotes !== undefined) updateData.company_notes = data.companyNotes;

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }

    return this.mapToEntity(appointment);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete appointment: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check appointment existence: ${error.message}`);
    }

    return !!data;
  }

  async approve(id: string, approvedBy: string, notes?: string): Promise<Appointment> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve appointment: ${error.message}`);
    }

    return this.mapToEntity(appointment);
  }

  async reject(id: string, rejectedBy: string, reason?: string): Promise<Appointment> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: rejectedBy,
    };

    if (reason !== undefined) {
      updateData.rejection_reason = reason;
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject appointment: ${error.message}`);
    }

    return this.mapToEntity(appointment);
  }

  async reschedule(
    id: string,
    newStartTime: Date,
    newEndTime: Date,
    rescheduledBy: string
  ): Promise<{ old: Appointment; new: Appointment }> {
    const supabase = await createClient();

    // Eski randevuyu al
    const oldAppointment = await this.findById(id);
    if (!oldAppointment) {
      throw new Error('Appointment not found');
    }

    // Eski randevuyu cancelled yap
    const { data: cancelledAppointment, error: cancelError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (cancelError) {
      throw new Error(`Failed to cancel old appointment: ${cancelError.message}`);
    }

    // Yeni randevu oluştur
    const { data: newAppointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        consultant_id: oldAppointment.consultantId,
        company_id: oldAppointment.companyId,
        program_id: oldAppointment.programId,
        title: oldAppointment.title,
        description: oldAppointment.description,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
        timezone: oldAppointment.timezone,
        requested_by: oldAppointment.requestedBy,
        requested_at: oldAppointment.requestedAt.toISOString(),
        status: 'pending', // Yeni randevu pending olarak başlar
        rescheduled_from: id,
        rescheduled_at: new Date().toISOString(),
        rescheduled_by: rescheduledBy,
        company_notes: oldAppointment.companyNotes,
        notes: oldAppointment.notes,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create rescheduled appointment: ${createError.message}`);
    }

    return {
      old: this.mapToEntity(cancelledAppointment),
      new: this.mapToEntity(newAppointment),
    };
  }

  async markAsCompleted(id: string): Promise<Appointment> {
    const supabase = await createClient();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark appointment as completed: ${error.message}`);
    }

    return this.mapToEntity(appointment);
  }

  async markAsAttended(id: string): Promise<Appointment> {
    const supabase = await createClient();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({
        attended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark appointment as attended: ${error.message}`);
    }

    return this.mapToEntity(appointment);
  }

  async updateZoomMeeting(
    appointmentId: string,
    meetingId: string,
    joinUrl: string,
    startUrl: string,
    password?: string
  ): Promise<void> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      zoom_meeting_id: meetingId,
      zoom_join_url: joinUrl,
      zoom_start_url: startUrl,
    };

    if (password !== undefined) {
      updateData.zoom_password = password;
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update Zoom meeting: ${error.message}`);
    }
  }

  /**
   * Map database row to Appointment entity
   */
  private mapToEntity(row: any): Appointment {
    return {
      id: row.id,
      consultantId: row.consultant_id,
      companyId: row.company_id,
      programId: row.program_id,
      title: row.title,
      description: row.description,
      status: row.status,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      timezone: row.timezone,
      requestedBy: row.requested_by,
      requestedAt: new Date(row.requested_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : null,
      approvedBy: row.approved_by,
      rejectedAt: row.rejected_at ? new Date(row.rejected_at) : null,
      rejectedBy: row.rejected_by,
      rejectionReason: row.rejection_reason,
      rescheduledFrom: row.rescheduled_from,
      rescheduledAt: row.rescheduled_at ? new Date(row.rescheduled_at) : null,
      rescheduledBy: row.rescheduled_by,
      zoomMeetingId: row.zoom_meeting_id,
      zoomJoinUrl: row.zoom_join_url,
      zoomStartUrl: row.zoom_start_url,
      zoomPassword: row.zoom_password,
      notes: row.notes,
      companyNotes: row.company_notes,
      attendedAt: row.attended_at ? new Date(row.attended_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    };
  }
}
