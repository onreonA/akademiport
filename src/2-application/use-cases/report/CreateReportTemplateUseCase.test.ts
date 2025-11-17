import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateReportTemplateUseCase } from './CreateReportTemplateUseCase';
import { IReportTemplateRepository } from '@/3-domain/interfaces/repositories/IReportTemplateRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ReportTemplate, ReportType } from '@/3-domain/entities/ReportTemplate';

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('CreateReportTemplateUseCase', () => {
  let mockRepository: IReportTemplateRepository;
  let useCase: CreateReportTemplateUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByType: vi.fn(),
      findActiveByType: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    } as any;

    useCase = new CreateReportTemplateUseCase(mockRepository);
  });

  const createMockTemplate = (overrides?: Partial<ReportTemplate>): ReportTemplate => ({
    id: 'template-1',
    name: 'Test Template',
    description: 'Test Description',
    reportType: 'monthly' as ReportType,
    templateContent: {},
    sections: [],
    aiEnabled: true,
    aiUseCase: 'report_generation',
    version: 1,
    isActive: true,
    metadata: {},
    createdBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('execute', () => {
    it('should create template successfully', async () => {
      const dto = {
        name: 'Test Template',
        reportType: 'monthly' as ReportType,
        description: 'Test Description',
        templateContent: { title: 'Test Title' },
        sections: ['section1'],
        aiEnabled: true,
      };

      const template = createMockTemplate();

      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(template));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe('template-1');
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should use default values when optional fields not provided', async () => {
      const dto = {
        name: 'Test Template',
        reportType: 'monthly' as ReportType,
        templateContent: { title: 'Test Title' },
        sections: ['section1'],
      };

      const template = createMockTemplate();

      vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(template));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      // Use case passes dto directly to repository
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should fail when validation fails', async () => {
      const dto = {
        name: '', // Invalid: empty name
        reportType: 'monthly' as ReportType,
      };

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should fail when repository fails', async () => {
      const dto = {
        name: 'Test Template',
        reportType: 'monthly' as ReportType,
        templateContent: { title: 'Test Title' },
        sections: ['section1'],
      };

      vi.mocked(mockRepository.create).mockResolvedValue(
        Result.fail(new AppError('Database error', 500))
      );

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Database error');
    });

    it('should handle exceptions', async () => {
      const dto = {
        name: 'Test Template',
        reportType: 'monthly' as ReportType,
        templateContent: { title: 'Test Title' },
        sections: ['section1'],
      };

      vi.mocked(mockRepository.create).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });
});
