/**
 * Remove Program Use Case
 *
 * Business logic for removing a user from a program
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { UserRole } from '@/domain/enums/UserRole';
import { RemoveProgramDto } from '@/application/dto/user';

interface RemoveProgramRequest extends RemoveProgramDto {
  removerRole: UserRole; // Role of the user making the request
}

export class RemoveProgramUseCase {
  constructor(
    private userRepository: IUserRepository,
    private programRepository: IProgramRepository
  ) {}

  async execute(request: RemoveProgramRequest): Promise<Result<void>> {
    try {
      // 1. Authorization: Only MASTER_ADMIN and PROGRAM_MANAGER can remove programs
      if (
        request.removerRole !== UserRole.MASTER_ADMIN &&
        request.removerRole !== UserRole.PROGRAM_MANAGER
      ) {
        return Result.fail('Bu işlem için yetkiniz yok');
      }

      // 2. Check if user exists
      const userResult = await this.userRepository.findById(request.userId);
      if (userResult.isFailure) {
        return Result.fail(userResult.error || 'Kullanıcı bulunamadı');
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      // 3. Check if program exists
      const programResult = await this.programRepository.findById(request.programId);
      if (programResult.isFailure) {
        return Result.fail(programResult.error || 'Program bulunamadı');
      }

      if (!programResult.value) {
        return Result.fail('Program bulunamadı');
      }

      // 4. PROGRAM_MANAGER can only remove from their own programs
      if (request.removerRole === UserRole.PROGRAM_MANAGER) {
        const program = programResult.value;
        if (program.programManagerId !== request.removedBy) {
          return Result.fail('Bu programdan kullanıcı çıkarma yetkiniz yok');
        }
      }

      // 5. Check if assigned
      const isAssignedResult = await this.userRepository.isProgramAssigned(
        request.userId,
        request.programId
      );
      if (isAssignedResult.isFailure) {
        return Result.fail(isAssignedResult.error || 'Kontrol yapılamadı');
      }

      if (!isAssignedResult.value) {
        return Result.fail('Bu kullanıcı programa atanmamış');
      }

      // 6. Remove user from program
      const removeResult = await this.userRepository.removeProgram(
        request.userId,
        request.programId
      );

      if (removeResult.isFailure) {
        return Result.fail(removeResult.error || 'Program ataması kaldırılamadı');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program ataması kaldırılamadı');
    }
  }
}

