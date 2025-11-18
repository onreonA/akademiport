import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAIInsightsUseCase } from './GetAIInsightsUseCase';
import { AIUseCase, AIProvider, AIModel } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AIPrompt } from '@/3-domain/entities/AI';
import { AppError } from '@/6-core/errors/AppError';

// Mock services
const mockAIRouter = { complete: vi.fn() };
const mockPromptManager = { getActivePrompt: vi.fn(), renderPrompt: vi.fn() };
const mockTokenTracker = { logUsage: vi.fn() };
const mockUserRepository = { findAll: vi.fn() };
const mockCompanyRepository = {
  findById: vi.fn(),
  findWithFilters: vi.fn(),
};
const mockProjectRepository = {
  findAll: vi.fn(),
  findByProgramId: vi.fn(),
  findByCompanyId: vi.fn(),
};
const mockTaskRepository = {
  findAll: vi.fn(),
  findByCompanyId: vi.fn(),
};
const mockTrainingRepository = {
  findByProgramId: vi.fn(),
  findByCompanyId: vi.fn(),
};
const mockEventRepository = {
  findByProgramId: vi.fn(),
  findByCompanyId: vi.fn(),
};

describe('GetAIInsightsUseCase', () => {
  let useCase: GetAIInsightsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetAIInsightsUseCase(
      mockAIRouter as any,
      mockPromptManager as any,
      mockTokenTracker as any,
      mockUserRepository as any,
      mockCompanyRepository as any,
      mockProjectRepository as any,
      mockTaskRepository as any,
      mockTrainingRepository as any,
      mockEventRepository as any
    );
  });

  const createMockPrompt = (): AIPrompt => ({
    id: '1',
    name: 'AI Insights',
    template: 'Analyze dashboard data: {{dashboard_data}}',
    useCase: AIUseCase.TREND_ANALYSIS,
    variables: {},
    version: 1,
    isActive: true,
    provider: AIProvider.CLAUDE,
    model: AIModel.CLAUDE_SONNET,
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createMockAIResponse = () => ({
    text: JSON.stringify({
      insights: [
        {
          type: 'trend',
          title: 'User Growth Trend',
          description: 'Users are growing steadily',
          severity: 'low',
          category: 'users',
        },
      ],
      trends: [
        {
          metric: 'users',
          direction: 'up',
          change: 10,
          period: 'month',
        },
      ],
      anomalies: [
        {
          metric: 'task_completion',
          expectedValue: 80,
          actualValue: 60,
          deviation: -20,
          description: 'Task completion rate is below expected',
        },
      ],
      recommendations: [
        {
          title: 'Improve Task Completion',
          description: 'Focus on improving task completion rates',
          priority: 'high',
          actionItems: ['Review pending tasks', 'Provide additional support'],
        },
      ],
    }),
    provider: AIProvider.CLAUDE,
    model: AIModel.CLAUDE_SONNET,
    usage: {
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300,
      costUsd: 0.001,
    },
    durationMs: 500,
  });

  describe('execute', () => {
    it('should get AI insights successfully for master dashboard', async () => {
      const mockPrompt = createMockPrompt();
      const mockAIResponse = createMockAIResponse();

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(Result.ok([{ id: '1' }] as any));
      vi.mocked(mockCompanyRepository.findWithFilters).mockResolvedValue(
        Result.ok({ companies: [{ id: '1' }], total: 1 })
      );
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue(Result.ok([{ id: '1' }] as any));
      vi.mocked(mockTaskRepository.findAll).mockResolvedValue(Result.ok([{ id: '1' }] as any));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse as any));

      const result = await useCase.execute({
        userId: 'user-1',
        dashboardType: 'master',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.insights).toBeDefined();
      expect(result.value?.trends).toBeDefined();
      expect(result.value?.anomalies).toBeDefined();
      expect(result.value?.recommendations).toBeDefined();
      expect(mockAIRouter.complete).toHaveBeenCalled();
      expect(mockTokenTracker.logUsage).toHaveBeenCalled();
    });

    it('should get AI insights successfully for consultant dashboard', async () => {
      const mockPrompt = createMockPrompt();
      const mockAIResponse = createMockAIResponse();

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(
        Result.ok({ id: 'company-1', name: 'Test Company', isActive: true } as any)
      );
      vi.mocked(mockProjectRepository.findByProgramId).mockResolvedValue(Result.ok([]));
      vi.mocked(mockTrainingRepository.findByProgramId).mockResolvedValue(Result.ok([]));
      vi.mocked(mockEventRepository.findByProgramId).mockResolvedValue(Result.ok([]));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse as any));

      const result = await useCase.execute({
        userId: 'user-1',
        dashboardType: 'consultant',
        companyId: 'company-1',
        programId: 'program-1',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(mockAIRouter.complete).toHaveBeenCalled();
    });

    it('should get AI insights successfully for company dashboard', async () => {
      const mockPrompt = createMockPrompt();
      const mockAIResponse = createMockAIResponse();

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(
        Result.ok({ id: 'company-1', name: 'Test Company', isActive: true } as any)
      );
      vi.mocked(mockProjectRepository.findByCompanyId).mockResolvedValue(Result.ok([]));
      vi.mocked(mockTaskRepository.findByCompanyId).mockResolvedValue(Result.ok([]));
      vi.mocked(mockTrainingRepository.findByCompanyId).mockResolvedValue(Result.ok([]));
      vi.mocked(mockEventRepository.findByCompanyId).mockResolvedValue(Result.ok([]));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse as any));

      const result = await useCase.execute({
        userId: 'user-1',
        dashboardType: 'company',
        companyId: 'company-1',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(mockAIRouter.complete).toHaveBeenCalled();
    });

    it('should fail when prompt not found', async () => {
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute({
        userId: 'user-1',
        dashboardType: 'master',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(AppError);
    });

    it('should fail when prompt manager fails', async () => {
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(
        Result.fail('Failed to get prompt')
      );

      const result = await useCase.execute({
        userId: 'user-1',
        dashboardType: 'master',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should fail when AI router fails', async () => {
      const mockPrompt = createMockPrompt();

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(Result.ok([]));
      vi.mocked(mockCompanyRepository.findWithFilters).mockResolvedValue(
        Result.ok({ companies: [], total: 0 })
      );
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue(Result.ok([]));
      vi.mocked(mockTaskRepository.findAll).mockResolvedValue(Result.ok([]));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.fail('AI service error'));

      const result = await useCase.execute({
        userId: 'user-1',
        dashboardType: 'master',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should parse fallback response when JSON parsing fails', async () => {
      const mockPrompt = createMockPrompt();
      const mockAIResponse = {
        text: 'This is a plain text response without JSON',
        provider: AIProvider.CLAUDE,
        model: AIModel.CLAUDE_SONNET,
        usage: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300,
          costUsd: 0.001,
        },
        durationMs: 500,
      };

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(Result.ok([]));
      vi.mocked(mockCompanyRepository.findWithFilters).mockResolvedValue(
        Result.ok({ companies: [], total: 0 })
      );
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue(Result.ok([]));
      vi.mocked(mockTaskRepository.findAll).mockResolvedValue(Result.ok([]));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(Result.ok(mockAIResponse as any));

      const result = await useCase.execute({
        userId: 'user-1',
        dashboardType: 'master',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.insights).toBeDefined();
      expect(result.value?.trends).toBeDefined();
      expect(result.value?.anomalies).toBeDefined();
      expect(result.value?.recommendations).toBeDefined();
    });
  });
});
