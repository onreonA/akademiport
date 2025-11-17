'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ListTodo, ArrowLeft } from 'lucide-react';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { TaskDescriptionGenerator } from '@/1-presentation/components/features/ai/TaskDescriptionGenerator';

interface SubProject {
  id: string;
  name: string;
}

interface CompanyUser {
  id: string;
  full_name: string;
  email: string;
}

export default function NewTaskPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [projectData, setProjectData] = useState<{
    name?: string;
    companyId?: string;
    companyName?: string;
    programId?: string;
    programName?: string;
  }>({});
  const [formData, setFormData] = useState({
    sub_project_id: '',
    assigned_to: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  });

  useEffect(() => {
    fetchSubProjects();
    fetchCompanyUsers();
    fetchProjectData();
  }, [projectId]);

  const fetchSubProjects = async () => {
    try {
      const response = await fetch(`/api/sub-projects?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch sub-projects');
      const data = await response.json();
      // API returns array directly or wrapped in data
      setSubProjects(Array.isArray(data) ? data : data.data || data.subProjects || []);
    } catch (err) {
      console.error('Error fetching sub-projects:', err);
    }
  };

  const fetchProjectData = async () => {
    try {
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) throw new Error('Failed to fetch project');
      const project = await projectResponse.json();

      setProjectData({
        name: project.name,
        companyId: project.companyId || project.company_id,
        companyName: project.companyName || project.company?.name,
        programId: project.programId || project.program_id,
        programName: project.programName || project.program?.name,
      });
    } catch (err) {
      console.error('Error fetching project data:', err);
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      // First get project to get company_id
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) throw new Error('Failed to fetch project');
      const projectData = await projectResponse.json();
      // API returns project directly, not wrapped in { project: {...} }
      const companyId =
        projectData.companyId || projectData.company_id || projectData.project?.company_id;

      if (!companyId) {
        console.error('Company ID not found in project data');
        return;
      }

      // Then get company users
      const usersResponse = await fetch(`/api/companies/${companyId}/users`);
      if (!usersResponse.ok) throw new Error('Failed to fetch company users');
      const usersData = await usersResponse.json();
      setCompanyUsers(usersData.users || usersData.data || []);
    } catch (err) {
      console.error('Error fetching company users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map formData to API expected format
      const payload = {
        subProjectId: formData.sub_project_id,
        assignedTo: formData.assigned_to || undefined,
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status || 'todo',
        priority: formData.priority || 'medium',
        dueDate: formData.due_date || undefined,
        orderIndex: 0,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create task' }));
        throw new Error(errorData.error || errorData.message || 'Failed to create task');
      }

      const data = await response.json();
      router.push(`/consultant-dashboard/projects/${projectId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAIGenerated = (result: {
    description: string;
    subTasks: Array<{ title: string; description: string }>;
    keyPoints: string[];
  }) => {
    // Set description
    setFormData((prev) => ({
      ...prev,
      description: result.description,
    }));

    // TODO: Show sub tasks and key points in a modal or expandable section
    console.log('AI Generated:', result);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title="Yeni Görev Oluştur"
          subtitle="Firma kullanıcısına görev atayın"
          icon={ListTodo}
          actions={
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => router.push(`/consultant-dashboard/projects/${projectId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          }
        />

        {/* Form */}
        <EnhancedCard variant="glass" className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sub-Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="sub_project_id">
                Alt Proje <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.sub_project_id}
                onValueChange={(value) => handleChange('sub_project_id', value)}
                required
              >
                <SelectTrigger id="sub_project_id">
                  <SelectValue placeholder="Alt proje seçin" />
                </SelectTrigger>
                <SelectContent>
                  {subProjects.length === 0 ? (
                    <SelectItem value="no-subproject" disabled>
                      Henüz alt proje yok
                    </SelectItem>
                  ) : (
                    subProjects.map((subProject) => (
                      <SelectItem key={subProject.id} value={subProject.id}>
                        {subProject.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {subProjects.length === 0 && (
                <p className="text-sm text-muted-foreground">⚠️ Önce alt proje oluşturmalısınız.</p>
              )}
            </div>

            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Görev Başlığı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Örn: Pazar araştırması raporu hazırla"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Açıklama</Label>
                <TaskDescriptionGenerator
                  taskTitle={formData.title}
                  programName={projectData.programName}
                  companyName={projectData.companyName}
                  projectName={projectData.name}
                  subProjectName={subProjects.find((sp) => sp.id === formData.sub_project_id)?.name}
                  companyId={projectData.companyId}
                  programId={projectData.programId}
                  onGenerated={handleAIGenerated}
                />
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Görev hakkında detaylı bilgi..."
                rows={4}
              />
            </div>

            {/* Assign To */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Atanan Kişi (Opsiyonel)</Label>
              <Select
                value={formData.assigned_to || undefined}
                onValueChange={(value) =>
                  handleChange('assigned_to', value === 'none' ? '' : value)
                }
              >
                <SelectTrigger id="assigned_to">
                  <SelectValue placeholder="Firma kullanıcısı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Atama yapma</SelectItem>
                  {companyUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Yapılacak</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="review">İncelemede</SelectItem>
                    <SelectItem value="done">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Bitiş Tarihi (Opsiyonel)</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/consultant-dashboard/projects/${projectId}`)}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1"
                disabled={loading || subProjects.length === 0}
              >
                {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
              </Button>
            </div>
          </form>
        </EnhancedCard>
      </div>
    </div>
  );
}
