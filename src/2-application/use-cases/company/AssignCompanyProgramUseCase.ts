/**
 * Assign Company Program Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { Company } from '@/domain/entities/Company';
import { UserRole } from '@/domain/enums/UserRole';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';

export class AssignCompanyProgramUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(
    companyId: string,
    programId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Company>> {
    // Authorization: Only MASTER_ADMIN can assign programs
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

    // TODO: Check if program exists

    // Update company's program
    return await this.companyRepository.update(companyId, { programId } as any);
  }
}
