/**
 * Change Password Use Case
 *
 * Business logic for changing user password
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { ChangePasswordDto, validatePasswordStrength } from '@/application/dto/user';

interface ChangePasswordRequest extends ChangePasswordDto {
  userId: string; // ID of the user making the request
}

export class ChangePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: ChangePasswordRequest): Promise<Result<void>> {
    try {
      // 1. Validation: All fields required
      if (!request.oldPassword || !request.newPassword || !request.confirmPassword) {
        return Result.fail('Tüm alanlar zorunludur');
      }

      // 2. Validation: New password and confirm password must match
      if (request.newPassword !== request.confirmPassword) {
        return Result.fail('Yeni şifreler eşleşmiyor');
      }

      // 3. Validation: New password must be different from old password
      if (request.oldPassword === request.newPassword) {
        return Result.fail('Yeni şifre eski şifre ile aynı olamaz');
      }

      // 4. Validation: Password strength
      const strengthResult = validatePasswordStrength(request.newPassword);
      if (!strengthResult.isValid) {
        return Result.fail(strengthResult.errors.join(', '));
      }

      // 5. Check if user exists
      const userResult = await this.userRepository.findById(request.userId);
      if (userResult.isFailure) {
        return Result.fail(userResult.error || 'Kullanıcı bulunamadı');
      }

      if (!userResult.value) {
        return Result.fail('Kullanıcı bulunamadı');
      }

      // 6. Note: Password verification and update should be done through AuthService
      // which uses Supabase Auth. This use case validates the request.
      // The actual password change will be handled by the API route calling AuthService.

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Şifre değiştirilemedi');
    }
  }
}

