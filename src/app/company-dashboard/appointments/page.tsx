'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  AppointmentList,
  AppointmentDetail,
  AppointmentRequestForm,
} from '@/presentation/components/features/appointments';
import { useAppointments } from '@/shared/hooks/api/useAppointments';
import { useEvents } from '@/shared/hooks/api/useEvents';
import { useAuth } from '@/shared/hooks/useAuth';
import { UnifiedCalendar } from '@/presentation/components/features/calendar';
import type { AppointmentResponseDto } from '@/application/dto/appointment';
import type { EventResponseDto } from '@/application/dto/event';
import type { Availability } from '@/domain/entities/Availability';
import type { UnavailableDate } from '@/domain/entities/UnavailableDate';

export default function CompanyAppointmentsPage() {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDto | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [companyProgramId, setCompanyProgramId] = useState<string | null>(null);
  const [consultantIds, setConsultantIds] = useState<string[]>([]);
  const [allAvailabilityRules, setAllAvailabilityRules] = useState<Availability[]>([]);
  const [allUnavailableDates, setAllUnavailableDates] = useState<UnavailableDate[]>([]);

  // Get appointments for the company (will be filtered by API based on authenticated user)
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    companyId: undefined, // Will be filtered by API
    page: 1,
    limit: 100,
  });

  // Get events for the company (will be filtered by API based on company's program)
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents({
    programId: null, // Will be filtered by backend based on company's program
    consultantId: null,
    status: 'scheduled', // Only show scheduled events
    page: 1,
    limit: 100,
  });

  const appointments = appointmentsData?.appointments || [];
  const events = eventsData?.events || [];

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

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetail = () => {
    setSelectedAppointment(null);
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
  };

  // Debug: Log appointments for calendar
  console.log('📅 [CompanyAppointmentsPage] Appointments for calendar:', appointments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
          <p className="text-muted-foreground mt-1">
            Danışmanlarınızla randevu talep edin ve yönetin
          </p>
        </div>
        {!showRequestForm && !selectedAppointment && (
          <Button onClick={() => setShowRequestForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Randevu Talep Et
          </Button>
        )}
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <AppointmentRequestForm
          onSuccess={handleRequestSuccess}
          onCancel={() => setShowRequestForm(false)}
        />
      )}

      {/* Appointment Detail */}
      {selectedAppointment && !showRequestForm && (
        <AppointmentDetail appointmentId={selectedAppointment.id} onClose={handleCloseDetail} />
      )}

      {/* List/Calendar View */}
      {!showRequestForm && !selectedAppointment && (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')}
        >
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="calendar">Takvim</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <AppointmentList
              companyId={undefined} // Will be filtered by API
              onAppointmentClick={handleAppointmentClick}
              showFilters={true}
            />
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
                      window.location.href = `/company-dashboard/events/${eventData.id}`;
                    }
                  }
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
