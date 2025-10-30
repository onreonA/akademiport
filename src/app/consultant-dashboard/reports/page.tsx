/**
 * Consultant Reports Page
 * Future Feature
 */

'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card } from '@/presentation/components/ui/atoms/card';

export default function ConsultantReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Raporlarım</h1>
        <p className="text-muted-foreground mt-2">Performans ve aktivite raporları</p>
      </div>

      <Card className="p-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Yakında</h3>
        <p className="text-muted-foreground">Raporlama özelliği gelecek sprint'lerde eklenecek.</p>
      </Card>
    </div>
  );
}
