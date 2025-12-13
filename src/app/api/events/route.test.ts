/**
 * Integration Tests for /api/events
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser, resetTestCookies } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';
import { setupTestIsolation } from '@/shared/test/test-isolation';

// Mock auth helper
const mockGetAuthenticatedUser = vi.fn();
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

// Mock repositories - use class constructor pattern
const mockGetPrograms = vi.fn();
const mockListEvents = vi.fn();
const mockCreateEvent = vi.fn();

vi.mock('@/4-infrastructure/database/repositories/UserRepository', () => {
  return {
    UserRepository: class {
      getPrograms = mockGetPrograms;
    },
  };
});

vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => {
  return {
    EventRepository: class {
      list = mockListEvents;
      create = mockCreateEvent;
    },
  };
});

// Mock use cases - use class constructor pattern
const mockCreateEventExecute = vi.fn();
const mockListEventsExecute = vi.fn();

vi.mock('@/application/use-cases/event', () => {
  return {
    CreateEventUseCase: class {
      execute = mockCreateEventExecute;
    },
    ListEventsUseCase: class {
      execute = mockListEventsExecute;
    },
  };
});

// Setup test isolation
setupTestIsolation();

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTestCookies();

    // Reset repository mocks
    mockGetPrograms.mockResolvedValue({
      isSuccess: true,
      value: [],
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns events for consultant', async () => {
    const user = createMockUser({ role: UserRole.CONSULTANT });
    mockGetAuthenticatedUser.mockResolvedValue(user as any);

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
    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: 'company-user-1',
    });
    (user as any).companyId = 'company-1';
    mockGetAuthenticatedUser.mockResolvedValue(user as any);

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
    const user = createMockUser({ role: UserRole.CONSULTANT });
    mockGetAuthenticatedUser.mockResolvedValue(user as any);

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
        page: 2,
        limit: 10,
        totalPages: 0,
      },
    });

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
    resetTestCookies();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

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
    const user = createMockUser({ role: UserRole.COMPANY_USER });
    mockGetAuthenticatedUser.mockResolvedValue(user as any);

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
    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID format (version 4)
    });
    mockGetAuthenticatedUser.mockResolvedValue(user as any);

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
        programId: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID format
        startTime: '2025-12-31T10:00:00Z', // Future date
        endTime: '2025-12-31T12:00:00Z', // Future date
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('event-1');
    expect(data.title).toBe('Test Event');
  });

  it('validates required fields', async () => {
    const user = createMockUser({
      role: UserRole.CONSULTANT,
    });
    mockGetAuthenticatedUser.mockResolvedValue(user as any);

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
    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID format (version 4)
    });
    mockGetAuthenticatedUser.mockResolvedValue(user as any);

    // Import AppError for proper error instance
    const { AppError } = await import('@/6-core/errors/AppError');
    const error = new AppError('Program not found', 404);

    mockCreateEventExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: {
        title: 'Test Event',
        programId: '550e8400-e29b-41d4-a716-446655440999', // Valid UUID format
        startTime: '2025-12-31T10:00:00Z', // Future date
        endTime: '2025-12-31T12:00:00Z', // Future date
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });
});
