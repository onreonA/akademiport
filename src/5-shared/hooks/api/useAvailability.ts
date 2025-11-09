/**
 * React Query hooks for Availability Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Availability,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
} from '@/domain/entities/Availability';
import type {
  UnavailableDate,
  CreateUnavailableDateDto,
  UpdateUnavailableDateDto,
} from '@/domain/entities/UnavailableDate';

// ============================================
// AVAILABILITY HOOKS
// ============================================

export const useAvailability = (consultantId: string, programId?: string | null) => {
  return useQuery<Availability[]>({
    queryKey: ['availability', consultantId, programId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (programId !== undefined) {
        params.append('programId', programId || 'null');
      }

      const response = await fetch(`/api/consultants/${consultantId}/availability?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsaitlik kuralları yüklenemedi');
      }

      const data = await response.json();
      return data.data || [];
    },
    enabled: !!consultantId,
  });
};

export const useCreateAvailability = (consultantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateAvailabilityDto, 'consultantId'>) => {
      console.log('useCreateAvailability mutationFn called with:', {
        consultantId,
        data,
        url: `/api/consultants/${consultantId}/availability`,
      });

      const response = await fetch(`/api/consultants/${consultantId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('API response status:', response.status);
      const responseData = await response.json();
      console.log('API response data:', responseData);

      if (!response.ok) {
        const errorMessage = responseData.error || 'Müsaitlik kuralı oluşturulamadı';
        console.error('API error:', errorMessage);
        throw new Error(errorMessage);
      }

      return responseData;
    },
    onSuccess: (data) => {
      console.log('useCreateAvailability onSuccess:', data);
      queryClient.invalidateQueries({ queryKey: ['availability', consultantId] });
      toast.success('Müsaitlik kuralı başarıyla oluşturuldu');
    },
    onError: (error: Error) => {
      console.error('useCreateAvailability onError:', error);
      toast.error(error.message || 'Müsaitlik kuralı oluşturulamadı');
    },
  });
};

export const useUpdateAvailability = (consultantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAvailabilityDto }) => {
      const response = await fetch(`/api/consultants/${consultantId}/availability/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsaitlik kuralı güncellenemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', consultantId] });
      toast.success('Müsaitlik kuralı başarıyla güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Müsaitlik kuralı güncellenemedi');
    },
  });
};

export const useDeleteAvailability = (consultantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/consultants/${consultantId}/availability/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsaitlik kuralı silinemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', consultantId] });
      toast.success('Müsaitlik kuralı başarıyla silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Müsaitlik kuralı silinemedi');
    },
  });
};

// ============================================
// UNAVAILABLE DATES HOOKS
// ============================================

export const useUnavailableDates = (
  consultantId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    programId?: string | null;
  }
) => {
  return useQuery<UnavailableDate[]>({
    queryKey: [
      'unavailableDates',
      consultantId,
      options?.startDate,
      options?.endDate,
      options?.programId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.startDate) {
        params.append('startDate', options.startDate.toISOString());
      }
      if (options?.endDate) {
        params.append('endDate', options.endDate.toISOString());
      }
      if (options?.programId !== undefined) {
        params.append('programId', options.programId || 'null');
      }

      const response = await fetch(`/api/consultants/${consultantId}/unavailable?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsait olmayan tarihler yüklenemedi');
      }

      const data = await response.json();
      return data.data || [];
    },
    enabled: !!consultantId,
  });
};

export const useCreateUnavailableDate = (consultantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateUnavailableDateDto, 'consultantId'>) => {
      const response = await fetch(`/api/consultants/${consultantId}/unavailable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsait olmayan tarih oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailableDates', consultantId] });
      toast.success('Müsait olmayan tarih başarıyla eklendi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Müsait olmayan tarih oluşturulamadı');
    },
  });
};

export const useUpdateUnavailableDate = (consultantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUnavailableDateDto }) => {
      const response = await fetch(`/api/consultants/${consultantId}/unavailable/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsait olmayan tarih güncellenemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailableDates', consultantId] });
      toast.success('Müsait olmayan tarih başarıyla güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Müsait olmayan tarih güncellenemedi');
    },
  });
};

export const useDeleteUnavailableDate = (consultantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/consultants/${consultantId}/unavailable/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsait olmayan tarih silinemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailableDates', consultantId] });
      toast.success('Müsait olmayan tarih başarıyla silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Müsait olmayan tarih silinemedi');
    },
  });
};

// ============================================
// CHECK AVAILABILITY HOOK
// ============================================

export const useCheckAvailability = (
  consultantId: string,
  startTime: Date | null,
  endTime: Date | null,
  programId?: string | null
) => {
  return useQuery<{ isAvailable: boolean; conflicts: Array<{ type: string; details: any }> }>({
    queryKey: [
      'checkAvailability',
      consultantId,
      startTime?.toISOString(),
      endTime?.toISOString(),
      programId,
    ],
    queryFn: async () => {
      if (!startTime || !endTime) {
        throw new Error('Başlangıç ve bitiş tarihi gerekli');
      }

      const params = new URLSearchParams({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      if (programId !== undefined) {
        params.append('programId', programId || 'null');
      }

      const response = await fetch(`/api/consultants/${consultantId}/availability/check?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsaitlik kontrolü yapılamadı');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!consultantId && !!startTime && !!endTime,
  });
};
