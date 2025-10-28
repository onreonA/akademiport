/**
 * List Users Use Case
 *
 * Business logic for listing users with filters and pagination
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/enums/UserRole';
import { UserFilterDto } from '@/application/dto/user';

interface ListUsersRequest extends UserFilterDto {
  userId: string; // ID of the user making the request
  userRole: UserRole; // Role of the user making the request
}

interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: ListUsersRequest): Promise<Result<ListUsersResponse>> {
    try {
      // 1. Authorization: MASTER_ADMIN and PROGRAM_MANAGER can list users
      if (
        request.userRole !== UserRole.MASTER_ADMIN &&
        request.userRole !== UserRole.PROGRAM_MANAGER
      ) {
        return Result.fail('Bu işlem için yetkiniz yok');
      }

      // 2. PROGRAM_MANAGER can only see users below their level
      // This is handled by filtering in the repository

      // 3. Build filters
      const filters: UserFilterDto = {
        role: request.role,
        companyId: request.companyId,
        programId: request.programId,
        isActive: request.isActive,
        search: request.search,
        page: request.page,
        limit: request.limit,
        sortBy: request.sortBy,
        sortOrder: request.sortOrder,
      };

      // 4. Get users with filters
      const result = await this.userRepository.findWithFilters(filters);
      if (result.isFailure) {
        return Result.fail(result.error || 'Kullanıcılar alınamadı');
      }

      return Result.ok(result.value!);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcılar alınamadı');
    }
  }
}

