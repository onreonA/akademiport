import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ForumTopicWithDetails, ForumReplyWithDetails } from '@/3-domain/interfaces/repositories/IForumRepository';
import { CreateTopicDto, UpdateTopicDto, TopicFilterDto, CreateReplyDto } from '@/2-application/dtos/forum';
import { ForumCategory } from '@/3-domain/entities/Forum';

// =====================================================
// QUERY KEYS
// =====================================================

export const forumKeys = {
  all: ['forum'] as const,
  topics: () => [...forumKeys.all, 'topics'] as const,
  topicList: (filters: string) => [...forumKeys.topics(), 'list', filters] as const,
  topicDetail: (id: string) => [...forumKeys.topics(), 'detail', id] as const,
  replies: (topicId: string) => [...forumKeys.topics(), 'replies', topicId] as const,
  categories: (programId: string) => [...forumKeys.all, 'categories', programId] as const,
};

// =====================================================
// API FUNCTIONS
// =====================================================

async function fetchTopicsList(filters?: TopicFilterDto): Promise<{ topics: ForumTopicWithDetails[]; total: number }> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await fetch(`/api/forum/topics?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konular yüklenemedi');
  }
  return response.json();
}

async function fetchTopicById(id: string): Promise<ForumTopicWithDetails> {
  const response = await fetch(`/api/forum/topics/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu yüklenemedi');
  }
  return response.json();
}

async function createTopic(dto: CreateTopicDto): Promise<{ id: string }> {
  const response = await fetch('/api/forum/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu oluşturulamadı');
  }

  return response.json();
}

async function updateTopic(id: string, dto: UpdateTopicDto): Promise<ForumTopicWithDetails> {
  const response = await fetch(`/api/forum/topics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu güncellenemedi');
  }

  return response.json();
}

async function deleteTopic(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu silinemedi');
  }
}

async function fetchReplies(topicId: string, parentId?: string | null): Promise<{ replies: ForumReplyWithDetails[]; total: number }> {
  const params = new URLSearchParams();
  if (parentId !== undefined) {
    params.append('parentId', parentId || '');
  }

  const response = await fetch(`/api/forum/topics/${topicId}/replies?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Yanıtlar yüklenemedi');
  }
  return response.json();
}

async function createReply(topicId: string, dto: CreateReplyDto): Promise<{ id: string }> {
  const response = await fetch(`/api/forum/topics/${topicId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Yanıt oluşturulamadı');
  }

  return response.json();
}

async function likeTopic(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/like`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Beğeni eklenemedi');
  }
}

async function unlikeTopic(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/like`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Beğeni kaldırılamadı');
  }
}

async function markSolution(topicId: string, replyId: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${topicId}/solution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ replyId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Çözüm işaretlenemedi');
  }
}

async function fetchCategories(programId: string): Promise<ForumCategory[]> {
  const response = await fetch(`/api/forum/categories?programId=${programId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kategoriler yüklenemedi');
  }
  return response.json();
}

async function createCategory(dto: { programId: string; name: string; description?: string; icon?: string; color?: string; orderIndex?: number; requireApproval?: boolean }): Promise<ForumCategory> {
  const response = await fetch('/api/forum/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kategori oluşturulamadı');
  }

  return response.json();
}

async function pinTopic(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/pin`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu sabitlenemedi');
  }
}

async function unpinTopic(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/pin`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Sabitleme kaldırılamadı');
  }
}

async function lockTopicAction(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/lock`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu kilitlenemedi');
  }
}

async function unlockTopicAction(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/lock`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kilit açılamadı');
  }
}

async function closeTopic(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/close`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu kapatılamadı');
  }
}

async function approveTopic(id: string): Promise<void> {
  const response = await fetch(`/api/forum/topics/${id}/approve`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Konu onaylanamadı');
  }
}

async function updateReply(id: string, dto: { content: string }): Promise<{ id: string }> {
  const response = await fetch(`/api/forum/replies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Yanıt güncellenemedi');
  }

  return response.json();
}

async function deleteReply(id: string): Promise<void> {
  const response = await fetch(`/api/forum/replies/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Yanıt silinemedi');
  }
}

async function likeReply(id: string): Promise<void> {
  const response = await fetch(`/api/forum/replies/${id}/like`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Beğeni eklenemedi');
  }
}

async function unlikeReply(id: string): Promise<void> {
  const response = await fetch(`/api/forum/replies/${id}/like`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Beğeni kaldırılamadı');
  }
}

// =====================================================
// HOOKS
// =====================================================

export function useTopicsList(filters?: TopicFilterDto) {
  return useQuery({
    queryKey: forumKeys.topicList(JSON.stringify(filters || {})),
    queryFn: () => fetchTopicsList(filters),
  });
}

export function useTopicDetail(id: string) {
  return useQuery({
    queryKey: forumKeys.topicDetail(id),
    queryFn: () => fetchTopicById(id),
    enabled: !!id,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Konu oluşturuldu');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTopicDto }) => updateTopic(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(variables.id) });
      toast.success('Konu güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Konu silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReplies(topicId: string, parentId?: string | null) {
  return useQuery({
    queryKey: [...forumKeys.replies(topicId), parentId || 'root'],
    queryFn: () => fetchReplies(topicId, parentId),
    enabled: !!topicId,
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, dto }: { topicId: string; dto: CreateReplyDto }) => createReply(topicId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.replies(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Yanıt eklendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLikeTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeTopic,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnlikeTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlikeTopic,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMarkSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, replyId }: { topicId: string; replyId: string }) => markSolution(topicId, replyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.replies(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Çözüm işaretlendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCategories(programId: string) {
  return useQuery({
    queryKey: forumKeys.categories(programId),
    queryFn: () => fetchCategories(programId),
    enabled: !!programId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.categories(variables.programId) });
      toast.success('Kategori oluşturuldu');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePinTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinTopic,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Konu sabitlendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnpinTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpinTopic,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Sabitleme kaldırıldı');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLockTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lockTopicAction,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Konu kilitlendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnlockTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlockTopicAction,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Kilit açıldı');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCloseTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeTopic,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Konu kapatıldı');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useApproveTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveTopic,
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      toast.success('Konu onaylandı');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto, topicId }: { id: string; dto: { content: string }; topicId: string }) => updateReply(id, dto),
    onSuccess: (_, variables) => {
      // Invalidate replies for the topic
      queryClient.invalidateQueries({ queryKey: forumKeys.replies(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(variables.topicId) });
      toast.success('Yanıt güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, topicId }: { replyId: string; topicId: string }) => deleteReply(replyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.replies(variables.topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topicDetail(variables.topicId) });
      toast.success('Yanıt silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLikeReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, topicId }: { replyId: string; topicId: string }) => likeReply(replyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.replies(variables.topicId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnlikeReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, topicId }: { replyId: string; topicId: string }) => unlikeReply(replyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.replies(variables.topicId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

