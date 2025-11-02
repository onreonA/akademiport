import { ITaskCommentRepository } from '@/domain/interfaces/repositories/ITaskCommentRepository';
import { TaskComment, CreateTaskCommentDto } from '@/domain/entities/TaskComment';
import { createClient } from '@/infrastructure/database/supabase-server';

export class TaskCommentRepository implements ITaskCommentRepository {
  async create(data: CreateTaskCommentDto): Promise<TaskComment> {
    const supabase = await createClient();

    // isQuestion değerini açıkça boolean'a çevir
    const isQuestionValue = Boolean(data.isQuestion);

    console.log('[TaskCommentRepository.create] Creating comment:', {
      taskId: data.taskId,
      userId: data.userId,
      comment: data.comment?.substring(0, 50),
      isQuestion: data.isQuestion,
      isQuestionValue,
    });

    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: data.taskId,
        user_id: data.userId,
        comment: data.comment,
        is_question: isQuestionValue,
        parent_comment_id: data.parentCommentId || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task comment: ${error.message}`);
    }

    return this.mapToEntity(comment);
  }

  async findById(id: string): Promise<TaskComment | null> {
    const supabase = await createClient();

    const { data: comment, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find task comment: ${error.message}`);
    }

    return this.mapToEntity(comment);
  }

  async findByTaskId(taskId: string): Promise<TaskComment[]> {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to find task comments: ${error.message}`);
    }

    return comments?.map((c) => this.mapToEntity(c)) || [];
  }

  async findByUserId(userId: string): Promise<TaskComment[]> {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find user comments: ${error.message}`);
    }

    return comments?.map((c) => this.mapToEntity(c)) || [];
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('task_comments').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete task comment: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('task_comments').select('id').eq('id', id).single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check task comment existence: ${error.message}`);
    }

    return !!data;
  }

  private mapToEntity(data: any): TaskComment {
    return {
      id: data.id,
      taskId: data.task_id,
      userId: data.user_id,
      comment: data.comment,
      isQuestion: data.is_question,
      parentCommentId: data.parent_comment_id || null,
      createdAt: new Date(data.created_at),
    };
  }
}
