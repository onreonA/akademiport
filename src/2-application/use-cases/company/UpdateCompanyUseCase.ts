/**
 * Update Company Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { Company } from '@/domain/entities/Company';
import { UserRole } from '@/domain/enums/UserRole';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import type { UpdateCompanyDto } from '@/application/dto/company';

export class UpdateCompanyUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(
    companyId: string,
    dto: UpdateCompanyDto,
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
      // MASTER_ADMIN can update any company
    } else if (userRole === UserRole.PROGRAM_MANAGER) {
      // PROGRAM_MANAGER can only update companies in their program
      // TODO: Check if user is manager of company's program
    } else if (userRole === UserRole.COMPANY_ADMIN) {
      // COMPANY_ADMIN can only update their own company
      if (userCompanyId !== companyId) {
        return Result.fail('Sadece kendi firmanızı güncelleyebilirsiniz');
      }
    } else {
      return Result.fail('Bu işlem için yetkiniz yok');
    }

    // Update company
    return await this.companyRepository.update(companyId, dto);
  }
}

