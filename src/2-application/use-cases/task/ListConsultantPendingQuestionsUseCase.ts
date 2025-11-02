import { ITaskRepository } from '@/domain/interfaces/repositories/ITaskRepository';
import { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import { ISubProjectRepository } from '@/domain/interfaces/repositories/ISubProjectRepository';
import { ITaskCommentRepository } from '@/domain/interfaces/repositories/ITaskCommentRepository';
import { Result } from '@/core/result';
import { AppError } from '@/core/errors';

/**
 * List Consultant Pending Questions Use Case
 *
 * Consultant'ın atandığı projelerdeki görevlerde cevap bekleyen soruları listeler
 */
export class ListConsultantPendingQuestionsUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private projectRepository: IProjectRepository,
    private subProjectRepository: ISubProjectRepository,
    private taskCommentRepository: ITaskCommentRepository
  ) {}

  async execute(consultantId: string): Promise<Result<any[]>> {
    try {
      console.log('[ListConsultantPendingQuestionsUseCase] Starting for consultant:', consultantId);

      // 1. Consultant'ın projelerini bul
      const projects = await this.projectRepository.findByConsultantId(consultantId);
      console.log('[ListConsultantPendingQuestionsUseCase] Projects found:', projects.length);

      if (projects.length === 0) {
        console.log('[ListConsultantPendingQuestionsUseCase] No projects found for consultant');
        return Result.ok([]);
      }

      // 2. Bu projelerdeki sub-projeleri bul
      const projectIds = projects.map((p) => p.id);
      const allSubProjects: string[] = [];

      for (const projectId of projectIds) {
        const subProjects = await this.subProjectRepository.findByProjectId(projectId);
        allSubProjects.push(...subProjects.map((sp) => sp.id));
      }
      console.log(
        '[ListConsultantPendingQuestionsUseCase] Sub-projects found:',
        allSubProjects.length
      );

      if (allSubProjects.length === 0) {
        console.log('[ListConsultantPendingQuestionsUseCase] No sub-projects found');
        return Result.ok([]);
      }

      // 3. Bu sub-projelerdeki görevleri bul
      // Admin client kullanarak RLS'i bypass edelim (debug için)
      const { getSupabaseAdminClient } = await import('@/infrastructure/database/supabase-server');
      const supabase = getSupabaseAdminClient();

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .in('sub_project_id', allSubProjects)
        .is('deleted_at', null);

      if (tasksError) {
        console.error('[ListConsultantPendingQuestionsUseCase] Tasks query error:', tasksError);
        throw new Error(`Failed to find tasks: ${tasksError.message}`);
      }

      console.log('[ListConsultantPendingQuestionsUseCase] Tasks found:', tasks?.length || 0);

      if (!tasks || tasks.length === 0) {
        console.log('[ListConsultantPendingQuestionsUseCase] No tasks found in sub-projects');
        return Result.ok([]);
      }

      const taskIds = tasks.map((t) => t.id);
      console.log('[ListConsultantPendingQuestionsUseCase] Task IDs:', taskIds);

      // 4. Bu görevlerdeki soruları bul (is_question = true)
      const { data: comments, error: commentsError } = await supabase
        .from('task_comments')
        .select('*')
        .in('task_id', taskIds)
        .eq('is_question', true)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error(
          '[ListConsultantPendingQuestionsUseCase] Comments query error:',
          commentsError
        );
        throw new Error(`Failed to find questions: ${commentsError.message}`);
      }

      console.log('[ListConsultantPendingQuestionsUseCase] Comments found:', comments?.length || 0);
      if (comments && comments.length > 0) {
        console.log('[ListConsultantPendingQuestionsUseCase] Sample comment:', {
          id: comments[0].id,
          task_id: comments[0].task_id,
          is_question: comments[0].is_question,
          comment: comments[0].comment?.substring(0, 50),
        });
      }

      if (!comments || comments.length === 0) {
        console.log('[ListConsultantPendingQuestionsUseCase] No questions found in tasks');

        // Debug: Tüm soruları kontrol et (RLS olmadan)
        const { data: allComments } = await supabase
          .from('task_comments')
          .select('id, task_id, is_question, comment')
          .eq('is_question', true)
          .order('created_at', { ascending: false })
          .limit(10);
        console.log(
          '[ListConsultantPendingQuestionsUseCase] Total questions in DB (any task):',
          allComments?.length || 0
        );

        if (allComments && allComments.length > 0) {
          console.log(
            '[ListConsultantPendingQuestionsUseCase] Sample questions found in DB:',
            allComments.map((c: any) => ({
              id: c.id,
              task_id: c.task_id,
              comment: c.comment?.substring(0, 50),
            }))
          );

          // Bu soruların hangi görevlere ait olduğunu kontrol et
          const allQuestionTaskIds = allComments.map((c: any) => c.task_id);
          const { data: questionTasks } = await supabase
            .from('tasks')
            .select('id, title, sub_project_id')
            .in('id', allQuestionTaskIds);

          if (questionTasks && questionTasks.length > 0) {
            console.log(
              '[ListConsultantPendingQuestionsUseCase] Tasks with questions:',
              questionTasks.map((t: any) => ({
                id: t.id,
                title: t.title,
                sub_project_id: t.sub_project_id,
              }))
            );

            // Bu görevlerin hangi projelere ait olduğunu kontrol et
            const questionSubProjectIds = questionTasks
              .map((t: any) => t.sub_project_id)
              .filter(Boolean);
            if (questionSubProjectIds.length > 0) {
              const { data: questionSubProjects } = await supabase
                .from('sub_projects')
                .select('id, name, project_id')
                .in('id', questionSubProjectIds);

              if (questionSubProjects && questionSubProjects.length > 0) {
                const questionProjectIds = questionSubProjects
                  .map((sp: any) => sp.project_id)
                  .filter(Boolean);
                const { data: questionProjects } = await supabase
                  .from('projects')
                  .select('id, name, consultant_id')
                  .in('id', questionProjectIds);

                console.log(
                  '[ListConsultantPendingQuestionsUseCase] Projects with questions:',
                  questionProjects?.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    consultant_id: p.consultant_id,
                    is_this_consultant: p.consultant_id === consultantId,
                  })) || []
                );
              }
            }
          }
        }

        return Result.ok([]);
      }

      // 5. Görev bilgilerini toplu olarak al (performans için)
      const uniqueTaskIds = [...new Set(comments.map((c: any) => c.task_id))];
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, title, status, sub_project_id')
        .in('id', uniqueTaskIds);

      // 6. Sub-project bilgilerini toplu olarak al
      const uniqueSubProjectIds = [
        ...new Set((tasksData || []).map((t: any) => t.sub_project_id).filter(Boolean)),
      ];
      const { data: subProjectsData } = await supabase
        .from('sub_projects')
        .select('id, name, project_id')
        .in('id', uniqueSubProjectIds);

      // 7. Project bilgilerini toplu olarak al
      const uniqueProjectIds = [
        ...new Set((subProjectsData || []).map((sp: any) => sp.project_id).filter(Boolean)),
      ];
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, company_id')
        .in('id', uniqueProjectIds);

      // 8. Company bilgilerini toplu olarak al
      const uniqueCompanyIds = [
        ...new Set((projectsData || []).map((p: any) => p.company_id).filter(Boolean)),
      ];
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', uniqueCompanyIds);

      // 9. User bilgilerini toplu olarak al
      const uniqueUserIds = [...new Set(comments.map((c: any) => c.user_id).filter(Boolean))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', uniqueUserIds);

      // 10. Verileri map'le (lookup için)
      const tasksMap = new Map((tasksData || []).map((t: any) => [t.id, t]));
      const subProjectsMap = new Map((subProjectsData || []).map((sp: any) => [sp.id, sp]));
      const projectsMap = new Map((projectsData || []).map((p: any) => [p.id, p]));
      const companiesMap = new Map((companiesData || []).map((c: any) => [c.id, c]));
      const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]));

      // 11. Soruları ve görev bilgilerini formatla
      const questionsWithTasks = comments.map((comment: any) => {
        const task = tasksMap.get(comment.task_id);
        const subProject = task?.sub_project_id ? subProjectsMap.get(task.sub_project_id) : null;
        const project = subProject?.project_id ? projectsMap.get(subProject.project_id) : null;
        const company = project?.company_id ? companiesMap.get(project.company_id) : null;
        const user = comment.user_id ? usersMap.get(comment.user_id) : null;

        return {
          id: comment.id,
          comment: comment.comment,
          isQuestion: comment.is_question,
          createdAt: comment.created_at,
          task: task
            ? {
                id: task.id,
                title: task.title,
                status: task.status,
                subProject: subProject
                  ? {
                      id: subProject.id,
                      name: subProject.name,
                      project: project
                        ? {
                            id: project.id,
                            name: project.name,
                            company: company
                              ? {
                                  id: company.id,
                                  name: company.name,
                                }
                              : null,
                          }
                        : null,
                    }
                  : null,
              }
            : null,
          user: user
            ? {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
              }
            : null,
        };
      });

      return Result.ok(questionsWithTasks);
    } catch (error) {
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to list pending questions',
          500
        )
      );
    }
  }
}
