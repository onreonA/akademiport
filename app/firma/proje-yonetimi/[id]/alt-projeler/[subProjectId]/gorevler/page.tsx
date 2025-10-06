import { createClient } from '@supabase/supabase-js';

import CompanyProjectTasksClient from './CompanyProjectTasksClient';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
interface PageProps {
  params: Promise<{ id: string; subProjectId: string }>;
}
export default async function CompanyProjectTasksPage({ params }: PageProps) {
  const { id: projectId, subProjectId } = await params;
  // Alt proje detaylarını getir
  const { data: subProject, error: subProjectError } = await supabase
    .from('sub_projects')
    .select(
      `
      *,
      projects (
        id,
        name,
        description
      )
    `
    )
    .eq('id', subProjectId)
    .eq('project_id', projectId)
    .single();
  if (subProjectError || !subProject) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-3xl'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Alt Proje Bulunamadı
          </h3>
          <p className='text-gray-500'>
            Aradığınız alt proje bulunamadı veya erişim izniniz yok.
          </p>
        </div>
      </div>
    );
  }
  // Görevleri getir
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('sub_project_id', subProjectId)
    .order('created_at', { ascending: false });
  if (tasksError) {
  }
  return (
    <CompanyProjectTasksClient
      projectId={projectId}
      subProjectId={subProjectId}
      subProject={subProject}
      tasks={tasks || []}
    />
  );
}
