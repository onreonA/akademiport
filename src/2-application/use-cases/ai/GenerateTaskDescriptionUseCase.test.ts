import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerateTaskDescriptionUseCase } from './GenerateTaskDescriptionUseCase';
import { AIUseCase, AIRequestStatus, AIProvider, AIModel } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AIPrompt } from '@/3-domain/entities/AI';

// Mock AI Router
const mockAIRouter = {
  complete: vi.fn(),
  stream: vi.fn(),
  selectProvider: vi.fn(),
  checkProviderHealth: vi.fn(),
};

// Mock Prompt Manager
const mockPromptManager = {
  getActivePrompt: vi.fn(),
  renderPrompt: vi.fn(),
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
  listPromptVersions: vi.fn(),
};

// Mock Token Tracker
const mockTokenTracker = {
  logUsage: vi.fn(),
  getTotalTokens: vi.fn(),
  getUsageStats: vi.fn(),
};

vi.mock('@/5-shared/services/ai/ai-router.service', () => ({
  AIRouterService: vi.fn(() => mockAIRouter),
}));

vi.mock('@/5-shared/services/ai/prompt-manager.service', () => ({
  PromptManagerService: vi.fn(() => mockPromptManager),
}));

vi.mock('@/5-shared/services/ai/token-tracker.service', () => ({
  TokenTrackerService: vi.fn(() => mockTokenTracker),
}));

describe('GenerateTaskDescriptionUseCase', () => {
  let useCase: GenerateTaskDescriptionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GenerateTaskDescriptionUseCase(
      mockAIRouter as any,
      mockPromptManager as any,
      mockTokenTracker as any
    );
  });

  describe('execute', () => {
    it('should generate task description successfully', async () => {
      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Task Description',
        template: 'Generate description for {{taskTitle}}',
        useCase: AIUseCase.TASK_DESCRIPTION,
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAIResponse = {
        text: JSON.stringify({
          description: 'Test task description',
          subTasks: [{ title: 'Subtask 1', description: 'Description 1' }],
          keyPoints: ['Point 1', 'Point 2'],
          estimatedDuration: '2 hours',
        }),
        requestTokens: 100,
        responseTokens: 200,
        totalTokens: 300,
        costUsd: 0.001,
        durationMs: 500,
        model: AIModel.GPT_4,
        provider: AIProvider.OPENAI,
      };

      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockPromptManager.renderPrompt.mockReturnValue('Rendered prompt');
      mockAIRouter.complete.mockResolvedValue(Result.ok(mockAIResponse));
      mockTokenTracker.logUsage.mockResolvedValue(
        Result.ok({
          id: '1',
          userId: 'user-1',
          provider: AIProvider.OPENAI,
          model: AIModel.GPT_4,
          useCase: AIUseCase.TASK_DESCRIPTION,
          requestTokens: 100,
          responseTokens: 200,
          totalTokens: 300,
          costUsd: 0.001,
          status: AIRequestStatus.SUCCESS,
          createdAt: new Date(),
        })
      );

      const result = await useCase.execute({
        taskTitle: 'Test Task',
        programName: 'Test Program',
        companyName: 'Test Company',
        userId: 'user-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.description).toBe('Test task description');
        expect(result.value.subTasks).toHaveLength(1);
        expect(result.value.keyPoints).toHaveLength(2);
      }
    });

    it('should fail when prompt template not found', async () => {
      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(null));

      const result = await useCase.execute({
        taskTitle: 'Test Task',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should fail when AI service returns error', async () => {
      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Task Description',
        template: 'Template',
        useCase: AIUseCase.TASK_DESCRIPTION,
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockPromptManager.renderPrompt.mockReturnValue('Rendered prompt');
      mockAIRouter.complete.mockResolvedValue(Result.fail(new Error('AI service error')));

      const result = await useCase.execute({
        taskTitle: 'Test Task',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should handle invalid JSON response with fallback parser', async () => {
      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Task Description',
        template: 'Template',
        useCase: AIUseCase.TASK_DESCRIPTION,
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAIResponse = {
        text: 'Description: Test description\n\n1. Subtask 1\n\nKey Points:\n- Point 1',
        requestTokens: 100,
        responseTokens: 200,
        totalTokens: 300,
        costUsd: 0.001,
        durationMs: 500,
        model: AIModel.GPT_4,
        provider: AIProvider.OPENAI,
      };

      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockPromptManager.renderPrompt.mockReturnValue('Rendered prompt');
      mockAIRouter.complete.mockResolvedValue(Result.ok(mockAIResponse));
      mockTokenTracker.logUsage.mockResolvedValue(
        Result.ok({
          id: '1',
          userId: 'user-1',
          provider: AIProvider.OPENAI,
          model: AIModel.GPT_4,
          useCase: AIUseCase.TASK_DESCRIPTION,
          requestTokens: 100,
          responseTokens: 200,
          totalTokens: 300,
          costUsd: 0.001,
          status: AIRequestStatus.SUCCESS,
          createdAt: new Date(),
        })
      );

      const result = await useCase.execute({
        taskTitle: 'Test Task',
      });

      // Should succeed with fallback parser
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.description).toBeDefined();
      }
    });

    it('should handle missing required fields in response', async () => {
      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Task Description',
        template: 'Template',
        useCase: AIUseCase.TASK_DESCRIPTION,
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAIResponse = {
        text: JSON.stringify({
          description: 'Test',
          // Missing subTasks and keyPoints
        }),
        requestTokens: 100,
        responseTokens: 200,
        totalTokens: 300,
        costUsd: 0.001,
        durationMs: 500,
        model: AIModel.GPT_4,
        provider: AIProvider.OPENAI,
      };

      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockPromptManager.renderPrompt.mockReturnValue('Rendered prompt');
      mockAIRouter.complete.mockResolvedValue(Result.ok(mockAIResponse));
      mockTokenTracker.logUsage.mockResolvedValue(
        Result.ok({
          id: '1',
          userId: 'user-1',
          provider: AIProvider.OPENAI,
          model: AIModel.GPT_4,
          useCase: AIUseCase.TASK_DESCRIPTION,
          requestTokens: 100,
          responseTokens: 200,
          totalTokens: 300,
          costUsd: 0.001,
          status: AIRequestStatus.SUCCESS,
          createdAt: new Date(),
        })
      );

      const result = await useCase.execute({
        taskTitle: 'Test Task',
      });

      // Should succeed, subTasks and keyPoints might be undefined or empty array
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.description).toBe('Test');
        // subTasks and keyPoints might be undefined, so check if they exist or are arrays
        expect(result.value.subTasks === undefined || Array.isArray(result.value.subTasks)).toBe(
          true
        );
        expect(result.value.keyPoints === undefined || Array.isArray(result.value.keyPoints)).toBe(
          true
        );
      }
    });
  });
});
