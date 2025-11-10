'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, Users, Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Switch } from '@/presentation/components/ui/atoms/switch';
import { CreateEventDtoSchema, type CreateEventDto } from '@/application/dto/event';
import { toast } from 'sonner';

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEventDto) => Promise<void>;
  defaultValues?: Partial<CreateEventDto>;
  programId?: string;
  consultantId?: string;
}

export function EventForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  programId,
  consultantId,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateEventDto>({
    resolver: zodResolver(CreateEventDtoSchema),
    defaultValues: {
      programId: defaultValues?.programId || programId || '',
      consultantId: defaultValues?.consultantId || consultantId || '',
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      category: defaultValues?.category || 'webinar',
      status: defaultValues?.status || 'draft',
      timezone: defaultValues?.timezone || 'Europe/Istanbul',
      attendanceRequired: defaultValues?.attendanceRequired ?? true,
      isPublic: defaultValues?.isPublic ?? true,
      createZoomMeeting: defaultValues?.createZoomMeeting ?? true,
      maxAttendees: defaultValues?.maxAttendees ?? null,
      organizerName: defaultValues?.organizerName ?? null,
      organizerEmail: defaultValues?.organizerEmail ?? null,
      ...defaultValues,
    },
  });

  const createZoomMeeting = watch('createZoomMeeting');
  const startTimeValue = watch('startTime');
  const endTimeValue = watch('endTime');

  // Helper function to convert ISO string to datetime-local format
  const isoToDatetimeLocal = (isoString: string | undefined | null): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      // Format: YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Helper function to convert datetime-local format to ISO string
  const datetimeLocalToIso = (value: string): string => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      return date.toISOString();
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (open) {
      const resetData: any = {
        programId: defaultValues?.programId || programId || '',
        consultantId: defaultValues?.consultantId || consultantId || '',
        title: defaultValues?.title || '',
        description: defaultValues?.description || '',
        category: defaultValues?.category || 'webinar',
        status: defaultValues?.status || 'draft',
        timezone: defaultValues?.timezone || 'Europe/Istanbul',
        attendanceRequired: defaultValues?.attendanceRequired ?? true,
        isPublic: defaultValues?.isPublic ?? true,
        createZoomMeeting: defaultValues?.createZoomMeeting ?? true,
        maxAttendees: defaultValues?.maxAttendees ?? undefined,
        ...defaultValues,
      };

      // Convert ISO dates to datetime-local format for display
      if (defaultValues?.startTime) {
        resetData.startTime = defaultValues.startTime; // Keep ISO for validation, will be converted on display
      }
      if (defaultValues?.endTime) {
        resetData.endTime = defaultValues.endTime; // Keep ISO for validation, will be converted on display
      }

      // Ensure maxAttendees is undefined if not provided or invalid (to avoid NaN)
      if (
        resetData.maxAttendees === null ||
        resetData.maxAttendees === undefined ||
        (typeof resetData.maxAttendees === 'number' && isNaN(resetData.maxAttendees))
      ) {
        delete resetData.maxAttendees; // Remove the property entirely instead of setting to undefined
      }

      reset(resetData);
    }
  }, [open, defaultValues, programId, consultantId, reset]);

  const onFormSubmit = async (data: CreateEventDto) => {
    try {
      console.log('Form submit triggered with data:', data);
      console.log('Form errors:', errors);

      // Validate required fields before submission
      if (!data.startTime || !data.endTime) {
        toast.error('Lütfen başlangıç ve bitiş tarihlerini giriniz');
        return;
      }

      if (!data.programId) {
        toast.error('Program ID gereklidir');
        return;
      }

      if (!data.consultantId) {
        toast.error('Danışman ID gereklidir');
        return;
      }

      console.log('Calling onSubmit with data:', data);
      await onSubmit(data);
      reset();
      onOpenChange(false);
      // Don't show success toast here, let the parent handle it
    } catch (error) {
      console.error('Form submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Etkinlik oluşturulamadı');
      throw error; // Re-throw to let parent handle
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit event triggered');
    console.log('Current form values:', watch());
    console.log('Current form errors:', errors);

    handleSubmit(onFormSubmit, (validationErrors) => {
      console.error('Form validation failed:', validationErrors);
      // Show specific error messages (Zod refine errors are on specific paths)
      if (validationErrors.endTime) {
        // endTime path'inde refine hatası olabilir (başlangıç > bitiş)
        toast.error(
          validationErrors.endTime.message || 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
        );
      } else if (validationErrors.startTime) {
        toast.error(validationErrors.startTime.message || 'Başlangıç tarihi gereklidir');
      } else if (validationErrors.programId) {
        toast.error(validationErrors.programId.message || 'Program seçimi gereklidir');
      } else if (validationErrors.consultantId) {
        toast.error(validationErrors.consultantId.message || 'Danışman ID gereklidir');
      } else if (validationErrors.title) {
        toast.error(validationErrors.title.message || 'Etkinlik başlığı gereklidir');
      } else {
        // Tüm hataları göster
        const errorMessages = Object.values(validationErrors)
          .map((error: any) => error?.message)
          .filter(Boolean)
          .join(', ');
        toast.error(errorMessages || 'Lütfen formdaki hataları düzeltin');
      }
    })(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
          <DialogDescription>
            Program bazlı etkinlik oluşturun ve katılımcılara duyurun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Etkinlik Başlığı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Örn: E-İhracat Temelleri Webinarı"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Etkinlik hakkında detaylı bilgi..."
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as any)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="announcement">Duyuru</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="scheduled">Planlanmış</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">
                Başlangıç Tarihi/Saati <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={isoToDatetimeLocal(startTimeValue)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const isoValue = datetimeLocalToIso(value);
                    if (isoValue) {
                      setValue('startTime', isoValue, { shouldValidate: true });
                    }
                  } else {
                    setValue('startTime', '', { shouldValidate: true });
                  }
                }}
                className={errors.startTime ? 'border-destructive' : ''}
                required
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">
                Bitiş Tarihi/Saati <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={isoToDatetimeLocal(endTimeValue)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const isoValue = datetimeLocalToIso(value);
                    if (isoValue) {
                      setValue('endTime', isoValue, { shouldValidate: true });
                    }
                  } else {
                    setValue('endTime', '', { shouldValidate: true });
                  }
                }}
                className={errors.endTime ? 'border-destructive' : ''}
                required
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Max Attendees */}
          <div className="space-y-2">
            <Label htmlFor="maxAttendees">Maksimum Katılımcı Sayısı</Label>
            <Input
              id="maxAttendees"
              type="number"
              min="1"
              {...register('maxAttendees', {
                setValueAs: (value) => {
                  if (
                    value === '' ||
                    value === null ||
                    value === undefined ||
                    value === 'undefined'
                  ) {
                    return undefined;
                  }
                  const num = Number(value);
                  return isNaN(num) ? undefined : num;
                },
              })}
              placeholder="Sınırsız için boş bırakın"
              className={errors.maxAttendees ? 'border-destructive' : ''}
            />
            {errors.maxAttendees && (
              <p className="text-sm text-destructive">{errors.maxAttendees.message}</p>
            )}
          </div>

          {/* Organizer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizerName">Organizatör Adı</Label>
              <Input
                id="organizerName"
                {...register('organizerName')}
                placeholder="Organizatör adı"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizerEmail">Organizatör Email</Label>
              <Input
                id="organizerEmail"
                type="email"
                {...register('organizerEmail')}
                placeholder="organizator@example.com"
                className={errors.organizerEmail ? 'border-destructive' : ''}
              />
              {errors.organizerEmail && (
                <p className="text-sm text-destructive">{errors.organizerEmail.message}</p>
              )}
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="attendanceRequired">Katılım Gerekli</Label>
                <p className="text-sm text-muted-foreground">
                  Katılımcıların kayıt olması gerekiyor mu?
                </p>
              </div>
              <Switch
                id="attendanceRequired"
                checked={watch('attendanceRequired')}
                onCheckedChange={(checked) => setValue('attendanceRequired', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Herkese Açık</Label>
                <p className="text-sm text-muted-foreground">Etkinlik herkese görünür mü?</p>
              </div>
              <Switch
                id="isPublic"
                checked={watch('isPublic')}
                onCheckedChange={(checked) => setValue('isPublic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="createZoomMeeting">Zoom Meeting Oluştur</Label>
                <p className="text-sm text-muted-foreground">
                  Otomatik olarak Zoom meeting oluşturulsun mu?
                </p>
              </div>
              <Switch
                id="createZoomMeeting"
                checked={createZoomMeeting}
                onCheckedChange={(checked) => setValue('createZoomMeeting', checked)}
              />
            </div>
          </div>

          {/* Hidden fields */}
          <input
            type="hidden"
            {...register('programId')}
            value={programId || defaultValues?.programId || ''}
          />
          <input
            type="hidden"
            {...register('consultantId')}
            value={consultantId || defaultValues?.consultantId || ''}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Etkinlik Oluştur
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
