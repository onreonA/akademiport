/**
 * Program Form Component
 *
 * Form for creating and editing programs
 */

'use client';

import * as React from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Textarea } from '@/presentation/components/ui/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { ProgramStatus, ProgramStatusLabels } from '@/domain/enums/ProgramStatus';
import type { Program } from '@/domain/entities/Program';

export interface ProgramFormProps {
  program?: Program;
  onSubmit: (data: ProgramFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ProgramFormData {
  name: string;
  description?: string;
  city?: string;
  region?: string;
  programType?: string;
  startDate: string;
  endDate: string;
  maxCompanies: number;
  status?: ProgramStatus;
  sponsor?: string;
  budget?: number;
}

export function ProgramForm({ program, onSubmit, onCancel }: ProgramFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [formData, setFormData] = React.useState<ProgramFormData>({
    name: program?.name || '',
    description: program?.description || '',
    city: program?.city || '',
    region: program?.region || '',
    programType: program?.programType || '',
    startDate: program?.startDate ? new Date(program.startDate).toISOString().split('T')[0] : '',
    endDate: program?.endDate ? new Date(program.endDate).toISOString().split('T')[0] : '',
    maxCompanies: program?.maxCompanies || 20,
    status: program?.status,
    sponsor: program?.sponsor || '',
    budget: program?.budget,
  });

  const handleChange = (field: keyof ProgramFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      newErrors.name = 'Program adı zorunludur';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Program adı en az 3 karakter olmalıdır';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Başlangıç tarihi zorunludur';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Bitiş tarihi zorunludur';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
      }
    }

    if (formData.maxCompanies < 1) {
      newErrors.maxCompanies = 'Maksimum firma sayısı en az 1 olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
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
          <label htmlFor="name" className="text-sm font-medium">
            Program Adı <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Örn: İzmir E-İhracat Programı 2024"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Açıklama
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Program hakkında kısa açıklama..."
            rows={4}
          />
        </div>
      </div>

      {/* Location & Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Konum ve Tip</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              Şehir
            </label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Örn: İzmir"
            />
          </div>

          {/* Region */}
          <div className="space-y-2">
            <label htmlFor="region" className="text-sm font-medium">
              Bölge
            </label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              placeholder="Örn: Ege"
            />
          </div>
        </div>

        {/* Program Type */}
        <div className="space-y-2">
          <label htmlFor="programType" className="text-sm font-medium">
            Program Tipi
          </label>
          <Input
            id="programType"
            value={formData.programType}
            onChange={(e) => handleChange('programType', e.target.value)}
            placeholder="Örn: E-İhracat Dönüşüm"
          />
        </div>
      </div>

      {/* Dates & Capacity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tarihler ve Kapasite</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              Başlangıç Tarihi <span className="text-destructive">*</span>
            </label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={errors.startDate ? 'border-destructive' : ''}
            />
            {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              Bitiş Tarihi <span className="text-destructive">*</span>
            </label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={errors.endDate ? 'border-destructive' : ''}
            />
            {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
          </div>
        </div>

        {/* Max Companies */}
        <div className="space-y-2">
          <label htmlFor="maxCompanies" className="text-sm font-medium">
            Maksimum Firma Sayısı <span className="text-destructive">*</span>
          </label>
          <Input
            id="maxCompanies"
            type="number"
            min="1"
            value={formData.maxCompanies}
            onChange={(e) => handleChange('maxCompanies', parseInt(e.target.value, 10))}
            className={errors.maxCompanies ? 'border-destructive' : ''}
          />
          {errors.maxCompanies && <p className="text-sm text-destructive">{errors.maxCompanies}</p>}
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ek Bilgiler</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sponsor */}
          <div className="space-y-2">
            <label htmlFor="sponsor" className="text-sm font-medium">
              Sponsor
            </label>
            <Input
              id="sponsor"
              value={formData.sponsor}
              onChange={(e) => handleChange('sponsor', e.target.value)}
              placeholder="Örn: İzmir Ticaret Odası"
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label htmlFor="budget" className="text-sm font-medium">
              Bütçe (TL)
            </label>
            <Input
              id="budget"
              type="number"
              min="0"
              value={formData.budget || ''}
              onChange={(e) =>
                handleChange('budget', e.target.value ? parseFloat(e.target.value) : 0)
              }
              placeholder="Örn: 500000"
            />
          </div>
        </div>

        {/* Status (only for edit) */}
        {program && (
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Durum
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ProgramStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Kaydediliyor...
            </>
          ) : program ? (
            'Güncelle'
          ) : (
            'Oluştur'
          )}
        </Button>
      </div>
    </form>
  );
}
