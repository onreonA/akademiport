/**
 * Integration Tests for PATCH /api/events/[id]/attendance/[attendanceId]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from './route';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';
import { Result } from '@/6-core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => ({
  EventRepository: vi.fn().mockImplementation(() => ({
    findById: vi.fn(),
  })),
}));

const mockMarkAttendanceExecute = vi.fn();

vi.mock('@/2-application/use-cases/event', () => ({
  MarkEventAttendanceAsAttendedUseCase: vi.fn().mockImplementation(() => ({
    execute: mockMarkAttendanceExecute,
  })),
}));

vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('PATCH /api/events/[id]/attendance/[attendanceId]', () => {
  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = createMockRequest(
      'http://localhost:3000/api/events/event-1/attendance/attendance-1',
      { method: 'PATCH' }
    );
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'event-1', attendanceId: 'attendance-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 when user is not consultant or admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.COMPANY_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const request = createMockRequest(
      'http://localhost:3000/api/events/event-1/attendance/attendance-1',
      { method: 'PATCH' }
    );
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'event-1', attendanceId: 'attendance-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should mark attendance as attended successfully for consultant', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const consultantId = 'consultant-1';
    const user = createMockUser({ role: UserRole.CONSULTANT, id: consultantId });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { EventRepository } = await import(
      '@/4-infrastructure/database/repositories/EventRepository'
    );
    const mockEventRepository = new EventRepository();
    vi.mocked(mockEventRepository.findById).mockResolvedValue({
      id: 'event-1',
      consultantId: consultantId,
    } as any);

    const mockAttendance = {
      id: 'attendance-1',
      eventId: 'event-1',
      userId: 'user-1',
      companyId: 'company-1',
      status: 'attended',
    };

    mockMarkAttendanceExecute.mockResolvedValue(Result.ok(mockAttendance));

    const request = createMockRequest(
      'http://localhost:3000/api/events/event-1/attendance/attendance-1',
      { method: 'PATCH' }
    );
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'event-1', attendanceId: 'attendance-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.attendance).toEqual(mockAttendance);
    expect(mockMarkAttendanceExecute).toHaveBeenCalledWith('attendance-1', 'event-1', consultantId);
  });

  it('should mark attendance as attended successfully for master_admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const adminId = 'admin-1';
    const consultantId = 'consultant-1';
    const user = createMockUser({ role: UserRole.MASTER_ADMIN, id: adminId });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { EventRepository } = await import(
      '@/4-infrastructure/database/repositories/EventRepository'
    );
    const mockEventRepository = new EventRepository();
    vi.mocked(mockEventRepository.findById).mockResolvedValue({
      id: 'event-1',
      consultantId: consultantId,
    } as any);

    const mockAttendance = {
      id: 'attendance-1',
      eventId: 'event-1',
      userId: 'user-1',
      companyId: 'company-1',
      status: 'attended',
    };

    mockMarkAttendanceExecute.mockResolvedValue(Result.ok(mockAttendance));

    const request = createMockRequest(
      'http://localhost:3000/api/events/event-1/attendance/attendance-1',
      { method: 'PATCH' }
    );
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'event-1', attendanceId: 'attendance-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockMarkAttendanceExecute).toHaveBeenCalledWith('attendance-1', 'event-1', consultantId);
  });

  it('should return 404 when event not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { EventRepository } = await import(
      '@/4-infrastructure/database/repositories/EventRepository'
    );
    const mockEventRepository = new EventRepository();
    vi.mocked(mockEventRepository.findById).mockResolvedValue(null);

    const request = createMockRequest(
      'http://localhost:3000/api/events/non-existent/attendance/attendance-1',
      { method: 'PATCH' }
    );
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'non-existent', attendanceId: 'attendance-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Event not found');
  });

  it('should return 403 when consultant tries to mark attendance for other consultant event', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { EventRepository } = await import(
      '@/4-infrastructure/database/repositories/EventRepository'
    );
    const mockEventRepository = new EventRepository();
    vi.mocked(mockEventRepository.findById).mockResolvedValue({
      id: 'event-1',
      consultantId: 'consultant-2', // Different consultant
    } as any);

    const request = createMockRequest(
      'http://localhost:3000/api/events/event-1/attendance/attendance-1',
      { method: 'PATCH' }
    );
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'event-1', attendanceId: 'attendance-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('You can only mark attendance for your own events');
  });

  it('should return 500 when use case fails', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { EventRepository } = await import(
      '@/4-infrastructure/database/repositories/EventRepository'
    );
    const mockEventRepository = new EventRepository();
    vi.mocked(mockEventRepository.findById).mockResolvedValue({
      id: 'event-1',
      consultantId: 'consultant-1',
    } as any);

    mockMarkAttendanceExecute.mockResolvedValue(
      Result.fail(new Error('Failed to mark attendance'))
    );

    const request = createMockRequest(
      'http://localhost:3000/api/events/event-1/attendance/attendance-1',
      { method: 'PATCH' }
    );
    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'event-1', attendanceId: 'attendance-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to mark attendance');
  });
});

