'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { EventDetail } from '@/presentation/components/features/events';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEventDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Etkinlik Detayı</h1>
          <p className="text-muted-foreground mt-1">Etkinlik bilgilerini görüntüleyin</p>
        </div>
      </div>

      {/* Event Detail */}
      <EventDetail eventId={id} />
    </div>
  );
}
