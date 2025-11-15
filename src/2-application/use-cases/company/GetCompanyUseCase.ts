/**
 * Get Company Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { Company } from '@/3-domain/entities/Company';
import { UserRole } from '@/3-domain/enums/UserRole';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';

export class GetCompanyUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(
    companyId: string,
    userId: string,
    userRole: UserRole,
    userCompanyId?: string
  ): Promise<Result<Company>> {
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
      // MASTER_ADMIN can view any company
    } else if (userRole === UserRole.PROGRAM_MANAGER) {
      // PROGRAM_MANAGER can view companies in their program
      // TODO: Check if user is manager of company's program
    } else if (userRole === UserRole.CONSULTANT) {
      // CONSULTANT can view companies they're assigned to
      // TODO: Check if user is assigned to this company's program
    } else if (userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.COMPANY_USER) {
      // Company users can only view their own company
      if (userCompanyId !== companyId) {
        return Result.fail('Sadece kendi firmanızı görüntüleyebilirsiniz');
      }
    } else {
      return Result.fail('Bu işlem için yetkiniz yok');
    }

    return Result.ok(company);
  }
}
