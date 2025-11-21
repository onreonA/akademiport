/**
 * Delete Program Use Case
 *
 * Business logic for deleting a program
 */

import { Result } from '@/core/result/Result';
import { IProgramRepository } from '@/3-domain/interfaces/IProgramRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { UserRole } from '@/3-domain/enums/UserRole';

export interface DeleteProgramInput {
  id: string;
  userId: string;
  userRole: UserRole;
}

export class DeleteProgramUseCase {
  constructor(
    private readonly programRepository: IProgramRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly trainingRepository: ITrainingRepository
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
        const errorMsg =
          programResult.error instanceof Error
            ? programResult.error.message
            : typeof programResult.error === 'string'
              ? programResult.error
              : 'Program bulunamadı';
        return Result.fail(`Program bulunamadı: ${errorMsg}`);
      }

      if (!programResult.value) {
        return Result.fail('Program bulunamadı. Program ID geçersiz veya silinmiş olabilir.');
      }

      // 3. Business Rule: Check if program has active companies
      const companiesResult = await this.companyRepository.findByProgramId(input.id);

      if (companiesResult.isFailure) {
        const errorMsg =
          companiesResult.error instanceof Error
            ? companiesResult.error.message
            : typeof companiesResult.error === 'string'
              ? companiesResult.error
              : 'Bilinmeyen hata';
        return Result.fail(`Firma kontrolü yapılamadı: ${errorMsg}`);
      }

      const activeCompanies = companiesResult.value?.filter((company) => company.isActive) || [];

      if (activeCompanies.length > 0) {
        return Result.fail(
          `Bu program silinemez. ${activeCompanies.length} aktif firma bulunmaktadır. Önce firmaları pasif hale getirin.`
        );
      }

      // 4. Business Rule: Check if program has trainings
      try {
        const trainings = await this.trainingRepository.findByProgramId(input.id);
        if (trainings && trainings.length > 0) {
          return Result.fail(
            `Bu program silinemez. Programa bağlı ${trainings.length} eğitim bulunmaktadır. Önce eğitimleri silin veya başka bir programa taşıyın.`
          );
        }
      } catch (trainingError) {
        // If we can't check trainings, log but don't fail - let the database constraint handle it
        console.warn('Could not check trainings before program deletion:', trainingError);
      }

      // 5. Delete program
      const deleteResult = await this.programRepository.delete(input.id);

      if (deleteResult.isFailure) {
        let errorMsg =
          deleteResult.error instanceof Error
            ? deleteResult.error.message
            : typeof deleteResult.error === 'string'
              ? deleteResult.error
              : 'Bilinmeyen hata';

        // Check if error is related to trainings constraint
        if (errorMsg.includes('trainings_global_or_program') || errorMsg.includes('trainings')) {
          errorMsg =
            'Bu program silinemez. Programa bağlı eğitimler bulunmaktadır. Önce eğitimleri silin veya başka bir programa taşıyın.';
        }

        return Result.fail(`Program silinemedi: ${errorMsg}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Bilinmeyen hata';
      return Result.fail(`Program silinirken beklenmeyen bir hata oluştu: ${errorMessage}`);
    }
  }
}
