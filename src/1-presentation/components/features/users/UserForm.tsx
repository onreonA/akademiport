/**
 * User Form Component
 *
 * Form for creating and editing users with validation
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { UserRole, UserRoleLabels } from '@/domain/enums/UserRole';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';

// Form schema
const userFormSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır').max(100),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
  companyId: z.string().optional(),
  bio: z.string().max(500, 'Biyografi en fazla 500 karakter olabilir').optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
  hideRoleSelection?: boolean;
  hideCompanySelection?: boolean;
  allowedRoles?: UserRole[]; // If provided, only show these roles in the dropdown
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  hideRoleSelection = false,
  hideCompanySelection = false,
  allowedRoles,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: initialData?.email || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      password: '',
      phone: initialData?.phone || '',
      role: initialData?.role || UserRole.COMPANY_USER,
      companyId: initialData?.companyId || '',
      bio: initialData?.bio || '',
    },
  });

  // Update form when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData && isEdit) {
      reset({
        email: initialData.email || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        password: '',
        phone: initialData.phone || '',
        role: initialData.role || UserRole.COMPANY_USER,
        companyId: initialData.companyId || '',
        bio: initialData.bio || '',
      });
    }
  }, [initialData, isEdit, reset]);

  const selectedRole = watch('role');

  const handleFormSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if company is required for selected role
  const isCompanyRequired =
    selectedRole === UserRole.COMPANY_ADMIN || selectedRole === UserRole.COMPANY_USER;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="ornek@email.com"
          {...register('email')}
          disabled={isEdit || isSubmitting}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">
          Ad <span className="text-destructive">*</span>
        </Label>
        <Input
          id="firstName"
          placeholder="Ahmet"
          {...register('firstName')}
          disabled={isSubmitting}
        />
        {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">
          Soyad <span className="text-destructive">*</span>
        </Label>
        <Input
          id="lastName"
          placeholder="Yılmaz"
          {...register('lastName')}
          disabled={isSubmitting}
        />
        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
      </div>

      {/* Password (only for create) */}
      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">
            Şifre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isSubmitting}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          <p className="text-xs text-muted-foreground">En az 8 karakter</p>
        </div>
      )}

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+90 555 123 45 67"
          {...register('phone')}
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      {/* Role */}
      {!hideRoleSelection && (
        <div className="space-y-2">
          <Label htmlFor="role">
            Rol <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue('role', value as UserRole)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rol seçin" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UserRoleLabels)
                .filter(([key]) => {
                  // If allowedRoles is provided, only show those roles
                  if (allowedRoles && allowedRoles.length > 0) {
                    return allowedRoles.includes(key as UserRole);
                  }
                  // Otherwise show all roles
                  return true;
                })
                .map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </div>
      )}

      {/* Company ID (conditional) */}
      {!hideCompanySelection && isCompanyRequired && (
        <div className="space-y-2">
          <Label htmlFor="companyId">
            Firma ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyId"
            placeholder="Firma ID"
            {...register('companyId')}
            disabled={isSubmitting}
          />
          {errors.companyId && (
            <p className="text-sm text-destructive">{errors.companyId.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Firma kullanıcıları için firma seçimi zorunludur
          </p>
        </div>
      )}

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Biyografi</Label>
        <Textarea
          id="bio"
          placeholder="Kısa biyografi..."
          rows={4}
          {...register('bio')}
          disabled={isSubmitting}
        />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
        <p className="text-xs text-muted-foreground">En fazla 500 karakter</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            İptal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {isEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
            </>
          ) : isEdit ? (
            'Güncelle'
          ) : (
            'Oluştur'
          )}
        </Button>
      </div>
    </form>
  );
};
