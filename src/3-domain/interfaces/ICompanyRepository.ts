/**
 * Company Repository Interface
 */

import { Result } from '@/core/result/Result';
import { Company } from '../entities/Company';

// TODO: Company DTOs will be created in Sprint 6
// For now, we'll define them inline
interface CreateCompanyDto {
  programId: string;
  name: string;
  legalName?: string;
  taxNumber?: string;
  tradeRegistryNumber?: string;
  slug?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  sector?: string;
  subSector?: string;
  employeeCount?: number;
  foundationYear?: number;
  maxUsers?: number;
}

interface UpdateCompanyDto {
  name?: string;
  legalName?: string;
  taxNumber?: string;
  tradeRegistryNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  sector?: string;
  subSector?: string;
  employeeCount?: number;
  foundationYear?: number;
  logoUrl?: string;
  isActive?: boolean;
  maxUsers?: number;
  settings?: Record<string, unknown>;
}

export interface ICompanyRepository {
  findById(id: string): Promise<Result<Company | null>>;
  findAll(): Promise<Result<Company[]>>;
  findByProgramId(programId: string): Promise<Result<Company[]>>;
  findByCity(city: string): Promise<Result<Company[]>>;
  create(dto: CreateCompanyDto): Promise<Result<Company>>;
  update(id: string, dto: UpdateCompanyDto): Promise<Result<Company>>;
  delete(id: string): Promise<Result<void>>;
}
