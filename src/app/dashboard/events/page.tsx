'use client';

import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { EventList, EventForm } from '@/presentation/components/features/events';
import { UnifiedCalendar } from '@/presentation/components/features/calendar';
import { useEvents } from '@/shared/hooks/api/useEvents';
import { useAppointments } from '@/shared/hooks/api/useAppointments';
import { usePrograms } from '@/shared/hooks/api/usePrograms';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';
import type { EventResponseDto, CreateEventDto } from '@/application/dto/event';
import type { AppointmentResponseDto } from '@/application/dto/appointment';

export default function AdminEventsPage() {
  const { user } = useAuth();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponseDto | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  // Fetch programs for filter
  const { data: programsData } = usePrograms({
    page: 1,
    limit: 100,
  });
  const programs = programsData?.data || [];

  // Fetch events
  const { data: eventsData, refetch } = useEvents({
    programId: selectedProgramId || null,
    consultantId: null,
    page: 1,
    limit: 100, // Get more events for calendar
  });

  // Fetch appointments (filtered by selected program if any)
  const { data: appointmentsData } = useAppointments({
    programId: selectedProgramId || null,
    consultantId: null,
    companyId: null,
    page: 1,
    limit: 100,
  });

  const events = eventsData?.events || [];
  const appointments = appointmentsData?.appointments || [];

  const handleCreateEvent = async (data: CreateEventDto) => {
    try {
      // Ensure programId is set
      const finalProgramId = selectedProgramId || data.programId;
      if (!finalProgramId) {
        toast.error('Lütfen bir program seçin');
        return;
      }

      // Ensure consultantId is set
      const finalConsultantId = data.consultantId || user?.id;
      if (!finalConsultantId) {
        toast.error('Danışman ID bulunamadı');
        return;
      }

      console.log('Creating event with:', {
        programId: finalProgramId,
        consultantId: finalConsultantId,
        title: data.title,
      });

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          programId: finalProgramId,
          consultantId: finalConsultantId,
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
    window.location.href = `/dashboard/events/${event.id}`;
  };

  const handleAppointmentClick = (appointment: AppointmentResponseDto) => {
    window.location.href = `/dashboard/appointments/${appointment.id}`;
  };

  const selectedProgram = selectedProgramId
    ? programs.find((p) => p.id === selectedProgramId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Etkinlikler</h1>
          <p className="text-muted-foreground mt-1">
            {selectedProgram ? selectedProgram.name : 'Tüm programların etkinlikleri'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedProgramId || 'all'}
            onValueChange={(value) => setSelectedProgramId(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Program seçin" />
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
          <Button
            onClick={() => {
              if (!selectedProgramId) {
                toast.error('Lütfen önce bir program seçin');
                return;
              }
              setFormOpen(true);
            }}
            disabled={!selectedProgramId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Etkinlik
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <EventList
            programId={selectedProgramId || undefined}
            onEventClick={handleEventClick}
            onCreateEvent={() => setFormOpen(true)}
            showCreateButton={false}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
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
        programId={selectedProgramId || undefined}
        consultantId={user?.id || undefined}
      />
    </div>
  );
}
