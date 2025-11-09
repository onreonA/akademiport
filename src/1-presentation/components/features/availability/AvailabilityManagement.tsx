/**
 * Availability Management Component
 * Danışman müsaitlik yönetimi için component
 */

'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, Clock, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  useAvailability,
  useCreateAvailability,
  useUpdateAvailability,
  useDeleteAvailability,
  useUnavailableDates,
  useCreateUnavailableDate,
  useUpdateUnavailableDate,
  useDeleteUnavailableDate,
} from '@/shared/hooks/api/useAvailability';
import { useAuth } from '@/shared/hooks/useAuth';
import { useConsultantProgram } from '@/shared/contexts/ConsultantProgramContext';
import { ProgramSelector } from '@/presentation/components/features/consultant';
import type { Availability } from '@/domain/entities/Availability';
import type { UnavailableDate } from '@/domain/entities/UnavailableDate';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Pazar' },
  { value: 1, label: 'Pazartesi' },
  { value: 2, label: 'Salı' },
  { value: 3, label: 'Çarşamba' },
  { value: 4, label: 'Perşembe' },
  { value: 5, label: 'Cuma' },
  { value: 6, label: 'Cumartesi' },
];

const UNAVAILABLE_REASONS = [
  { value: 'Tatil', label: 'Tatil' },
  { value: 'Kişisel', label: 'Kişisel' },
  { value: 'Eğitim', label: 'Eğitim' },
  { value: 'Toplantı', label: 'Toplantı' },
  { value: 'Diğer', label: 'Diğer' },
];

