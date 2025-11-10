/**
 * Integration Tests for /api/appointments/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/AppointmentRepository', () => ({
  AppointmentRepository: vi.fn(),
}));

// Mock use cases with vi.fn() that returns a constructor
const mockGetAppointmentUseCase = vi.fn();
const mockUpdateAppointmentUseCase = vi.fn();
const mockDeleteAppointmentUseCase = vi.fn();

vi.mock('@/application/use-cases/appointment', () => ({
  GetAppointmentUseCase: mockGetAppointmentUseCase,
  UpdateAppointmentUseCase: mockUpdateAppointmentUseCase,
  DeleteAppointmentUseCase: mockDeleteAppointmentUseCase,
}));

describe('GET /api/appointments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAppointment = {
      id: 'appointment-1',
      consultantId: 'consultant-1',
      companyId: 'company-1',
      title: 'Test Appointment',
    };

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: mockAppointment,
    });

    mockGetAppointmentUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/appointments/appointment-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.event?.id).toBe('appointment-1');
  });

  it('returns 403 when consultant tries to access other consultant appointment', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-2' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAppointment = {
      id: 'appointment-1',
      consultantId: 'consultant-1', // Different consultant
      companyId: 'company-1',
    };

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: mockAppointment,
    });

    mockGetAppointmentUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

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

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: true,
      error: { message: 'Appointment not found', statusCode: 404 },
    });

    mockGetAppointmentUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

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
    const { AppointmentRepository } = await import(
      '@/4-infrastructure/database/repositories/AppointmentRepository'
    );

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const existingAppointment = {
      id: 'appointment-1',
      title: 'Original Title',
      consultantId: 'consultant-1',
    };

    const updatedAppointment = {
      ...existingAppointment,
      title: 'Updated Title',
    };

    // Mock repository for existence check
    const mockRepoInstance = {
      findById: vi.fn().mockResolvedValue(existingAppointment),
    };
    vi.mocked(AppointmentRepository).mockImplementation(() => mockRepoInstance as any);

    // Mock UpdateAppointmentUseCase
    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: updatedAppointment,
    });
    mockUpdateAppointmentUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

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
    const { AppointmentRepository } = await import(
      '@/4-infrastructure/database/repositories/AppointmentRepository'
    );

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAppointment = {
      id: 'appointment-1',
      consultantId: 'consultant-1',
      status: 'pending',
    };

    // Mock repository for existence check
    const mockRepoInstance = {
      findById: vi.fn().mockResolvedValue(mockAppointment),
    };
    vi.mocked(AppointmentRepository).mockImplementation(() => mockRepoInstance as any);

    // Mock DeleteAppointmentUseCase
    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: undefined,
    });
    mockDeleteAppointmentUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

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
