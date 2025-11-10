/**
 * Integration Tests for /api/appointments
 *
 * Tests appointment API routes with authentication, authorization, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

// Mock all dependencies before importing the route
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/AppointmentRepository', () => ({
  AppointmentRepository: vi.fn(),
}));

// Mock use cases with vi.fn() that returns a constructor
const mockCreateAppointmentUseCase = vi.fn();
const mockListAppointmentsUseCase = vi.fn();

vi.mock('@/application/use-cases/appointment', () => ({
  CreateAppointmentUseCase: mockCreateAppointmentUseCase,
  ListAppointmentsUseCase: mockListAppointmentsUseCase,
}));

describe('GET /api/appointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns appointments for consultant', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        appointments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });

    mockListAppointmentsUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.appointments).toBeDefined();
    expect(data.pagination).toBeDefined();
  });

  it('returns appointments for company user', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: 'company-user-1',
    });
    (user as any).companyId = 'company-1';
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        appointments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });

    mockListAppointmentsUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('returns 403 when company user has no companyId', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
    });
    // companyId is missing
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Firma bilgisi');
  });

  it('handles query parameters correctly', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        appointments: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      },
    });

    mockListAppointmentsUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/appointments?page=2&limit=10&status=pending'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
  });
});

describe('POST /api/appointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: {
        title: 'Test Appointment',
        consultantId: 'consultant-1',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T11:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not company user or admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: {
        title: 'Test Appointment',
        consultantId: 'consultant-1',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T11:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('creates appointment successfully for company user', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: 'company-user-1',
    });
    (user as any).companyId = 'company-1';
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        id: 'appointment-1',
      },
    });

    mockCreateAppointmentUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: {
        title: 'Test Appointment',
        consultantId: 'consultant-1',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T11:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('appointment-1');
  });

  it('validates required fields', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
    });
    (user as any).companyId = 'company-1';
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments', {
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
      role: UserRole.COMPANY_USER,
    });
    (user as any).companyId = 'company-1';
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: true,
      error: { message: 'Consultant is not available', code: 400 },
    });

    mockCreateAppointmentUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: {
        title: 'Test Appointment',
        consultantId: 'consultant-1',
        startTime: '2025-02-01T10:00:00Z',
        endTime: '2025-02-01T11:00:00Z',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('not available');
  });
});
