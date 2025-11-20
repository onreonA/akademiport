import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerateTrainingSummaryUseCase } from './GenerateTrainingSummaryUseCase';
import { AIUseCase, AIRequestStatus, AIProvider, AIModel } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AIPrompt } from '@/3-domain/entities/AI';

// Mock AI Router
const mockAIRouter = {
  complete: vi.fn(),
  stream: vi.fn(),
};

// Mock Prompt Manager
const mockPromptManager = {
  getActivePrompt: vi.fn(),
  renderPrompt: vi.fn(),
};

// Mock Token Tracker
const mockTokenTracker = {
  logUsage: vi.fn(),
};

// Mock Repositories
const mockTrainingRepository = {
  findById: vi.fn(),
};

const mockTrainingVideoRepository = {
  findByTrainingId: vi.fn(),
};

const mockTrainingDocumentRepository = {
  findByTrainingId: vi.fn(),
};

describe('GenerateTrainingSummaryUseCase', () => {
  let useCase: GenerateTrainingSummaryUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GenerateTrainingSummaryUseCase(
      mockAIRouter as any,
      mockPromptManager as any,
      mockTokenTracker as any,
      mockTrainingRepository as any,
      mockTrainingVideoRepository as any,
      mockTrainingDocumentRepository as any
    );
  });

  describe('execute', () => {
    it('should generate training summary successfully', async () => {
      const mockTraining = {
        id: 'training-1',
        name: 'Test Training',
        description: 'Test Description',
      };

      const mockVideos = [{ id: 'video-1', title: 'Video 1', url: 'https://example.com/video1' }];

      const mockDocuments = [
        { id: 'doc-1', title: 'Document 1', fileUrl: 'https://example.com/doc1' },
      ];

      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Document Summary',
        template: 'Summarize {{training_name}}',
        useCase: AIUseCase.DOCUMENT_SUMMARY,
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
          summary: 'Test summary',
          keyPoints: ['Point 1', 'Point 2'],
          estimatedDuration: '2 hours',
          difficulty: 'intermediate',
          prerequisites: ['Prereq 1'],
          learningOutcomes: ['Outcome 1'],
        }),
        requestTokens: 100,
        responseTokens: 200,
        totalTokens: 300,
        costUsd: 0.001,
        durationMs: 500,
        model: AIModel.CLAUDE_SONNET,
        provider: AIProvider.CLAUDE,
      };

      mockTrainingRepository.findById.mockResolvedValue(mockTraining);
      mockTrainingVideoRepository.findByTrainingId.mockResolvedValue(mockVideos);
      mockTrainingDocumentRepository.findByTrainingId.mockResolvedValue(mockDocuments);
      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockPromptManager.renderPrompt.mockReturnValue('Rendered prompt');
      mockAIRouter.complete.mockResolvedValue(Result.ok(mockAIResponse));
      mockTokenTracker.logUsage.mockResolvedValue(
        Result.ok({
          id: '1',
          userId: 'user-1',
          provider: AIProvider.CLAUDE,
          model: AIModel.CLAUDE_SONNET,
          useCase: AIUseCase.DOCUMENT_SUMMARY,
          requestTokens: 100,
          responseTokens: 200,
          totalTokens: 300,
          costUsd: 0.001,
          status: AIRequestStatus.SUCCESS,
          createdAt: new Date(),
        })
      );

      const result = await useCase.execute({
        trainingId: 'training-1',
        userId: 'user-1',
      });

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.summary).toBe('Test summary');
        expect(result.value.keyPoints).toHaveLength(2);
        expect(result.value.learningOutcomes).toHaveLength(1);
      }
    });

    it('should fail when training not found', async () => {
      mockTrainingRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        trainingId: 'non-existent',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should fail when prompt template not found', async () => {
      const mockTraining = {
        id: 'training-1',
        name: 'Test Training',
      };

      mockTrainingRepository.findById.mockResolvedValue(mockTraining);
      mockTrainingVideoRepository.findByTrainingId.mockResolvedValue([]);
      mockTrainingDocumentRepository.findByTrainingId.mockResolvedValue([]);
      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(null));

      const result = await useCase.execute({
        trainingId: 'training-1',
      });

      expect(result.isFailure).toBe(true);
    });

    it('should handle AI service error', async () => {
      const mockTraining = {
        id: 'training-1',
        name: 'Test Training',
      };

      const mockPrompt: AIPrompt = {
        id: '1',
        name: 'Document Summary',
        template: 'Template',
        useCase: AIUseCase.DOCUMENT_SUMMARY,
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

      mockTrainingRepository.findById.mockResolvedValue(mockTraining);
      mockTrainingVideoRepository.findByTrainingId.mockResolvedValue([]);
      mockTrainingDocumentRepository.findByTrainingId.mockResolvedValue([]);
      mockPromptManager.getActivePrompt.mockResolvedValue(Result.ok(mockPrompt));
      mockPromptManager.renderPrompt.mockReturnValue('Rendered prompt');
      mockAIRouter.complete.mockResolvedValue(Result.fail(new Error('AI service error')));

      const result = await useCase.execute({
        trainingId: 'training-1',
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
