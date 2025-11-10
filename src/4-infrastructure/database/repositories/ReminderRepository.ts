import {
  IReminderRepository,
  EventReminder,
  AppointmentReminder,
} from '@/domain/interfaces/repositories/IReminderRepository';
import { createClient } from '@/infrastructure/database/supabase-server';

export class ReminderRepository implements IReminderRepository {
  async hasEventReminderBeenSent(
    eventId: string,
    userId: string,
    reminderType: '24hours' | '1hour'
  ): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('event_reminders')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('reminder_type', reminderType)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      throw new Error(`Failed to check event reminder: ${error.message}`);
    }

    return !!data;
  }

  async createEventReminder(data: {
    eventId: string;
    userId: string;
    reminderType: '24hours' | '1hour';
    sentToEmail: string;
    status: 'sent' | 'failed' | 'bounced';
    errorMessage?: string;
  }): Promise<EventReminder> {
    const supabase = await createClient();

    const { data: reminder, error } = await supabase
      .from('event_reminders')
      .insert({
        event_id: data.eventId,
        user_id: data.userId,
        reminder_type: data.reminderType,
        sent_to_email: data.sentToEmail,
        status: data.status,
        error_message: data.errorMessage || null,
      })
      .select()
      .single();

    if (error) {
      // If duplicate, try to get existing record
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('event_reminders')
          .select('*')
          .eq('event_id', data.eventId)
          .eq('user_id', data.userId)
          .eq('reminder_type', data.reminderType)
          .single();

        if (existing) {
          return this.mapToEventReminder(existing);
        }
      }
      throw new Error(`Failed to create event reminder: ${error.message}`);
    }

    return this.mapToEventReminder(reminder);
  }

  async hasAppointmentReminderBeenSent(
    appointmentId: string,
    userId: string,
    reminderType: '24hours' | '1hour'
  ): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('appointment_reminders')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('user_id', userId)
      .eq('reminder_type', reminderType)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check appointment reminder: ${error.message}`);
    }

    return !!data;
  }

  async createAppointmentReminder(data: {
    appointmentId: string;
    userId: string;
    reminderType: '24hours' | '1hour';
    sentToEmail: string;
    status: 'sent' | 'failed' | 'bounced';
    errorMessage?: string;
  }): Promise<AppointmentReminder> {
    const supabase = await createClient();

    const { data: reminder, error } = await supabase
      .from('appointment_reminders')
      .insert({
        appointment_id: data.appointmentId,
        user_id: data.userId,
        reminder_type: data.reminderType,
        sent_to_email: data.sentToEmail,
        status: data.status,
        error_message: data.errorMessage || null,
      })
      .select()
      .single();

    if (error) {
      // If duplicate, try to get existing record
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('appointment_reminders')
          .select('*')
          .eq('appointment_id', data.appointmentId)
          .eq('user_id', data.userId)
          .eq('reminder_type', data.reminderType)
          .single();

        if (existing) {
          return this.mapToAppointmentReminder(existing);
        }
      }
      throw new Error(`Failed to create appointment reminder: ${error.message}`);
    }

    return this.mapToAppointmentReminder(reminder);
  }

  private mapToEventReminder(data: any): EventReminder {
    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      reminderType: data.reminder_type,
      sentAt: new Date(data.sent_at),
      sentToEmail: data.sent_to_email,
      status: data.status,
      errorMessage: data.error_message,
      createdAt: new Date(data.created_at),
    };
  }

  private mapToAppointmentReminder(data: any): AppointmentReminder {
    return {
      id: data.id,
      appointmentId: data.appointment_id,
      userId: data.user_id,
      reminderType: data.reminder_type,
      sentAt: new Date(data.sent_at),
      sentToEmail: data.sent_to_email,
      status: data.status,
      errorMessage: data.error_message,
      createdAt: new Date(data.created_at),
    };
  }
}
