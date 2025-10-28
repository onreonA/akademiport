/**
 * Change Password Form Component
 *
 * Form for changing user password with strength indicator
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { calculatePasswordStrength } from '@/application/dto/user';
import { cn } from '@/presentation/lib/utils';

// Form schema
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mevcut şifre zorunludur'),
    newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalıdır'),
    confirmPassword: z.string().min(1, 'Şifre tekrarı zorunludur'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Yeni şifre eski şifre ile aynı olamaz',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormData) => Promise<void>;
  onCancel?: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const passwordStrength = newPassword ? calculatePasswordStrength(newPassword) : null;

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength color
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-red-500';
      case 1:
        return 'bg-orange-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Old Password */}
      <div className="space-y-2">
        <Label htmlFor="oldPassword">
          Mevcut Şifre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="oldPassword"
          type="password"
          placeholder="••••••••"
          {...register('oldPassword')}
          disabled={isSubmitting}
        />
        {errors.oldPassword && (
          <p className="text-sm text-destructive">{errors.oldPassword.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">
          Yeni Şifre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          {...register('newPassword')}
          disabled={isSubmitting}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}

        {/* Password Strength Indicator */}
        {passwordStrength && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    level <= passwordStrength.score
                      ? getStrengthColor(passwordStrength.score)
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Şifre Gücü: <span className="font-medium">{passwordStrength.label}</span>
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          En az 8 karakter, büyük harf, küçük harf ve rakam içermelidir
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Yeni Şifre (Tekrar) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
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
              Değiştiriliyor...
            </>
          ) : (
            'Şifreyi Değiştir'
          )}
        </Button>
      </div>
    </form>
  );
};
