import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AppointmentResponseDto,
  AppointmentListResponseDto,
  AppointmentFilterDto,
} from '@/application/dto/appointment';
import { toast } from 'sonner';

export const useAppointments = (filters?: AppointmentFilterDto) => {
  const queryParams = new URLSearchParams();
  if (filters?.consultantId) queryParams.append('consultantId', filters.consultantId);
  if (filters?.companyId) queryParams.append('companyId', filters.companyId);
  if (filters?.programId) queryParams.append('programId', filters.programId);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters?.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.page) queryParams.append('page', String(filters.page));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));

  const queryString = queryParams.toString();
  const queryKey = ['appointments', filters];

  return useQuery<AppointmentListResponseDto, Error>({
    queryKey,
    queryFn: async () => {
      const url = queryString ? `/api/appointments?${queryString}` : '/api/appointments';
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }
      return response.json();
    },
  });
};

export const useAppointment = (appointmentId: string) => {
  return useQuery<{ success: boolean; appointment: AppointmentResponseDto }, Error>({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch appointment');
      }
      return response.json();
    },
    enabled: !!appointmentId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      consultantId: string;
      programId?: string | null;
      title: string;
      description?: string | null;
      startTime: string;
      endTime: string;
      timezone?: string;
      companyNotes?: string | null;
    }) => {
      console.log('📤 [useCreateAppointment] Sending request:', data);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log(
        '📥 [useCreateAppointment] Response status:',
        response.status,
        response.statusText
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, get text
          const text = await response.text();
          console.error('❌ [useCreateAppointment] Non-JSON error response:', text);
          throw new Error(
            `Failed to create appointment: ${response.status} ${response.statusText}`
          );
        }

        console.error('❌ [useCreateAppointment] Error response:', errorData);

        // Handle validation errors with details
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationMessages = errorData.details
            .map((detail: any) => {
              return `${detail.path?.join('.') || 'field'}: ${detail.message}`;
            })
            .join(', ');
          throw new Error(`Validation failed: ${validationMessages}`);
        }

        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const responseData = await response.json();
      console.log('✅ [useCreateAppointment] Success response:', responseData);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Randevu talebi başarıyla oluşturuldu');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Randevu oluşturulamadı');
    },
  });
};

export const useApproveAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: string; notes?: string }) => {
      const response = await fetch(`/api/appointments/${appointmentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve appointment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      toast.success('Randevu başarıyla onaylandı');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Randevu onaylanamadı');
    },
  });
};

export const useRejectAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason: string }) => {
      const response = await fetch(`/api/appointments/${appointmentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject appointment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      toast.success('Randevu reddedildi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Randevu reddedilemedi');
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      newStartTime,
      newEndTime,
    }: {
      appointmentId: string;
      newStartTime: string;
      newEndTime: string;
    }) => {
      const response = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStartTime,
          newEndTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reschedule appointment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      toast.success('Randevu başarıyla revize edildi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Randevu revize edilemedi');
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: {
        title?: string;
        description?: string | null;
        startTime?: string;
        endTime?: string;
        timezone?: string;
        notes?: string | null;
        companyNotes?: string | null;
      };
    }) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      toast.success('Randevu başarıyla güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Randevu güncellenemedi');
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete appointment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Randevu başarıyla silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Randevu silinemedi');
    },
  });
};
