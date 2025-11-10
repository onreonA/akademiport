export interface EventReminder {
  id: string;
  eventId: string;
  userId: string;
  reminderType: '24hours' | '1hour';
  sentAt: Date;
  sentToEmail: string;
  status: 'sent' | 'failed' | 'bounced';
  errorMessage?: string;
  createdAt: Date;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  userId: string;
  reminderType: '24hours' | '1hour';
  sentAt: Date;
  sentToEmail: string;
  status: 'sent' | 'failed' | 'bounced';
  errorMessage?: string;
  createdAt: Date;
}

export interface CreateEventReminderDto {
  eventId: string;
  userId: string;
  reminderType: '24hours' | '1hour';
  sentToEmail: string;
  status: 'sent' | 'failed' | 'bounced';
  errorMessage?: string;
}

export interface CreateAppointmentReminderDto {
  appointmentId: string;
  userId: string;
  reminderType: '24hours' | '1hour';
  sentToEmail: string;
  status: 'sent' | 'failed' | 'bounced';
  errorMessage?: string;
}

export interface IReminderRepository {
  /**
   * Check if event reminder was already sent
   */
  hasEventReminderBeenSent(
    eventId: string,
    userId: string,
    reminderType: '24hours' | '1hour'
  ): Promise<boolean>;

  /**
   * Create event reminder record
   */
  createEventReminder(data: CreateEventReminderDto): Promise<EventReminder>;

  /**
   * Check if appointment reminder was already sent
   */
  hasAppointmentReminderBeenSent(
    appointmentId: string,
    userId: string,
    reminderType: '24hours' | '1hour'
  ): Promise<boolean>;

  /**
   * Create appointment reminder record
   */
  createAppointmentReminder(data: CreateAppointmentReminderDto): Promise<AppointmentReminder>;
}
