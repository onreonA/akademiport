import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenTrackerService } from './token-tracker.service';
import { AIProvider, AIUseCase, AIRequestStatus, AIModel } from '@/3-domain/enums/AIEnums';

// Mock Supabase client
const mockSupabaseQuery = {
  select: vi.fn(() => mockSupabaseQuery),
  insert: vi.fn(() => mockSupabaseQuery),
  eq: vi.fn(() => mockSupabaseQuery),
  gte: vi.fn(() => mockSupabaseQuery),
  lte: vi.fn(() => mockSupabaseQuery),
  single: vi.fn(),
};

const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseQuery),
};

vi.mock('@/4-infrastructure/database/supabase-server', () => {
  return {
    createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  };
});

describe('TokenTrackerService', () => {
  let service: TokenTrackerService;

  beforeEach(async () => {
    vi.clearAllMocks();
    service = new TokenTrackerService();
  });

  describe('logUsage', () => {
    it('should log usage successfully', async () => {
      const mockLog = {
        id: '123',
        user_id: 'user-123',
        company_id: 'company-123',
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        use_case: AIUseCase.TASK_DESCRIPTION,
        request_tokens: 100,
        response_tokens: 200,
        total_tokens: 300,
        cost_usd: 0.001,
        status: AIRequestStatus.SUCCESS,
        created_at: new Date().toISOString(),
      };

      mockSupabaseQuery.single.mockResolvedValue({
        data: mockLog,
        error: null,
      });

      const usageLog = {
        userId: 'user-123',
        companyId: 'company-123',
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        useCase: AIUseCase.TASK_DESCRIPTION,
        requestTokens: 100,
        responseTokens: 200,
        totalTokens: 300,
        costUsd: 0.001,
        status: AIRequestStatus.SUCCESS,
      };

      const result = await service.logUsage(usageLog);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalTokens).toBe(300);
      }
    });

    it('should handle errors', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const usageLog = {
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        useCase: AIUseCase.TASK_DESCRIPTION,
        requestTokens: 100,
        responseTokens: 200,
        totalTokens: 300,
        costUsd: 0.001,
        status: AIRequestStatus.SUCCESS,
      };

      const result = await service.logUsage(usageLog);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('getTotalTokens', () => {
    it('should return total tokens with filter', async () => {
      const mockLogs = [{ total_tokens: 100 }, { total_tokens: 200 }, { total_tokens: 300 }];

      // Mock the chain: first query (count with filters), second query (select)
      // First query chain: from().select().eq()... returns promise with { data, error, count }
      const mockQueryChain1: any = {
        select: vi.fn(function (this: any) {
          return this;
        }),
        eq: vi.fn(function (this: any) {
          return this;
        }),
        gte: vi.fn(function (this: any) {
          return this;
        }),
        lte: vi.fn(function (this: any) {
          return this;
        }),
        then: vi.fn((resolve: any) => resolve({ data: null, error: null, count: 3 })),
      };

      // Second query: from().select() returns promise with { data, error }
      const mockQueryChain2 = {
        select: vi.fn().mockResolvedValue({ data: mockLogs, error: null }),
      };

      // Mock from() to return different chains for each call
      vi.mocked(mockSupabaseClient.from)
        .mockReturnValueOnce(mockQueryChain1 as any)
        .mockReturnValueOnce(mockQueryChain2 as any);

      const result = await service.getTotalTokens({
        provider: AIProvider.OPENAI,
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(600);
      }
    });

    it('should return 0 if no logs found', async () => {
      // Mock first query (count)
      const mockQueryChain1: any = {
        select: vi.fn(function (this: any) {
          return this;
        }),
        eq: vi.fn(function (this: any) {
          return this;
        }),
        gte: vi.fn(function (this: any) {
          return this;
        }),
        lte: vi.fn(function (this: any) {
          return this;
        }),
        then: vi.fn((resolve: any) => resolve({ data: null, error: null, count: 0 })),
      };

      // Mock second query (select)
      const mockQueryChain2 = {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(mockSupabaseClient.from)
        .mockReturnValueOnce(mockQueryChain1 as any)
        .mockReturnValueOnce(mockQueryChain2 as any);

      const result = await service.getTotalTokens();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(0);
      }
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const mockLogs = [
        {
          provider: AIProvider.OPENAI,
          use_case: AIUseCase.TASK_DESCRIPTION,
          total_tokens: 100,
        },
        {
          provider: AIProvider.CLAUDE,
          use_case: AIUseCase.REPORT_GENERATION,
          total_tokens: 200,
        },
      ];

      // Mock query chain
      const mockQueryChain = {
        select: vi.fn().mockResolvedValue({ data: mockLogs, error: null }),
        eq: vi.fn(function (this: any) {
          return this;
        }),
        gte: vi.fn(function (this: any) {
          return this;
        }),
        lte: vi.fn(function (this: any) {
          return this;
        }),
      };

      vi.mocked(mockSupabaseClient.from).mockReturnValue(mockQueryChain as any);

      const result = await service.getUsageStats();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalRequests).toBe(2);
        expect(result.value.totalTokens).toBe(300);
        expect(result.value.averageTokensPerRequest).toBe(150);
      }
    });
  });
});
