/**
 * User Entity
 *
 * Domain entity for User
 */

import { UserRole } from '../enums/UserRole';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  bio?: string;
  expertiseAreas?: string[];
  socialLinks?: Record<string, string>;
  settings?: UserSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
}

export interface CreateUserDto {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  role?: UserRole;
  companyId?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  expertiseAreas?: string[];
  socialLinks?: Record<string, string>;
  settings?: Partial<UserSettings>;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  companyId?: string;
}
