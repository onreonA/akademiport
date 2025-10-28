/**
 * Company Repository Interface
 * Sprint 6: Updated with new DTOs and methods
 */

import { Result } from '@/core/result/Result';
import { Company } from '../entities/Company';
import { User } from '../entities/User';
import type { CreateCompanyDto, UpdateCompanyDto, CompanyFilterDto } from '@/application/dto/company';

export interface ICompanyRepository {
  // Existing methods
  findById(id: string): Promise<Result<Company | null>>;
  findAll(): Promise<Result<Company[]>>;
  findByProgramId(programId: string): Promise<Result<Company[]>>;
  findByCity(city: string): Promise<Result<Company[]>>;
  create(dto: CreateCompanyDto): Promise<Result<Company>>;
  update(id: string, dto: UpdateCompanyDto): Promise<Result<Company>>;
  delete(id: string): Promise<Result<void>>;

  // New methods - Sprint 6
  search(query: string): Promise<Result<Company[]>>;
  findWithFilters(filter: CompanyFilterDto): Promise<Result<{ companies: Company[]; total: number }>>;
  getCompanyUsers(companyId: string): Promise<Result<User[]>>;
  addCompanyUser(companyId: string, userId: string): Promise<Result<void>>;
  removeCompanyUser(companyId: string, userId: string): Promise<Result<void>>;
}
