import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import {
  Event,
  CreateEventDto,
  UpdateEventDto,
  EventFilterDto,
  EventAttendance,
} from '@/3-domain/entities/Event';
import { createClient } from '@/4-infrastructure/database/supabase-server';

export class EventRepository implements IEventRepository {
  async create(data: CreateEventDto): Promise<Event> {
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        program_id: data.programId,
        consultant_id: data.consultantId,
        title: data.title,
        description: data.description || null,
        category: data.category || 'other',
        status: data.status || 'draft',
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        timezone: data.timezone || 'Europe/Istanbul',
        attendance_required: data.attendanceRequired ?? true,
        max_attendees: data.maxAttendees || null,
        organizer_name: data.organizerName || null,
        organizer_email: data.organizerEmail || null,
        is_public: data.isPublic ?? true,
        created_by: (data as any).createdBy || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return this.mapToEntity(event);
  }

  async findById(id: string): Promise<Event | null> {
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find event: ${error.message}`);
    }

    return this.mapToEntity(event);
  }

  async findAll(filters?: EventFilterDto): Promise<{ data: Event[]; total: number }> {
    const supabase = await createClient();

    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const offset = (page - 1) * limit;

    let query = supabase.from('events').select('*', { count: 'exact' }).is('deleted_at', null);

    if (filters?.programId !== undefined && filters.programId !== null) {
      query = query.eq('program_id', filters.programId);
    }

    if (filters?.consultantId !== undefined && filters.consultantId !== null) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    if (filters?.category !== undefined) {
      query = query.eq('category', filters.category);
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

    const { data: events, error, count } = await finalQuery;

    if (error) {
      throw new Error(`Failed to find events: ${error.message}`);
    }

    return {
      data: events?.map((e) => this.mapToEntity(e)) || [],
      total: count || 0,
    };
  }

  async findByProgramId(
    programId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]> {
    const supabase = await createClient();

    let query = supabase
      .from('events')
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

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to find events by program: ${error.message}`);
    }

    return events?.map((e) => this.mapToEntity(e)) || [];
  }

  async findByConsultantId(
    consultantId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]> {
    const supabase = await createClient();

    let query = supabase
      .from('events')
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

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to find events by consultant: ${error.message}`);
    }

    return events?.map((e) => this.mapToEntity(e)) || [];
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: { programId?: string; consultantId?: string }
  ): Promise<Event[]> {
    const supabase = await createClient();

    let query = supabase
      .from('events')
      .select('*')
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .is('deleted_at', null);

    if (filters?.programId) {
      query = query.eq('program_id', filters.programId);
    }

    if (filters?.consultantId) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    query = query.order('start_time', { ascending: true });

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to find events by date range: ${error.message}`);
    }

    return events?.map((e) => this.mapToEntity(e)) || [];
  }

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startTime !== undefined) updateData.start_time = data.startTime.toISOString();
    if (data.endTime !== undefined) updateData.end_time = data.endTime.toISOString();
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.attendanceRequired !== undefined)
      updateData.attendance_required = data.attendanceRequired;
    if (data.maxAttendees !== undefined) updateData.max_attendees = data.maxAttendees;
    if (data.organizerName !== undefined) updateData.organizer_name = data.organizerName;
    if (data.organizerEmail !== undefined) updateData.organizer_email = data.organizerEmail;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;

    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return this.mapToEntity(event);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    // Soft delete
    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check event existence: ${error.message}`);
    }

    return !!data;
  }

  async registerAttendance(
    eventId: string,
    userId: string,
    companyId: string,
    notes?: string
  ): Promise<EventAttendance> {
    const supabase = await createClient();

    const { data: attendance, error } = await supabase
      .from('event_attendances')
      .insert({
        event_id: eventId,
        user_id: userId,
        company_id: companyId,
        notes: notes || null,
      })
      .select(
        `
        *,
        users!event_attendances_user_id_fkey (
          id,
          full_name
        ),
        companies!event_attendances_company_id_fkey (
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to register attendance: ${error.message}`);
    }

    return this.mapToAttendance(attendance);
  }

  async cancelAttendance(eventId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('event_attendances')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to cancel attendance: ${error.message}`);
    }
  }

  async markAttendanceAsAttended(attendanceId: string): Promise<EventAttendance> {
    const supabase = await createClient();

    const { data: attendance, error } = await supabase
      .from('event_attendances')
      .update({
        attended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', attendanceId)
      .select(
        `
        *,
        users!event_attendances_user_id_fkey (
          id,
          full_name
        ),
        companies!event_attendances_company_id_fkey (
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to mark attendance as attended: ${error.message}`);
    }

    return this.mapToAttendance(attendance);
  }

  async getAttendees(eventId: string): Promise<EventAttendance[]> {
    const supabase = await createClient();

    const { data: attendances, error } = await supabase
      .from('event_attendances')
      .select(
        `
        *,
        users!event_attendances_user_id_fkey (
          id,
          full_name
        ),
        companies!event_attendances_company_id_fkey (
          id,
          name
        )
      `
      )
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get attendees: ${error.message}`);
    }

    return attendances?.map((a) => this.mapToAttendance(a)) || [];
  }

  async findByUserId(
    userId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]> {
    const supabase = await createClient();

    let query = supabase
      .from('events')
      .select(
        `
        *,
        event_attendances!inner (
          user_id
        )
      `
      )
      .eq('event_attendances.user_id', userId)
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

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to find events by user: ${error.message}`);
    }

    // Flatten the nested structure
    return (
      events?.map((e: any) => {
        const { event_attendances, ...eventData } = e;
        return this.mapToEntity(eventData);
      }) || []
    );
  }

  async findByCompanyId(
    companyId: string,
    filters?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<Event[]> {
    const supabase = await createClient();

    let query = supabase
      .from('events')
      .select(
        `
        *,
        event_attendances!inner (
          company_id
        )
      `
      )
      .eq('event_attendances.company_id', companyId)
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

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to find events by company: ${error.message}`);
    }

    // Flatten the nested structure
    return (
      events?.map((e: any) => {
        const { event_attendances, ...eventData } = e;
        return this.mapToEntity(eventData);
      }) || []
    );
  }

  async updateAttendeeCount(eventId: string, count: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('events')
      .update({ current_attendees: count })
      .eq('id', eventId);

    if (error) {
      throw new Error(`Failed to update attendee count: ${error.message}`);
    }
  }

  async updateZoomMeeting(
    eventId: string,
    meetingId: string,
    joinUrl: string,
    startUrl: string,
    password?: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('events')
      .update({
        zoom_meeting_id: meetingId,
        zoom_join_url: joinUrl,
        zoom_start_url: startUrl,
        zoom_password: password || null,
      })
      .eq('id', eventId);

    if (error) {
      throw new Error(`Failed to update Zoom meeting: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Event {
    return {
      id: data.id,
      programId: data.program_id,
      consultantId: data.consultant_id,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      timezone: data.timezone,
      zoomMeetingId: data.zoom_meeting_id,
      zoomJoinUrl: data.zoom_join_url,
      zoomStartUrl: data.zoom_start_url,
      zoomPassword: data.zoom_password,
      attendanceRequired: data.attendance_required,
      maxAttendees: data.max_attendees,
      currentAttendees: data.current_attendees,
      organizerName: data.organizer_name,
      organizerEmail: data.organizer_email,
      isPublic: data.is_public,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }

  private mapToAttendance(data: any): EventAttendance {
    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      companyId: data.company_id,
      userName: data.users?.full_name || 'Unknown',
      companyName: data.companies?.name || 'Unknown',
      registeredAt: new Date(data.registered_at),
      attendedAt: data.attended_at ? new Date(data.attended_at) : null,
      notes: data.notes,
    };
  }
}
