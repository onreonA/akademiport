/**
 * Consultant Tasks Page
 * Sprint 8: Project Management (Coming Soon)
 */

'use client';

import React from 'react';
import { ListTodo } from 'lucide-react';
import { Card } from '@/presentation/components/ui/atoms/card';

export default function ConsultantTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Görevler</h1>
        <p className="text-muted-foreground mt-2">Görev yönetimi</p>
      </div>

      <Card className="p-12 text-center">
        <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Yakında</h3>
        <p className="text-muted-foreground">
          Görev yönetimi özelliği Sprint 8'de eklenecek.
        </p>
      </Card>
    </div>
  );
}

