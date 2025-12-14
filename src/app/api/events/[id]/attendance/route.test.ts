/**
 * Integration Tests for /api/events/[id]/attendance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';
import { Result } from '@/6-core/result/Result';
import { setupTestIsolation } from '@/shared/test/test-isolation';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock EventRepository - return mock instance from constructor
vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => {
  const mockRepo = {
    findById: vi.fn(),
  };
  (globalThis as any).__mockEventRepository = mockRepo;
  return {
    EventRepository: class {
      constructor() {
        return (globalThis as any).__mockEventRepository;
      }
    },
  };
});

// Mock CompanyRepository - return mock instance from constructor
vi.mock('@/4-infrastructure/database/repositories/CompanyRepository', () => {
  const mockRepo = {
    findById: vi.fn(),
  };
  (globalThis as any).__mockCompanyRepository = mockRepo;
  return {
    CompanyRepository: class {
      constructor() {
        return (globalThis as any).__mockCompanyRepository;
      }
    },
  };
});

// Access mocks from globalThis (set in vi.mock)
function getMockEventRepository() {
  return (globalThis as any).__mockEventRepository;
}
function getMockCompanyRepository() {
  return (globalThis as any).__mockCompanyRepository;
}

vi.mock('@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository', () => ({
  SupabaseLeaderboardRepository: vi.fn(),
}));

const mockGetAttendeesExecute = vi.fn();
const mockRegisterAttendanceExecute = vi.fn();

vi.mock('@/2-application/use-cases/event', () => ({
  GetEventAttendeesUseCase: class {
    constructor() {}
    execute = mockGetAttendeesExecute;
  },
  RegisterEventAttendanceUseCase: class {
    constructor() {}
    execute = mockRegisterAttendanceExecute;
  },
}));

vi.mock('@/2-application/use-cases/leaderboard', () => ({
  AddLeaderboardScoreUseCase: class {
    constructor() {}
    execute = vi.fn();
  },
}));

vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn((...args: any[]) => {
      // Log error for debugging
      console.error('Logger error:', ...args);
    }),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('GET /api/events/[id]/attendance', () => {
  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks - access from globalThis
    const mockEventRepo = getMockEventRepository();
    const mockCompanyRepo = getMockCompanyRepository();

    mockEventRepo.findById.mockResolvedValue({
      id: 'event-1',
      programId: 'program-1',
    } as any);
    // Mock companyRepository.findById to return Result.ok format
    mockCompanyRepo.findById.mockResolvedValue(
      Result.ok({
        id: 'company-1',
        programId: 'program-1',
      } as any)
    );
    // Mock GetEventAttendeesUseCase to return success
    mockGetAttendeesExecute.mockResolvedValue(Result.ok([]));
  });

  it('should return 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return attendees successfully for master_admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAttendees = [
      {
        id: 'attendance-1',
        eventId: 'event-1',
        userId: 'user-1',
        companyId: 'company-1',
        status: 'registered',
      },
    ];

    mockGetAttendeesExecute.mockResolvedValue(Result.ok(mockAttendees));

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.attendees).toEqual(mockAttendees);
  });

  it('should return 404 when event not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockEventRepo = getMockEventRepository();
    mockEventRepo.findById.mockResolvedValue(null);

    const request = createMockRequest('http://localhost:3000/api/events/non-existent/attendance');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Event not found');
  });

  it('should return 403 when company user tries to access different program event', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({
      role: UserRole.COMPANY_ADMIN,
      companyId: 'company-1',
    });
    // Ensure companyId is set (not just company_id) - match AuthenticatedUser interface
    const userWithCompanyId: any = {
      ...user,
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: 'company-1', // Explicitly set companyId
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(userWithCompanyId);

    const mockEventRepo = getMockEventRepository();
    const mockCompanyRepo = getMockCompanyRepository();

    mockEventRepo.findById.mockResolvedValue({
      id: 'event-1',
      programId: 'program-2', // Different program
    } as any);

    // Mock companyRepository.findById to return Result.ok with different program
    // This must return a Promise<Result<Company | null>>
    const companyResult = Result.ok({
      id: 'company-1',
      programId: 'program-1', // Different program
    } as any);
    mockCompanyRepo.findById.mockResolvedValue(companyResult);

    // Mock GetEventAttendeesUseCase - this won't be called if 403 is returned first
    mockGetAttendeesExecute.mockResolvedValue(Result.ok([]));

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    // Debug: Log response if test fails
    if (response.status !== 403) {
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('User companyId:', userWithCompanyId.companyId);
      const mockCompanyRepo = getMockCompanyRepository();
      console.log('Mock called:', mockCompanyRepo.findById.mock.calls.length);
    }

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });
});

describe('POST /api/events/[id]/attendance', () => {
  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks - access from globalThis
    const mockEventRepo = getMockEventRepository();
    const mockCompanyRepo = getMockCompanyRepository();

    mockEventRepo.findById.mockResolvedValue({
      id: 'event-1',
      programId: 'program-1',
    } as any);
    mockCompanyRepo.findById.mockResolvedValue(
      Result.ok({
        id: 'company-1',
        programId: 'program-1',
      } as any)
    );
  });

  it('should return 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance', {
      method: 'POST',
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 when user is not company user', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance', {
      method: 'POST',
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should register attendance successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    // Use valid UUID v4 format for validation (4th character must be '4', 13th must be 8/9/a/b)
    const userId = '123e4567-e89b-4123-a456-426614174000';
    const companyId = '123e4567-e89b-4123-a456-426614174001';
    const eventId = '123e4567-e89b-4123-a456-426614174002';

    const user = createMockUser({
      role: UserRole.COMPANY_ADMIN,
      companyId: companyId,
      id: userId,
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAttendance = {
      id: '123e4567-e89b-4123-a456-426614174003',
      eventId: eventId,
      userId: userId,
      companyId: companyId,
      status: 'registered',
    };

    mockRegisterAttendanceExecute.mockResolvedValue(Result.ok(mockAttendance));

    const request = createMockRequest(`http://localhost:3000/api/events/${eventId}/attendance`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ notes: 'Test notes' }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: eventId }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.attendance).toEqual(mockAttendance);
  });

  it('should return 400 when companyId is missing', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({
      role: UserRole.COMPANY_ADMIN,
      companyId: null,
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance', {
      method: 'POST',
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Company ID is required');
  });
});
