/**
 * List Companies Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { Company } from '@/domain/entities/Company';
import { UserRole } from '@/domain/enums/UserRole';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import type { CompanyFilterDto } from '@/application/dto/company';

export class ListCompaniesUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(
    filter: CompanyFilterDto,
    userId: string,
    userRole: UserRole,
    userCompanyId?: string
  ): Promise<Result<{ companies: Company[]; total: number }>> {
    // Authorization
    if (userRole === UserRole.MASTER_ADMIN) {
      // MASTER_ADMIN can list all companies
      return await this.companyRepository.findWithFilters(filter);
    } else if (userRole === UserRole.PROGRAM_MANAGER) {
      // PROGRAM_MANAGER can list companies in their program
      // TODO: Get user's program and filter by programId
      return await this.companyRepository.findWithFilters(filter);
    } else if (userRole === UserRole.CONSULTANT) {
      // CONSULTANT can list companies in programs they're assigned to
      // TODO: Get user's assigned programs and filter
      return await this.companyRepository.findWithFilters(filter);
    } else if (userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.COMPANY_USER) {
      // Company users can only see their own company
      if (!userCompanyId) {
        return Result.fail('Firma bilgisi bulunamadı');
      }

      const companyResult = await this.companyRepository.findById(userCompanyId);
      if (companyResult.isFailure) {
        return Result.fail(companyResult.error!);
      }

      const company = companyResult.value;
      if (!company) {
        return Result.fail('Firma bulunamadı');
      }

      return Result.ok({
        companies: [company],
        total: 1,
      });
    } else {
      return Result.fail('Bu işlem için yetkiniz yok');
    }
  }
}
