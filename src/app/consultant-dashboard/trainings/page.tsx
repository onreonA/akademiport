/**
 * Consultant Trainings Page
 * Sprint 9: Training Management (Coming Soon)
 */

'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Card } from '@/presentation/components/ui/atoms/card';

export default function ConsultantTrainingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Eğitimler</h1>
        <p className="text-muted-foreground mt-2">Eğitim yönetimi</p>
      </div>

      <Card className="p-12 text-center">
        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Yakında</h3>
        <p className="text-muted-foreground">
          Eğitim yönetimi özelliği Sprint 9'da eklenecek.
        </p>
      </Card>
    </div>
  );
}

