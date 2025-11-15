'use client';

import { useState } from 'react';
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { EventList, EventForm } from '@/presentation/components/features/events';
import { UnifiedCalendar } from '@/presentation/components/features/calendar';
import { ProgramSelector } from '@/presentation/components/features/consultant';
import { useConsultantProgram } from '@/shared/contexts/ConsultantProgramContext';
import { useEvents } from '@/shared/hooks/api/useEvents';
import { useAppointments } from '@/shared/hooks/api/useAppointments';
import { useAvailability, useUnavailableDates } from '@/shared/hooks/api/useAvailability';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';
import type { EventResponseDto, CreateEventDto } from '@/application/dto/event';
import type { AppointmentResponseDto } from '@/application/dto/appointment';

export default function ConsultantEventsPage() {
  const { selectedProgram, programs, isLoading: isLoadingPrograms } = useConsultantProgram();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponseDto | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch,
  } = useEvents({
    programId: selectedProgram?.id || undefined, // Use undefined instead of null
    consultantId: undefined,
    page: 1,
    limit: 100, // Get more events for calendar
  });

  // Get appointments for the consultant (no program filter needed for appointments)
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    consultantId: undefined, // Will be filtered by API based on authenticated user
    page: 1,
    limit: 100,
  });

  // Get availability data for calendar visualization
  const {
    data: availabilityRules,
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useAvailability(user?.id || '', selectedProgram?.id || null);
  const {
    data: unavailableDates,
    isLoading: isLoadingUnavailable,
    error: unavailableError,
  } = useUnavailableDates(user?.id || '', {
    programId: selectedProgram?.id || null,
  });

  const events = eventsData?.events || [];
  const appointments = appointmentsData?.appointments || [];

  // Debug logging
  React.useEffect(() => {
    if (selectedProgram) {
      console.log('Consultant Events Page - Selected Program:', {
        id: selectedProgram.id,
        name: selectedProgram.name,
      });
      console.log('Consultant Events Page - Events Data:', {
        events: events,
        total: eventsData?.pagination?.total || 0,
        isLoading: isLoadingEvents,
        error: eventsError,
      });
      console.log('Consultant Events Page - Availability Data:', {
        availabilityRules: availabilityRules || [],
        availabilityRulesCount: availabilityRules?.length || 0,
        isLoading: isLoadingAvailability,
        error: availabilityError,
        userId: user?.id,
        programId: selectedProgram?.id,
      });
      console.log('Consultant Events Page - Unavailable Dates Data:', {
        unavailableDates: unavailableDates || [],
        unavailableDatesCount: unavailableDates?.length || 0,
        isLoading: isLoadingUnavailable,
        error: unavailableError,
      });
    }
  }, [
    selectedProgram,
    events,
    eventsData,
    isLoadingEvents,
    eventsError,
    availabilityRules,
    isLoadingAvailability,
    availabilityError,
    unavailableDates,
    isLoadingUnavailable,
    unavailableError,
    user?.id,
  ]);

  const handleCreateEvent = async (data: CreateEventDto) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          programId: selectedProgram?.id || data.programId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Etkinlik oluşturulamadı');
      }

      await refetch();
      setFormOpen(false);
      toast.success('Etkinlik başarıyla oluşturuldu');
    } catch (error) {
      throw error;
    }
  };

  const handleEventClick = (event: EventResponseDto) => {
    setSelectedEvent(event);
    // Navigate to detail page or open modal
    window.location.href = `/consultant-dashboard/events/${event.id}`;
  };

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    window.location.href = `/consultant-dashboard/appointments/${appointment.id}`;
  };

  // Show loading state while programs are being fetched
  if (isLoadingPrograms) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Etkinlikler</h1>
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
  // This should rarely happen now since context auto-selects first program
  if (!selectedProgram && programs.length > 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Etkinlikler</h1>
            <p className="text-muted-foreground mt-1">Programınızı seçerek başlayın</p>
          </div>
        </div>

        {/* Program Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Program Seçin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-w-md">
                <ProgramSelector />
              </div>
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Program Seçin</p>
                <p className="text-sm text-muted-foreground">
                  Etkinlikleri görüntülemek için yukarıdan bir program seçin
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
            <h1 className="text-3xl font-bold tracking-tight">Etkinlikler</h1>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Etkinlikler</h1>
            {programs.length > 1 && (
              <div className="max-w-xs">
                <ProgramSelector className="w-full" />
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{selectedProgram?.name}</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Etkinlik
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <EventList
            programId={selectedProgram?.id}
            onEventClick={handleEventClick}
            onCreateEvent={() => setFormOpen(true)}
            showCreateButton={false}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
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
                }
              } else if (event.type === 'event') {
                const eventData = events.find((e) => e.id === event.id);
                if (eventData) {
                  handleEventClick(eventData);
                }
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Create Event Form */}
      <EventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateEvent}
            programId={selectedProgram?.id}
        consultantId={user?.id}
      />
    </div>
  );
}
