/**
 * Delete Program Use Case
 * 
 * Business logic for deleting a program
 */

import { Result } from '@/core/result/Result';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import { UserRole } from '@/domain/enums/UserRole';

export interface DeleteProgramInput {
  id: string;
  userId: string;
  userRole: UserRole;
}

export class DeleteProgramUseCase {
  constructor(
    private readonly programRepository: IProgramRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(input: DeleteProgramInput): Promise<Result<void>> {
    try {
      // 1. Authorization: Only MASTER_ADMIN can delete programs
      if (input.userRole !== UserRole.MASTER_ADMIN) {
        return Result.fail('Sadece Master Admin program silebilir');
      }

      // 2. Check if program exists
      const programResult = await this.programRepository.findById(input.id);

      if (programResult.isFailure) {
        return Result.fail(programResult.error || 'Program bulunamadı');
      }

      if (!programResult.value) {
        return Result.fail('Program bulunamadı');
      }

      // 3. Business Rule: Check if program has active companies
      const companiesResult = await this.companyRepository.findByProgramId(input.id);

      if (companiesResult.isFailure) {
        return Result.fail('Firma kontrolü yapılamadı');
      }

      const activeCompanies = companiesResult.value?.filter((company) => company.isActive) || [];

      if (activeCompanies.length > 0) {
        return Result.fail(
          `Bu program silinemez. ${activeCompanies.length} aktif firma bulunmaktadır. Önce firmaları pasif hale getirin.`
        );
      }

      // 4. Delete program
      const result = await this.programRepository.delete(input.id);

      if (result.isFailure) {
        return Result.fail(result.error || 'Program silinemedi');
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Program silinirken bir hata oluştu'
      );
    }
  }
}
