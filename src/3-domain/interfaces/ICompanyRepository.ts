/**
 * Company Repository Interface
 */

import { Result } from '@/core/result/Result';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '../entities/Company';

export interface ICompanyRepository {
  findById(id: string): Promise<Result<Company | null>>;
  findAll(): Promise<Result<Company[]>>;
  findByProgramId(programId: string): Promise<Result<Company[]>>;
  findByCity(city: string): Promise<Result<Company[]>>;
  create(dto: CreateCompanyDto): Promise<Result<Company>>;
  update(id: string, dto: UpdateCompanyDto): Promise<Result<Company>>;
  delete(id: string): Promise<Result<void>>;
}
