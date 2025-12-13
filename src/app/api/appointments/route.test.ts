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

const mockFindById = vi.fn();
vi.mock('@/4-infrastructure/database/repositories/AppointmentRepository', () => {
  return {
    AppointmentRepository: class {
      findById = mockFindById;
    },
  };
});

// Mock use cases - use class mock pattern
const mockCreateAppointmentExecute = vi.fn();
const mockListAppointmentsExecute = vi.fn();

vi.mock('@/application/use-cases/appointment', () => ({
  CreateAppointmentUseCase: class {
    execute = mockCreateAppointmentExecute;
  },
  ListAppointmentsUseCase: class {
    execute = mockListAppointmentsExecute;
  },
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

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListAppointmentsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      },
    });

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
      id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
    });
    (user as any).companyId = '550e8400-e29b-41d4-a716-446655440002'; // Valid UUID
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListAppointmentsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      },
    });

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

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListAppointmentsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [],
        total: 0,
        page: 2,
        limit: 10,
      },
    });

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
    expect(data.error).toContain('firma kullanıcıları');
  });

  it('creates appointment successfully for company user', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
    });
    (user as any).companyId = '550e8400-e29b-41d4-a716-446655440002'; // Valid UUID
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAppointment = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      consultantId: '550e8400-e29b-41d4-a716-446655440004',
      companyId: (user as any).companyId,
      programId: null,
      title: 'Test Appointment',
      description: null,
      status: 'pending' as const,
      startTime: new Date('2025-02-01T10:00:00Z'),
      endTime: new Date('2025-02-01T11:00:00Z'),
      timezone: 'UTC',
      requestedBy: user.id,
      requestedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      rescheduledFrom: null,
      rescheduledAt: null,
      rescheduledBy: null,
      attendedAt: null,
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomPassword: null,
      notes: null,
      companyNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreateAppointmentExecute.mockResolvedValue({
      isFailure: false,
      value: {
        id: mockAppointment.id,
      },
    });

    // Mock repository.findById to return the appointment
    mockFindById.mockResolvedValue(mockAppointment);

    const { POST } = await import('./route');
    // Use future dates to pass validation
    const futureStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    const futureEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(); // Tomorrow + 1 hour
    const request = createMockRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: {
        title: 'Test Appointment',
        consultantId: '550e8400-e29b-41d4-a716-446655440004', // Valid UUID
        startTime: futureStartTime,
        endTime: futureEndTime,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.appointment).toBeDefined();
    expect(data.appointment.id).toBe(mockAppointment.id);
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
      id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
    });
    (user as any).companyId = '550e8400-e29b-41d4-a716-446655440002'; // Valid UUID
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import AppError for proper error instance
    const { AppError } = await import('@/6-core/errors/AppError');
    const error = new AppError('Consultant is not available', 400);

    mockCreateAppointmentExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { POST } = await import('./route');
    // Use future dates to pass validation
    const futureStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    const futureEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(); // Tomorrow + 1 hour
    const request = createMockRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: {
        title: 'Test Appointment',
        consultantId: '550e8400-e29b-41d4-a716-446655440004', // Valid UUID
        startTime: futureStartTime,
        endTime: futureEndTime,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('not available');
  });
});
