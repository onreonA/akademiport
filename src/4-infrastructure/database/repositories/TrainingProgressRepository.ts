import { ITrainingProgressRepository } from '@/domain/interfaces/repositories/ITrainingProgressRepository';
import {
  TrainingProgress,
  CreateTrainingProgressDto,
  UpdateTrainingProgressDto,
  TrainingProgressFilterDto,
} from '@/domain/entities/TrainingProgress';
import { createClient } from '@/infrastructure/database/supabase-server';

export class TrainingProgressRepository implements ITrainingProgressRepository {
  async create(data: CreateTrainingProgressDto): Promise<TrainingProgress> {
    const supabase = await createClient();

    const { data: progress, error } = await supabase
      .from('training_progress')
      .insert({
        company_id: data.companyId,
        training_id: data.trainingId,
        video_id: data.videoId || null,
        document_id: data.documentId || null,
        progress_percentage: data.progressPercentage || 0,
        watched_at: data.watchedAt ? data.watchedAt.toISOString() : null,
        read_at: data.readAt ? data.readAt.toISOString() : null,
        completed_at: data.completedAt ? data.completedAt.toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create training progress: ${error.message}`);
    }

    return this.mapToEntity(progress);
  }

  async findById(id: string): Promise<TrainingProgress | null> {
    const supabase = await createClient();

    const { data: progress, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find training progress: ${error.message}`);
    }

    return this.mapToEntity(progress);
  }

  async findByCompanyAndTraining(
    companyId: string,
    trainingId: string
  ): Promise<TrainingProgress[]> {
    const supabase = await createClient();

    const { data: progressList, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('company_id', companyId)
      .eq('training_id', trainingId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find training progress: ${error.message}`);
    }

    return progressList?.map((p) => this.mapToEntity(p)) || [];
  }

  async findByVideo(companyId: string, videoId: string): Promise<TrainingProgress | null> {
    const supabase = await createClient();

    const { data: progress, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('company_id', companyId)
      .eq('video_id', videoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find video progress: ${error.message}`);
    }

    return this.mapToEntity(progress);
  }

  async findByDocument(companyId: string, documentId: string): Promise<TrainingProgress | null> {
    const supabase = await createClient();

    const { data: progress, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('company_id', companyId)
      .eq('document_id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find document progress: ${error.message}`);
    }

    return this.mapToEntity(progress);
  }

  async findAll(filters?: TrainingProgressFilterDto): Promise<TrainingProgress[]> {
    const supabase = await createClient();

    let query = supabase.from('training_progress').select('*');

    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters?.trainingId) {
      query = query.eq('training_id', filters.trainingId);
    }

    if (filters?.videoId !== undefined) {
      if (filters.videoId === null) {
        query = query.is('video_id', null);
      } else {
        query = query.eq('video_id', filters.videoId);
      }
    }

    if (filters?.documentId !== undefined) {
      if (filters.documentId === null) {
        query = query.is('document_id', null);
      } else {
        query = query.eq('document_id', filters.documentId);
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data: progressList, error } = await query;

    if (error) {
      throw new Error(`Failed to find training progress: ${error.message}`);
    }

    return progressList?.map((p) => this.mapToEntity(p)) || [];
  }

  async update(id: string, data: UpdateTrainingProgressDto): Promise<TrainingProgress> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.progressPercentage !== undefined)
      updateData.progress_percentage = data.progressPercentage;
    if (data.watchedAt !== undefined)
      updateData.watched_at = data.watchedAt ? data.watchedAt.toISOString() : null;
    if (data.readAt !== undefined)
      updateData.read_at = data.readAt ? data.readAt.toISOString() : null;
    if (data.completedAt !== undefined)
      updateData.completed_at = data.completedAt ? data.completedAt.toISOString() : null;

    const { data: progress, error } = await supabase
      .from('training_progress')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update training progress: ${error.message}`);
    }

    return this.mapToEntity(progress);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('training_progress').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete training progress: ${error.message}`);
    }
  }

  async deleteByTrainingId(trainingId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('training_progress')
      .delete()
      .eq('training_id', trainingId);

    if (error) {
      throw new Error(`Failed to delete training progress: ${error.message}`);
    }
  }

  private mapToEntity(data: any): TrainingProgress {
    return {
      id: data.id,
      companyId: data.company_id,
      trainingId: data.training_id,
      videoId: data.video_id,
      documentId: data.document_id,
      progressPercentage: data.progress_percentage,
      watchedAt: data.watched_at ? new Date(data.watched_at) : null,
      readAt: data.read_at ? new Date(data.read_at) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
