/**
 * Chatbot Conversations API Route Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result/Result';

// Mock authentication
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock repository
const mockFindUserConversations = vi.fn();
const mockCreateConversation = vi.fn();

vi.mock('@/4-infrastructure/database/repositories/SupabaseChatbotRepository', () => ({
  SupabaseChatbotRepository: class {
    findUserConversations = mockFindUserConversations;
    createConversation = mockCreateConversation;
  },
}));

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('GET /api/chatbot/conversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return conversations successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'consultant',
    } as any);

    const mockConversations = {
      data: [
        {
          id: 'conv-1',
          userId: 'user-1',
          title: 'Test Conversation',
        },
      ],
      total: 1,
    };

    mockFindUserConversations.mockResolvedValue(Result.ok(mockConversations));

    const request = new NextRequest('http://localhost/api/chatbot/conversations');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('conv-1');
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/chatbot/conversations');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle repository errors', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'consultant',
    } as any);

    mockFindUserConversations.mockResolvedValue(Result.fail('Database error'));

    const request = new NextRequest('http://localhost/api/chatbot/conversations');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

describe('POST /api/chatbot/conversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create conversation successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'consultant',
      companyId: 'company-1',
    } as any);

    const mockConversation = {
      id: 'conv-1',
      userId: 'user-1',
      title: 'New Conversation',
    };

    mockCreateConversation.mockResolvedValue(Result.ok(mockConversation));

    const request = new NextRequest('http://localhost/api/chatbot/conversations', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Conversation',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('conv-1');
    expect(mockCreateConversation).toHaveBeenCalledWith({
      userId: 'user-1',
      companyId: 'company-1',
      programId: null,
      title: 'New Conversation',
      context: {},
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/chatbot/conversations', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
