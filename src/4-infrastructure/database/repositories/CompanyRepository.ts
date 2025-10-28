/**
 * Company Repository Implementation
 */

import { createClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/core/result/Result';
import { ICompanyRepository } from '@/domain/interfaces/ICompanyRepository';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '@/domain/entities/Company';

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
}
