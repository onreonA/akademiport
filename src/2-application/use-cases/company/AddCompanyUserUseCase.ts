/**
 * Add Company User Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { UserRole } from '@/domain/enums/UserRole';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';

export class AddCompanyUserUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(
    companyId: string,
    targetUserId: string,
    userId: string,
    userRole: UserRole,
    userCompanyId?: string
  ): Promise<Result<void>> {
    // Get company
    const companyResult = await this.companyRepository.findById(companyId);
    if (companyResult.isFailure) {
      return Result.fail(companyResult.error!);
    }

    const company = companyResult.value;
    if (!company) {
      return Result.fail('Firma bulunamadı');
    }

    // Authorization
    if (userRole === UserRole.MASTER_ADMIN) {
      // MASTER_ADMIN can add users to any company
    } else if (userRole === UserRole.PROGRAM_MANAGER) {
      // PROGRAM_MANAGER can add users to companies in their program
      // TODO: Check if user is manager of company's program
    } else if (userRole === UserRole.COMPANY_ADMIN) {
      // COMPANY_ADMIN can only add users to their own company
      if (userCompanyId !== companyId) {
        return Result.fail('Sadece kendi firmanıza kullanıcı ekleyebilirsiniz');
      }
    } else {
      return Result.fail('Bu işlem için yetkiniz yok');
    }

    // Business rule: Check max users limit
    if (company.currentUsers >= company.maxUsers) {
      return Result.fail(`Maksimum kullanıcı sayısına ulaşıldı (${company.maxUsers})`);
    }

    // Add user to company
    return await this.companyRepository.addCompanyUser(companyId, targetUserId);
  }
}

