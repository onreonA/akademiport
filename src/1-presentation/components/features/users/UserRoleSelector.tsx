/**
 * User Role Selector Component
 *
 * Dropdown for selecting user roles with descriptions
 */

'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Label } from '@/presentation/components/ui/atoms/label';
import { UserRole, UserRoleLabels } from '@/domain/enums/UserRole';
import { getRoleDescription } from '@/application/dto/user';

export interface UserRoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  showDescription?: boolean;
}

export const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Rol',
  required = false,
  showDescription = true,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={(v) => onChange(v as UserRole)} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Rol seçin" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(UserRoleLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              <div className="flex flex-col">
                <span className="font-medium">{label}</span>
                {showDescription && (
                  <span className="text-xs text-muted-foreground">
                    {getRoleDescription(key as UserRole)}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showDescription && (
        <p className="text-sm text-muted-foreground">{getRoleDescription(value)}</p>
      )}
    </div>
  );
};

