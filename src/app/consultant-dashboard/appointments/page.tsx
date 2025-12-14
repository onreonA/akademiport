'use client';

import { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/1-presentation/components/ui/atoms/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/1-presentation/components/ui/atoms/tabs';
import {
  AppointmentList,
  AppointmentDetail,
} from '@/1-presentation/components/features/appointments';
import { useConsultantProgram } from '@/5-shared/contexts/ConsultantProgramContext';
import { ProgramSelector } from '@/1-presentation/components/features/consultant';
import { UnifiedCalendar } from '@/1-presentation/components/features/calendar';
import { useAppointments } from '@/5-shared/hooks/api/useAppointments';
import { useEvents } from '@/5-shared/hooks/api/useEvents';
import { useAvailability, useUnavailableDates } from '@/5-shared/hooks/api/useAvailability';
import { useAuth } from '@/5-shared/hooks/useAuth';
import type { AppointmentResponseDto } from '@/2-application/dto/appointment';
import type { EventResponseDto } from '@/2-application/dto/event';

export default function ConsultantAppointmentsPage() {
  const { selectedProgram, programs, isLoading: isLoadingPrograms } = useConsultantProgram();
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDto | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  // Get appointments for the consultant (no program filter needed for appointments)
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    consultantId: undefined, // Will be filtered by API based on authenticated user
    page: 1,
    limit: 100,
  });

  // Get events for the consultant's selected program
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents({
    programId: selectedProgram?.id || undefined,
    consultantId: undefined,
    page: 1,
    limit: 100,
  });

  // Get availability data for calendar visualization
  const { data: availabilityRules } = useAvailability(user?.id || '', selectedProgram?.id || null);
  const { data: unavailableDates } = useUnavailableDates(user?.id || '', {
    programId: selectedProgram?.id || null,
  });

  const appointments = appointmentsData?.appointments || [];
  const events = eventsData?.events || [];

  // Show loading state while programs are being fetched
  if (isLoadingPrograms) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
            <p className="text-muted-foreground mt-1">Programlar yükleniyor...</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-lg font-medium mb-2">Yükleniyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show program selector if no program selected but programs are available
  if (!selectedProgram && programs.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
            <p className="text-muted-foreground mt-1">Programınızı seçerek başlayın</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              <div className="max-w-md">
                <ProgramSelector />
              </div>
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Program Seçin</p>
                <p className="text-sm text-muted-foreground">
                  Randevuları görüntülemek için yukarıdan bir program seçin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no programs assigned
  if (!selectedProgram && programs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
            <p className="text-muted-foreground mt-1">Program bulunamadı</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Program Bulunamadı</p>
              <p className="text-sm text-muted-foreground">
                Size atanmış bir program bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetail = () => {
    setSelectedAppointment(null);
  };

  const handleEventClick = (event: EventResponseDto) => {
    window.location.href = `/consultant-dashboard/events/${event.id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
            {programs.length > 1 && (
              <div className="max-w-xs">
                <ProgramSelector className="w-full" />
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{selectedProgram?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {selectedAppointment ? (
            <AppointmentDetail appointmentId={selectedAppointment.id} onClose={handleCloseDetail} />
          ) : (
            <AppointmentList
              consultantId={undefined} // Will be filtered by API
              onAppointmentClick={handleAppointmentClick}
              showFilters={true}
            />
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {isLoadingAppointments || isLoadingEvents ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <UnifiedCalendar
              events={events}
              appointments={appointments}
              availability={availabilityRules || []}
              unavailableDates={unavailableDates || []}
              consultantId={user?.id}
              defaultView="dayGridMonth"
              onEventClick={(event) => {
                // Skip unavailable dates (background events)
                if (event.extendedProps?.isUnavailable) return;

                // Check if it's an appointment or event
                if (event.type === 'appointment') {
                  const appointmentData = appointments.find((a) => a.id === event.id);
                  if (appointmentData) {
                    handleAppointmentClick(appointmentData);
                    setActiveTab('list');
                  }
                } else if (event.type === 'event') {
                  const eventData = events.find((e) => e.id === event.id);
                  if (eventData) {
                    handleEventClick(eventData);
                  }
                }
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
