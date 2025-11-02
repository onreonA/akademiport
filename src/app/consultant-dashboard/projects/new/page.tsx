'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowLeft, Sparkles } from 'lucide-react';
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

interface Company {
  id: string;
  name: string;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    start_date: '',
    end_date: '',
    template_id: '',
  });

  useEffect(() => {
    fetchCompanies();
    fetchTemplates();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      // API returns { success: true, data: [...] }
      setCompanies(data.data || data.companies || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/projects/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = '/api/projects';

      // Map formData to API expected format
      const payload: any = {
        companyId: formData.company_id,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status || 'todo',
        priority: formData.priority || 'medium',
        startDate: formData.start_date || undefined,
        endDate: formData.end_date || undefined,
      };

      // Add templateId if template is selected
      if (formData.template_id && formData.template_id !== 'none') {
        payload.templateId = formData.template_id;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to create project');
      }

      const data = await response.json();
      // API returns project directly, not wrapped in { project: {...} }
      const projectId = data.id || data.project?.id;
      if (!projectId) {
        throw new Error('Project ID not found in response');
      }
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

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <GradientHeader
          title="Yeni Proje Oluştur"
          subtitle="Firmaya yeni bir proje atayın veya şablondan oluşturun"
          icon={Briefcase}
          actions={
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => router.push('/consultant-dashboard/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          }
        />

        {/* Form */}
        <EnhancedCard variant="glass" className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="template_id" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Şablondan Oluştur (Opsiyonel)
              </Label>
              <Select
                value={formData.template_id || undefined}
                onValueChange={(value) =>
                  handleChange('template_id', value === 'none' ? '' : value)
                }
              >
                <SelectTrigger id="template_id">
                  <SelectValue placeholder="Şablon seçin (boş bırakabilirsiniz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Şablon kullanma</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.template_id && (
                <p className="text-sm text-muted-foreground">
                  ✨ Şablon seçildiğinde, alt projeler ve görevler otomatik olarak kopyalanacaktır.
                </p>
              )}
            </div>

            {/* Company Selection */}
            <div className="space-y-2">
              <Label htmlFor="company_id">
                Firma <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => handleChange('company_id', value)}
                required
              >
                <SelectTrigger id="company_id">
                  <SelectValue placeholder="Firma seçin" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Proje Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Örn: Dijital Dönüşüm Projesi"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Proje hakkında detaylı bilgi..."
                rows={4}
              />
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

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Bitiş Tarihi</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push('/consultant-dashboard/projects')}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" className="w-full sm:flex-1" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Proje Oluştur'}
              </Button>
            </div>
          </form>
        </EnhancedCard>
      </div>
    </div>
  );
}
