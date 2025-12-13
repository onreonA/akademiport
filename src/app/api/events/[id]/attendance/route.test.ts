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

// Create mock instances that will be shared
const mockEventRepository = {
  findById: vi.fn(),
};

const mockCompanyRepository = {
  findById: vi.fn(),
};

// Store mocks globally before vi.mock hoisting
(globalThis as any).__mockEventRepository = mockEventRepository;
(globalThis as any).__mockCompanyRepository = mockCompanyRepository;

vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => ({
  EventRepository: class {
    constructor() {
      return (globalThis as any).__mockEventRepository;
    }
  },
}));

vi.mock('@/4-infrastructure/database/repositories/CompanyRepository', () => ({
  CompanyRepository: class {
    constructor() {
      return (globalThis as any).__mockCompanyRepository;
    }
  },
}));

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
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('GET /api/events/[id]/attendance', () => {
  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks
    mockEventRepository.findById.mockResolvedValue({
      id: 'event-1',
      programId: 'program-1',
    } as any);
    mockCompanyRepository.findById.mockResolvedValue({
      isFailure: false,
      value: {
        id: 'company-1',
        programId: 'program-1',
      },
    } as any);
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

    mockEventRepository.findById.mockResolvedValue(null);

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
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockEventRepository.findById.mockResolvedValue({
      id: 'event-1',
      programId: 'program-2', // Different program
    } as any);

    mockCompanyRepository.findById.mockResolvedValue(
      Result.ok({
        id: 'company-1',
        programId: 'program-1', // Different program
      } as any)
    );

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'event-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });
});

describe('POST /api/events/[id]/attendance', () => {
  setupTestIsolation();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks
    mockEventRepository.findById.mockResolvedValue({
      id: 'event-1',
      programId: 'program-1',
    } as any);
    mockCompanyRepository.findById.mockResolvedValue({
      isFailure: false,
      value: {
        id: 'company-1',
        programId: 'program-1',
      },
    } as any);
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
    const user = createMockUser({
      role: UserRole.COMPANY_ADMIN,
      companyId: 'company-1',
      id: 'user-1',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockAttendance = {
      id: 'attendance-1',
      eventId: 'event-1',
      userId: 'user-1',
      companyId: 'company-1',
      status: 'registered',
    };

    mockRegisterAttendanceExecute.mockResolvedValue(Result.ok(mockAttendance));

    const request = createMockRequest('http://localhost:3000/api/events/event-1/attendance', {
      method: 'POST',
      body: JSON.stringify({ notes: 'Test notes' }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'event-1' }),
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
