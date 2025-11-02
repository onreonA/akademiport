'use client';

/**
 * Assign Training Modal Component
 *
 * Modal for assigning a training to a company
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Label } from '@/presentation/components/ui/atoms/label';
import { TrainingCard } from './TrainingCard';
import type { Training } from '@/domain/entities/Training';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface AssignTrainingModalProps {
  companyId: string;
  companyName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AssignTrainingModal({
  companyId,
  companyName,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: AssignTrainingModalProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingTrainings, setFetchingTrainings] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTrainings();
    }
  }, [open]);

  const fetchTrainings = async () => {
    try {
      setFetchingTrainings(true);
      const response = await fetch('/api/consultant/trainings?status=active');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eğitimler yüklenemedi');
      }

      setTrainings(data.trainings || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eğitimler yüklenirken bir hata oluştu');
    } finally {
      setFetchingTrainings(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTrainingId) {
      toast.error('Lütfen bir eğitim seçin');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/consultant/trainings/${selectedTrainingId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          status: 'assigned',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eğitim atanırken bir hata oluştu');
      }

      toast.success('Eğitim başarıyla atandı');
      setSelectedTrainingId('');
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eğitim atanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const selectedTraining = trainings.find((t) => t.id === selectedTrainingId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Firmaya Eğitim Ata</DialogTitle>
          <DialogDescription>
            {companyName
              ? `${companyName} firmasına atanacak eğitimi seçin.`
              : 'Firmaya atanacak eğitimi seçin.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fetchingTrainings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : trainings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Atanabilir eğitim bulunamadı.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="training">Eğitim Seçin</Label>
                <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
                  <SelectTrigger id="training">
                    <SelectValue placeholder="Eğitim seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainings.map((training) => (
                      <SelectItem key={training.id} value={training.id}>
                        {training.name}
                        {training.isGlobal && ' (Global)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTraining && (
                <div className="border rounded-lg p-4">
                  <TrainingCard
                    training={selectedTraining}
                    onClick={() => {}}
                    videosCount={0}
                    documentsCount={0}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedTrainingId}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atanıyor...
              </>
            ) : (
              'Eğitim Ata'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
