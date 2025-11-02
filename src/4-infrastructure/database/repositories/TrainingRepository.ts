import { ITrainingRepository } from '@/domain/interfaces/repositories/ITrainingRepository';
import {
  Training,
  CreateTrainingDto,
  UpdateTrainingDto,
  TrainingFilterDto,
} from '@/domain/entities/Training';
import { createClient, getSupabaseAdminClient } from '@/infrastructure/database/supabase-server';

export class TrainingRepository implements ITrainingRepository {
  async create(data: CreateTrainingDto): Promise<Training> {
    const supabase = await createClient();

    const { data: training, error } = await supabase
      .from('trainings')
      .insert({
        name: data.name,
        description: data.description || null,
        program_id: data.programId || null,
        consultant_id: data.consultantId || null,
        is_global: data.isGlobal ?? false,
        status: data.status || 'draft',
        priority: data.priority || 'medium',
        is_locked: data.isLocked || false,
        created_by: data.createdBy || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create training: ${error.message}`);
    }

    return this.mapToEntity(training);
  }

  async findById(id: string): Promise<Training | null> {
    const supabase = await createClient();

    const { data: training, error } = await supabase
      .from('trainings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find training: ${error.message}`);
    }

    return this.mapToEntity(training);
  }

  async findAll(
    filters?: TrainingFilterDto,
    useAdminClient = false
  ): Promise<{ data: Training[]; total: number }> {
    const supabase = useAdminClient ? getSupabaseAdminClient() : await createClient();

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase.from('trainings').select('*', { count: 'exact' });

    // CRITICAL: Only apply filters if they have actual values (not undefined or empty)
    // undefined or null values should NOT filter (meaning "all")
    // Only apply filter if programId is a valid UUID string

    if (filters?.programId !== undefined && filters.programId !== null) {
      query = query.eq('program_id', filters.programId);
    }
    // If programId is null, don't apply filter (show all trainings)

    if (filters?.consultantId !== undefined && filters.consultantId) {
      query = query.eq('consultant_id', filters.consultantId);
    }

    if (filters?.isGlobal !== undefined && typeof filters.isGlobal === 'boolean') {
      query = query.eq('is_global', filters.isGlobal);
    }

    if (filters?.status !== undefined && filters.status && filters.status.trim() !== '') {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority !== undefined && filters.priority && filters.priority.trim() !== '') {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.search !== undefined && filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const finalQuery = limit > 0 ? query.range(offset, offset + limit - 1) : query;

    const { data: trainings, error, count } = await finalQuery;

    if (error) {
      console.error('❌ TrainingRepository query error:', error);
      throw new Error(`Failed to find trainings: ${error.message}`);
    }

    return {
      data: trainings?.map((t) => this.mapToEntity(t)) || [],
      total: count || 0,
    };
  }

  async findByProgramId(programId: string): Promise<Training[]> {
    const supabase = await createClient();

    const { data: trainings, error } = await supabase
      .from('trainings')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find trainings by program: ${error.message}`);
    }

    return trainings?.map((t) => this.mapToEntity(t)) || [];
  }

  async findByConsultantId(consultantId: string): Promise<Training[]> {
    const supabase = await createClient();

    const { data: trainings, error } = await supabase
      .from('trainings')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find trainings by consultant: ${error.message}`);
    }

    return trainings?.map((t) => this.mapToEntity(t)) || [];
  }

  async findGlobal(): Promise<Training[]> {
    const supabase = await createClient();

    const { data: trainings, error } = await supabase
      .from('trainings')
      .select('*')
      .eq('is_global', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find global trainings: ${error.message}`);
    }

    return trainings?.map((t) => this.mapToEntity(t)) || [];
  }

  async update(id: string, data: UpdateTrainingDto): Promise<Training> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.programId !== undefined) updateData.program_id = data.programId;
    if (data.consultantId !== undefined) updateData.consultant_id = data.consultantId;
    if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isLocked !== undefined) updateData.is_locked = data.isLocked;

    const { data: training, error } = await supabase
      .from('trainings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update training: ${error.message}`);
    }

    return this.mapToEntity(training);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('trainings').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete training: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Training {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      programId: data.program_id,
      consultantId: data.consultant_id,
      isGlobal: data.is_global,
      status: data.status,
      priority: data.priority,
      isLocked: data.is_locked,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }
}
