/**
 * Assign Role Use Case
 *
 * Business logic for assigning a role to a user
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { User } from '@/3-domain/entities/User';
import { UserRole } from '@/3-domain/enums/UserRole';
import { AssignRoleDto, canAssignRole } from '@/application/dto/user';

interface AssignRoleRequest extends AssignRoleDto {
  assignerRole: UserRole; // Role of the user making the request
}

export class AssignRoleUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: AssignRoleRequest): Promise<Result<User>> {
    try {
      // 1. Check if user exists
      const userResult = await this.userRepository.findById(request.userId);
      if (userResult.isFailure) {
        return Result.fail(userResult.error || 'Kullanıcı bulunamadı');
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      const user = userResult.value;

      // 2. Authorization: Check if role assignment is allowed
      const authResult = canAssignRole(request.assignerRole, user.role, request.newRole);
      if (!authResult.allowed) {
        return Result.fail(authResult.reason || 'Bu rol ataması yapılamaz');
      }

      // 3. Cannot assign role to self (except MASTER_ADMIN)
      if (request.assignedBy === request.userId && request.assignerRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Kendi rolünüzü değiştiremezsiniz');
      }

      // 4. Update user role
      const updateResult = await this.userRepository.update(request.userId, {
        role: request.newRole,
        updatedBy: request.assignedBy,
      });

      if (updateResult.isFailure) {
        return Result.fail(updateResult.error || 'Rol ataması yapılamadı');
      }

      // 5. Note: Role change should be logged for audit trail
      // This can be implemented in a future sprint

      return Result.ok(updateResult.value!);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Rol ataması yapılamadı');
    }
  }
}
