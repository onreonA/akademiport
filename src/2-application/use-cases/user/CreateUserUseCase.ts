/**
 * Create User Use Case
 *
 * Business logic for creating a new user
 */

import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/enums/UserRole';
import { CreateUserDto } from '@/application/dto/user';

interface CreateUserRequest extends CreateUserDto {
  userRole: UserRole; // Role of the user making the request
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<Result<User>> {
    try {
      // 1. Authorization: Only MASTER_ADMIN and PROGRAM_MANAGER can create users
      if (
        request.userRole !== UserRole.MASTER_ADMIN &&
        request.userRole !== UserRole.PROGRAM_MANAGER
      ) {
        return Result.fail('Bu işlem için yetkiniz yok');
      }

      // 2. PROGRAM_MANAGER cannot create MASTER_ADMIN or PROGRAM_MANAGER
      if (request.userRole === UserRole.PROGRAM_MANAGER) {
        if (
          request.role === UserRole.MASTER_ADMIN ||
          request.role === UserRole.PROGRAM_MANAGER
        ) {
          return Result.fail('Program Manager bu role kullanıcı oluşturamaz');
        }
      }

      // 3. Validation: Email is required
      if (!request.email || !request.email.trim()) {
        return Result.fail('Email zorunludur');
      }

      // 4. Validation: Full name is required
      if (!request.fullName || !request.fullName.trim()) {
        return Result.fail('Ad Soyad zorunludur');
      }

      // 5. Validation: Full name length
      if (request.fullName.length < 2 || request.fullName.length > 100) {
        return Result.fail('Ad Soyad 2-100 karakter arasında olmalıdır');
      }

      // 6. Validation: Email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.email)) {
        return Result.fail('Geçersiz email formatı');
      }

      // 7. Validation: Email uniqueness
      const existingUserResult = await this.userRepository.findByEmail(request.email);
      if (existingUserResult.isFailure) {
        return Result.fail(existingUserResult.error || 'Email kontrolü yapılamadı');
      }

      if (existingUserResult.value) {
        return Result.fail('Bu email adresi zaten kullanılıyor');
      }

      // 8. Validation: Password is required (will be hashed by AuthService)
      if (!request.password || request.password.length < 8) {
        return Result.fail('Şifre en az 8 karakter olmalıdır');
      }

      // 9. Validation: Company is required for COMPANY_ADMIN and COMPANY_USER
      if (
        (request.role === UserRole.COMPANY_ADMIN || request.role === UserRole.COMPANY_USER) &&
        !request.companyId
      ) {
        return Result.fail('Firma kullanıcıları için firma seçimi zorunludur');
      }

      // 10. Create user (Note: Supabase Auth user creation should be done before this)
      const createResult = await this.userRepository.create({
        email: request.email,
        fullName: request.fullName,
        password: request.password,
        phone: request.phone,
        role: request.role || UserRole.COMPANY_USER,
        companyId: request.companyId,
        bio: request.bio,
        expertiseAreas: request.expertiseAreas,
        socialLinks: request.socialLinks,
        createdBy: request.createdBy,
      });

      if (createResult.isFailure) {
        return Result.fail(createResult.error || 'Kullanıcı oluşturulamadı');
      }

      return Result.ok(createResult.value!);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı oluşturulamadı');
    }
  }
}

