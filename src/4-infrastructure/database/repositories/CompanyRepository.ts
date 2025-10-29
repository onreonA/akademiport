/**
 * Company Repository Implementation
 * Sprint 6: Updated with new DTOs and methods
 */

import { createClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/core/result/Result';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import { Company } from '@/domain/entities/Company';
import { User, UserRole } from '@/domain/entities/User';
import type {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyFilterDto,
} from '@/application/dto/company';

export class CompanyRepository implements ICompanyRepository {
  async findById(id: string): Promise<Result<Company | null>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firma bulunamadı');
    }
  }

  async findAll(): Promise<Result<Company[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firmalar alınamadı');
    }
  }

  async findByProgramId(programId: string): Promise<Result<Company[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firmalar alınamadı');
    }
  }

  async findByCity(city: string): Promise<Result<Company[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('city', city)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firmalar alınamadı');
    }
  }

  async create(dto: CreateCompanyDto): Promise<Result<Company>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('companies')
        .insert({
          program_id: dto.programId,
          name: dto.name,
          legal_name: dto.legalName,
          tax_number: dto.taxNumber,
          trade_registry_number: dto.tradeRegistryNumber,
          slug: dto.slug,
          email: dto.email,
          phone: dto.phone,
          website: dto.website,
          address: dto.address,
          city: dto.city,
          district: dto.district,
          postal_code: dto.postalCode,
          country: dto.country || 'Türkiye',
          sector: dto.sector,
          sub_sector: dto.subSector,
          employee_count: dto.employeeCount,
          foundation_year: dto.foundationYear,
          max_users: dto.maxUsers || 2,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firma oluşturulamadı');
    }
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Result<Company>> {
    try {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.legalName !== undefined) updateData.legal_name = dto.legalName;
      if (dto.taxNumber !== undefined) updateData.tax_number = dto.taxNumber;
      if (dto.tradeRegistryNumber !== undefined)
        updateData.trade_registry_number = dto.tradeRegistryNumber;
      if (dto.email !== undefined) updateData.email = dto.email;
      if (dto.phone !== undefined) updateData.phone = dto.phone;
      if (dto.website !== undefined) updateData.website = dto.website;
      if (dto.address !== undefined) updateData.address = dto.address;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.district !== undefined) updateData.district = dto.district;
      if (dto.postalCode !== undefined) updateData.postal_code = dto.postalCode;
      if (dto.sector !== undefined) updateData.sector = dto.sector;
      if (dto.subSector !== undefined) updateData.sub_sector = dto.subSector;
      if (dto.employeeCount !== undefined) updateData.employee_count = dto.employeeCount;
      if (dto.foundationYear !== undefined) updateData.foundation_year = dto.foundationYear;
      if (dto.logoUrl !== undefined) updateData.logo_url = dto.logoUrl;
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
      if (dto.maxUsers !== undefined) updateData.max_users = dto.maxUsers;
      if (dto.settings !== undefined) updateData.settings = dto.settings;

      const { data, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firma güncellenemedi');
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from('companies').delete().eq('id', id);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firma silinemedi');
    }
  }

  // New methods - Sprint 6
  async search(query: string): Promise<Result<Company[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .or(
          `name.ilike.%${query}%,legal_name.ilike.%${query}%,city.ilike.%${query}%,sector.ilike.%${query}%`
        )
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Arama yapılamadı');
    }
  }

  async findWithFilters(
    filter: CompanyFilterDto
  ): Promise<Result<{ companies: Company[]; total: number }>> {
    try {
      const supabase = await createClient();

      // Build query
      let query = supabase.from('companies').select('*', { count: 'exact' });

      // Apply filters
      if (filter.search) {
        query = query.or(
          `name.ilike.%${filter.search}%,legal_name.ilike.%${filter.search}%,city.ilike.%${filter.search}%`
        );
      }

      if (filter.programId) {
        query = query.eq('program_id', filter.programId);
      }

      if (filter.city) {
        query = query.eq('city', filter.city);
      }

      if (filter.sector) {
        query = query.eq('sector', filter.sector);
      }

      if (filter.isActive !== undefined) {
        query = query.eq('is_active', filter.isActive);
      }

      // Apply sorting
      const sortColumn =
        filter.sortBy === 'createdAt'
          ? 'created_at'
          : filter.sortBy === 'updatedAt'
            ? 'updated_at'
            : filter.sortBy === 'employeeCount'
              ? 'employee_count'
              : filter.sortBy;
      query = query.order(sortColumn, { ascending: filter.sortOrder === 'asc' });

      // Apply pagination
      const from = (filter.page - 1) * filter.limit;
      const to = from + filter.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok({
        companies: data.map((item) => this.mapToEntity(item)),
        total: count || 0,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firmalar alınamadı');
    }
  }

  async getCompanyUsers(companyId: string): Promise<Result<User[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToUserEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Firma kullanıcıları alınamadı');
    }
  }

  async addCompanyUser(companyId: string, userId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      // Check if company exists
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        return Result.fail('Firma bulunamadı');
      }

      // Check max users limit
      if (company.current_users >= company.max_users) {
        return Result.fail('Maksimum kullanıcı sayısına ulaşıldı');
      }

      // Update user's company_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: companyId })
        .eq('id', userId);

      if (updateError) {
        return Result.fail(updateError.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı eklenemedi');
    }
  }

  async removeCompanyUser(companyId: string, userId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      // Update user's company_id to null
      const { error } = await supabase
        .from('users')
        .update({ company_id: null })
        .eq('id', userId)
        .eq('company_id', companyId);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı çıkarılamadı');
    }
  }

  private mapToEntity(data: Record<string, unknown>): Company {
    return {
      id: data.id as string,
      programId: data.program_id as string,
      name: data.name as string,
      legalName: data.legal_name as string | undefined,
      taxNumber: data.tax_number as string | undefined,
      tradeRegistryNumber: data.trade_registry_number as string | undefined,
      slug: data.slug as string,
      email: data.email as string | undefined,
      phone: data.phone as string | undefined,
      website: data.website as string | undefined,
      address: data.address as string | undefined,
      city: data.city as string | undefined,
      district: data.district as string | undefined,
      postalCode: data.postal_code as string | undefined,
      country: data.country as string,
      sector: data.sector as string | undefined,
      subSector: data.sub_sector as string | undefined,
      employeeCount: data.employee_count as number | undefined,
      foundationYear: data.foundation_year as number | undefined,
      logoUrl: data.logo_url as string | undefined,
      isActive: data.is_active as boolean,
      maxUsers: data.max_users as number,
      currentUsers: data.current_users as number,
      settings: data.settings as Record<string, unknown> | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      createdBy: data.created_by as string | undefined,
      updatedBy: data.updated_by as string | undefined,
    };
  }

  private mapToUserEntity(data: Record<string, unknown>): User {
    return {
      id: data.id as string,
      email: data.email as string,
      fullName: data.full_name as string,
      role: data.role as UserRole,
      avatarUrl: data.avatar_url as string | undefined,
      companyId: data.company_id as string | undefined,
      isActive: data.is_active as boolean,
      isEmailVerified: data.is_email_verified as boolean,
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at as string) : undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
