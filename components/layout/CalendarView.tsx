'use client';
import React, { useState } from 'react';

import AppointmentCalendar from './AppointmentCalendar';
interface Appointment {
  id: string;
  title: string;
  description?: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  meeting_type: 'online' | 'phone' | 'in_person';
  consultant_name?: string;
  company_name?: string;
  meeting_link?: string;
  meeting_location?: string;
  attendance_notes?: string;
}
interface CalendarViewProps {
  appointments: Appointment[];
  onAppointmentUpdate?: (appointmentId: string, updates: any) => void;
  userRole?: 'admin' | 'company' | 'consultant';
}
export default function CalendarView({
  appointments,
  onAppointmentUpdate,
  userRole = 'company',
}: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<
    'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'
  >('dayGridMonth');
  // Handle calendar event click
  const handleEventClick = (eventInfo: any) => {
    const appointment = appointments.find(apt => apt.id === eventInfo.event.id);
    if (appointment) {
      // TODO: Implement appointment detail modal
    }
  };
  // Handle date selection (for creating new appointments)
  const handleDateSelect = (selectInfo: any) => {
    // TODO: Implement new appointment creation modal
  };
  // Handle appointment update
  const handleAppointmentUpdate = (appointmentId: string, updates: any) => {
    if (onAppointmentUpdate) {
      onAppointmentUpdate(appointmentId, updates);
    }
  };
  // View options
  const viewOptions = [
    { value: 'dayGridMonth', label: 'Aylık Görünüm', icon: '📅' },
    { value: 'timeGridWeek', label: 'Haftalık Görünüm', icon: '📊' },
    { value: 'timeGridDay', label: 'Günlük Görünüm', icon: '📋' },
    { value: 'listWeek', label: 'Liste Görünüm', icon: '📝' },
  ] as const;
  return (
    <div>
      {/* Calendar Component */}
      <AppointmentCalendar
        appointments={appointments as any}
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        view={currentView}
        height='700px'
        editable={userRole === 'admin'}
        selectable={userRole === 'company'}
      />
    </div>
  );
}
