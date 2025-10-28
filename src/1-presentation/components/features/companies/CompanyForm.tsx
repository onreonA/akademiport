'use client';

/**
 * Company Form Component
 * Sprint 6: Company Management
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCompanySchema, type CreateCompanyDto } from '@/application/dto/company';
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

interface CompanyFormProps {
  initialData?: Partial<CreateCompanyDto>;
  programs?: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateCompanyDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CompanyForm({
  initialData,
  programs = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: initialData || {
      country: 'Türkiye',
      maxUsers: 2,
    },
  });

  const programId = watch('programId');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Program Selection */}
      <div className="space-y-2">
        <Label htmlFor="programId">Program *</Label>
        <Select value={programId} onValueChange={(value) => setValue('programId', value)}>
          <SelectTrigger>
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
        {errors.programId && (
          <p className="text-sm text-destructive">{errors.programId.message}</p>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Firma Adı *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalName">Yasal Adı</Label>
          <Input id="legalName" {...register('legalName')} />
          {errors.legalName && (
            <p className="text-sm text-destructive">{errors.legalName.message}</p>
          )}
        </div>
      </div>

      {/* Tax & Registry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxNumber">Vergi Numarası</Label>
          <Input id="taxNumber" {...register('taxNumber')} />
          {errors.taxNumber && (
            <p className="text-sm text-destructive">{errors.taxNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tradeRegistryNumber">Ticaret Sicil No</Label>
          <Input id="tradeRegistryNumber" {...register('tradeRegistryNumber')} />
          {errors.tradeRegistryNumber && (
            <p className="text-sm text-destructive">{errors.tradeRegistryNumber.message}</p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Web Sitesi</Label>
          <Input id="website" type="url" {...register('website')} />
          {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Textarea id="address" {...register('address')} rows={3} />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Şehir</Label>
          <Input id="city" {...register('city')} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">İlçe</Label>
          <Input id="district" {...register('district')} />
          {errors.district && <p className="text-sm text-destructive">{errors.district.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Posta Kodu</Label>
          <Input id="postalCode" {...register('postalCode')} />
          {errors.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      {/* Sector & Employee Count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sector">Sektör</Label>
          <Input id="sector" {...register('sector')} />
          {errors.sector && <p className="text-sm text-destructive">{errors.sector.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeCount">Çalışan Sayısı</Label>
          <Input
            id="employeeCount"
            type="number"
            {...register('employeeCount', { valueAsNumber: true })}
          />
          {errors.employeeCount && (
            <p className="text-sm text-destructive">{errors.employeeCount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="foundationYear">Kuruluş Yılı</Label>
          <Input
            id="foundationYear"
            type="number"
            {...register('foundationYear', { valueAsNumber: true })}
          />
          {errors.foundationYear && (
            <p className="text-sm text-destructive">{errors.foundationYear.message}</p>
          )}
        </div>
      </div>

      {/* Max Users */}
      <div className="space-y-2">
        <Label htmlFor="maxUsers">Maksimum Kullanıcı Sayısı</Label>
        <Input
          id="maxUsers"
          type="number"
          {...register('maxUsers', { valueAsNumber: true })}
          min={1}
          max={10}
        />
        {errors.maxUsers && <p className="text-sm text-destructive">{errors.maxUsers.message}</p>}
        <p className="text-sm text-muted-foreground">Varsayılan: 2 (1-10 arası)</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
      </div>
    </form>
  );
}

