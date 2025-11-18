/**
 * CMS React Query Hooks
 * Sprint 23: CMS
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CMSPage, CMSPageStatus } from '@/3-domain/entities/CMSPage';
import { CMSMedia } from '@/3-domain/entities/CMSMedia';
import { CMSSettings, CMSSettingsCategory } from '@/3-domain/entities/CMSSettings';

// =====================================================
// CMS PAGES
// =====================================================

export interface CMSPageFilter {
  status?: CMSPageStatus;
  search?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
}

export function useCMSPages(filter?: CMSPageFilter) {
  return useQuery({
    queryKey: ['cms-pages', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.status) params.append('status', filter.status);
      if (filter?.search) params.append('search', filter.search);
      if (filter?.createdBy) params.append('createdBy', filter.createdBy);
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.offset) params.append('offset', filter.offset.toString());

      const response = await fetch(`/api/cms/pages?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Sayfalar yüklenemedi');
      }
      const data = await response.json();
      return data.data as CMSPage[];
    },
  });
}

export function useCMSPage(id: string) {
  return useQuery({
    queryKey: ['cms-page', id],
    queryFn: async () => {
      const response = await fetch(`/api/cms/pages/${id}`);
      if (!response.ok) {
        throw new Error('Sayfa yüklenemedi');
      }
      const data = await response.json();
      return data.data as CMSPage;
    },
    enabled: !!id,
  });
}

export function useCreateCMSPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: {
      slug: string;
      title: string;
      content?: any[];
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string[];
      ogImageUrl?: string;
      ogTitle?: string;
      ogDescription?: string;
      canonicalUrl?: string;
      status?: CMSPageStatus;
      publishedAt?: Date;
    }) => {
      const response = await fetch('/api/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sayfa oluşturulamadı');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
  });
}

export function useUpdateCMSPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: {
      id: string;
      slug?: string;
      title?: string;
      content?: any[];
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string[];
      ogImageUrl?: string;
      ogTitle?: string;
      ogDescription?: string;
      canonicalUrl?: string;
      status?: CMSPageStatus;
      publishedAt?: Date;
    }) => {
      const response = await fetch(`/api/cms/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sayfa güncellenemedi');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      queryClient.invalidateQueries({ queryKey: ['cms-page', variables.id] });
    },
  });
}

export function useDeleteCMSPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cms/pages/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sayfa silinemedi');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
  });
}

// =====================================================
// CMS MEDIA
// =====================================================

export interface CMSMediaFilter {
  mimeType?: string;
  uploadedBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export function useCMSMedia(filter?: CMSMediaFilter) {
  return useQuery({
    queryKey: ['cms-media', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.mimeType) params.append('mimeType', filter.mimeType);
      if (filter?.uploadedBy) params.append('uploadedBy', filter.uploadedBy);
      if (filter?.search) params.append('search', filter.search);
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.offset) params.append('offset', filter.offset.toString());

      const response = await fetch(`/api/cms/media?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Medya yüklenemedi');
      }
      const data = await response.json();
      return data.data as CMSMedia[];
    },
  });
}

export function useUploadCMSMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: {
      filename: string;
      originalFilename: string;
      mimeType: string;
      fileSize: number;
      fileUrl: string;
      storagePath: string;
      altText?: string;
      caption?: string;
    }) => {
      const response = await fetch('/api/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Medya yüklenemedi');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-media'] });
    },
  });
}

export function useDeleteCMSMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cms/media/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Medya silinemedi');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-media'] });
    },
  });
}

// =====================================================
// CMS SETTINGS
// =====================================================

export function useCMSSettings(category?: CMSSettingsCategory) {
  return useQuery({
    queryKey: ['cms-settings', category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await fetch(`/api/cms/settings?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Ayarlar yüklenemedi');
      }
      const data = await response.json();
      return data.data as CMSSettings[];
    },
  });
}

export function useCMSSetting(key: string) {
  return useQuery({
    queryKey: ['cms-setting', key],
    queryFn: async () => {
      const response = await fetch(`/api/cms/settings/${key}`);
      if (!response.ok) {
        throw new Error('Ayar yüklenemedi');
      }
      const data = await response.json();
      return data.data as CMSSettings;
    },
    enabled: !!key,
  });
}

export function useUpdateCMSSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const response = await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ayarlar güncellenemedi');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-settings'] });
    },
  });
}

export function useUpdateCMSSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      ...dto
    }: {
      key: string;
      value?: any;
      category?: CMSSettingsCategory;
      description?: string;
    }) => {
      const response = await fetch(`/api/cms/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ayar güncellenemedi');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms-settings'] });
      queryClient.invalidateQueries({ queryKey: ['cms-setting', variables.key] });
    },
  });
}
