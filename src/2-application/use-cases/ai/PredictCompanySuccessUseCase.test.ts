import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PredictCompanySuccessUseCase } from './PredictCompanySuccessUseCase';
import { AIUseCase, AIRequestStatus, AIProvider, AIModel } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AIPrompt } from '@/3-domain/entities/AI';

// Mock services
const mockAIRouter = { complete: vi.fn() };
const mockPromptManager = { getActivePrompt: vi.fn(), renderPrompt: vi.fn() };
const mockTokenTracker = { logUsage: vi.fn() };
const mockProjectRepository = { findByCompanyId: vi.fn() };
const mockTrainingRepository = { findAll: vi.fn() };
const mockTrainingProgressRepository = { findByCompanyAndTraining: vi.fn() };
const mockEventRepository = { findByProgramId: vi.fn(), getAttendees: vi.fn() };
const mockCompanyRepository = { findById: vi.fn() };

describe('PredictCompanySuccessUseCase', () => {
  let useCase: PredictCompanySuccessUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new PredictCompanySuccessUseCase(
      mockAIRouter as any,
      mockPromptManager as any,
      mockTokenTracker as any,
      mockProjectRepository as any,
      mockTrainingRepository as any,
      mockTrainingProgressRepository as any,
      mockEventRepository as any,
      mockCompanyRepository as any
    );
  });

  describe('execute', () => {
    it('should predict company success successfully', async () => {
      const mockCompany = { id: 'company-1', name: 'Test Company' };
      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Success Prediction',
        template: 'Predict success for {{company_name}}',
        useCase: AIUseCase.SUCCESS_PREDICTION,
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
      };

      const mockAIResponse = {
        text: JSON.stringify({
          successProbability: 75,
          successLevel: 'high',
          prediction: 'Test prediction',
          factors: [{ name: 'Factor 1', impact: 'positive', description: 'Desc', weight: 0.8 }],
          recommendations: ['Rec 1'],
        }),
        requestTokens: 100,
        responseTokens: 200,
        totalTokens: 300,
        costUsd: 0.001,
        durationMs: 500,
        model: AIModel.CLAUDE_SONNET,
        provider: AIProvider.CLAUDE,
      };

      mockCompanyRepository.findById.mockResolvedValue(Result.ok(mockCompany));
      mockProjectRepository.findByCompanyId.mockResolvedValue([]);
      mockTrainingRepository.findAll.mockResolvedValue({ data: [], total: 0 });
      mockTrainingProgressRepository.findByCompanyAndTraining.mockResolvedValue([]);
      mockEventRepository.findByProgramId.mockResolvedValue([]);
      mockEventRepository.getAttendees.mockResolvedValue([]);
      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockPromptManager.renderPrompt.mockReturnValue('Rendered prompt');
      mockAIRouter.complete.mockResolvedValue(Result.ok(mockAIResponse));
      mockTokenTracker.logUsage.mockResolvedValue(
        Result.ok({
          id: '1',
          userId: 'user-1',
          provider: AIProvider.CLAUDE,
          model: AIModel.CLAUDE_SONNET,
          useCase: AIUseCase.SUCCESS_PREDICTION,
          requestTokens: 100,
          responseTokens: 200,
          totalTokens: 300,
          costUsd: 0.001,
          status: AIRequestStatus.SUCCESS,
          createdAt: new Date(),
        })
      );

      const result = await useCase.execute({
        companyId: 'company-1',
        userId: 'user-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.successProbability).toBe(75);
        expect(result.value.successLevel).toBe('high');
      }
    });

    it('should fail when company not found', async () => {
      mockCompanyRepository.findById.mockResolvedValue(Result.fail(new Error('Not found')));

      const result = await useCase.execute({
        companyId: 'non-existent',
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
