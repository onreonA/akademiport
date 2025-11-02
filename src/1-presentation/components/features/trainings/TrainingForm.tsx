/**
 * Training Form Component
 *
 * Form for creating and editing trainings
 */

'use client';

import * as React from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import { Label } from '@/presentation/components/ui/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import type { Training, TrainingStatus, TrainingPriority } from '@/domain/entities/Training';

export interface TrainingFormProps {
  training?: Training;
  programs?: Array<{ id: string; name: string }>;
  onSubmit: (data: TrainingFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface TrainingFormData {
  name: string;
  description?: string;
  programId?: string | null;
  isGlobal: boolean;
  status: TrainingStatus;
  priority: TrainingPriority;
  isLocked: boolean;
}

export function TrainingForm({ training, programs = [], onSubmit, onCancel }: TrainingFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<TrainingFormData>({
    name: training?.name || '',
    description: training?.description || '',
    programId: training?.programId || null,
    isGlobal: training?.isGlobal ?? false,
    status: training?.status || 'draft',
    priority: training?.priority || 'medium',
    isLocked: training?.isLocked || false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof TrainingFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // If isGlobal changes, clear programId if needed
      if (field === 'isGlobal' && value === true) {
        updated.programId = null;
      }
      // If programId is set, isGlobal should be false
      if (field === 'programId' && value) {
        updated.isGlobal = false;
      }
      return updated;
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Eğitim adı zorunludur';
    }

    if (formData.isGlobal && formData.programId) {
      newErrors.programId = 'Global eğitim program ID içeremez';
    }

    if (!formData.isGlobal && !formData.programId) {
      newErrors.programId = 'Program bazlı eğitim için program seçilmelidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Temel Bilgiler</h3>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Eğitim Adı <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Örn: E-İhracat Temel Eğitimi"
            className={errors.name ? 'border-destructive' : ''}
            disabled={loading}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Eğitim hakkında açıklama..."
            rows={4}
            disabled={loading}
          />
        </div>
      </div>

      {/* Training Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Eğitim Tipi</h3>

        <div className="space-y-2">
          <Label htmlFor="isGlobal">Eğitim Tipi</Label>
          <Select
            value={formData.isGlobal ? 'global' : 'program'}
            onValueChange={(value) => handleChange('isGlobal', value === 'global')}
            disabled={loading}
          >
            <SelectTrigger id="isGlobal">
              <SelectValue placeholder="Eğitim tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global Eğitim</SelectItem>
              <SelectItem value="program">Program Bazlı Eğitim</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!formData.isGlobal && (
          <div className="space-y-2">
            <Label htmlFor="programId">
              Program <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.programId || ''}
              onValueChange={(value) => handleChange('programId', value || null)}
              disabled={loading}
            >
              <SelectTrigger
                id="programId"
                className={errors.programId ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Program seçin" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.programId && <p className="text-sm text-destructive">{errors.programId}</p>}
          </div>
        )}
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Durum</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value as TrainingStatus)}
            disabled={loading}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="archived">Arşivlendi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Öncelik</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleChange('priority', value as TrainingPriority)}
            disabled={loading}
          >
            <SelectTrigger id="priority">
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

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ayarlar</h3>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isLocked"
            checked={formData.isLocked}
            onChange={(e) => handleChange('isLocked', e.target.checked)}
            disabled={loading}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isLocked" className="font-normal cursor-pointer">
            Sıralı erişim kontrolü (Kilitli eğitim)
          </Label>
        </div>
        <p className="text-sm text-muted-foreground ml-6">
          Aktif edildiğinde, eğitim içeriği sırayla erişilebilir olur
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t relative z-50">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            İptal
          </Button>
        )}
        <Button type="submit" disabled={loading} className="relative z-50">
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Kaydediliyor...
            </>
          ) : training ? (
            'Güncelle'
          ) : (
            'Oluştur'
          )}
        </Button>
      </div>
    </form>
  );
}
