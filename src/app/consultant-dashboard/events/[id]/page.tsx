'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { EventDetail } from '@/1-presentation/components/features/events';
import { toast } from 'sonner';
import type { EventResponseDto } from '@/2-application/dto/event';

export default function ConsultantEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const handleEdit = (_event: EventResponseDto) => {
    router.push(`/consultant-dashboard/events/${id}/edit`);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Etkinlik silinemedi');
      }

      toast.success('Etkinlik başarıyla silindi');
      router.push('/consultant-dashboard/events');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Etkinlik silinemedi');
    }
  };

  const handleRegisterAttendance = async () => {
    try {
      const response = await fetch(`/api/events/${id}/attendance`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Katılım kaydı yapılamadı');
      }

      toast.success('Etkinliğe başarıyla kaydoldunuz');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Katılım kaydı yapılamadı');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
        </div>

        <EventDetail
          eventId={id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRegisterAttendance={handleRegisterAttendance}
          showActions={true}
        />
      </div>
    </div>
  );
}
