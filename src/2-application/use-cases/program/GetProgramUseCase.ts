/**
 * Get Program Use Case
 * 
 * Business logic for retrieving a single program
 */

import { Result } from '@/core/result/Result';
import { Program } from '@/domain/entities/Program';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';

export interface GetProgramInput {
  id: string;
}

export class GetProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: GetProgramInput): Promise<Result<Program>> {
    try {
      // 1. Validation: ID is required
      if (!input.id || input.id.trim().length === 0) {
        return Result.fail('Program ID zorunludur');
      }

      // 2. Get program
      const result = await this.programRepository.findById(input.id);

      if (result.isFailure) {
        return Result.fail(result.error || 'Program bulunamadı');
      }

      if (!result.value) {
        return Result.fail('Program bulunamadı');
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Program getirilirken bir hata oluştu'
      );
    }
  }
}
