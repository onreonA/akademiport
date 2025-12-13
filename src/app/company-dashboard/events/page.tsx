'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { EventList } from '@/presentation/components/features/events';
import { UnifiedCalendar } from '@/presentation/components/features/calendar';
import { useEvents } from '@/shared/hooks/api/useEvents';
import { useAppointments } from '@/shared/hooks/api/useAppointments';
import { useAuth } from '@/shared/hooks/useAuth';
import type { EventResponseDto } from '@/application/dto/event';
import type { AppointmentResponseDto } from '@/application/dto/appointment';
import type { Availability } from '@/domain/entities/Availability';
import type { UnavailableDate } from '@/domain/entities/UnavailableDate';

export default function CompanyEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [companyProgramId, setCompanyProgramId] = useState<string | null>(null);
  const [consultantIds, setConsultantIds] = useState<string[]>([]);
  const [allAvailabilityRules, setAllAvailabilityRules] = useState<Availability[]>([]);
  const [allUnavailableDates, setAllUnavailableDates] = useState<UnavailableDate[]>([]);

  // Company users can see events from their program
  const { data: eventsData } = useEvents({
    programId: null, // Will be filtered by backend based on company's program
    consultantId: null,
    status: 'scheduled', // Only show scheduled events
    page: 1,
    limit: 100, // Get more events for calendar
  });

  // Get appointments for the company (will be filtered by API based on authenticated user)
  const { data: appointmentsData } = useAppointments({
    companyId: undefined, // Will be filtered by API
    page: 1,
    limit: 100,
  });

  const events = eventsData?.events || [];
  const appointments = appointmentsData?.appointments || [];

  // Fetch company's programId and consultants
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.companyId) return;

      try {
        // Get company details
        const companyResponse = await fetch(`/api/companies/${user.companyId}`);
        const companyData = await companyResponse.json();

        if (companyData.success && companyData.data?.programId) {
          const programId = companyData.data.programId;
          setCompanyProgramId(programId);

          // Get consultants for this program
          const consultantsResponse = await fetch(`/api/programs/${programId}/consultants`);
          const consultantsData = await consultantsResponse.json();

          if (consultantsData.success && consultantsData.data) {
            const ids = consultantsData.data.map((c: any) => c.id);
            setConsultantIds(ids);
          }
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error);
      }
    };

    fetchCompanyData();
  }, [user?.companyId]);

  // Fetch availability for all consultants
  useEffect(() => {
    const fetchAllAvailability = async () => {
      if (consultantIds.length === 0 || !companyProgramId) return;

      const availabilityPromises = consultantIds.map(async (consultantId) => {
        try {
          const response = await fetch(
            `/api/consultants/${consultantId}/availability?programId=${companyProgramId}`
          );
          const data = await response.json();
          return data.success ? data.data || [] : [];
        } catch (error) {
          console.error(`Failed to fetch availability for consultant ${consultantId}:`, error);
          return [];
        }
      });

      const unavailablePromises = consultantIds.map(async (consultantId) => {
        try {
          const response = await fetch(
            `/api/consultants/${consultantId}/unavailable?programId=${companyProgramId}`
          );
          const data = await response.json();
          return data.success ? data.data || [] : [];
        } catch (error) {
          console.error(`Failed to fetch unavailable dates for consultant ${consultantId}:`, error);
          return [];
        }
      });

      const [availabilityResults, unavailableResults] = await Promise.all([
        Promise.all(availabilityPromises),
        Promise.all(unavailablePromises),
      ]);

      setAllAvailabilityRules(availabilityResults.flat());
      setAllUnavailableDates(unavailableResults.flat());
    };

    fetchAllAvailability();
  }, [consultantIds, companyProgramId]);

  const handleEventClick = (event: EventResponseDto) => {
    window.location.href = `/company-dashboard/events/${event.id}`;
  };

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    window.location.href = `/company-dashboard/appointments/${appointment.id}`;
  };

  // İstatistikleri hesapla
  const stats = useMemo(() => {
    const now = new Date();
    const upcomingEvents = events.filter((e) => new Date(e.startTime) > now);
    const thisMonthEvents = events.filter((e) => {
      const eventDate = new Date(e.startTime);
      return (
        eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
      );
    });

    return {
      total: events.length,
      upcoming: upcomingEvents.length,
      thisMonth: thisMonthEvents.length,
    };
  }, [events]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-2xl border border-border/50 p-8 mb-6">
        {/* Arka plan dekoratif elementler */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -z-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Etkinlikler
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Programınıza ait etkinlikleri görüntüleyin ve takip edin
              </p>
            </div>
          </div>

          {/* İstatistik kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Etkinlik</p>
                  <motion.p
                    key={stats.total}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold mt-1"
                  >
                    {stats.total}
                  </motion.p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Yaklaşan</p>
                  <motion.p
                    key={stats.upcoming}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold mt-1"
                  >
                    {stats.upcoming}
                  </motion.p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bu Ay</p>
                  <motion.p
                    key={stats.thisMonth}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold mt-1"
                  >
                    {stats.thisMonth}
                  </motion.p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="list" className="space-y-4" key="list">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <EventList onEventClick={handleEventClick} showCreateButton={false} />
            </motion.div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4" key="calendar">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <UnifiedCalendar
                events={events}
                appointments={appointments}
                availability={allAvailabilityRules}
                unavailableDates={allUnavailableDates}
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
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