export function AvailabilityManagement() {
  const { user } = useAuth();
  const { selectedProgram } = useConsultantProgram();
  const consultantId = user?.id || '';

  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [unavailableDialogOpen, setUnavailableDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [editingUnavailable, setEditingUnavailable] = useState<UnavailableDate | null>(null);

  // Fetch data
  const { data: availabilityRules, isLoading: isLoadingAvailability } = useAvailability(
    consultantId,
    selectedProgram?.id || null
  );
  const { data: unavailableDates, isLoading: isLoadingUnavailable } = useUnavailableDates(
    consultantId,
    {
      programId: selectedProgram?.id || null,
    }
  );

  // Mutations
  const createAvailability = useCreateAvailability(consultantId);
  const updateAvailability = useUpdateAvailability(consultantId);
  const deleteAvailability = useDeleteAvailability(consultantId);
  const createUnavailableDate = useCreateUnavailableDate(consultantId);
  const updateUnavailableDate = useUpdateUnavailableDate(consultantId);
  const deleteUnavailableDate = useDeleteUnavailableDate(consultantId);

  // Group availability by day
  const availabilityByDay = (availabilityRules || []).reduce(
    (acc, rule) => {
      if (!acc[rule.dayOfWeek]) {
        acc[rule.dayOfWeek] = [];
      }
      acc[rule.dayOfWeek].push(rule);
      return acc;
    },
    {} as Record<number, Availability[]>
  );

  const handleCreateAvailability = (data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    validFrom?: string;
    validUntil?: string;
  }) => {
    console.log('handleCreateAvailability called with:', {
      ...data,
      programId: selectedProgram?.id || null,
    });

    createAvailability.mutate(
      {
        ...data,
        programId: selectedProgram?.id || null,
      },
      {
        onSuccess: (response) => {
          console.log('Availability created successfully:', response);
          setAvailabilityDialogOpen(false);
        },
        onError: (error) => {
          console.error('Error creating availability:', error);
        },
      }
    );
  };

  const handleUpdateAvailability = (
    id: string,
    data: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      validFrom?: string;
      validUntil?: string;
      isActive?: boolean;
    }
  ) => {
    updateAvailability.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditingAvailability(null);
        },
      }
    );
  };

  const handleCreateUnavailableDate = (data: {
    startTime: string;
    endTime: string;
    reason?: string;
    notes?: string;
  }) => {
    createUnavailableDate.mutate(
      {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        reason: data.reason || null,
        notes: data.notes || null,
        programId: selectedProgram?.id || null,
      },
      {
        onSuccess: () => {
          setUnavailableDialogOpen(false);
        },
      }
    );
  };

  const handleUpdateUnavailableDate = (
    id: string,
    data: {
      startTime?: string;
      endTime?: string;
      reason?: string;
      notes?: string;
    }
  ) => {
    updateUnavailableDate.mutate(
      {
        id,
        data: {
          startTime: data.startTime ? new Date(data.startTime) : undefined,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
          reason: data.reason !== undefined ? data.reason || null : undefined,
          notes: data.notes !== undefined ? data.notes || null : undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingUnavailable(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Müsaitlik Yönetimi</h2>
          <p className="text-muted-foreground mt-1">
            Çalışma saatlerinizi ve müsait olmadığınız tarihleri yönetin
          </p>
        </div>
        {selectedProgram && (
          <div className="max-w-xs">
            <ProgramSelector />
          </div>
        )}
      </div>

      {/* Weekly Availability */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Haftalık Çalışma Saatleri</CardTitle>
              <CardDescription>Her gün için müsait olduğunuz saatleri belirleyin</CardDescription>
            </div>
            <Dialog
              open={availabilityDialogOpen}
              onOpenChange={(open) => {
                setAvailabilityDialogOpen(open);
                if (!open) {
                  setEditingAvailability(null);
                }
              }}
            >
              <Button
                onClick={() => {
                  setEditingAvailability(null);
                  setAvailabilityDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kural Ekle
              </Button>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAvailability ? 'Müsaitlik Kuralı Düzenle' : 'Yeni Müsaitlik Kuralı'}
                  </DialogTitle>
                  <DialogDescription>Haftalık çalışma saatlerinizi belirleyin</DialogDescription>
                </DialogHeader>
                <AvailabilityForm
                  initialData={editingAvailability}
                  onSubmit={(data) => {
                    if (editingAvailability) {
                      handleUpdateAvailability(editingAvailability.id, data);
                    } else {
                      handleCreateAvailability(data);
                    }
                  }}
                  onCancel={() => {
                    setAvailabilityDialogOpen(false);
                    setEditingAvailability(null);
                  }}
                  isLoading={createAvailability.isPending || updateAvailability.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAvailability ? (
            <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
          ) : (
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const rules = availabilityByDay[day.value] || [];
                return (
                  <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24 font-medium">{day.label}</div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {rules.length === 0 ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          Müsaitlik kuralı yok
                        </Badge>
                      ) : (
                        rules.map((rule) => (
                          <Badge
                            key={rule.id}
                            variant={rule.isActive ? 'default' : 'secondary'}
                            className="flex items-center gap-2"
                          >
                            <Clock className="w-3 h-3" />
                            {rule.startTime} - {rule.endTime}
                            {rule.programId && (
                              <span className="text-xs opacity-75">
                                ({selectedProgram?.name || 'Program'})
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => {
                                setEditingAvailability(rule);
                                setAvailabilityDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0"
                              onClick={() => {
                                if (confirm('Bu kuralı silmek istediğinize emin misiniz?')) {
                                  deleteAvailability.mutate(rule.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unavailable Dates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Müsait Olmadığım Tarihler</CardTitle>
              <CardDescription>
                Tatil, eğitim veya kişisel nedenlerle müsait olmadığınız tarihleri ekleyin
              </CardDescription>
            </div>
            <Dialog
              open={unavailableDialogOpen}
              onOpenChange={(open) => {
                setUnavailableDialogOpen(open);
                if (!open) {
                  setEditingUnavailable(null);
                }
              }}
            >
              <Button
                onClick={() => {
                  setEditingUnavailable(null);
                  setUnavailableDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tarih Ekle
              </Button>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingUnavailable
                      ? 'Müsait Olmama Tarihi Düzenle'
                      : 'Yeni Müsait Olmama Tarihi'}
                  </DialogTitle>
                  <DialogDescription>
                    Müsait olmadığınız tarih/saat aralığını belirleyin
                  </DialogDescription>
                </DialogHeader>
                <UnavailableDateForm
                  initialData={editingUnavailable}
                  onSubmit={(data) => {
                    if (editingUnavailable) {
                      handleUpdateUnavailableDate(editingUnavailable.id, data);
                    } else {
                      handleCreateUnavailableDate(data);
                    }
                  }}
                  onCancel={() => {
                    setUnavailableDialogOpen(false);
                    setEditingUnavailable(null);
                  }}
                  isLoading={createUnavailableDate.isPending || updateUnavailableDate.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingUnavailable ? (
            <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
          ) : unavailableDates && unavailableDates.length > 0 ? (
            <div className="space-y-3">
              {unavailableDates.map((date) => (
                <div
                  key={date.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {new Date(date.startTime).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(date.startTime).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(date.endTime).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {date.reason && (
                        <Badge variant="outline" className="mt-1">
                          {date.reason}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingUnavailable(date);
                        setUnavailableDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Bu tarihi silmek istediğinize emin misiniz?')) {
                          deleteUnavailableDate.mutate(date.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Henüz müsait olmadığınız tarih eklenmemiş</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Availability Form Component
function AvailabilityForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: Availability | null;
  onSubmit: (data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    validFrom?: string;
    validUntil?: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.dayOfWeek.toString() || '1');
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '17:00');
  const [validFrom, setValidFrom] = useState(() => {
    if (!initialData?.validFrom) return '';
    const date =
      initialData.validFrom instanceof Date
        ? initialData.validFrom
        : new Date(initialData.validFrom);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  });
  const [validUntil, setValidUntil] = useState(() => {
    if (!initialData?.validUntil) return '';
    const date =
      initialData.validUntil instanceof Date
        ? initialData.validUntil
        : new Date(initialData.validUntil);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      validFrom: validFrom || undefined,
      validUntil: validUntil || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dayOfWeek">Haftanın Günü</Label>
        <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OF_WEEK.map((day) => (
              <SelectItem key={day.value} value={day.value.toString()}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Başlangıç Saati</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Bitiş Saati</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Geçerlilik Başlangıcı (Opsiyonel)</Label>
          <Input
            id="validFrom"
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Geçerlilik Bitişi (Opsiyonel)</Label>
          <Input
            id="validUntil"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Ekle'}
        </Button>
      </div>
    </form>
  );
}

// Unavailable Date Form Component
function UnavailableDateForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: UnavailableDate | null;
  onSubmit: (data: { startTime: string; endTime: string; reason?: string; notes?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [startTime, setStartTime] = useState(() => {
    if (initialData) {
      return new Date(initialData.startTime).toISOString().slice(0, 16);
    }
    // Use a stable default time (current time, but calculated once during initialization)
    const defaultTime = new Date();
    return defaultTime.toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState(() => {
    if (initialData) {
      return new Date(initialData.endTime).toISOString().slice(0, 16);
    }
    // Use a stable default time (1 hour from a fixed reference point)
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);
    return defaultTime.toISOString().slice(0, 16);
  });
  const [reason, setReason] = useState(initialData?.reason ?? 'none');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startTime,
      endTime,
      reason: reason === 'none' ? undefined : reason || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Başlangıç</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Bitiş</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Sebep (Opsiyonel)</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Sebep seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sebep yok</SelectItem>
            {UNAVAILABLE_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ek bilgiler..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Ekle'}
        </Button>
      </div>
    </form>
  );
}
