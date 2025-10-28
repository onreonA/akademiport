/**
 * Update Profile Use Case
 *
 * Business logic for updating user profile (self-service)
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { User } from '@/domain/entities/User';
import { UpdateProfileDto, validateSocialLinks } from '@/application/dto/user';

interface UpdateProfileRequest extends UpdateProfileDto {
  userId: string; // ID of the user making the request
}

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: UpdateProfileRequest): Promise<Result<User>> {
    try {
      // 1. Check if user exists
      const userResult = await this.userRepository.findById(request.userId);
      if (userResult.isFailure) {
        return Result.fail(userResult.error || 'Kullanıcı bulunamadı');
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      // 2. Validation: Full name length
      if (request.fullName !== undefined) {
        if (request.fullName.length < 2 || request.fullName.length > 100) {
          return Result.fail('Ad Soyad 2-100 karakter arasında olmalıdır');
        }
      }

      // 3. Validation: Bio length
      if (request.bio !== undefined && request.bio.length > 500) {
        return Result.fail('Biyografi en fazla 500 karakter olabilir');
      }

      // 4. Validation: Expertise areas max 10
      if (request.expertiseAreas !== undefined && request.expertiseAreas.length > 10) {
        return Result.fail('En fazla 10 uzmanlık alanı eklenebilir');
      }

      // 5. Validation: Social links
      if (request.socialLinks !== undefined) {
        const socialLinksResult = validateSocialLinks(request.socialLinks);
        if (!socialLinksResult.isValid) {
          return Result.fail(socialLinksResult.errors.join(', '));
        }
      }

      // 6. Update profile (only allowed fields)
      const updateResult = await this.userRepository.update(request.userId, {
        fullName: request.fullName,
        phone: request.phone,
        avatarUrl: request.avatarUrl,
        bio: request.bio,
        expertiseAreas: request.expertiseAreas,
        socialLinks: request.socialLinks,
        settings: request.settings,
        updatedBy: request.userId,
      });

      if (updateResult.isFailure) {
        return Result.fail(updateResult.error || 'Profil güncellenemedi');
      }

      return Result.ok(updateResult.value!);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Profil güncellenemedi');
    }
  }
}

