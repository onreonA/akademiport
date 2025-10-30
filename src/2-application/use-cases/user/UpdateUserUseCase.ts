/**
 * Update User Use Case
 *
 * Business logic for updating an existing user
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/enums/UserRole';
import { UpdateUserDto } from '@/application/dto/user';

interface UpdateUserRequest extends UpdateUserDto {
  id: string;
  userId: string; // ID of the user making the request
  userRole: UserRole; // Role of the user making the request
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: UpdateUserRequest): Promise<Result<User>> {
    try {
      // 1. Check if user exists
      const userResult = await this.userRepository.findById(request.id);
      if (userResult.isFailure) {
        return Result.fail(userResult.error || 'Kullanıcı bulunamadı');
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      const user = userResult.value;

      // 2. Authorization: MASTER_ADMIN can update anyone
      // PROGRAM_MANAGER can update users below their level
      // Users can update themselves (limited fields)
      const isSelf = request.userId === request.id;
      const isMasterAdmin = request.userRole === UserRole.MASTER_ADMIN;
      const isProgramManager = request.userRole === UserRole.PROGRAM_MANAGER;

      if (!isMasterAdmin && !isProgramManager && !isSelf) {
        return Result.fail('Bu işlem için yetkiniz yok');
      }

      // 3. Self-update restrictions: Cannot change role, isActive, companyId
      if (isSelf && !isMasterAdmin) {
        if (request.role !== undefined || request.isActive !== undefined) {
          return Result.fail('Kendi rolünüzü veya aktiflik durumunuzu değiştiremezsiniz');
        }
      }

      // 4. PROGRAM_MANAGER restrictions: Cannot update MASTER_ADMIN or PROGRAM_MANAGER
      if (isProgramManager && !isMasterAdmin) {
        if (user.role === UserRole.MASTER_ADMIN || user.role === UserRole.PROGRAM_MANAGER) {
          return Result.fail('Program Manager bu kullanıcıyı güncelleyemez');
        }

        // Cannot assign MASTER_ADMIN or PROGRAM_MANAGER role
        if (request.role === UserRole.MASTER_ADMIN || request.role === UserRole.PROGRAM_MANAGER) {
          return Result.fail('Program Manager bu rolleri atayamaz');
        }
      }

      // 5. Validation: Full name length
      if (request.fullName !== undefined) {
        if (request.fullName.length < 2 || request.fullName.length > 100) {
          return Result.fail('Ad Soyad 2-100 karakter arasında olmalıdır');
        }
      }

      // 6. Validation: Bio length
      if (request.bio !== undefined && request.bio.length > 500) {
        return Result.fail('Biyografi en fazla 500 karakter olabilir');
      }

      // 7. Validation: Expertise areas max 10
      if (request.expertiseAreas !== undefined && request.expertiseAreas.length > 10) {
        return Result.fail('En fazla 10 uzmanlık alanı eklenebilir');
      }

      // 8. Update user
      const updateResult = await this.userRepository.update(request.id, {
        fullName: request.fullName,
        phone: request.phone,
        avatarUrl: request.avatarUrl,
        role: request.role,
        companyId: request.companyId,
        isActive: request.isActive,
        bio: request.bio,
        expertiseAreas: request.expertiseAreas,
        socialLinks: request.socialLinks,
        settings: request.settings,
        updatedBy: request.userId,
      });

      if (updateResult.isFailure) {
        return Result.fail(updateResult.error || 'Kullanıcı güncellenemedi');
      }

      return Result.ok(updateResult.value!);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı güncellenemedi');
    }
  }
}
