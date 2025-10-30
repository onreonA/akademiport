/**
 * Update Program Use Case
 *
 * Business logic for updating an existing program
 */

import { Result } from '@/core/result/Result';
import { Program } from '@/domain/entities/Program';
import { UpdateProgramDto } from '@/application/dto/program';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { UserRole } from '@/domain/enums/UserRole';

export interface UpdateProgramInput extends UpdateProgramDto {
  id: string;
  userId: string;
  userRole: UserRole;
  updatedBy?: string;
}

export class UpdateProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: UpdateProgramInput): Promise<Result<Program>> {
    try {
      // 1. Check if program exists
      const programResult = await this.programRepository.findById(input.id);

      if (programResult.isFailure) {
        return Result.fail(programResult.error || 'Program bulunamadı');
      }

      if (!programResult.value) {
        return Result.fail('Program bulunamadı');
      }

      const existingProgram = programResult.value;

      // 2. Authorization: MASTER_ADMIN or PROGRAM_MANAGER (if they manage this program)
      const canEdit = this.canUserEditProgram(
        input.userId,
        input.userRole,
        existingProgram.programManagerId
      );

      if (!canEdit) {
        return Result.fail('Bu programı düzenleme yetkiniz yok');
      }

      // 3. Validation: Name
      if (input.name !== undefined) {
        if (input.name.trim().length === 0) {
          return Result.fail('Program adı boş olamaz');
        }

        if (input.name.length < 3) {
          return Result.fail('Program adı en az 3 karakter olmalıdır');
        }

        if (input.name.length > 100) {
          return Result.fail('Program adı en fazla 100 karakter olabilir');
        }
      }

      // 4. Business Rules: Date validation
      if (input.startDate || input.endDate) {
        const startDate = input.startDate ? new Date(input.startDate) : existingProgram.startDate;
        const endDate = input.endDate ? new Date(input.endDate) : existingProgram.endDate;

        if (startDate >= endDate) {
          return Result.fail('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
        }
      }

      // 5. Business Rules: Status change validation
      if (input.status !== undefined) {
        // Only MASTER_ADMIN can change status
        if (input.userRole !== UserRole.MASTER_ADMIN) {
          return Result.fail('Sadece Master Admin program durumunu değiştirebilir');
        }
      }

      // 6. Business Rules: Manager change validation
      if (input.programManagerId !== undefined) {
        // Only MASTER_ADMIN can change manager
        if (input.userRole !== UserRole.MASTER_ADMIN) {
          return Result.fail('Sadece Master Admin program yöneticisini değiştirebilir');
        }
      }

      // 7. Update program
      const updateDto: UpdateProgramDto = {
        name: input.name?.trim(),
        description: input.description?.trim(),
        city: input.city?.trim(),
        region: input.region?.trim(),
        programType: input.programType?.trim(),
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        durationMonths: input.durationMonths,
        maxCompanies: input.maxCompanies,
        status: input.status,
        sponsor: input.sponsor?.trim(),
        budget: input.budget,
        programManagerId: input.programManagerId,
        settings: input.settings,
      };

      const result = await this.programRepository.update(input.id, updateDto);

      if (result.isFailure) {
        return Result.fail(result.error || 'Program güncellenemedi');
      }

      return Result.ok(result.value!);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Program güncellenirken bir hata oluştu'
      );
    }
  }

  private canUserEditProgram(
    userId: string,
    userRole: UserRole,
    programManagerId?: string
  ): boolean {
    // MASTER_ADMIN can edit any program
    if (userRole === UserRole.MASTER_ADMIN) {
      return true;
    }

    // PROGRAM_MANAGER can edit only their own program
    if (userRole === UserRole.PROGRAM_MANAGER && programManagerId === userId) {
      return true;
    }

    return false;
  }
}
