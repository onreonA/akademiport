/**
 * Delete Company Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { UserRole } from '@/3-domain/enums/UserRole';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';

export class DeleteCompanyUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(companyId: string, userId: string, userRole: UserRole): Promise<Result<void>> {
    // Authorization: Only MASTER_ADMIN can delete companies
    if (userRole !== UserRole.MASTER_ADMIN) {
      return Result.fail('Bu işlem için yetkiniz yok');
    }

    // Get company
    const companyResult = await this.companyRepository.findById(companyId);
    if (companyResult.isFailure) {
      return Result.fail(companyResult.error!);
    }

    const company = companyResult.value;
    if (!company) {
      return Result.fail('Firma bulunamadı');
    }

    // Business rule: Cannot delete company with active users
    if (company.currentUsers > 0) {
      return Result.fail('Aktif kullanıcısı olan firma silinemez');
    }

    // Delete company
    return await this.companyRepository.delete(companyId);
  }
}
