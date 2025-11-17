import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result/Result';

// Mock authentication
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use case
const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/ai/GenerateTrainingSummaryUseCase', () => ({
  GenerateTrainingSummaryUseCase: class {
    execute = mockExecute;
  },
}));

// Mock services
vi.mock('@/5-shared/services/ai/ai-router.service', () => ({
  AIRouterService: class {},
}));

vi.mock('@/5-shared/services/ai/prompt-manager.service', () => ({
  PromptManagerService: class {},
}));

vi.mock('@/5-shared/services/ai/token-tracker.service', () => ({
  TokenTrackerService: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingRepository', () => ({
  TrainingRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingVideoRepository', () => ({
  TrainingVideoRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingDocumentRepository', () => ({
  TrainingDocumentRepository: class {},
}));

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('POST /api/ai/trainings/[id]/generate-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate training summary successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.ok({
        summary: 'Test summary',
        keyPoints: [],
        learningOutcomes: [],
      })
    );

    const request = new NextRequest(
      'http://localhost/api/ai/trainings/training-1/generate-summary',
      {
        method: 'POST',
      }
    );

    const { POST } = await import('./route');
    const response = await POST(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary).toBe('Test summary');
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost/api/ai/trainings/training-1/generate-summary',
      {
        method: 'POST',
      }
    );

    const { POST } = await import('./route');
    const response = await POST(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 500 when use case fails', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(Result.fail(new Error('Use case error')));

    const request = new NextRequest(
      'http://localhost/api/ai/trainings/training-1/generate-summary',
      {
        method: 'POST',
      }
    );

    const { POST } = await import('./route');
    const response = await POST(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
