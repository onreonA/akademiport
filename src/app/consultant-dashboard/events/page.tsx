'use client';

import { useState, useMemo } from 'react';
import React from 'react';
import {
  Calendar,
  Plus,
  Users,
  CalendarDays,
  CalendarClock,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/1-presentation/components/ui/atoms/tabs';
import { EventList, EventForm } from '@/1-presentation/components/features/events';
import { UnifiedCalendar } from '@/1-presentation/components/features/calendar';
import { ProgramSelector } from '@/1-presentation/components/features/consultant';
import { GradientHeader } from '@/1-presentation/components/ui/molecules/gradient-header';
import { ModernStatCard } from '@/1-presentation/components/ui/atoms/modern-stat-card';
import { EnhancedCard } from '@/1-presentation/components/ui/atoms/enhanced-card';
import { useConsultantProgram } from '@/5-shared/contexts/ConsultantProgramContext';
import { useEvents } from '@/5-shared/hooks/api/useEvents';
import { useAppointments } from '@/5-shared/hooks/api/useAppointments';
import { useAvailability, useUnavailableDates } from '@/5-shared/hooks/api/useAvailability';
import { useAuth } from '@/5-shared/hooks/useAuth';
import { toast } from 'sonner';
import type { EventResponseDto, CreateEventDto } from '@/2-application/dto/event';
import type { AppointmentResponseDto } from '@/2-application/dto/appointment';

export default function ConsultantEventsPage() {
  const { selectedProgram, programs, isLoading: isLoadingPrograms } = useConsultantProgram();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
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
  const { data: appointmentsData } = useAppointments({
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

  const events = useMemo(() => eventsData?.events || [], [eventsData?.events]);
  const appointments = appointmentsData?.appointments || [];

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
    window.location.href = `/consultant-dashboard/events/${event.id}`;
  };

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    window.location.href = `/consultant-dashboard/appointments/${appointment.id}`;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.startDate) > now);
    const past = events.filter((e) => new Date(e.startDate) <= now);
    const totalAttendees = events.reduce((sum, e) => sum + (e.attendeeCount || 0), 0);

    return {
      total: events.length,
      upcoming: upcoming.length,
      past: past.length,
      totalAttendees,
    };
  }, [events]);

  // Show loading state while programs are being fetched
  if (isLoadingPrograms) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-32 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse bg-white/50 dark:bg-gray-800/50 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show program selector if no program selected but programs are available
  // This should rarely happen now since context auto-selects first program
  if (!selectedProgram && programs.length > 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <GradientHeader
            icon={Calendar}
            title="Etkinlikler"
            subtitle="Programınızı seçerek başlayın"
          />

          <EnhancedCard variant="glass" className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Program Seçin
                </h3>
                <div className="max-w-md">
                  <ProgramSelector />
                </div>
              </div>
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Program Seçin
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Etkinlikleri görüntülemek için yukarıdan bir program seçin
                </p>
              </div>
            </div>
          </EnhancedCard>
        </div>
      </div>
    );
  }

  // Show message if no programs assigned
  if (!selectedProgram && programs.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6 flex items-center justify-center">
        <EnhancedCard variant="glass" className="max-w-xl mx-auto p-10 text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Program Bulunamadı
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Size atanmış bir program bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.
          </p>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <GradientHeader
          icon={Calendar}
          title="Etkinlikler"
          subtitle={selectedProgram?.name || 'Etkinlik Yönetimi'}
          actions={
            <div className="flex flex-wrap gap-2">
              {programs.length > 1 && (
                <div className="min-w-[200px]">
                  <ProgramSelector className="w-full" />
                </div>
              )}
              <Button onClick={() => setFormOpen(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Yeni Etkinlik
              </Button>
            </div>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernStatCard
            title="Toplam Etkinlik"
            value={stats.total}
            icon={CalendarDays}
            color="purple"
            showGlow
          />
          <ModernStatCard
            title="Gelecek Etkinlikler"
            value={stats.upcoming}
            icon={CalendarClock}
            color="blue"
            showGlow={stats.upcoming > 0}
          />
          <ModernStatCard
            title="Geçmiş Etkinlikler"
            value={stats.past}
            icon={ListChecks}
            color="green"
          />
          <ModernStatCard
            title="Toplam Katılımcı"
            value={stats.totalAttendees}
            icon={Users}
            color="orange"
            showGlow
          />
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Liste
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Takvim
            </TabsTrigger>
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
            <EnhancedCard variant="glass" className="p-4">
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
            </EnhancedCard>
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
    </div>
  );
}
