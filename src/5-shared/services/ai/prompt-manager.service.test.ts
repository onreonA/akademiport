import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PromptManagerService } from './prompt-manager.service';
import { AIUseCase, AIProvider, AIModel } from '@/3-domain/enums/AIEnums';
import { AIPrompt } from '@/3-domain/entities/AI';

// Mock Supabase client
vi.mock('@/4-infrastructure/database/supabase-server', () => {
  const mockSupabaseQuery = {
    select: vi.fn(() => mockSupabaseQuery),
    insert: vi.fn(() => mockSupabaseQuery),
    update: vi.fn(() => mockSupabaseQuery),
    eq: vi.fn(() => mockSupabaseQuery),
    single: vi.fn(),
    order: vi.fn(() => mockSupabaseQuery),
  };

  const mockSupabaseClient = {
    from: vi.fn(() => mockSupabaseQuery),
  };

  return {
    createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  };
});

describe('PromptManagerService', () => {
  let service: PromptManagerService;
  let mockSupabaseQuery: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createClient } = await import('@/4-infrastructure/database/supabase-server');
    const client = await createClient();
    mockSupabaseQuery = client.from('ai_prompts');
    service = new PromptManagerService();
  });

  describe('getActivePrompt', () => {
    it('should return active prompt for use case', async () => {
      const mockPrompt = {
        id: '123',
        name: 'Test Prompt',
        description: 'Test',
        use_case: AIUseCase.TASK_DESCRIPTION,
        template: 'Test template {{variable}}',
        variables: {},
        version: 1,
        is_active: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1.0,
        metadata: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseQuery.single.mockResolvedValue({
        data: mockPrompt,
        error: null,
      });

      const result = await service.getActivePrompt(AIUseCase.TASK_DESCRIPTION);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeDefined();
        expect(result.value?.useCase).toBe(AIUseCase.TASK_DESCRIPTION);
      }
    });

    it('should return null if no active prompt found', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await service.getActivePrompt(AIUseCase.TASK_DESCRIPTION);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeNull();
      }
    });

    it('should handle errors', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'ERROR' },
      });

      const result = await service.getActivePrompt(AIUseCase.TASK_DESCRIPTION);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('renderPrompt', () => {
    it('should render prompt with variables', () => {
      const prompt: AIPrompt = {
        id: '123',
        name: 'Test',
        template: 'Hello {{name}}, welcome to {{program}}',
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

      const rendered = service.renderPrompt(prompt, {
        name: 'John',
        program: 'E-İhracat',
      });

      expect(rendered).toBe('Hello John, welcome to E-İhracat');
    });

    it('should handle missing variables', () => {
      const prompt: AIPrompt = {
        id: '123',
        name: 'Test',
        template: 'Hello {{name}}',
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

      const rendered = service.renderPrompt(prompt, {});

      expect(rendered).toBe('Hello {{name}}');
    });

    it('should handle multiple occurrences of same variable', () => {
      const prompt: AIPrompt = {
        id: '123',
        name: 'Test',
        template: '{{name}} says hello to {{name}}',
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

      const rendered = service.renderPrompt(prompt, { name: 'John' });

      expect(rendered).toBe('John says hello to John');
    });
  });

  describe('createPrompt', () => {
    it('should create new prompt', async () => {
      const mockPrompt = {
        id: '123',
        name: 'New Prompt',
        use_case: AIUseCase.TASK_DESCRIPTION,
        template: 'Template',
        version: 1,
        is_active: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseQuery.single.mockResolvedValue({
        data: mockPrompt,
        error: null,
      });

      const newPrompt: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Prompt',
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
      };

      const result = await service.createPrompt(newPrompt);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('listPromptVersions', () => {
    it('should list all versions of a use case', async () => {
      const mockPrompts = [
        {
          id: '1',
          use_case: AIUseCase.TASK_DESCRIPTION,
          version: 2,
          is_active: true,
        },
        {
          id: '2',
          use_case: AIUseCase.TASK_DESCRIPTION,
          version: 1,
          is_active: false,
        },
      ];

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockPrompts,
        error: null,
      });

      const result = await service.listPromptVersions(AIUseCase.TASK_DESCRIPTION);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBe(2);
      }
    });
  });
});
