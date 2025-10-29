/**
 * Remove Company User Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { UserRole } from '@/domain/enums/UserRole';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';

export class RemoveCompanyUserUseCase {
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
      // MASTER_ADMIN can remove users from any company
    } else if (userRole === UserRole.PROGRAM_MANAGER) {
      // PROGRAM_MANAGER can remove users from companies in their program
      // TODO: Check if user is manager of company's program
    } else if (userRole === UserRole.COMPANY_ADMIN) {
      // COMPANY_ADMIN can only remove users from their own company
      if (userCompanyId !== companyId) {
        return Result.fail('Sadece kendi firmanızdan kullanıcı çıkarabilirsiniz');
      }

      // COMPANY_ADMIN cannot remove themselves
      if (targetUserId === userId) {
        return Result.fail('Kendinizi çıkaramazsınız');
      }
    } else {
      return Result.fail('Bu işlem için yetkiniz yok');
    }

    // Remove user from company
    return await this.companyRepository.removeCompanyUser(companyId, targetUserId);
  }
}
