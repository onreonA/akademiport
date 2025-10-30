/**
 * Program Repository Implementation
 */

import { createClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/core/result/Result';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { Program } from '@/domain/entities/Program';
import { CreateProgramDto, UpdateProgramDto } from '@/application/dto/program';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';

export class ProgramRepository implements IProgramRepository {
  async findById(id: string): Promise<Result<Program | null>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.from('programs').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program bulunamadı');
    }
  }

  async findAll(): Promise<Result<Program[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Programlar alınamadı');
    }
  }

  async findByStatus(status: string): Promise<Result<Program[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Programlar alınamadı');
    }
  }

  async findByCity(city: string): Promise<Result<Program[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('city', city)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Programlar alınamadı');
    }
  }

  async create(dto: CreateProgramDto): Promise<Result<Program>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('programs')
        .insert({
          name: dto.name,
          description: dto.description,
          slug: dto.slug,
          city: dto.city,
          region: dto.region,
          program_type: dto.programType,
          start_date: dto.startDate.toISOString(),
          end_date: dto.endDate.toISOString(),
          duration_months: dto.durationMonths,
          max_companies: dto.maxCompanies || 20,
          sponsor: dto.sponsor,
          budget: dto.budget,
          program_manager_id: dto.programManagerId,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program oluşturulamadı');
    }
  }

  async update(id: string, dto: UpdateProgramDto): Promise<Result<Program>> {
    try {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.region !== undefined) updateData.region = dto.region;
      if (dto.programType !== undefined) updateData.program_type = dto.programType;
      if (dto.startDate !== undefined) updateData.start_date = dto.startDate.toISOString();
      if (dto.endDate !== undefined) updateData.end_date = dto.endDate.toISOString();
      if (dto.durationMonths !== undefined) updateData.duration_months = dto.durationMonths;
      if (dto.maxCompanies !== undefined) updateData.max_companies = dto.maxCompanies;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.sponsor !== undefined) updateData.sponsor = dto.sponsor;
      if (dto.budget !== undefined) updateData.budget = dto.budget;
      if (dto.programManagerId !== undefined) updateData.program_manager_id = dto.programManagerId;
      if (dto.settings !== undefined) updateData.settings = dto.settings;

      const { data, error } = await supabase
        .from('programs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program güncellenemedi');
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from('programs').delete().eq('id', id);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program silinemedi');
    }
  }

  async findByManagerId(managerId: string): Promise<Result<Program[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('program_manager_id', managerId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Programlar alınamadı');
    }
  }

  async search(query: string): Promise<Result<Program[]>> {
    try {
      const supabase = await createClient();

      // PostgreSQL full-text search using ilike
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Arama yapılamadı');
    }
  }

  async addConsultant(programId: string, consultantId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      // Insert into user_programs table
      const { error } = await supabase.from('user_programs').insert({
        user_id: consultantId,
        program_id: programId,
        role_in_program: 'consultant',
        is_active: true,
      });

      if (error) {
        // Check if already exists
        if (error.code === '23505') {
          // Unique constraint violation
          return Result.fail('Bu danışman zaten programa ekli');
        }
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Danışman eklenemedi');
    }
  }

  async removeConsultant(programId: string, consultantId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      // Delete from user_programs table
      const { error } = await supabase
        .from('user_programs')
        .delete()
        .eq('user_id', consultantId)
        .eq('program_id', programId)
        .eq('role_in_program', 'consultant');

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Danışman çıkarılamadı');
    }
  }

  async getConsultants(
    programId: string
  ): Promise<Result<import('@/domain/entities/User').User[]>> {
    try {
      const supabase = await createClient();

      // Join user_programs with users table
      const { data, error } = await supabase
        .from('user_programs')
        .select(
          `
          user_id,
          users (
            id,
            email,
            full_name,
            phone,
            avatar_url,
            role,
            company_id,
            is_active,
            is_email_verified,
            last_login_at,
            bio,
            expertise_areas,
            social_links,
            settings,
            created_at,
            updated_at,
            created_by,
            updated_by
          )
        `
        )
        .eq('program_id', programId)
        .eq('role_in_program', 'consultant')
        .eq('is_active', true);

      if (error) {
        return Result.fail(error.message);
      }

      // Map to User entities
      const users = data
        .map((item: any) => {
          if (!item.users) return null;
          return this.mapToUserEntity(item.users);
        })
        .filter((user): user is import('@/domain/entities/User').User => user !== null);

      return Result.ok(users);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Danışmanlar alınamadı');
    }
  }

  private mapToEntity(data: Record<string, unknown>): Program {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string | undefined,
      slug: data.slug as string,
      city: data.city as string | undefined,
      region: data.region as string | undefined,
      programType: data.program_type as string | undefined,
      startDate: new Date(data.start_date as string),
      endDate: new Date(data.end_date as string),
      durationMonths: data.duration_months as number | undefined,
      maxCompanies: data.max_companies as number,
      currentCompanies: data.current_companies as number,
      status: data.status as ProgramStatus,
      sponsor: data.sponsor as string | undefined,
      budget: data.budget as number | undefined,
      programManagerId: data.program_manager_id as string | undefined,
      settings: data.settings as Record<string, unknown> | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      createdBy: data.created_by as string | undefined,
      updatedBy: data.updated_by as string | undefined,
    };
  }

  private mapToUserEntity(data: Record<string, unknown>): import('@/domain/entities/User').User {
    return {
      id: data.id as string,
      email: data.email as string,
      fullName: data.full_name as string,
      phone: data.phone as string | undefined,
      avatarUrl: data.avatar_url as string | undefined,
      role: data.role as import('@/domain/enums/UserRole').UserRole,
      companyId: data.company_id as string | undefined,
      isActive: data.is_active as boolean,
      isEmailVerified: data.is_email_verified as boolean,
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at as string) : undefined,
      bio: data.bio as string | undefined,
      expertiseAreas: data.expertise_areas as string[] | undefined,
      socialLinks: data.social_links as Record<string, string> | undefined,
      settings: data.settings as import('@/domain/entities/User').UserSettings | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      createdBy: data.created_by as string | undefined,
      updatedBy: data.updated_by as string | undefined,
    };
  }
}
