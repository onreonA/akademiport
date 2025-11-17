import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyzeCompanyRiskUseCase } from './AnalyzeCompanyRiskUseCase';
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

describe('AnalyzeCompanyRiskUseCase', () => {
  let useCase: AnalyzeCompanyRiskUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AnalyzeCompanyRiskUseCase(
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
    it('should analyze company risk successfully', async () => {
      const mockCompany = { id: 'company-1', name: 'Test Company' };
      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Risk Analysis',
        template: 'Analyze risk for {{company_name}}',
        useCase: AIUseCase.RISK_ANALYSIS,
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
          riskScore: 45,
          riskLevel: 'medium',
          analysis: 'Test analysis',
          factors: [{ name: 'Factor 1', impact: 'negative', description: 'Desc', score: 50 }],
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
          useCase: AIUseCase.RISK_ANALYSIS,
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
        expect(result.value.riskScore).toBe(45);
        expect(result.value.riskLevel).toBe('medium');
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
