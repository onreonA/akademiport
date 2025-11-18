/**
 * Integration Tests for /api/events
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => ({
  EventRepository: vi.fn(),
}));

// Mock UserRepository
const mockGetPrograms = vi.fn();
vi.mock('@/4-infrastructure/database/repositories/UserRepository', () => ({
  UserRepository: class {
    getPrograms = mockGetPrograms;
  },
}));

// Mock use cases - use class mock pattern
const mockCreateEventExecute = vi.fn();
const mockListEventsExecute = vi.fn();

vi.mock('@/application/use-cases/event', () => ({
  CreateEventUseCase: class {
    execute = mockCreateEventExecute;
  },
  ListEventsUseCase: class {
    execute = mockListEventsExecute;
  },
}));

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset repository mocks
    mockGetPrograms.mockResolvedValue({
      isSuccess: true,
      value: [],
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns events for consultant', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Mock UserRepository.getPrograms
    mockGetPrograms.mockResolvedValue({
      isSuccess: true,
      value: [{ id: 'program-1' }],
    });

    mockListEventsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        events: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.events).toBeDefined();
    expect(data.pagination).toBeDefined();
  });

  it('returns events for company user', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: 'company-user-1',
    });
    (user as any).companyId = 'company-1';
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListEventsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        events: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('handles query parameters correctly', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Mock UserRepository.getPrograms
    mockGetPrograms.mockResolvedValue({
      isSuccess: true,
      value: [{ id: 'program-1' }],
    });

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        events: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      },
    });

    mockListEventsUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/events?page=2&limit=10&status=scheduled'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
  });
});

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: {
        title: 'Test Event',
        programId: 'program-1',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T12:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not consultant or admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: {
        title: 'Test Event',
        programId: 'program-1',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T12:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('creates event successfully for consultant', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: 'consultant-1',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockEvent = {
      id: 'event-1',
      title: 'Test Event',
      programId: 'program-1',
      consultantId: 'consultant-1',
      startTime: new Date('2025-02-01T10:00:00Z'),
      endTime: new Date('2025-02-01T12:00:00Z'),
      status: 'scheduled' as const,
    };

    mockCreateEventExecute.mockResolvedValue({
      isFailure: false,
      value: mockEvent,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: {
        title: 'Test Event',
        programId: 'program-1',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T12:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('event-1');
    expect(data.title).toBe('Test Event');
  });

  it('validates required fields', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: {
        // Missing required fields
        title: '',
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockCreateEventExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Program not found', code: 404 },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: {
        title: 'Test Event',
        programId: 'non-existent',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T12:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });
});
