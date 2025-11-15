/**
 * Delete User Use Case
 *
 * Business logic for deleting (soft delete) a user
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { UserRole } from '@/3-domain/enums/UserRole';

interface DeleteUserRequest {
  id: string;
  userId: string; // ID of the user making the request
  userRole: UserRole; // Role of the user making the request
}

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: DeleteUserRequest): Promise<Result<void>> {
    try {
      // 1. Authorization: Only MASTER_ADMIN can delete users
      if (request.userRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Bu işlem için yetkiniz yok');
      }

      // 2. Check if user exists
      const userResult = await this.userRepository.findById(request.id);
      if (userResult.isFailure) {
        return Result.fail(userResult.error || 'Kullanıcı bulunamadı');
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      // 3. Cannot delete self
      if (request.userId === request.id) {
        return Result.fail('Kendi hesabınızı silemezsiniz');
      }

      // 4. Soft delete user
      const deleteResult = await this.userRepository.delete(request.id);
      if (deleteResult.isFailure) {
        return Result.fail(deleteResult.error || 'Kullanıcı silinemedi');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı silinemedi');
    }
  }
}
