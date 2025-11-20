'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';
import Link from 'next/link';

interface Project {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  progress: number;
}

interface Company {
  id: string;
  name: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
  });

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);

      console.log('📦 [Edit Project] Project data:', data);
      console.log('📦 [Edit Project] companyId:', data.companyId);

      // Set form data with companyId - ensure it's set only if companyId exists
      if (data.companyId) {
        setFormData((prev) => {
          const newData = {
            ...prev,
            companyId: data.companyId,
            name: data.name,
            description: data.description || '',
            status: data.status,
            priority: data.priority,
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
          };
          console.log('📦 [Edit Project] Setting formData with companyId:', newData.companyId);
          return newData;
        });
      } else {
        // If no companyId, set other fields but keep companyId empty
        setFormData((prev) => ({
          ...prev,
          name: data.name,
          description: data.description || '',
          status: data.status,
          priority: data.priority,
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        }));
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Proje yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);

      // For consultants, we need to get companies from their programs
      // First, get consultant's programs
      const programsResponse = await fetch('/api/consultant/programs?limit=100');
      if (!programsResponse.ok) {
        throw new Error('Failed to fetch programs');
      }
      const programsData = await programsResponse.json();

      console.log('📦 [Edit Project] Programs data:', programsData);
      console.log('📦 [Edit Project] Programs:', programsData.data);

      if (!programsData.success || !programsData.data || programsData.data.length === 0) {
        console.log('📦 [Edit Project] No programs found for consultant');
        setCompanies([]);
        return;
      }

      // Get companies from all programs
      const allCompanies: Company[] = [];
      const companyIds = new Set<string>();

      for (const programItem of programsData.data) {
        // ConsultantProgramWithStats structure: { program: Program, companiesCount: number, ... }
        // We need to access program.id from program.program.id
        const program = programItem.program || programItem;
        const programId = program.id;

        if (!programId) {
          console.warn('📦 [Edit Project] Program missing ID:', programItem);
          continue;
        }

        try {
          console.log(`📦 [Edit Project] Fetching companies for program: ${programId}`);
          const companiesResponse = await fetch(
            `/api/consultant/programs/${programId}/companies?limit=100`
          );
          if (companiesResponse.ok) {
            const companiesData = await companiesResponse.json();
            if (companiesData.success && companiesData.data) {
              // API returns ConsultantCompanyWithStats[] which has { company, programId, ... }
              // We need to extract the company object from each item
              for (const companyWithStats of companiesData.data) {
                // Handle both formats: { company: Company } or direct Company object
                const company = companyWithStats.company || companyWithStats;
                if (company && company.id && !companyIds.has(company.id)) {
                  companyIds.add(company.id);
                  allCompanies.push(company);
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching companies for program ${programId}:`, err);
        }
      }

      // Ensure unique companies by id
      const uniqueCompanies = Array.from(new Map(allCompanies.map((c) => [c.id, c])).values());

      setCompanies(uniqueCompanies);

      console.log('📦 [Edit Project] Companies loaded:', uniqueCompanies.length);
      console.log(
        '📦 [Edit Project] Companies:',
        uniqueCompanies.map((c) => ({ id: c.id, name: c.name }))
      );
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error(error instanceof Error ? error.message : 'Firmalar yüklenemedi');
      setCompanies([]); // Fallback to empty array
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      await Promise.all([fetchProject(), fetchCompanies()]);
    }
    loadData();
  }, [projectId, fetchProject, fetchCompanies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: formData.companyId,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      toast.success('Proje başarıyla güncellendi!');
      router.push(`/consultant-dashboard/projects/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Bu projeyi silmek istediğinizden emin misiniz? Tüm alt projeler ve görevler de silinecektir.'
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      toast.success('Proje başarıyla silindi!');
      router.push('/consultant-dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Proje yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Proje bulunamadı</p>
          <Link href="/consultant-dashboard/projects">
            <Button variant="outline">Geri Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <GradientHeader
          icon={Briefcase}
          title="Proje Düzenle"
          subtitle={project.name}
          progress={project.progress}
          actions={
            <Link href={`/consultant-dashboard/projects/${projectId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          }
        />

        <EnhancedCard variant="glass" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="companyId">
                Firma <span className="text-destructive">*</span>
              </Label>
              {loading || companiesLoading ? (
                <Input id="companyId" value="Yükleniyor..." disabled className="bg-muted" />
              ) : companies.length === 0 ? (
                <Input id="companyId" value="Firma bulunamadı" disabled className="bg-muted" />
              ) : (
                <Select
                  value={
                    formData.companyId && formData.companyId !== '' ? formData.companyId : undefined
                  }
                  onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  disabled={saving || deleting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Firma seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies
                      .filter((company) => company?.id && company?.name)
                      .filter(
                        (company, index, self) =>
                          self.findIndex((c) => c.id === company.id) === index
                      )
                      .map((company) => (
                        <SelectItem key={`company-${company.id}`} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
              {formData.companyId &&
                companies.length > 0 &&
                !companies.find((c) => c.id === formData.companyId) && (
                  <p className="text-sm text-muted-foreground">
                    Seçili firma listede bulunamadı. Lütfen başka bir firma seçin.
                  </p>
                )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Proje Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: E-İhracat Dönüşüm Projesi"
                required
                disabled={saving || deleting}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Proje hakkında detaylı açıklama..."
                rows={4}
                disabled={saving || deleting}
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={saving || deleting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planlama</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="on_hold">Beklemede</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  disabled={saving || deleting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={saving || deleting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={saving || deleting}
                />
              </div>
            </div>

            {/* Progress Info */}
            <EnhancedCard className="bg-blue-50/50 border-blue-200 p-4">
              <p className="text-sm text-blue-700">
                <strong>İlerleme:</strong> {project.progress}% (Otomatik hesaplanır)
              </p>
            </EnhancedCard>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={saving || deleting || !formData.name}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/consultant-dashboard/projects/${projectId}`)}
                disabled={saving || deleting}
              >
                İptal
              </Button>
            </div>
          </form>
        </EnhancedCard>

        {/* Delete Section */}
        <EnhancedCard variant="glass" className="border-red-200 bg-red-50/50 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-900">Tehlikeli Bölge</h3>
              <p className="text-sm text-red-700 mt-1">
                Projeyi silerseniz, bu işlem geri alınamaz. Tüm alt projeler, görevler ve yorumlar
                da silinecektir.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Projeyi Sil
                </>
              )}
            </Button>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
