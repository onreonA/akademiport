/**
 * Manage Consultants Use Case
 *
 * Business logic for adding/removing consultants to/from a program
 */

import { Result } from '@/core/result/Result';
import { User } from '@/3-domain/entities/User';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { UserRole } from '@/3-domain/enums/UserRole';

export interface AddConsultantInput {
  programId: string;
  consultantId: string;
  userId: string;
  userRole: UserRole;
}

export interface RemoveConsultantInput {
  programId: string;
  consultantId: string;
  userId: string;
  userRole: UserRole;
}

export interface GetConsultantsInput {
  programId: string;
  skipProgramCheck?: boolean; // Skip program existence check (for company users where authorization is done at API level)
}

export class ManageConsultantsUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  /**
   * Add a consultant to a program
   */
  async addConsultant(input: AddConsultantInput): Promise<Result<void>> {
    try {
      // 1. Authorization: MASTER_ADMIN or PROGRAM_MANAGER
      const canManage = await this.canUserManageProgram(
        input.userId,
        input.userRole,
        input.programId
      );

      if (!canManage) {
        return Result.fail('Bu programa danışman ekleme yetkiniz yok');
      }

      // 2. Validation: Required fields
      if (!input.programId || input.programId.trim().length === 0) {
        return Result.fail('Program ID zorunludur');
      }

      if (!input.consultantId || input.consultantId.trim().length === 0) {
        return Result.fail('Danışman ID zorunludur');
      }

      // 3. Check if program exists
      const programResult = await this.programRepository.findById(input.programId);

      if (programResult.isFailure || !programResult.value) {
        return Result.fail('Program bulunamadı');
      }

      // 4. TODO: Check if consultant user exists and has CONSULTANT role
      // This will be implemented when we have UserRepository (Sprint 5)

      // 5. Add consultant to program (user_programs table)
      const addResult = await this.programRepository.addConsultant(
        input.programId,
        input.consultantId
      );

      if (addResult.isFailure) {
        return Result.fail(addResult.error || 'Danışman eklenemedi');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Danışman eklenirken bir hata oluştu'
      );
    }
  }

  /**
   * Remove a consultant from a program
   */
  async removeConsultant(input: RemoveConsultantInput): Promise<Result<void>> {
    try {
      // 1. Authorization: MASTER_ADMIN or PROGRAM_MANAGER
      const canManage = await this.canUserManageProgram(
        input.userId,
        input.userRole,
        input.programId
      );

      if (!canManage) {
        return Result.fail('Bu programdan danışman çıkarma yetkiniz yok');
      }

      // 2. Validation: Required fields
      if (!input.programId || input.programId.trim().length === 0) {
        return Result.fail('Program ID zorunludur');
      }

      if (!input.consultantId || input.consultantId.trim().length === 0) {
        return Result.fail('Danışman ID zorunludur');
      }

      // 3. Check if program exists
      const programResult = await this.programRepository.findById(input.programId);

      if (programResult.isFailure || !programResult.value) {
        return Result.fail('Program bulunamadı');
      }

      // 4. Remove consultant from program (user_programs table)
      const removeResult = await this.programRepository.removeConsultant(
        input.programId,
        input.consultantId
      );

      if (removeResult.isFailure) {
        return Result.fail(removeResult.error || 'Danışman çıkarılamadı');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Danışman çıkarılırken bir hata oluştu'
      );
    }
  }

  /**
   * Get all consultants for a program
   *
   * Note: Program existence check is skipped for company users as they are already
   * authorized at the API level. This avoids RLS policy issues.
   */
  async getConsultants(input: GetConsultantsInput): Promise<Result<User[]>> {
    try {
      // 1. Validation: Required fields
      if (!input.programId || input.programId.trim().length === 0) {
        return Result.fail('Program ID zorunludur');
      }

      // 2. Skip program existence check for company users (authorization done at API level)
      // For other roles, check if program exists
      if (!input.skipProgramCheck) {
        const programResult = await this.programRepository.findById(input.programId);

        if (programResult.isFailure || !programResult.value) {
          return Result.fail('Program bulunamadı');
        }
      }

      // 3. Get consultants from program (user_programs JOIN users)
      // This uses admin client internally, so it works for all roles
      const consultantsResult = await this.programRepository.getConsultants(input.programId);

      if (consultantsResult.isFailure) {
        return Result.fail(consultantsResult.error || 'Danışmanlar alınamadı');
      }

      return Result.ok(consultantsResult.value || []);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Danışmanlar getirilirken bir hata oluştu'
      );
    }
  }

  /**
   * Check if user can manage program (add/remove consultants)
   */
  private async canUserManageProgram(
    userId: string,
    userRole: UserRole,
    programId: string
  ): Promise<boolean> {
    // MASTER_ADMIN can manage any program
    if (userRole === UserRole.MASTER_ADMIN) {
      return true;
    }

    // PROGRAM_MANAGER can manage only their own program
    if (userRole === UserRole.PROGRAM_MANAGER) {
      const programResult = await this.programRepository.findById(programId);

      if (programResult.isSuccess && programResult.value) {
        return programResult.value.programManagerId === userId;
      }
    }

    return false;
  }
}
