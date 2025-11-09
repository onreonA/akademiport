'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Label } from '@/presentation/components/ui/atoms/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import {
  useApproveAppointment,
  useRejectAppointment,
  useRescheduleAppointment,
} from '@/shared/hooks/api/useAppointments';
import type { AppointmentResponseDto } from '@/application/dto/appointment';
import { Input } from '@/presentation/components/ui/atoms/input';

interface AppointmentActionsProps {
  appointment: AppointmentResponseDto;
}

export function AppointmentActions({ appointment }: AppointmentActionsProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  const approveMutation = useApproveAppointment();
  const rejectMutation = useRejectAppointment();
  const rescheduleMutation = useRescheduleAppointment();

  const canApprove = appointment.status === 'pending';
  const canReject = appointment.status === 'pending';
  const canReschedule = appointment.status === 'pending' || appointment.status === 'approved';

  const handleApprove = () => {
    approveMutation.mutate(
      { appointmentId: appointment.id, notes: approveNotes || undefined },
      {
        onSuccess: () => {
          setApproveDialogOpen(false);
          setApproveNotes('');
        },
      }
    );
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }
    rejectMutation.mutate(
      { appointmentId: appointment.id, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectReason('');
        },
      }
    );
  };

  const handleReschedule = () => {
    if (!newStartTime || !newEndTime) {
      return;
    }
    rescheduleMutation.mutate(
      {
        appointmentId: appointment.id,
        newStartTime,
        newEndTime,
      },
      {
        onSuccess: () => {
          setRescheduleDialogOpen(false);
          setNewStartTime('');
          setNewEndTime('');
        },
      }
    );
  };

  // Convert ISO string to datetime-local format
  const toDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {canApprove && (
              <Button onClick={() => setApproveDialogOpen(true)} className="flex-1 md:flex-none">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Onayla
              </Button>
            )}

            {canReject && (
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                className="flex-1 md:flex-none"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reddet
              </Button>
            )}

            {canReschedule && (
              <Button
                variant="outline"
                onClick={() => {
                  setNewStartTime(toDateTimeLocal(appointment.startTime));
                  setNewEndTime(toDateTimeLocal(appointment.endTime));
                  setRescheduleDialogOpen(true);
                }}
                className="flex-1 md:flex-none"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Revize Et
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Randevuyu Onayla</DialogTitle>
            <DialogDescription>
              Bu randevuyu onaylamak istediğinizden emin misiniz? Onaylandıktan sonra Zoom meeting
              otomatik oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-notes">Notlar (Opsiyonel)</Label>
              <Textarea
                id="approve-notes"
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="Randevu hakkında notlar..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Onaylanıyor...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Onayla
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Randevuyu Reddet</DialogTitle>
            <DialogDescription>
              Bu randevuyu reddetmek istediğinizden emin misiniz? Red nedeni firma kullanıcısına
              gönderilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">
                Red Nedeni <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Randevuyu neden reddettiğinizi açıklayın..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reddediliyor...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reddet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Randevuyu Revize Et</DialogTitle>
            <DialogDescription>
              Randevu için yeni tarih ve saat seçin. Eski randevu iptal edilecek ve yeni bir randevu
              oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-start-time">
                  Yeni Başlangıç Tarihi ve Saati <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-start-time"
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-end-time">
                  Yeni Bitiş Tarihi ve Saati <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-end-time"
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={rescheduleMutation.isPending || !newStartTime || !newEndTime}
            >
              {rescheduleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revize Ediliyor...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Revize Et
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
