/**
 * User Repository Implementation
 *
 * Supabase implementation of IUserRepository
 */

import { createClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/core/result/Result';
import { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { User } from '@/domain/entities/User';
import { Program } from '@/domain/entities/Program';
import { UserRole } from '@/domain/enums/UserRole';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  UserFilterDefaults,
} from '@/application/dto/user';

export class UserRepository implements IUserRepository {
  private readonly tableName = 'users';
  private readonly userProgramsTableName = 'user_programs';
  private readonly programsTableName = 'programs';

  // ============================================================================
  // BASIC CRUD
  // ============================================================================

  async findById(id: string): Promise<Result<User | null>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return Result.ok(null);
        }
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı bulunamadı');
    }
  }

  async findAll(): Promise<Result<User[]>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcılar alınamadı');
    }
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı bulunamadı');
    }
  }

  async create(dto: CreateUserDto): Promise<Result<User>> {
    try {
      const supabase = await createClient();

      // Note: Password hashing and Supabase Auth user creation
      // should be handled by AuthService before calling this method
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          email: dto.email,
          full_name: dto.fullName,
          phone: dto.phone,
          role: dto.role || UserRole.COMPANY_USER,
          company_id: dto.companyId,
          bio: dto.bio,
          expertise_areas: dto.expertiseAreas,
          social_links: dto.socialLinks,
          is_active: true,
          is_email_verified: false,
          created_by: dto.createdBy,
          updated_by: dto.createdBy,
        })
        .select('*')
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı oluşturulamadı');
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<Result<User>> {
    try {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: dto.updatedBy,
      };

      if (dto.fullName !== undefined) updateData.full_name = dto.fullName;
      if (dto.phone !== undefined) updateData.phone = dto.phone;
      if (dto.avatarUrl !== undefined) updateData.avatar_url = dto.avatarUrl;
      if (dto.role !== undefined) updateData.role = dto.role;
      if (dto.companyId !== undefined) updateData.company_id = dto.companyId;
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
      if (dto.bio !== undefined) updateData.bio = dto.bio;
      if (dto.expertiseAreas !== undefined) updateData.expertise_areas = dto.expertiseAreas;
      if (dto.socialLinks !== undefined) updateData.social_links = dto.socialLinks;
      if (dto.settings !== undefined) updateData.settings = dto.settings;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToEntity(data));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı güncellenemedi');
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      // Soft delete: set is_active to false
      const { error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı silinemedi');
    }
  }

  // ============================================================================
  // FILTERING & SEARCH
  // ============================================================================

  async findByRole(role: string): Promise<Result<User[]>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcılar alınamadı');
    }
  }

  async findByCompanyId(companyId: string): Promise<Result<User[]>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcılar alınamadı');
    }
  }

  async findByProgramId(programId: string): Promise<Result<User[]>> {
    try {
      const supabase = await createClient();

      // Join user_programs with users
      const { data, error } = await supabase
        .from(this.userProgramsTableName)
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
        .eq('is_active', true);

      if (error) {
        return Result.fail(error.message);
      }

      // Map to User entities
      const users = data
        .map((item: any) => {
          if (!item.users) return null;
          return this.mapToEntity(item.users);
        })
        .filter((user): user is User => user !== null);

      return Result.ok(users);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcılar alınamadı');
    }
  }

  async search(query: string): Promise<Result<User[]>> {
    try {
      const supabase = await createClient();

      // PostgreSQL full-text search using ilike
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(data.map((item) => this.mapToEntity(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Arama yapılamadı');
    }
  }

  async findWithFilters(filters: UserFilterDto): Promise<
    Result<{
      users: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    try {
      const supabase = await createClient();

      // Apply defaults
      const page = filters.page || UserFilterDefaults.page;
      const limit = filters.limit || UserFilterDefaults.limit;
      const sortBy = filters.sortBy || UserFilterDefaults.sortBy;
      const sortOrder = filters.sortOrder || UserFilterDefaults.sortOrder;
      const offset = (page - 1) * limit;

      // Build query
      let query = supabase.from(this.tableName).select('*', { count: 'exact' });

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      // Program filter requires join
      if (filters.programId) {
        // This is more complex, we need to join with user_programs
        // For now, we'll fetch program users separately and filter
        const programUsersResult = await this.findByProgramId(filters.programId);
        if (programUsersResult.isFailure) {
          return Result.fail(programUsersResult.error || 'Program kullanıcıları alınamadı');
        }

        const programUserIds = programUsersResult.value?.map((u) => u.id) || [];
        if (programUserIds.length === 0) {
          return Result.ok({
            users: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          });
        }

        query = query.in('id', programUserIds);
      }

      // Apply sorting
      const sortColumn = this.mapSortField(sortBy);
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        return Result.fail(error.message);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return Result.ok({
        users: data.map((item) => this.mapToEntity(item)),
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcılar alınamadı');
    }
  }

  // ============================================================================
  // PROGRAM MANAGEMENT
  // ============================================================================

  async assignProgram(
    userId: string,
    programId: string,
    roleInProgram?: string
  ): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from(this.userProgramsTableName).insert({
        user_id: userId,
        program_id: programId,
        role_in_program: roleInProgram || 'participant',
        is_active: true,
      });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          return Result.fail('Bu kullanıcı zaten programa atanmış');
        }
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program ataması yapılamadı');
    }
  }

  async removeProgram(userId: string, programId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from(this.userProgramsTableName)
        .delete()
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Program ataması kaldırılamadı');
    }
  }

  async getPrograms(userId: string): Promise<Result<Program[]>> {
    try {
      console.log('🔍 UserRepository.getPrograms - Start', { userId });
      console.log('⏳ Creating Supabase client...');
      const supabase = await createClient();
      console.log('✅ Supabase client created');

      // Join user_programs with programs
      const { data, error } = await supabase
        .from(this.userProgramsTableName)
        .select(
          `
          program_id,
          programs (
            id,
            name,
            description,
            slug,
            city,
            region,
            program_type,
            start_date,
            end_date,
            duration_months,
            max_companies,
            current_companies,
            status,
            sponsor,
            budget,
            program_manager_id,
            settings,
            created_at,
            updated_at,
            created_by,
            updated_by
          )
        `
        )
        .eq('user_id', userId)
        .eq('is_active', true);

      console.log('📊 Query result:', { error: error?.message, dataLength: data?.length });

      if (error) {
        console.error('❌ Supabase error:', error);
        return Result.fail(error.message);
      }

      // Map to Program entities
      const programs = data
        .map((item: any) => {
          if (!item.programs) return null;
          return this.mapToProgramEntity(item.programs);
        })
        .filter((program): program is Program => program !== null);

      console.log('✅ Programs mapped:', programs.length);
      return Result.ok(programs);
    } catch (error) {
      console.error('💥 UserRepository.getPrograms - Exception:', error);
      return Result.fail(error instanceof Error ? error.message : 'Programlar alınamadı');
    }
  }

  async isProgramAssigned(userId: string, programId: string): Promise<Result<boolean>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from(this.userProgramsTableName)
        .select('id')
        .eq('user_id', userId)
        .eq('program_id', programId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(false);
        }
        return Result.fail(error.message);
      }

      return Result.ok(!!data);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kontrol yapılamadı');
    }
  }

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  async changePassword(userId: string, newPasswordHash: string): Promise<Result<void>> {
    try {
      // Note: This should be handled by Supabase Auth
      // This method is here for completeness but password changes
      // should go through AuthService which uses Supabase Auth
      return Result.fail('Şifre değişikliği AuthService üzerinden yapılmalıdır');
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Şifre değiştirilemedi');
    }
  }

  // ============================================================================
  // STATUS MANAGEMENT
  // ============================================================================

  async activate(userId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from(this.tableName)
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı aktifleştirilemedi');
    }
  }

  async deactivate(userId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Kullanıcı deaktifleştirilemedi');
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async countByRole(role: string): Promise<Result<number>> {
    try {
      const supabase = await createClient();

      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('role', role)
        .eq('is_active', true);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(count || 0);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Sayım yapılamadı');
    }
  }

  async countByCompany(companyId: string): Promise<Result<number>> {
    try {
      const supabase = await createClient();

      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(count || 0);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Sayım yapılamadı');
    }
  }

  async countByProgram(programId: string): Promise<Result<number>> {
    try {
      const supabase = await createClient();

      const { count, error } = await supabase
        .from(this.userProgramsTableName)
        .select('*', { count: 'exact', head: true })
        .eq('program_id', programId)
        .eq('is_active', true);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(count || 0);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Sayım yapılamadı');
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToEntity(data: Record<string, unknown>): User {
    return {
      id: data.id as string,
      email: data.email as string,
      fullName: data.full_name as string,
      phone: data.phone as string | undefined,
      avatarUrl: data.avatar_url as string | undefined,
      role: data.role as UserRole,
      companyId: data.company_id as string | undefined,
      isActive: data.is_active as boolean,
      isEmailVerified: data.is_email_verified as boolean,
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at as string) : undefined,
      bio: data.bio as string | undefined,
      expertiseAreas: data.expertise_areas as string[] | undefined,
      socialLinks: data.social_links as Record<string, string> | undefined,
      settings: data.settings as any,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      createdBy: data.created_by as string | undefined,
      updatedBy: data.updated_by as string | undefined,
    };
  }

  private mapToProgramEntity(data: Record<string, unknown>): Program {
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

  private mapSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      fullName: 'full_name',
      email: 'email',
      createdAt: 'created_at',
      role: 'role',
      lastLoginAt: 'last_login_at',
    };

    return fieldMap[sortBy] || 'created_at';
  }
}
