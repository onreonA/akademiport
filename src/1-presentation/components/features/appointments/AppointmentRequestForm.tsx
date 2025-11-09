'use client';

import { useState, useEffect } from 'react';
import { Calendar, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
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
import { useCreateAppointment } from '@/shared/hooks/api/useAppointments';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';

interface Consultant {
  id: string;
  fullName: string;
  email: string;
}

interface AppointmentRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentRequestForm({ onSuccess, onCancel }: AppointmentRequestFormProps) {
  const { user } = useAuth();
  const createAppointment = useCreateAppointment();

  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoadingConsultants, setIsLoadingConsultants] = useState(false);
  const [companyProgramId, setCompanyProgramId] = useState<string | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [companyNotes, setCompanyNotes] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'conflict' | null>(
    null
  );

  // Fetch consultants for company's program
  useEffect(() => {
    if (user?.companyId) {
      fetchConsultants();
    }
  }, [user?.companyId]);

  const fetchConsultants = async () => {
    try {
      setIsLoadingConsultants(true);

      if (!user?.companyId) {
        console.error('❌ [AppointmentRequestForm] User companyId is missing:', user);
        toast.error('Firma bilgisi bulunamadı');
        return;
      }

      console.log('🔍 [AppointmentRequestForm] Fetching company:', user.companyId);

      // Get company's program first
      const companyResponse = await fetch(`/api/companies/${user.companyId}`);
      const companyData = await companyResponse.json();

      console.log('📦 [AppointmentRequestForm] Company response:', {
        success: companyData.success,
        programId: companyData.data?.programId,
        companyData: companyData.data,
      });

      if (!companyData.success) {
        console.error('❌ [AppointmentRequestForm] Company fetch failed:', companyData.error);
        toast.error(companyData.error || 'Firma bilgisi alınamadı');
        return;
      }

      if (!companyData.data?.programId) {
        console.error('❌ [AppointmentRequestForm] Company has no programId:', companyData.data);
        toast.error('Firmanın programı bulunamadı');
        return;
      }

      // Store programId for later use
      setCompanyProgramId(companyData.data.programId);

      console.log(
        '🔍 [AppointmentRequestForm] Fetching consultants for program:',
        companyData.data.programId
      );

      // Get consultants for the program
      const consultantsResponse = await fetch(
        `/api/programs/${companyData.data.programId}/consultants`
      );
      const consultantsData = await consultantsResponse.json();

      console.log('👥 [AppointmentRequestForm] Consultants response:', {
        success: consultantsData.success,
        count: consultantsData.data?.length || 0,
        consultants: consultantsData.data,
        error: consultantsData.error,
      });

      if (!consultantsData.success) {
        console.error(
          '❌ [AppointmentRequestForm] Consultants fetch failed:',
          consultantsData.error
        );
        toast.error(consultantsData.error || 'Danışmanlar yüklenemedi');
        return;
      }

      if (!consultantsData.data || consultantsData.data.length === 0) {
        console.warn(
          '⚠️ [AppointmentRequestForm] No consultants found for program:',
          companyData.data.programId
        );
        setConsultants([]);
        return;
      }

      // Map User entities to Consultant format
      const consultantList = (consultantsData.data || []).map((user: any) => ({
        id: user.id,
        fullName:
          user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
      }));

      console.log('✅ [AppointmentRequestForm] Mapped consultants:', consultantList);
      setConsultants(consultantList);
    } catch (error) {
      console.error('❌ [AppointmentRequestForm] Exception:', error);
      toast.error('Danışmanlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingConsultants(false);
    }
  };

  // Check availability when time changes
  useEffect(() => {
    if (selectedConsultantId && startTime && endTime) {
      checkAvailability();
    } else {
      setAvailabilityStatus(null);
    }
  }, [selectedConsultantId, startTime, endTime]);

  const checkAvailability = async () => {
    if (!selectedConsultantId || !startTime || !endTime) return;

    try {
      setIsCheckingAvailability(true);
      // Use new availability check API
      const startDateTime = new Date(startTime);
      const endDateTime = new Date(endTime);

      const params = new URLSearchParams({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      if (companyProgramId) {
        params.append('programId', companyProgramId);
      }

      const response = await fetch(
        `/api/consultants/${selectedConsultantId}/availability/check?${params}`
      );
      const data = await response.json();

      if (data.success) {
        const { isAvailable, conflicts } = data.data;
        if (isAvailable) {
          setAvailabilityStatus('available');
        } else {
          setAvailabilityStatus('conflict');
          console.warn('Availability conflicts:', conflicts);
        }
      } else {
        setAvailabilityStatus('conflict');
      }
    } catch (error) {
      console.error('Failed to check availability:', error);
      setAvailabilityStatus('conflict');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedConsultantId || !title || !startTime || !endTime) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (!user?.companyId || !user?.id) {
      toast.error('Kullanıcı bilgileri bulunamadı');
      return;
    }

    if (availabilityStatus === 'conflict') {
      toast.error('Seçilen saatte danışmanın başka bir randevusu bulunmaktadır');
      return;
    }

    console.log('📤 [AppointmentRequestForm] Submitting appointment request:', {
      consultantId: selectedConsultantId,
      companyId: user.companyId,
      programId: companyProgramId,
      title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    });

    createAppointment.mutate(
      {
        consultantId: selectedConsultantId,
        programId: companyProgramId || null,
        title,
        description: description || null,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        timezone: 'Europe/Istanbul',
        companyNotes: companyNotes || null,
      },
      {
        onSuccess: (data) => {
          console.log('✅ [AppointmentRequestForm] Appointment created successfully:', data);
          // Reset form
          setSelectedConsultantId('');
          setTitle('');
          setDescription('');
          setStartTime('');
          setEndTime('');
          setCompanyNotes('');
          setAvailabilityStatus(null);

          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error) => {
          console.error('❌ [AppointmentRequestForm] Appointment creation failed:', error);
        },
      }
    );
  };

  // Calculate end time automatically (minimum 15 minutes)
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (value && !endTime) {
      const start = new Date(value);
      const end = new Date(start.getTime() + 15 * 60 * 1000); // Add 15 minutes
      setEndTime(end.toISOString().slice(0, 16));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Randevu Talep Et</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Consultant Selection */}
          <div className="space-y-2">
            <Label htmlFor="consultant">
              Danışman <span className="text-destructive">*</span>
            </Label>
            {isLoadingConsultants ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Danışmanlar yükleniyor...</span>
              </div>
            ) : consultants.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Programınıza atanmış danışman bulunmamaktadır.
              </div>
            ) : (
              <Select value={selectedConsultantId} onValueChange={setSelectedConsultantId} required>
                <SelectTrigger id="consultant">
                  <SelectValue placeholder="Danışman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Randevu Başlığı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Proje Danışmanlığı Görüşmesi"
              required
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Randevu hakkında detaylar..."
              rows={4}
              maxLength={5000}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">
                Başlangıç Tarihi ve Saati <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">
                Bitiş Tarihi ve Saati <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                min={startTime || new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Availability Status */}
          {selectedConsultantId && startTime && endTime && (
            <div className="flex items-center gap-2">
              {isCheckingAvailability ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Müsaitlik kontrol ediliyor...
                  </span>
                </>
              ) : availabilityStatus === 'available' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Danışman bu saatte müsait</span>
                </>
              ) : availabilityStatus === 'conflict' ? (
                <>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    Danışmanın bu saatte başka bir randevusu bulunmaktadır
                  </span>
                </>
              ) : null}
            </div>
          )}

          {/* Company Notes */}
          <div className="space-y-2">
            <Label htmlFor="company-notes">Notlarınız</Label>
            <Textarea
              id="company-notes"
              value={companyNotes}
              onChange={(e) => setCompanyNotes(e.target.value)}
              placeholder="Danışman için notlarınız..."
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
            )}
            <Button
              type="submit"
              disabled={createAppointment.isPending || availabilityStatus === 'conflict'}
            >
              {createAppointment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Randevu Talebi Gönder
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
