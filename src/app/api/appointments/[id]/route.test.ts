/**
 * Integration Tests for /api/appointments/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

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
const mockGetAppointmentExecute = vi.fn();
const mockUpdateAppointmentExecute = vi.fn();
const mockDeleteAppointmentExecute = vi.fn();

vi.mock('@/application/use-cases/appointment', () => ({
  GetAppointmentUseCase: class {
    execute = mockGetAppointmentExecute;
  },
  UpdateAppointmentUseCase: class {
    execute = mockUpdateAppointmentExecute;
  },
  DeleteAppointmentUseCase: class {
    execute = mockDeleteAppointmentExecute;
  },
}));

describe('GET /api/appointments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockReset();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns appointment for consultant when they own it', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAppointment = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      consultantId: user.id,
      companyId: '550e8400-e29b-41d4-a716-446655440002',
      programId: null,
      title: 'Test Appointment',
      description: null,
      status: 'pending' as const,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      timezone: 'UTC',
      requestedBy: '550e8400-e29b-41d4-a716-446655440003',
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

    mockGetAppointmentExecute.mockResolvedValue({
      isFailure: false,
      value: mockAppointment,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.appointment?.id).toBe(mockAppointment.id);
  });

  it('returns 403 when consultant tries to access other consultant appointment', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440001', // Different consultant
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAppointment = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      consultantId: '550e8400-e29b-41d4-a716-446655440000', // Different consultant
      companyId: '550e8400-e29b-41d4-a716-446655440003',
      programId: null,
      title: 'Test Appointment',
      description: null,
      status: 'pending' as const,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      timezone: 'UTC',
      requestedBy: '550e8400-e29b-41d4-a716-446655440004',
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

    mockGetAppointmentExecute.mockResolvedValue({
      isFailure: false,
      value: mockAppointment,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('returns 404 when appointment not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import NotFoundError for proper error instance
    const { NotFoundError } = await import('@/6-core/errors/AppError');
    const error = new NotFoundError('Appointment not found');

    mockGetAppointmentExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/non-existent');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Appointment not found');
  });
});

describe('PATCH /api/appointments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockReset();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { PATCH } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1', {
      method: 'PATCH',
      body: { title: 'Updated Title' },
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('updates appointment successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const existingAppointment = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      consultantId: user.id,
      companyId: '550e8400-e29b-41d4-a716-446655440002',
      programId: null,
      title: 'Original Title',
      description: null,
      status: 'pending' as const,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      timezone: 'UTC',
      requestedBy: '550e8400-e29b-41d4-a716-446655440003',
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

    const updatedAppointment = {
      ...existingAppointment,
      title: 'Updated Title',
    };

    // Mock repository for existence check
    mockFindById.mockResolvedValue(existingAppointment);

    // Mock UpdateAppointmentUseCase
    mockUpdateAppointmentExecute.mockResolvedValue({
      isFailure: false,
      value: updatedAppointment,
    });

    const { PATCH } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1', {
      method: 'PATCH',
      body: { title: 'Updated Title' },
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('DELETE /api/appointments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindById.mockReset();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('deletes appointment successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAppointment = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      consultantId: user.id,
      companyId: '550e8400-e29b-41d4-a716-446655440002',
      programId: null,
      title: 'Test Appointment',
      description: null,
      status: 'pending' as const,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      timezone: 'UTC',
      requestedBy: '550e8400-e29b-41d4-a716-446655440003',
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

    // Mock repository for existence check
    mockFindById.mockResolvedValue(mockAppointment);

    // Mock DeleteAppointmentUseCase
    mockDeleteAppointmentExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
