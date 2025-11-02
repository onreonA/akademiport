import { ITrainingVideoRepository } from '@/domain/interfaces/repositories/ITrainingVideoRepository';
import {
  TrainingVideo,
  CreateTrainingVideoDto,
  UpdateTrainingVideoDto,
} from '@/domain/entities/TrainingVideo';
import { createClient } from '@/infrastructure/database/supabase-server';

export class TrainingVideoRepository implements ITrainingVideoRepository {
  async create(data: CreateTrainingVideoDto): Promise<TrainingVideo> {
    const supabase = await createClient();

    // Extract YouTube ID from URL
    const youtubeId = this.extractYouTubeId(data.youtubeUrl);

    const { data: video, error } = await supabase
      .from('training_videos')
      .insert({
        training_id: data.trainingId,
        title: data.title,
        description: data.description || null,
        youtube_url: data.youtubeUrl,
        youtube_id: youtubeId,
        order_index: data.orderIndex || 0,
        is_locked: data.isLocked || false,
        duration_seconds: data.durationSeconds || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create training video: ${error.message}`);
    }

    return this.mapToEntity(video);
  }

  async findById(id: string): Promise<TrainingVideo | null> {
    const supabase = await createClient();

    const { data: video, error } = await supabase
      .from('training_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find training video: ${error.message}`);
    }

    return this.mapToEntity(video);
  }

  async findByTrainingId(trainingId: string): Promise<TrainingVideo[]> {
    const supabase = await createClient();

    const { data: videos, error } = await supabase
      .from('training_videos')
      .select('*')
      .eq('training_id', trainingId)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to find training videos: ${error.message}`);
    }

    return videos?.map((v) => this.mapToEntity(v)) || [];
  }

  async update(id: string, data: UpdateTrainingVideoDto): Promise<TrainingVideo> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.youtubeUrl !== undefined) {
      updateData.youtube_url = data.youtubeUrl;
      updateData.youtube_id = this.extractYouTubeId(data.youtubeUrl);
    }
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
    if (data.isLocked !== undefined) updateData.is_locked = data.isLocked;
    if (data.durationSeconds !== undefined) updateData.duration_seconds = data.durationSeconds;

    const { data: video, error } = await supabase
      .from('training_videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update training video: ${error.message}`);
    }

    return this.mapToEntity(video);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('training_videos').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete training video: ${error.message}`);
    }
  }

  async deleteByTrainingId(trainingId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('training_videos').delete().eq('training_id', trainingId);

    if (error) {
      throw new Error(`Failed to delete training videos: ${error.message}`);
    }
  }

  private mapToEntity(data: any): TrainingVideo {
    return {
      id: data.id,
      trainingId: data.training_id,
      title: data.title,
      description: data.description,
      youtubeUrl: data.youtube_url,
      youtubeId: data.youtube_id,
      orderIndex: data.order_index,
      isLocked: data.is_locked,
      durationSeconds: data.duration_seconds,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Extract YouTube video ID from URL
   */
  private extractYouTubeId(url: string): string | null {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}
