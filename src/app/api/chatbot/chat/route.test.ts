/**
 * Chatbot Chat API Route Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result/Result';

// Mock authentication
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use case
const mockSendMessage = vi.fn();
vi.mock('@/2-application/use-cases/chatbot/ChatbotConversationUseCase', () => ({
  ChatbotConversationUseCase: class {
    sendMessage = mockSendMessage;
  },
}));

// Mock repositories
vi.mock('@/4-infrastructure/database/repositories/SupabaseChatbotRepository', () => ({
  SupabaseChatbotRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingRepository', () => ({
  TrainingRepository: class {},
}));

// Mock services
vi.mock('@/5-shared/services/ai/ai-router.service', () => ({
  AIRouterService: class {},
}));

vi.mock('@/5-shared/services/ai/prompt-manager.service', () => ({
  PromptManagerService: class {},
}));

vi.mock('@/5-shared/services/ai/token-tracker.service', () => ({
  TokenTrackerService: class {},
}));

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('POST /api/chatbot/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send message successfully (non-streaming)', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'consultant',
      companyId: 'company-1',
    } as any);

    const mockResponse = {
      conversation: {
        id: 'conv-1',
        userId: 'user-1',
        title: 'Test',
      },
      message: {
        id: 'msg-1',
        content: 'Hello',
        role: 'user',
      },
      assistantMessage: {
        id: 'msg-2',
        content: 'Hello! How can I help?',
        role: 'assistant',
      },
    };

    mockSendMessage.mockResolvedValue(Result.ok(mockResponse));

    const request = new NextRequest('http://localhost/api/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        stream: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.conversation.id).toBe('conv-1');
    expect(mockSendMessage).toHaveBeenCalledWith({
      message: 'Hello',
      userId: 'user-1',
      companyId: 'company-1',
      programId: undefined,
      context: undefined,
      conversationId: undefined,
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when message is missing', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'consultant',
    } as any);

    const request = new NextRequest('http://localhost/api/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Mesaj gereklidir');
  });

  it('should return 500 when use case fails', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'consultant',
    } as any);

    mockSendMessage.mockResolvedValue(Result.fail(new Error('Failed to send message')));

    const request = new NextRequest('http://localhost/api/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('should handle streaming requests', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'consultant',
    } as any);

    const request = new NextRequest('http://localhost/api/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        stream: true,
      }),
    });

    const response = await POST(request);

    // Streaming response should have text/event-stream content type
    expect(response.headers.get('content-type')).toBe('text/event-stream');
  });
});
