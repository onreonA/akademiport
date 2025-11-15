import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NewsWithTags } from '@/3-domain/interfaces/repositories/INewsRepository';
import { CreateNewsDto, UpdateNewsDto, RecordReadDto } from '@/2-application/dtos/news';

// =====================================================
// QUERY KEYS
// =====================================================

export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  list: (filters: string) => [...newsKeys.lists(), filters] as const,
  details: () => [...newsKeys.all, 'detail'] as const,
  detail: (id: string) => [...newsKeys.details(), id] as const,
};

// =====================================================
// API FUNCTIONS
// =====================================================

async function fetchNewsList(filters?: Record<string, any>): Promise<NewsWithTags[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const response = await fetch(`/api/news?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Haberler yüklenemedi');
  }
  return response.json();
}

async function fetchNewsById(id: string): Promise<NewsWithTags> {
  const response = await fetch(`/api/news/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Haber yüklenemedi');
  }
  return response.json();
}

async function createNews(dto: CreateNewsDto): Promise<NewsWithTags> {
  const response = await fetch('/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Haber oluşturulamadı');
  }

  return response.json();
}

async function updateNews(id: string, dto: UpdateNewsDto): Promise<NewsWithTags> {
  const response = await fetch(`/api/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Haber güncellenemedi');
  }

  return response.json();
}

async function deleteNews(id: string): Promise<void> {
  const response = await fetch(`/api/news/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Haber silinemedi');
  }
}

async function publishNews(id: string): Promise<NewsWithTags> {
  const response = await fetch(`/api/news/${id}/publish`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Haber yayınlanamadı');
  }

  return response.json();
}

async function likeNews(id: string): Promise<void> {
  const response = await fetch(`/api/news/${id}/like`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Beğeni eklenemedi');
  }
}

async function unlikeNews(id: string): Promise<void> {
  const response = await fetch(`/api/news/${id}/like`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Beğeni kaldırılamadı');
  }
}

async function recordRead(dto: RecordReadDto): Promise<void> {
  const response = await fetch(`/api/news/${dto.newsId}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Okuma kaydedilemedi');
  }
}

// =====================================================
// HOOKS
// =====================================================

export function useNewsList(filters?: Record<string, any>) {
  return useQuery({
    queryKey: newsKeys.list(JSON.stringify(filters || {})),
    queryFn: () => fetchNewsList(filters),
  });
}

export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => fetchNewsById(id),
    enabled: !!id,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      toast.success('Haber oluşturuldu');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateNewsDto }) => updateNews(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(variables.id) });
      toast.success('Haber güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      toast.success('Haber silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePublishNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishNews,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(id) });
      toast.success('Haber yayınlandı');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLikeNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnlikeNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlikeNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRecordRead() {
  return useMutation({
    mutationFn: recordRead,
    // Silent - no toast notifications
  });
}
