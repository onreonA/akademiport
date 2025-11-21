/**
 * Delete User Use Case
 *
 * Business logic for deleting (hard delete) a user
 * Deletes from both Supabase Auth and public.users table
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
        const errorMsg =
          userResult.error instanceof Error
            ? userResult.error.message
            : typeof userResult.error === 'string'
              ? userResult.error
              : 'Bilinmeyen hata';
        return Result.fail(`Kullanıcı bulunamadı: ${errorMsg}`);
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı. Kullanıcı ID geçersiz veya silinmiş olabilir.');
      }

      // 3. Cannot delete self
      if (request.userId === request.id) {
        return Result.fail(
          'Kendi hesabınızı silemezsiniz. Başka bir admin hesabından silme işlemini gerçekleştirin.'
        );
      }

      // 4. Hard delete user (deletes from Supabase Auth and public.users)
      const deleteResult = await this.userRepository.delete(request.id);
      if (deleteResult.isFailure) {
        const errorMsg =
          deleteResult.error instanceof Error
            ? deleteResult.error.message
            : typeof deleteResult.error === 'string'
              ? deleteResult.error
              : 'Bilinmeyen hata';
        return Result.fail(`Kullanıcı silinemedi: ${errorMsg}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı silinemedi');
    }
  }
}
