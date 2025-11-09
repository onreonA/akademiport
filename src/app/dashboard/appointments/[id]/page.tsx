'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { AppointmentDetail } from '@/presentation/components/features/appointments';

export default function AdminAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Randevu Detayı</h1>
          <p className="text-muted-foreground mt-1">Randevu bilgilerini görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Appointment Detail */}
      <AppointmentDetail appointmentId={id} />
    </div>
  );
}
