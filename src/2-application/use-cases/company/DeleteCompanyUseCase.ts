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
      const errorMsg =
        companyResult.error instanceof Error
          ? companyResult.error.message
          : typeof companyResult.error === 'string'
            ? companyResult.error
            : 'Bilinmeyen hata';
      return Result.fail(`Firma bulunamadı: ${errorMsg}`);
    }

    const company = companyResult.value;
    if (!company) {
      return Result.fail('Firma bulunamadı. Firma ID geçersiz veya silinmiş olabilir.');
    }

    // Business rule: Cannot delete company with active users
    if (company.currentUsers > 0) {
      return Result.fail(
        `Bu firma silinemez. ${company.currentUsers} aktif kullanıcı bulunmaktadır. Önce kullanıcıları çıkarın veya pasif hale getirin.`
      );
    }

    // Delete company
    const deleteResult = await this.companyRepository.delete(companyId);

    if (deleteResult.isFailure) {
      const errorMsg =
        deleteResult.error instanceof Error
          ? deleteResult.error.message
          : typeof deleteResult.error === 'string'
            ? deleteResult.error
            : 'Bilinmeyen hata';
      return Result.fail(`Firma silinemedi: ${errorMsg}`);
    }

    return deleteResult;
  }
}
