import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequest } from '@/5-shared/test/api-helpers';
import { Result } from '@/6-core/result/Result';

// Mock services
const mockSend = vi.fn();
const mockSendTemplate = vi.fn();
const mockQueue = vi.fn();

vi.mock('@/5-shared/services/email', () => ({
  EmailService: class {
    send = mockSend;
    sendTemplate = mockSendTemplate;
    queue = mockQueue;
  },
}));

// Mock Supabase
const mockCreateClient = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: mockCreateClient,
}));

describe('POST /api/email/send', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for authenticated user
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-id' } },
          error: null,
        }),
      },
    });

    // Default mock for successful email send - use Result pattern
    mockSend.mockResolvedValue(
      Result.ok({
        success: true,
        sendgridMessageId: 'test-message-id',
      })
    );

    mockQueue.mockResolvedValue(Result.ok('queue-id'));
  });

  it('should send email successfully', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sendgridMessageId).toBeDefined();
  });

  it('should queue email if queue flag is set', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
        queue: true,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.queueId).toBeDefined();
  });

  it('should return 401 if not authenticated', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid request data', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: {
        to: 'invalid-email',
        subject: '',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
