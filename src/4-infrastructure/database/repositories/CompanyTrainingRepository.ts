import { ICompanyTrainingRepository } from '@/domain/interfaces/repositories/ICompanyTrainingRepository';
import {
  CompanyTraining,
  CreateCompanyTrainingDto,
  UpdateCompanyTrainingDto,
} from '@/domain/entities/CompanyTraining';
import { createClient } from '@/infrastructure/database/supabase-server';

export class CompanyTrainingRepository implements ICompanyTrainingRepository {
  async create(data: CreateCompanyTrainingDto): Promise<CompanyTraining> {
    const supabase = await createClient();

    const { data: companyTraining, error } = await supabase
      .from('company_trainings')
      .insert({
        company_id: data.companyId,
        training_id: data.trainingId,
        assigned_by: data.assignedBy,
        status: data.status || 'assigned',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create company training: ${error.message}`);
    }

    return this.mapToEntity(companyTraining);
  }

  async findById(id: string): Promise<CompanyTraining | null> {
    const supabase = await createClient();

    const { data: companyTraining, error } = await supabase
      .from('company_trainings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find company training: ${error.message}`);
    }

    return this.mapToEntity(companyTraining);
  }

  async findByCompanyId(companyId: string): Promise<CompanyTraining[]> {
    const supabase = await createClient();

    const { data: companyTrainings, error } = await supabase
      .from('company_trainings')
      .select('*')
      .eq('company_id', companyId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find company trainings: ${error.message}`);
    }

    return companyTrainings?.map((ct) => this.mapToEntity(ct)) || [];
  }

  async findByTrainingId(trainingId: string): Promise<CompanyTraining[]> {
    const supabase = await createClient();

    const { data: companyTrainings, error } = await supabase
      .from('company_trainings')
      .select('*')
      .eq('training_id', trainingId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find company trainings: ${error.message}`);
    }

    return companyTrainings?.map((ct) => this.mapToEntity(ct)) || [];
  }

  async findByCompanyAndTraining(
    companyId: string,
    trainingId: string
  ): Promise<CompanyTraining | null> {
    const supabase = await createClient();

    const { data: companyTraining, error } = await supabase
      .from('company_trainings')
      .select('*')
      .eq('company_id', companyId)
      .eq('training_id', trainingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find company training: ${error.message}`);
    }

    return this.mapToEntity(companyTraining);
  }

  async update(id: string, data: UpdateCompanyTrainingDto): Promise<CompanyTraining> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (data.status !== undefined) updateData.status = data.status;

    const { data: companyTraining, error } = await supabase
      .from('company_trainings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update company training: ${error.message}`);
    }

    return this.mapToEntity(companyTraining);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('company_trainings').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete company training: ${error.message}`);
    }
  }

  async deleteByCompanyAndTraining(companyId: string, trainingId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('company_trainings')
      .delete()
      .eq('company_id', companyId)
      .eq('training_id', trainingId);

    if (error) {
      throw new Error(`Failed to delete company training: ${error.message}`);
    }
  }

  private mapToEntity(data: any): CompanyTraining {
    return {
      id: data.id,
      companyId: data.company_id,
      trainingId: data.training_id,
      assignedBy: data.assigned_by,
      assignedAt: new Date(data.assigned_at),
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
