'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from 'sonner';

interface Consultant {
  id: string;
  full_name: string;
  email: string;
}

interface ConsultantChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentConsultantId?: string | null;
  currentConsultantName?: string | null;
  onSuccess?: () => void;
}

function ConsultantChangeDialog({
  open,
  onOpenChange,
  projectId,
  currentConsultantId,
  currentConsultantName,
  onSuccess,
}: ConsultantChangeDialogProps) {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingConsultants, setFetchingConsultants] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConsultants();
      setSelectedConsultantId(currentConsultantId || '');
    }
  }, [open, currentConsultantId]);

  const fetchConsultants = async () => {
    try {
      setFetchingConsultants(true);
      const response = await fetch('/api/users?role=consultant');
      if (!response.ok) throw new Error('Failed to fetch consultants');
      const data = await response.json();
      setConsultants(data.data || data.users || []);
    } catch (err) {
      console.error('Error fetching consultants:', err);
      toast.error('Danışmanlar yüklenemedi');
    } finally {
      setFetchingConsultants(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedConsultantId) {
      toast.error('Lütfen bir danışman seçin');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId: selectedConsultantId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Danışman değiştirilemedi');
      }

      toast.success('Danışman başarıyla değiştirildi');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error changing consultant:', err);
      toast.error(err instanceof Error ? err.message : 'Danışman değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Danışman Değiştir</DialogTitle>
          <DialogDescription>
            Bu projeye atanacak danışmanı seçin. Mevcut danışman:{' '}
            <span className="font-semibold">{currentConsultantName || 'Atanmamış'}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="consultant">Yeni Danışman</Label>
            <Select
              value={selectedConsultantId}
              onValueChange={setSelectedConsultantId}
              disabled={fetchingConsultants || loading}
            >
              <SelectTrigger id="consultant">
                <SelectValue placeholder="Danışman seçin" />
              </SelectTrigger>
              <SelectContent>
                {consultants.map((consultant) => (
                  <SelectItem key={consultant.id} value={consultant.id}>
                    {consultant.full_name} ({consultant.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedConsultantId}>
            {loading ? 'Değiştiriliyor...' : 'Değiştir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConsultantChangeDialog;
export { ConsultantChangeDialog };
