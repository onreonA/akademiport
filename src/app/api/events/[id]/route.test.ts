/**
 * Integration Tests for /api/events/[id]
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

// Mock use cases with vi.fn() that returns a constructor
const mockGetEventUseCase = vi.fn();
const mockUpdateEventUseCase = vi.fn();
const mockDeleteEventUseCase = vi.fn();

vi.mock('@/application/use-cases/event', () => ({
  GetEventUseCase: mockGetEventUseCase,
  UpdateEventUseCase: mockUpdateEventUseCase,
  DeleteEventUseCase: mockDeleteEventUseCase,
}));

describe('GET /api/events/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events/event-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns event for consultant when they own it', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockEvent = {
      id: 'event-1',
      consultantId: 'consultant-1',
      programId: 'program-1',
      title: 'Test Event',
    };

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: mockEvent,
    });

    mockGetEventUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events/event-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('event-1');
  });

  it('returns 404 when event not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: true,
      error: { message: 'Event not found', statusCode: 404 },
    });

    mockGetEventUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events/non-existent');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });

    expect(response.status).toBe(404);
  });
});

describe('PUT /api/events/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events/event-1', {
      method: 'PUT',
      body: { title: 'Updated Title' },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('updates event successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const updatedEvent = {
      id: 'event-1',
      title: 'Updated Title',
      consultantId: 'consultant-1',
    };

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: updatedEvent,
    });

    mockUpdateEventUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events/event-1', {
      method: 'PUT',
      body: { title: 'Updated Title' },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated Title');
  });
});

describe('DELETE /api/events/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events/event-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('deletes event successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    mockDeleteEventUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/events/event-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });

    expect(response.status).toBe(204);
  });
});
