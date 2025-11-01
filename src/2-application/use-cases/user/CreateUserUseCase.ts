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
      // 1. Authorization: MASTER_ADMIN, PROGRAM_MANAGER, and CONSULTANT can create users
      if (
        request.userRole !== UserRole.MASTER_ADMIN &&
        request.userRole !== UserRole.PROGRAM_MANAGER &&
        request.userRole !== UserRole.CONSULTANT
      ) {
        return Result.fail('Bu işlem için yetkiniz yok');
      }

      // 2. PROGRAM_MANAGER cannot create MASTER_ADMIN or PROGRAM_MANAGER
      if (request.userRole === UserRole.PROGRAM_MANAGER) {
        if (request.role === UserRole.MASTER_ADMIN || request.role === UserRole.PROGRAM_MANAGER) {
          return Result.fail('Program Manager bu role kullanıcı oluşturamaz');
        }
      }

      // 3. CONSULTANT can only create COMPANY_USER or COMPANY_ADMIN
      if (request.userRole === UserRole.CONSULTANT) {
        if (request.role !== UserRole.COMPANY_USER && request.role !== UserRole.COMPANY_ADMIN) {
          return Result.fail('Danışman sadece firma kullanıcıları oluşturabilir');
        }
        // TODO: Check if company is in consultant's program
      }

      // 4. Validation: Email is required
      if (!request.email || !request.email.trim()) {
        return Result.fail('Email zorunludur');
      }

      // 5. Validation: First name and last name are required
      if (!request.firstName || !request.firstName.trim()) {
        return Result.fail('Ad zorunludur');
      }

      if (!request.lastName || !request.lastName.trim()) {
        return Result.fail('Soyad zorunludur');
      }

      // 5. Validation: Name length
      if (request.firstName.length < 2 || request.firstName.length > 100) {
        return Result.fail('Ad 2-100 karakter arasında olmalıdır');
      }

      if (request.lastName.length < 2 || request.lastName.length > 100) {
        return Result.fail('Soyad 2-100 karakter arasında olmalıdır');
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
        firstName: request.firstName,
        lastName: request.lastName,
        fullName: `${request.firstName} ${request.lastName}`,
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
