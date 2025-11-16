import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock services
vi.mock('@/5-shared/services/email', () => ({
  EmailService: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      isSuccess: true,
      value: { sendgridMessageId: 'test-message-id' },
    }),
    sendTemplate: vi.fn().mockResolvedValue({
      isSuccess: true,
      value: { sendgridMessageId: 'test-message-id' },
    }),
    queue: vi.fn().mockResolvedValue({
      isSuccess: true,
      value: 'queue-id',
    }),
  })),
}));

// Mock Supabase
vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-id' } },
      }),
    },
  }),
}));

describe('POST /api/email/send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send email successfully', async () => {
    const request = new NextRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sendgridMessageId).toBeDefined();
  });

  it('should queue email if queue flag is set', async () => {
    const request = new NextRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
        queue: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.queueId).toBeDefined();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mock('@/4-infrastructure/database/supabase-server', () => ({
      createClient: vi.fn().mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      }),
    }));

    const request = new NextRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid request data', async () => {
    const request = new NextRequest('http://localhost/api/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to: 'invalid-email',
        subject: '',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
