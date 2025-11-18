/**
 * Integration Tests for /api/appointments/[id]/approve
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock AppointmentRepository
const mockFindById = vi.fn();
vi.mock('@/infrastructure/database/repositories/AppointmentRepository', () => ({
  AppointmentRepository: class {
    findById = mockFindById;
  },
}));

// Mock use case - use class mock pattern
const mockApproveAppointmentExecute = vi.fn();

vi.mock('@/application/use-cases/appointment', () => ({
  ApproveAppointmentUseCase: class {
    execute = mockApproveAppointmentExecute;
  },
}));

describe('POST /api/appointments/[id]/approve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset repository mock
    mockFindById.mockResolvedValue(null);
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/appointments/appointment-1/approve',
      {
        method: 'POST',
      }
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('returns 403 when user is not consultant or admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/appointments/appointment-1/approve',
      {
        method: 'POST',
      }
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('danışman');
  });

  it('approves appointment successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Mock repository to return appointment
    const mockAppointment = {
      id: 'appointment-1',
      consultantId: 'consultant-1',
      status: 'pending' as const,
    };
    mockFindById.mockResolvedValue(mockAppointment);

    const approvedAppointment = {
      id: 'appointment-1',
      status: 'approved' as const,
      zoomMeetingId: 'zoom-123',
      zoomJoinUrl: 'https://zoom.us/j/123',
    };

    mockApproveAppointmentExecute.mockResolvedValue({
      isFailure: false,
      value: approvedAppointment,
    });

    const { POST } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/appointments/appointment-1/approve',
      {
        method: 'POST',
      }
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: 'appointment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('approved');
    expect(data.zoomJoinUrl).toBeDefined();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Mock repository to return appointment
    const mockAppointment = {
      id: 'non-existent',
      consultantId: 'consultant-1',
      status: 'pending' as const,
    };
    mockFindById.mockResolvedValue(mockAppointment);

    mockApproveAppointmentExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Appointment not found', statusCode: 404 },
    });

    const { POST } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/appointments/non-existent/approve',
      {
        method: 'POST',
      }
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });

    expect(response.status).toBe(404);
  });
});
