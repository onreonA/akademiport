/**
 * Get User Use Case
 *
 * Business logic for retrieving a single user
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/enums/UserRole';

interface GetUserRequest {
  id: string;
  userId: string; // ID of the user making the request
  userRole: UserRole; // Role of the user making the request
}

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: GetUserRequest): Promise<Result<User>> {
    try {
      // 1. Get user
      const userResult = await this.userRepository.findById(request.id);
      if (userResult.isFailure) {
        return Result.fail(userResult.error || 'Kullanıcı bulunamadı');
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      const user = userResult.value;

      // 2. Authorization: MASTER_ADMIN and PROGRAM_MANAGER can view anyone
      // Users can view themselves
      // Company admins can view their company users
      const isSelf = request.userId === request.id;
      const isMasterAdmin = request.userRole === UserRole.MASTER_ADMIN;
      const isProgramManager = request.userRole === UserRole.PROGRAM_MANAGER;

      if (isMasterAdmin || isProgramManager || isSelf) {
        return Result.ok(user);
      }

      // 3. Company admin can view their company users
      if (request.userRole === UserRole.COMPANY_ADMIN) {
        // Get requesting user to check company
        const requestingUserResult = await this.userRepository.findById(request.userId);
        if (requestingUserResult.isSuccess && requestingUserResult.value) {
          const requestingUser = requestingUserResult.value;
          if (requestingUser.companyId && requestingUser.companyId === user.companyId) {
            return Result.ok(user);
          }
        }
      }

      return Result.fail('Bu kullanıcıyı görüntüleme yetkiniz yok');
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı alınamadı');
    }
  }
}
