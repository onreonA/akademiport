/**
 * Assign Program Use Case
 *
 * Business logic for assigning a user to a program
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { UserRole } from '@/domain/enums/UserRole';
import { AssignProgramDto, determineProgramRole } from '@/application/dto/user';

interface AssignProgramRequest extends AssignProgramDto {
  assignerRole: UserRole; // Role of the user making the request
}

export class AssignProgramUseCase {
  constructor(
    private userRepository: IUserRepository,
    private programRepository: IProgramRepository
  ) {}

  async execute(request: AssignProgramRequest): Promise<Result<void>> {
    try {
      // 1. Authorization: Only MASTER_ADMIN and PROGRAM_MANAGER can assign programs
      if (
        request.assignerRole !== UserRole.MASTER_ADMIN &&
        request.assignerRole !== UserRole.PROGRAM_MANAGER
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

      const user = userResult.value;

      // 3. Check if program exists
      const programResult = await this.programRepository.findById(request.programId);
      if (programResult.isFailure) {
        return Result.fail(programResult.error || 'Program bulunamadı');
      }

      if (!programResult.value) {
        return Result.fail('Program bulunamadı');
      }

      // 4. PROGRAM_MANAGER can only assign to their own programs
      if (request.assignerRole === UserRole.PROGRAM_MANAGER) {
        const program = programResult.value;
        if (program.programManagerId !== request.assignedBy) {
          return Result.fail('Bu programa kullanıcı atama yetkiniz yok');
        }
      }

      // 5. Check if already assigned
      const isAssignedResult = await this.userRepository.isProgramAssigned(
        request.userId,
        request.programId
      );
      if (isAssignedResult.isFailure) {
        return Result.fail(isAssignedResult.error || 'Kontrol yapılamadı');
      }

      if (isAssignedResult.value) {
        return Result.fail('Bu kullanıcı zaten programa atanmış');
      }

      // 6. Determine program role if not provided
      const roleInProgram = request.roleInProgram || determineProgramRole(user.role);

      // 7. Assign user to program
      const assignResult = await this.userRepository.assignProgram(
        request.userId,
        request.programId,
        roleInProgram
      );

      if (assignResult.isFailure) {
        return Result.fail(assignResult.error || 'Program ataması yapılamadı');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program ataması yapılamadı');
    }
  }
}
