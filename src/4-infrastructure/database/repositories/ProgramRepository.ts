/**
 * Program Repository Implementation
 */

import { createClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/core/result/Result';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { Program, CreateProgramDto, UpdateProgramDto } from '@/domain/entities/Program';
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
}
