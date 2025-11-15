/**
 * Assign Manager Use Case
 *
 * Business logic for assigning a program manager to a program
 */

import { Result } from '@/core/result/Result';
import { Program } from '@/3-domain/entities/Program';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { UserRole } from '@/3-domain/enums/UserRole';

export interface AssignManagerInput {
  programId: string;
  managerId: string;
  userId: string;
  userRole: UserRole;
}

export class AssignManagerUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: AssignManagerInput): Promise<Result<Program>> {
    try {
      // 1. Authorization: Only MASTER_ADMIN can assign managers
      if (input.userRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Sadece Master Admin program yöneticisi atayabilir');
      }

      // 2. Validation: Required fields
      if (!input.programId || input.programId.trim().length === 0) {
        return Result.fail('Program ID zorunludur');
      }

      if (!input.managerId || input.managerId.trim().length === 0) {
        return Result.fail('Yönetici ID zorunludur');
      }

      // 3. Check if program exists
      const programResult = await this.programRepository.findById(input.programId);

      if (programResult.isFailure) {
        return Result.fail(programResult.error || 'Program bulunamadı');
      }

      if (!programResult.value) {
        return Result.fail('Program bulunamadı');
      }

      // 4. TODO: Check if manager user exists and has PROGRAM_MANAGER role
      // This will be implemented in Sprint 5 when we have UserRepository
      // For now, we trust that the managerId is valid

      // 5. Update program with new manager
      const updateResult = await this.programRepository.update(input.programId, {
        programManagerId: input.managerId,
      });

      if (updateResult.isFailure) {
        return Result.fail(updateResult.error || 'Yönetici atanamadı');
      }

      return Result.ok(updateResult.value!);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Yönetici atanırken bir hata oluştu'
      );
    }
  }
}
