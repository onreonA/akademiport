/**
 * Create Company Use Case
 * Sprint 6: Company Management
 */

import { Result } from '@/core/result/Result';
import { Company } from '@/domain/entities/Company';
import { UserRole } from '@/domain/enums/UserRole';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import type { CreateCompanyDto } from '@/application/dto/company';
import { prepareCreateCompanyDto } from '@/application/dto/company';

export class CreateCompanyUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(dto: CreateCompanyDto, userId: string, userRole: UserRole): Promise<Result<Company>> {
    // Authorization: Only MASTER_ADMIN and PROGRAM_MANAGER can create companies
    if (userRole !== UserRole.MASTER_ADMIN && userRole !== UserRole.PROGRAM_MANAGER) {
      return Result.fail('Bu işlem için yetkiniz yok');
    }

    // Prepare DTO (auto-generate slug, set defaults)
    const preparedDto = prepareCreateCompanyDto(dto);

    // Create company
    return await this.companyRepository.create(preparedDto);
  }
}

