/**
 * Chatbot Hooks
 *
 * React Query hooks for chatbot functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChatbotConversation,
  ChatbotMessage,
  ChatbotConversationWithMessages,
} from '@/3-domain/entities/Chatbot';

const API_BASE = '/api/chatbot';

// Types
export interface SendMessageDto {
  conversationId?: string;
  message: string;
  companyId?: string | null;
  programId?: string | null;
  context?: Record<string, any>;
  stream?: boolean;
}

export interface ChatbotResponse {
  conversation: ChatbotConversation;
  message: ChatbotMessage;
  assistantMessage: ChatbotMessage;
}

// Fetch user conversations
export function useChatbotConversations(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['chatbot-conversations', limit, offset],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/conversations?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return response.json() as Promise<{ data: ChatbotConversation[]; total: number }>;
    },
  });
}

// Fetch single conversation with messages
export function useChatbotConversation(id: string) {
  return useQuery({
    queryKey: ['chatbot-conversation', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/conversations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }
      return response.json() as Promise<ChatbotConversationWithMessages>;
    },
    enabled: !!id,
  });
}

// Send message (non-streaming)
export function useSendChatbotMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: SendMessageDto) => {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dto, stream: false }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json() as Promise<{ success: boolean; data: ChatbotResponse }>;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-conversations'] });
      if (variables.conversationId || data.data?.conversation?.id) {
        queryClient.invalidateQueries({
          queryKey: [
            'chatbot-conversation',
            variables.conversationId || data.data?.conversation?.id,
          ],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Mesaj gönderilemedi');
    },
  });
}

// Send message with streaming
export function useSendChatbotMessageStream() {
  const queryClient = useQueryClient();

  return {
    sendMessage: async (
      dto: SendMessageDto,
      onChunk: (chunk: string) => void,
      onComplete: (fullMessage: string, conversationId: string) => void,
      onError: (error: string) => void
    ) => {
      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...dto, stream: true }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data.trim()) {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'chunk') {
                    onChunk(parsed.content);
                  } else if (parsed.type === 'done') {
                    onComplete(parsed.message, parsed.conversationId);
                    queryClient.invalidateQueries({ queryKey: ['chatbot-conversations'] });
                    queryClient.invalidateQueries({
                      queryKey: ['chatbot-conversation', parsed.conversationId],
                    });
                  } else if (parsed.type === 'error') {
                    onError(parsed.error);
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    },
  };
}

// Create conversation
export function useCreateChatbotConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: {
      companyId?: string | null;
      programId?: string | null;
      title?: string | null;
      context?: Record<string, any>;
    }) => {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create conversation');
      }

      return response.json() as Promise<ChatbotConversation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-conversations'] });
    },
  });
}

// Delete conversation
export function useDeleteChatbotConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete conversation');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-conversations'] });
    },
  });
}
