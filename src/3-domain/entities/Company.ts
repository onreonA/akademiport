/**
 * Company Entity
 */

export interface Company {
  id: string;
  programId: string;
  name: string;
  legalName?: string;
  taxNumber?: string;
  tradeRegistryNumber?: string;
  slug: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country: string;
  sector?: string;
  subSector?: string;
  employeeCount?: number;
  foundationYear?: number;
  logoUrl?: string;
  isActive: boolean;
  maxUsers: number;
  currentUsers: number;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCompanyDto {
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

export interface UpdateCompanyDto {
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
