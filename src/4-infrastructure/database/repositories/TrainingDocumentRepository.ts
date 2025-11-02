import { ITrainingDocumentRepository } from '@/domain/interfaces/repositories/ITrainingDocumentRepository';
import {
  TrainingDocument,
  CreateTrainingDocumentDto,
  UpdateTrainingDocumentDto,
} from '@/domain/entities/TrainingDocument';
import { createClient } from '@/infrastructure/database/supabase-server';

export class TrainingDocumentRepository implements ITrainingDocumentRepository {
  async create(data: CreateTrainingDocumentDto): Promise<TrainingDocument> {
    const supabase = await createClient();

    const { data: document, error } = await supabase
      .from('training_documents')
      .insert({
        training_id: data.trainingId,
        title: data.title,
        description: data.description || null,
        file_url: data.fileUrl,
        file_name: data.fileName,
        file_size: data.fileSize || null,
        file_type: data.fileType || null,
        order_index: data.orderIndex || 0,
        is_locked: data.isLocked || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create training document: ${error.message}`);
    }

    return this.mapToEntity(document);
  }

  async findById(id: string): Promise<TrainingDocument | null> {
    const supabase = await createClient();

    const { data: document, error } = await supabase
      .from('training_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find training document: ${error.message}`);
    }

    return this.mapToEntity(document);
  }

  async findByTrainingId(trainingId: string): Promise<TrainingDocument[]> {
    const supabase = await createClient();

    const { data: documents, error } = await supabase
      .from('training_documents')
      .select('*')
      .eq('training_id', trainingId)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to find training documents: ${error.message}`);
    }

    return documents?.map((d) => this.mapToEntity(d)) || [];
  }

  async update(id: string, data: UpdateTrainingDocumentDto): Promise<TrainingDocument> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fileUrl !== undefined) updateData.file_url = data.fileUrl;
    if (data.fileName !== undefined) updateData.file_name = data.fileName;
    if (data.fileSize !== undefined) updateData.file_size = data.fileSize;
    if (data.fileType !== undefined) updateData.file_type = data.fileType;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
    if (data.isLocked !== undefined) updateData.is_locked = data.isLocked;

    const { data: document, error } = await supabase
      .from('training_documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update training document: ${error.message}`);
    }

    return this.mapToEntity(document);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('training_documents').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete training document: ${error.message}`);
    }
  }

  async deleteByTrainingId(trainingId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('training_documents')
      .delete()
      .eq('training_id', trainingId);

    if (error) {
      throw new Error(`Failed to delete training documents: ${error.message}`);
    }
  }

  private mapToEntity(data: any): TrainingDocument {
    return {
      id: data.id,
      trainingId: data.training_id,
      title: data.title,
      description: data.description,
      fileUrl: data.file_url,
      fileName: data.file_name,
      fileSize: data.file_size,
      fileType: data.file_type,
      orderIndex: data.order_index,
      isLocked: data.is_locked,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
