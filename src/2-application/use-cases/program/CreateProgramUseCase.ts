/**
 * Create Program Use Case
 *
 * Business logic for creating a new program
 */

import { Result } from '@/core/result/Result';
import { Program } from '@/domain/entities/Program';
import { CreateProgramDto } from '@/application/dto/program';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { UserRole } from '@/domain/enums/UserRole';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';

export interface CreateProgramInput extends CreateProgramDto {
  createdBy?: string;
  userRole: UserRole;
}

export class CreateProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: CreateProgramInput): Promise<Result<Program>> {
    try {
      // 1. Authorization: Only MASTER_ADMIN can create programs
      if (input.userRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Sadece Master Admin program oluşturabilir');
      }

      // 2. Validation: Required fields
      if (!input.name || input.name.trim().length === 0) {
        return Result.fail('Program adı zorunludur');
      }

      if (input.name.length < 3) {
        return Result.fail('Program adı en az 3 karakter olmalıdır');
      }

      if (input.name.length > 100) {
        return Result.fail('Program adı en fazla 100 karakter olabilir');
      }

      if (!input.startDate) {
        return Result.fail('Başlangıç tarihi zorunludur');
      }

      if (!input.endDate) {
        return Result.fail('Bitiş tarihi zorunludur');
      }

      // 3. Business Rules: Date validation
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      if (startDate >= endDate) {
        return Result.fail('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      }

      // 4. Business Rules: Calculate duration if not provided
      if (!input.durationMonths) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        input.durationMonths = diffMonths;
      }

      // 5. Business Rules: Generate slug if not provided
      if (!input.slug) {
        input.slug = this.generateSlug(input.name);
      }

      // 6. Business Rules: Set default status if not provided
      if (!input.status) {
        input.status = ProgramStatus.PLANNED;
      }

      // 7. Business Rules: Set default maxCompanies if not provided
      if (!input.maxCompanies) {
        input.maxCompanies = 20;
      }

      // 8. Create program
      const createDto: CreateProgramDto = {
        name: input.name.trim(),
        description: input.description?.trim(),
        slug: input.slug,
        city: input.city?.trim(),
        region: input.region?.trim(),
        programType: input.programType?.trim(),
        startDate: startDate,
        endDate: endDate,
        durationMonths: input.durationMonths,
        maxCompanies: input.maxCompanies,
        sponsor: input.sponsor?.trim(),
        budget: input.budget,
        programManagerId: input.programManagerId,
        status: input.status,
      };

      const result = await this.programRepository.create(createDto);

      if (result.isFailure) {
        return Result.fail(result.error || 'Program oluşturulamadı');
      }

      return Result.ok(result.value!);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Program oluşturulurken bir hata oluştu'
      );
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
