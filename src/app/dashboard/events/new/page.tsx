'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { EventForm } from '@/presentation/components/features/events';
import { usePrograms } from '@/shared/hooks/api/usePrograms';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';
import type { CreateEventDto } from '@/application/dto/event';

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(true);

  // Fetch programs for selection
  const { data: programsData } = usePrograms({
    page: 1,
    limit: 100,
  });
  const programs = programsData?.data || [];

  const handleCreateEvent = async (data: CreateEventDto) => {
    try {
      // Ensure programId is set
      if (!data.programId) {
        toast.error('Lütfen bir program seçin');
        return;
      }

      // Ensure consultantId is set
      const finalConsultantId = data.consultantId || user?.id;
      if (!finalConsultantId) {
        toast.error('Danışman ID bulunamadı');
        return;
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          programId: data.programId,
          consultantId: finalConsultantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Etkinlik oluşturulamadı');
      }

      const result = await response.json();
      toast.success('Etkinlik başarıyla oluşturuldu');

      // Redirect to the created event detail page
      // API returns { success: true, ...result.value } where result.value is the Event
      const eventId = result.id || result.event?.id || result.data?.id;
      if (eventId) {
        router.push(`/dashboard/events/${eventId}`);
      } else {
        router.push('/dashboard/events');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Etkinlik oluşturulamadı');
      throw error;
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    router.push('/dashboard/events');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/events')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Etkinlik</h1>
          <p className="text-muted-foreground mt-1">Yeni bir etkinlik oluşturun</p>
        </div>
      </div>

      {/* Event Form */}
      <EventForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleCreateEvent}
        programs={programs}
        consultantId={user?.id}
      />
    </div>
  );
}
