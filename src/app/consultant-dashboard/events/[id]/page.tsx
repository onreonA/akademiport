'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { EventDetail } from '@/presentation/components/features/events';
import { toast } from 'sonner';

export default function ConsultantEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const handleEdit = (event: any) => {
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
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
  );
}
