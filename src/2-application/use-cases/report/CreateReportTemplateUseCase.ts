/**
 * Create Report Template Use Case
 *
 * Yeni rapor şablonu oluşturur
 */

import { IReportTemplateRepository } from '@/3-domain/interfaces/repositories/IReportTemplateRepository';
import { CreateReportTemplateDto, ReportTemplateEntity } from '@/3-domain/entities/ReportTemplate';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';

export class CreateReportTemplateUseCase {
  constructor(private templateRepository: IReportTemplateRepository) {}

  async execute(dto: CreateReportTemplateDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const template = new ReportTemplateEntity({
        id: '',
        name: dto.name,
        description: dto.description || null,
        reportType: dto.reportType,
        templateContent: dto.templateContent || {},
        sections: dto.sections || [],
        aiEnabled: dto.aiEnabled !== undefined ? dto.aiEnabled : true,
        aiUseCase: dto.aiUseCase || 'report_generation',
        version: 1,
        isActive: true,
        metadata: dto.metadata || {},
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const validation = template.validate();
      if (!validation.isValid) {
        return Result.fail(new AppError(validation.errors.join(', '), 400));
      }

      // Create template
      const createResult = await this.templateRepository.create(dto);

      if (createResult.isFailure) {
        return Result.fail(createResult.error || new AppError('Template oluşturulamadı', 500));
      }

      return Result.ok({ id: createResult.value.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Template oluşturulamadı', 500)
      );
    }
  }
}
