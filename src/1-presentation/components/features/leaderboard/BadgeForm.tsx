'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateBadgeDtoSchema,
  UpdateBadgeDtoSchema,
  CreateBadgeDto,
  UpdateBadgeDto,
} from '@/2-application/dtos/leaderboard';
import {
  BadgeCategory,
  RequirementType,
  BADGE_CATEGORY_LABELS,
  REQUIREMENT_TYPE_LABELS,
} from '@/3-domain/enums/LeaderboardEnums';
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
import { Switch } from '@/presentation/components/ui/atoms/switch';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Badge as BadgeEntity } from '@/3-domain/entities/Leaderboard';

interface BadgeFormProps {
  badge?: BadgeEntity;
  onSubmit: (data: CreateBadgeDto | UpdateBadgeDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function BadgeForm({ badge, onSubmit, onCancel, isSubmitting }: BadgeFormProps) {
  const isEdit = !!badge;
  const schema = isEdit ? UpdateBadgeDtoSchema : CreateBadgeDtoSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBadgeDto | UpdateBadgeDto>({
    resolver: zodResolver(schema),
    defaultValues: badge
      ? {
          name: badge.name,
          description: badge.description || '',
          icon: badge.icon || '',
          category: badge.category as BadgeCategory,
          requirementType: badge.requirementType as RequirementType,
          requirementValue: badge.requirementValue,
          requirementActivity: badge.requirementActivity || '',
          pointsBonus: badge.pointsBonus,
          isActive: badge.isActive,
          orderIndex: badge.orderIndex,
        }
      : {
          category: BadgeCategory.GENERAL,
          requirementType: RequirementType.COUNT,
          pointsBonus: 0,
          isActive: true,
          orderIndex: 0,
        },
  });

  const category = watch('category');
  const requirementType = watch('requirementType');

  const handleFormSubmit = async (data: CreateBadgeDto | UpdateBadgeDto) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Rozet Adı *</Label>
        <Input id="name" {...register('name')} placeholder="Örn: İlk Adım" maxLength={100} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Rozet açıklaması"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <Label htmlFor="icon">İkon (Emoji)</Label>
        <Input id="icon" {...register('icon')} placeholder="🎯" maxLength={10} />
        <p className="text-xs text-muted-foreground">Bir emoji veya ikon adı girin</p>
        {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Kategori *</Label>
        <Select
          value={category}
          onValueChange={(value) => setValue('category', value as BadgeCategory)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(BADGE_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      {/* Requirement Type */}
      <div className="space-y-2">
        <Label htmlFor="requirementType">Kazanma Koşulu Tipi *</Label>
        <Select
          value={requirementType}
          onValueChange={(value) => setValue('requirementType', value as RequirementType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REQUIREMENT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.requirementType && (
          <p className="text-sm text-destructive">{errors.requirementType.message}</p>
        )}
      </div>

      {/* Requirement Value */}
      <div className="space-y-2">
        <Label htmlFor="requirementValue">Gerekli Değer *</Label>
        <Input
          id="requirementValue"
          type="number"
          {...register('requirementValue', { valueAsNumber: true })}
          placeholder="Örn: 10"
          min={1}
        />
        <p className="text-xs text-muted-foreground">
          {requirementType === RequirementType.COUNT && 'Kaç kez yapılması gerektiği'}
          {requirementType === RequirementType.THRESHOLD && 'Toplam puan eşiği'}
        </p>
        {errors.requirementValue && (
          <p className="text-sm text-destructive">{errors.requirementValue.message}</p>
        )}
      </div>

      {/* Requirement Activity (only for count type) */}
      {requirementType === RequirementType.COUNT && (
        <div className="space-y-2">
          <Label htmlFor="requirementActivity">Aktivite Tipi</Label>
          <Input
            id="requirementActivity"
            {...register('requirementActivity')}
            placeholder="Örn: task_completed"
          />
          <p className="text-xs text-muted-foreground">
            Hangi aktivite tipinin sayılacağı (örn: task_completed, video_watched)
          </p>
          {errors.requirementActivity && (
            <p className="text-sm text-destructive">{errors.requirementActivity.message}</p>
          )}
        </div>
      )}

      {/* Points Bonus */}
      <div className="space-y-2">
        <Label htmlFor="pointsBonus">Bonus Puan</Label>
        <Input
          id="pointsBonus"
          type="number"
          {...register('pointsBonus', { valueAsNumber: true })}
          placeholder="0"
          min={0}
        />
        <p className="text-xs text-muted-foreground">Rozet kazanıldığında verilecek ekstra puan</p>
        {errors.pointsBonus && (
          <p className="text-sm text-destructive">{errors.pointsBonus.message}</p>
        )}
      </div>

      {/* Order Index */}
      <div className="space-y-2">
        <Label htmlFor="orderIndex">Sıralama</Label>
        <Input
          id="orderIndex"
          type="number"
          {...register('orderIndex', { valueAsNumber: true })}
          placeholder="0"
          min={0}
        />
        <p className="text-xs text-muted-foreground">
          Rozetlerin görüntülenme sırası (düşük sayı önce gösterilir)
        </p>
        {errors.orderIndex && (
          <p className="text-sm text-destructive">{errors.orderIndex.message}</p>
        )}
      </div>

      {/* Is Active */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={watch('isActive')}
          onCheckedChange={(checked) => setValue('isActive', checked)}
        />
        <Label htmlFor="isActive">Aktif</Label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
}
