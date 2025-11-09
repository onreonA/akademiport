'use client';

import { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import {
  AppointmentList,
  AppointmentDetail,
  AppointmentActions,
} from '@/presentation/components/features/appointments';
import { UnifiedCalendar } from '@/presentation/components/features/calendar';
import { useAppointments } from '@/shared/hooks/api/useAppointments';
import { useEvents } from '@/shared/hooks/api/useEvents';
import { usePrograms } from '@/shared/hooks/api/usePrograms';
import type { AppointmentResponseDto } from '@/application/dto/appointment';
import type { EventResponseDto } from '@/application/dto/event';

export default function AdminAppointmentsPage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDto | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  // Fetch programs for filter
  const { data: programsData } = usePrograms({
    page: 1,
    limit: 100,
  });
  const programs = programsData?.data || [];

  // Fetch appointments
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    programId: selectedProgramId || null,
    consultantId: selectedConsultantId || null,
    companyId: selectedCompanyId || null,
    page: 1,
    limit: 100, // Get more appointments for calendar
  });

  // Fetch events (filtered by selected program if any)
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents({
    programId: selectedProgramId || null,
    consultantId: null,
    page: 1,
    limit: 100,
  });

  const appointments = appointmentsData?.appointments || [];
  const events = eventsData?.events || [];

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetail = () => {
    setSelectedAppointment(null);
  };

  const handleEventClick = (event: EventResponseDto) => {
    window.location.href = `/dashboard/events/${event.id}`;
  };

  const selectedProgram = selectedProgramId
    ? programs.find((p) => p.id === selectedProgramId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
          <p className="text-muted-foreground mt-1">Tüm randevuları görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Program</label>
              <Select
                value={selectedProgramId || 'all'}
                onValueChange={(value) => setSelectedProgramId(value === 'all' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Programlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Programlar</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Danışman</label>
              <Select
                value={selectedConsultantId || 'all'}
                onValueChange={(value) => setSelectedConsultantId(value === 'all' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Danışmanlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Danışmanlar</SelectItem>
                  {/* TODO: Fetch consultants and populate */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Firma</label>
              <Select
                value={selectedCompanyId || 'all'}
                onValueChange={(value) => setSelectedCompanyId(value === 'all' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Firmalar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Firmalar</SelectItem>
                  {/* TODO: Fetch companies and populate */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {selectedAppointment ? (
            <div className="space-y-4">
              <Button variant="outline" onClick={handleCloseDetail}>
                ← Listeye Dön
              </Button>
              <AppointmentDetail
                appointmentId={selectedAppointment.id}
                onClose={handleCloseDetail}
              />
            </div>
          ) : (
            <AppointmentList
              programId={selectedProgramId || undefined}
              consultantId={selectedConsultantId || undefined}
              companyId={selectedCompanyId || undefined}
              onAppointmentClick={handleAppointmentClick}
              showFilters={false}
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
              defaultView="dayGridMonth"
              onEventClick={(event) => {
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
